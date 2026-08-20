'use client'

import { useState, useMemo } from 'react'
import { Search, Youtube } from 'lucide-react'
import type { Lang, Sermon } from '@/types'

interface SermonsFeedProps {
  lang: Lang
  recentSermons: Sermon[]
  foundationalSermons: Sermon[]
  t: {
    recent_title: string
    recent_subtitle: string
    foundations_title: string
    foundations_subtitle: string
    search_placeholder: string
    filter_all: string
    no_results: string
    speaker_label: string
    scripture_label: string
    watch_button: string
    youtube_channel: string
  }
}

function getYouTubeId(url: string): string {
  const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/)
  return match ? match[1] : ''
}

function SermonCard({ sermon, lang, t }: { sermon: Sermon; lang: Lang; t: SermonsFeedProps['t'] }) {
  const title = lang === 'es' && sermon.title_es ? sermon.title_es : sermon.title_en
  const videoId = sermon.youtube_url ? getYouTubeId(sermon.youtube_url) : null
  const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null

  return (
    <div className="card hover:shadow-md transition-shadow">
      {thumb && (
        <div className="aspect-video bg-neutral-100 relative overflow-hidden">
          <img src={thumb} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 rounded-full p-3">
              <Youtube className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      )}
      <div className="card-body">
        <h3 className="text-lg font-bold mb-1">{title}</h3>
        <p className="text-sm text-neutral-500 mb-1">
          <span className="font-medium">{t.speaker_label}:</span> {sermon.speaker}
        </p>
        {sermon.scripture_reference && (
          <p className="text-sm text-neutral-500 mb-1">
            <span className="font-medium">{t.scripture_label}:</span> {sermon.scripture_reference}
          </p>
        )}
        {sermon.sermon_date && !sermon.is_foundational && (
          <p className="text-xs text-neutral-400 mb-3">
            {new Date(sermon.sermon_date).toLocaleDateString(
              lang === 'es' ? 'es-MX' : 'en-US',
              { year: 'numeric', month: 'long', day: 'numeric' }
            )}
          </p>
        )}
        {sermon.topic && sermon.is_foundational && (
          <span className="badge badge-blue mb-3">{sermon.topic}</span>
        )}
        {sermon.youtube_url && (
          <a
            href={sermon.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm no-underline w-full justify-center"
          >
            <Youtube className="w-4 h-4" />
            {t.watch_button}
          </a>
        )}
      </div>
    </div>
  )
}

export default function SermonsFeed({ lang, recentSermons, foundationalSermons, t }: SermonsFeedProps) {
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState('all')

  const topics = useMemo(() => {
    const set = new Set(foundationalSermons.map((s) => s.topic).filter(Boolean))
    return Array.from(set) as string[]
  }, [foundationalSermons])

  const filteredRecent = useMemo(() => {
    if (!search) return recentSermons
    const q = search.toLowerCase()
    return recentSermons.filter(
      (s) =>
        s.title_en.toLowerCase().includes(q) ||
        s.speaker.toLowerCase().includes(q) ||
        (s.scripture_reference || '').toLowerCase().includes(q)
    )
  }, [search, recentSermons])

  const filteredFoundational = useMemo(() => {
    let results = foundationalSermons
    if (search) {
      const q = search.toLowerCase()
      results = results.filter(
        (s) =>
          s.title_en.toLowerCase().includes(q) ||
          s.speaker.toLowerCase().includes(q) ||
          (s.scripture_reference || '').toLowerCase().includes(q)
      )
    }
    if (topicFilter !== 'all') {
      results = results.filter((s) => s.topic === topicFilter)
    }
    return results
  }, [search, topicFilter, foundationalSermons])

  return (
    <div>
      {/* Search bar */}
      <section className="bg-white border-b border-neutral-100 py-6 px-4 sticky top-16 md:top-20 z-30">
        <div className="container-site">
          <div className="relative max-w-xl mx-auto">
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
        </div>
      </section>

      {/* Recent Sermons */}
      <section className="section bg-neutral-50">
        <div className="container-site px-4">
          <h2 className="mb-2">{t.recent_title}</h2>
          <p className="text-neutral-500 mb-8">{t.recent_subtitle}</p>

          {filteredRecent.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecent.map((sermon) => (
                <SermonCard key={sermon.id} sermon={sermon} lang={lang} t={t} />
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">{t.no_results}</p>
          )}

          <a
            href="https://www.youtube.com/@montehorebtv/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-primary-700 font-semibold no-underline hover:underline"
          >
            <Youtube className="w-5 h-5" />
            {t.youtube_channel}
          </a>
        </div>
      </section>

      {/* Foundational Sermons */}
      {foundationalSermons.length > 0 && (
        <section className="section bg-white">
          <div className="container-site px-4">
            <h2 className="mb-2">{t.foundations_title}</h2>
            <p className="text-neutral-500 mb-6">{t.foundations_subtitle}</p>

            {/* Topic filter */}
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter by topic">
                <button
                  onClick={() => setTopicFilter('all')}
                  className={`badge text-sm px-4 py-1.5 min-h-[40px] rounded-full border transition-colors
                    ${topicFilter === 'all'
                      ? 'bg-primary-900 text-white border-primary-900'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400'
                    }`}
                >
                  {t.filter_all}
                </button>
                {topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setTopicFilter(topic)}
                    className={`badge text-sm px-4 py-1.5 min-h-[40px] rounded-full border transition-colors
                      ${topicFilter === topic
                        ? 'bg-primary-900 text-white border-primary-900'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400'
                      }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}

            {filteredFoundational.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFoundational.map((sermon) => (
                  <SermonCard key={sermon.id} sermon={sermon} lang={lang} t={t} />
                ))}
              </div>
            ) : (
              <p className="text-neutral-500">{t.no_results}</p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
