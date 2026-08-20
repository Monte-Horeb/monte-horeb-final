'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Calendar, User, ChevronRight, BookOpen } from 'lucide-react'
import type { Lang, BlogPost, BlogCategory } from '@/types'

interface BlogFeedProps {
  lang: Lang
  posts: BlogPost[]
  categories: BlogCategory[]
  t: {
    search_placeholder: string
    filter_all: string
    no_posts: string
    read_more: string
  }
}

function BlogCard({ post, lang, t }: { post: BlogPost; lang: Lang; t: BlogFeedProps['t'] }) {
  const title = lang === 'es' && post.title_es ? post.title_es : post.title_en
  const excerpt = lang === 'es' ? post.excerpt_es : post.excerpt_en
  const category = post.category as any

  return (
    <Link
      href={`/${lang}/blog/${post.slug}`}
      className="card hover:shadow-md transition-shadow no-underline group"
    >
      {/* Image */}
      {post.featured_image_url && (
        <div className="aspect-video bg-neutral-100 overflow-hidden rounded-t-xl">
          <img
            src={post.featured_image_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="card-body">
        {/* Category */}
        {category && (
          <span className="badge badge-blue w-fit text-xs mb-2">
            {lang === 'es' ? category.name_es : category.name_en}
          </span>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary-700 transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-neutral-600 text-sm line-clamp-3 mb-4 leading-relaxed">{excerpt}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-auto pt-4 border-t border-neutral-100">
          {post.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(post.published_at).toLocaleDateString(
                lang === 'es' ? 'es-MX' : 'en-US',
                { month: 'short', day: 'numeric' }
              )}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-primary-700 font-semibold group-hover:underline">
            {lang === 'es' ? 'Leer más' : 'Read more'}
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function BlogFeed({ lang, posts, categories, t }: BlogFeedProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = posts

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title_en.toLowerCase().includes(q) ||
          (p.title_es || '').toLowerCase().includes(q) ||
          (p.excerpt_en || '').toLowerCase().includes(q) ||
          (p.excerpt_es || '').toLowerCase().includes(q)
      )
    }

    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category_id === categoryFilter)
    }

    return result
  }, [search, categoryFilter, posts])

  return (
    <div>
      {/* Search + Filter bar */}
      <section className="bg-white border-b border-neutral-100 py-6 px-4 sticky top-16 md:top-20 z-30">
        <div className="container-site">
          {/* Search */}
          <div className="relative max-w-xl mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search_placeholder}
              className="input pl-12"
              aria-label={t.search_placeholder}
            />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors min-h-[40px]
                ${categoryFilter === 'all'
                  ? 'bg-primary-900 text-white border-primary-900'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400'
                }`}
            >
              {t.filter_all}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors min-h-[40px]
                  ${categoryFilter === cat.id
                    ? 'bg-primary-900 text-white border-primary-900'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400'
                  }`}
              >
                {lang === 'es' ? cat.name_es : cat.name_en}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog grid */}
      <section className="section bg-neutral-50">
        <div className="container-site px-4">
          {filtered.length > 0 ? (
            <>
              <p className="text-sm text-neutral-500 mb-6">
                {filtered.length} {lang === 'es' ? 'artículos' : 'posts'}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((post) => (
                  <BlogCard key={post.id} post={post} lang={lang} t={t} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">{t.no_posts}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
