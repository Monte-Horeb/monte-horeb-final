import type { Metadata } from 'next'
import { Radio, Eye, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import type { Lang, LiveStream } from '@/types'

interface LivePageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: LivePageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.live : en.live
  return { title: t.meta_title, description: t.meta_description }
}

function getYouTubeId(url: string): string {
  const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/)
  return match ? match[1] : ''
}

export default async function LivePage({ params }: LivePageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.live : en.live

  const supabase = await createClient()

  // Get current/upcoming live streams
  const { data: liveStreams } = await supabase
    .from('live_streams')
    .select('*')
    .order('scheduled_at', { ascending: false })
    .limit(5)

  const currentLive = liveStreams?.find((s: LiveStream) => s.is_live)
  const otherStreams = liveStreams?.filter((s: LiveStream) => !s.is_live) || []

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-900 text-white section-sm">
        <div className="container-narrow px-4 text-center">
          <Radio className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" aria-hidden />
          <h1 className="text-white mb-4">{t.headline}</h1>
          <p className="text-primary-200">{t.subheadline}</p>
        </div>
      </section>

      {/* Current live stream */}
      {currentLive && (
        <section className="section bg-white border-b border-green-200">
          <div className="container-site px-4">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                <Radio className="w-3 h-3 animate-pulse" />
                {lang === 'es' ? 'EN VIVO' : 'LIVE NOW'}
              </span>
            </div>

            <h2 className="text-3xl font-bold mb-6">
              {lang === 'es' ? currentLive.title_es : currentLive.title_en}
            </h2>

            <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg mb-6">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(currentLive.youtube_url)}?autoplay=1`}
                title={currentLive.title_en}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>

            {currentLive.description_en && (
              <p className="text-neutral-600 text-lg mb-6">
                {lang === 'es' ? currentLive.description_es : currentLive.description_en}
              </p>
            )}

            {currentLive.viewer_count > 0 && (
              <div className="flex items-center gap-2 text-neutral-600">
                <Eye className="w-5 h-5" />
                <span>{currentLive.viewer_count.toLocaleString()} {lang === 'es' ? 'espectadores' : 'viewers'}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Scheduled streams */}
      {otherStreams.length > 0 && (
        <section className="section bg-neutral-50">
          <div className="container-site px-4">
            <h2 className="text-2xl font-bold mb-8">
              {lang === 'es' ? 'Transmisiones Próximas' : 'Upcoming Services'}
            </h2>

            <div className="space-y-4">
              {otherStreams.map((stream: LiveStream) => {
                const title = lang === 'es' ? stream.title_es : stream.title_en
                return (
                  <div key={stream.id} className="card card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{title}</h3>
                        {stream.scheduled_at && (
                          <p className="text-sm text-neutral-500">
                            {new Date(stream.scheduled_at).toLocaleDateString(
                              lang === 'es' ? 'es-MX' : 'en-US',
                              { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                            )}
                          </p>
                        )}
                      </div>
                      <a
                        href={stream.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm no-underline"
                      >
                        {lang === 'es' ? 'Ver' : 'Watch'}
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!currentLive && otherStreams.length === 0 && (
        <section className="section bg-neutral-50">
          <div className="container-narrow px-4 text-center py-20">
            <Radio className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">
              {lang === 'es'
                ? 'No hay transmisiones en vivo en este momento.'
                : 'No live streams available right now.'}
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
