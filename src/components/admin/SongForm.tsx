'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Song, SongCategory } from '@/types'

interface SongFormProps {
  song?: Song
  categories: SongCategory[]
}

const STORAGE_BUCKET = 'church-files'

export default function SongForm({ song, categories }: SongFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title_en: song?.title_en ?? '',
    title_es: song?.title_es ?? '',
    artist: song?.artist ?? '',
    musical_key: song?.musical_key ?? '',
    category_id: song?.category_id ?? '',
    youtube_url_en: song?.youtube_url_en ?? '',
    youtube_url_es: song?.youtube_url_es ?? '',
    file_url: song?.file_url ?? '',
    file_type: song?.file_type ?? '',
    language: song?.language ?? 'both',
    is_published: song?.is_published ?? true,
    sort_order: song?.sort_order ?? 0,
  })

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'pdf' && ext !== 'pptx') {
      setError('Only PDF and PPTX files are supported.')
      return
    }

    setUploading(true)
    setError('')

    const supabase = createClient()
    const path = `songs/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { upsert: false })

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    setForm((f) => ({ ...f, file_url: data.publicUrl, file_type: ext }))
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const supabase = createClient()
    const payload = {
      title_en: form.title_en.trim(),
      title_es: form.title_es.trim() || null,
      artist: form.artist.trim() || null,
      musical_key: form.musical_key.trim() || null,
      category_id: form.category_id || null,
      youtube_url_en: form.youtube_url_en.trim() || null,
      youtube_url_es: form.youtube_url_es.trim() || null,
      file_url: form.file_url || null,
      file_type: form.file_type || null,
      language: form.language,
      is_published: form.is_published,
      sort_order: Number(form.sort_order) || 0,
    }

    const { error: saveError } = song
      ? await supabase.from('songs').update(payload).eq('id', song.id)
      : await supabase.from('songs').insert(payload)

    if (saveError) {
      setError(saveError.message)
      setSaving(false)
      return
    }

    router.push('/admin/songs')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card card-body max-w-3xl space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title_en" className="label">Title (English) *</label>
          <input
            id="title_en"
            className="input"
            value={form.title_en}
            onChange={(e) => set('title_en', e.target.value)}
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

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="artist" className="label">Artist</label>
          <input
            id="artist"
            className="input"
            value={form.artist}
            onChange={(e) => set('artist', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="musical_key" className="label">Key</label>
          <input
            id="musical_key"
            className="input"
            placeholder="G, Am, D..."
            value={form.musical_key}
            onChange={(e) => set('musical_key', e.target.value)}
          />
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

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="youtube_url_en" className="label">YouTube URL (English)</label>
          <input
            id="youtube_url_en"
            type="url"
            className="input"
            value={form.youtube_url_en}
            onChange={(e) => set('youtube_url_en', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="youtube_url_es" className="label">YouTube URL (Spanish)</label>
          <input
            id="youtube_url_es"
            type="url"
            className="input"
            value={form.youtube_url_es}
            onChange={(e) => set('youtube_url_es', e.target.value)}
          />
        </div>
      </div>

      {/* File upload */}
      <div>
        <span className="label">Sheet music / slides (PDF or PPTX)</span>
        {form.file_url ? (
          <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-lg p-3">
            <span className="badge badge-gold text-xs uppercase">{form.file_type}</span>
            <a
              href={form.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-700 truncate flex-1"
            >
              {form.file_url.split('/').pop()}
            </a>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, file_url: '', file_type: '' }))}
              className="p-1.5 rounded hover:bg-neutral-200"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 border-2 border-dashed border-neutral-300 rounded-lg p-4 cursor-pointer hover:border-primary-400 transition-colors">
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
            ) : (
              <Upload className="w-5 h-5 text-neutral-400" />
            )}
            <span className="text-sm text-neutral-600">
              {uploading ? 'Uploading...' : 'Choose a PDF or PPTX file'}
            </span>
            <input
              type="file"
              accept=".pdf,.pptx"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 items-end">
        <div>
          <label htmlFor="language" className="label">Language</label>
          <select
            id="language"
            className="input"
            value={form.language}
            onChange={(e) => set('language', e.target.value as Song['language'])}
          >
            <option value="both">Both</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
          </select>
        </div>
        <div>
          <label htmlFor="sort_order" className="label">Sort order</label>
          <input
            id="sort_order"
            type="number"
            className="input"
            value={form.sort_order}
            onChange={(e) => set('sort_order', Number(e.target.value))}
          />
        </div>
        <label className="flex items-center gap-2 min-h-[48px] cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={form.is_published}
            onChange={(e) => set('is_published', e.target.checked)}
          />
          <span className="text-sm font-medium text-neutral-700">Published</span>
        </label>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving || uploading} className="btn btn-primary">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : song ? 'Save Changes' : 'Create Song'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn btn-outline">
          Cancel
        </button>
      </div>
    </form>
  )
}
