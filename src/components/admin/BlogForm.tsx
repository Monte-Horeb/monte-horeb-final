'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { BlogPost, BlogCategory } from '@/types'

interface BlogFormProps {
  post?: BlogPost
  categories: BlogCategory[]
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function BlogForm({ post, categories }: BlogFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(Boolean(post))

  const [form, setForm] = useState({
    title_en: post?.title_en ?? '',
    title_es: post?.title_es ?? '',
    slug: post?.slug ?? '',
    excerpt_en: post?.excerpt_en ?? '',
    excerpt_es: post?.excerpt_es ?? '',
    content_en: post?.content_en ?? '',
    content_es: post?.content_es ?? '',
    category_id: post?.category_id ?? '',
    featured_image_url: post?.featured_image_url ?? '',
    is_published: post?.is_published ?? false,
  })

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleTitleChange = (value: string) => {
    setForm((f) => ({
      ...f,
      title_en: value,
      slug: slugTouched ? f.slug : slugify(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const supabase = createClient()

    // Stamp published_at the first time a post goes live, and clear it
    // if it is pulled back to draft.
    const publishedAt = form.is_published
      ? post?.published_at ?? new Date().toISOString()
      : null

    const payload = {
      title_en: form.title_en.trim(),
      title_es: form.title_es.trim() || null,
      slug: (form.slug.trim() || slugify(form.title_en)),
      excerpt_en: form.excerpt_en.trim() || null,
      excerpt_es: form.excerpt_es.trim() || null,
      content_en: form.content_en,
      content_es: form.content_es.trim() || null,
      category_id: form.category_id || null,
      featured_image_url: form.featured_image_url.trim() || null,
      is_published: form.is_published,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    }

    const { error: saveError } = post
      ? await supabase.from('blog_posts').update(payload).eq('id', post.id)
      : await supabase.from('blog_posts').insert(payload)

    if (saveError) {
      setError(saveError.message)
      setSaving(false)
      return
    }

    router.push('/admin/blog')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card card-body max-w-4xl space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title_en" className="label">Title (English) *</label>
          <input
            id="title_en"
            className="input"
            value={form.title_en}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="title_es" className="label">Title (Spanish)</label>
          <input
            id="title_es"
            className="input"
            value={form.title_es}
            onChange={(e) => set('title_es', e.target.value)}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="slug" className="label">URL slug *</label>
          <input
            id="slug"
            className="input"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              set('slug', e.target.value)
            }}
            required
          />
          <p className="text-xs text-neutral-500 mt-1">/en/blog/{form.slug || 'your-post'}</p>
        </div>
        <div>
          <label htmlFor="category_id" className="label">Category</label>
          <select
            id="category_id"
            className="input"
            value={form.category_id}
            onChange={(e) => set('category_id', e.target.value)}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name_en}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="featured_image_url" className="label">Featured image URL</label>
        <input
          id="featured_image_url"
          type="url"
          className="input"
          value={form.featured_image_url}
          onChange={(e) => set('featured_image_url', e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="excerpt_en" className="label">Excerpt (English)</label>
          <textarea
            id="excerpt_en"
            className="input min-h-[80px] resize-y"
            value={form.excerpt_en}
            onChange={(e) => set('excerpt_en', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="excerpt_es" className="label">Excerpt (Spanish)</label>
          <textarea
            id="excerpt_es"
            className="input min-h-[80px] resize-y"
            value={form.excerpt_es}
            onChange={(e) => set('excerpt_es', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="content_en" className="label">Content (English) *</label>
        <textarea
          id="content_en"
          className="input min-h-[300px] resize-y font-mono text-sm"
          value={form.content_en}
          onChange={(e) => set('content_en', e.target.value)}
          required
        />
        <p className="text-xs text-neutral-500 mt-1">
          Basic HTML is supported (&lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;a&gt;, &lt;ul&gt;).
        </p>
      </div>

      <div>
        <label htmlFor="content_es" className="label">Content (Spanish)</label>
        <textarea
          id="content_es"
          className="input min-h-[300px] resize-y font-mono text-sm"
          value={form.content_es}
          onChange={(e) => set('content_es', e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4"
          checked={form.is_published}
          onChange={(e) => set('is_published', e.target.checked)}
        />
        <span className="text-sm font-medium text-neutral-700">Published</span>
      </label>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : post ? 'Save Changes' : 'Create Post'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </form>
  )
}
