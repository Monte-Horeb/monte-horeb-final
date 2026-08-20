'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, FileText, Presentation, Youtube, Music } from 'lucide-react'
import type { Lang, Song, SongCategory } from '@/types'

interface SongLibraryProps {
  lang: Lang
  songs: Song[]
  categories: SongCategory[]
  t: {
    search_placeholder: string
    filter_all: string
    no_results: string
    view_pdf: string
    view_ppt: string
    watch_en: string
    watch_es: string
  }
}

function SongCard({ song, lang, t }: { song: Song; lang: Lang; t: SongLibraryProps['t'] }) {
  const title = lang === 'es' && song.title_es ? song.title_es : song.title_en

  return (
    <Link
      href={`/${lang}/songs/${song.id}`}
      className="card hover:shadow-md transition-shadow no-underline group"
    >
      <div className="card-body">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
            <Music className="w-5 h-5 text-primary-700" aria-hidden />
          </div>
          <div className="flex flex-wrap gap-1">
            {song.file_type === 'pdf' && (
              <span className="badge badge-blue text-xs">PDF</span>
            )}
            {song.file_type === 'pptx' && (
              <span className="badge badge-gold text-xs">PPT</span>
            )}
            {(song.youtube_url_en || song.youtube_url_es) && (
              <span className="badge bg-red-100 text-red-700 text-xs">
                <Youtube className="w-3 h-3 inline mr-0.5" />
                Video
              </span>
            )}
          </div>
        </div>

        <h3 className="font-bold text-base text-neutral-900 mb-1 group-hover:text-primary-900 transition-colors">
          {title}
        </h3>

        {song.artist && (
          <p className="text-sm text-neutral-500 mb-1">{song.artist}</p>
        )}

        {song.musical_key && (
          <p className="text-xs text-neutral-400">
            {lang === 'es' ? 'Tono' : 'Key'}: <span className="font-medium">{song.musical_key}</span>
          </p>
        )}

        {song.category && (
          <p className="text-xs text-accent-700 mt-2 font-medium">
            {lang === 'es' ? song.category.name_es : song.category.name_en}
          </p>
        )}
      </div>
    </Link>
  )
}

export default function SongLibrary({ lang, songs, categories, t }: SongLibraryProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filtered = useMemo(() => {
    let result = songs

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.title_en.toLowerCase().includes(q) ||
          (s.title_es || '').toLowerCase().includes(q) ||
          (s.artist || '').toLowerCase().includes(q)
      )
    }

    if (categoryFilter !== 'all') {
      result = result.filter((s) => s.category_id === categoryFilter)
    }

    return result
  }, [songs, search, categoryFilter])

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

          {/* Category filter tabs */}
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

      {/* Song grid */}
      <section className="section bg-neutral-50">
        <div className="container-site px-4">
          {filtered.length > 0 ? (
            <>
              <p className="text-sm text-neutral-500 mb-6">
                {filtered.length} {lang === 'es' ? 'canciones' : 'songs'}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((song) => (
                  <SongCard key={song.id} song={song} lang={lang} t={t} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <Music className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">{t.no_results}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
