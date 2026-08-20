'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { CheckCircle } from 'lucide-react'
import type { Lang } from '@/types'

interface VideoPlayerClientProps {
  videoId: string
  courseId: string
  youtubeId: string
  title: string
  lang: Lang
  t: {
    mark_watched: string
    watched_badge: string
  }
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('monte_session_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('monte_session_id', id)
  }
  return id
}

export default function VideoPlayerClient({
  videoId, courseId, youtubeId, title, lang, t
}: VideoPlayerClientProps) {
  const [watched, setWatched] = useState(false)
  const [saving, setSaving] = useState(false)
  const progressSaved = useRef(false)

  // Check if already watched on mount
  useEffect(() => {
    const sessionId = getOrCreateSessionId()
    if (!sessionId) return

    fetch(`/api/progress?videoId=${videoId}&sessionId=${sessionId}&lang=${lang}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.completed) setWatched(true)
      })
      .catch(() => {})
  }, [videoId, lang])

  const markWatched = useCallback(async () => {
    if (progressSaved.current || watched) return
    progressSaved.current = true
    setSaving(true)

    const sessionId = getOrCreateSessionId()
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          videoId,
          courseId,
          lang,
          completed: true,
          watchedSeconds: 0,
        }),
      })
      setWatched(true)
    } catch {
      progressSaved.current = false
    } finally {
      setSaving(false)
    }
  }, [videoId, courseId, lang, watched])

  return (
    <div>
      {/* YouTube embed - streaming only */}
      <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg mb-4">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          title={title}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>

      {/* Watched status */}
      <div className="flex items-center justify-between">
        {watched ? (
          <div className="flex items-center gap-2 text-green-700 font-semibold">
            <CheckCircle className="w-5 h-5" />
            {t.watched_badge}
          </div>
        ) : (
          <button
            onClick={markWatched}
            disabled={saving}
            className="btn btn-outline btn-sm"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                {lang === 'es' ? 'Guardando...' : 'Saving...'}
              </span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {t.mark_watched}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
