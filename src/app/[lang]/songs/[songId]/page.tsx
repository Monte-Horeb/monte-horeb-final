import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Music, Presentation } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import PdfViewer from '@/components/songs/PdfViewerClient'
import type { Lang } from '@/types'

interface SongPageProps {
  params: { lang: string; songId: string }
}

export async function generateMetadata({ params }: SongPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const supabase = await createClient()
  const { data: song } = await supabase
    .from('songs')
    .select('title_en, title_es, artist')
    .eq('id', params.songId)
    .eq('is_published', true)
    .single()

  if (!song) return {}

  const title = lang === 'es' && song.title_es ? song.title_es : song.title_en
  return { title: `${title} - ${lang === 'es' ? 'Himnario' : 'Song Library'} | Iglesia Monte Horeb` }
}

function getYouTubeId(url: string): string {
  const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/)
  return match ? match[1] : ''
}

function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const id = getYouTubeId(url)
  if (!id) return null
  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-sm">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}

export default async function SongPage({ params }: SongPageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.songs : en.songs

  const supabase = await createClient()

  // Fetch song + increment view count
  const { data: song } = await supabase
    .from('songs')
    .select('*, category:song_categories(*)')
    .eq('id', params.songId)
    .eq('is_published', true)
    .single()

  if (!song) notFound()

  // Atomic increment via SECURITY DEFINER function. The previous
  // read-modify-write lost concurrent views and was blocked by RLS.
  await supabase.rpc('increment_song_view', { song_id: song.id })

  const title = lang === 'es' && song.title_es ? song.title_es : song.title_en

  return (
    <div>
      {/* Back nav */}
      <div className="bg-white border-b border-neutral-100 py-3 px-4">
        <div className="container-site">
          <Link
            href={`/${lang}/songs`}
            className="inline-flex items-center gap-2 text-sm text-primary-700 no-underline hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back_to_library}
          </Link>
        </div>
      </div>

      <div className="section bg-neutral-50">
        <div className="container-site px-4">
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Music className="w-7 h-7 text-primary-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{title}</h1>
              {song.artist && <p className="text-neutral-500">{song.artist}</p>}
              {song.musical_key && (
                <p className="text-sm text-neutral-400 mt-1">
                  {lang === 'es' ? 'Tono' : 'Key'}: <span className="font-medium">{song.musical_key}</span>
                </p>
              )}
              {song.category && (
                <span className="badge badge-blue mt-2">
                  {lang === 'es' ? song.category.name_es : song.category.name_en}
                </span>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* File Viewer */}
            <div>
              <h2 className="text-xl font-bold mb-4">{t.file_viewer_title}</h2>
              {song.file_url && song.file_type ? (
                song.file_type === 'pdf' ? (
                  <PdfViewer fileUrl={song.file_url} title={title} t={t} />
                ) : (
                  <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
                    <Presentation className="w-12 h-12 text-accent-600 mx-auto mb-3" />
                    <p className="text-neutral-600 mb-4">
                      {lang === 'es' ? 'Archivo de diapositivas disponible.' : 'Slide file available.'}
                    </p>
                    <a
                      href={song.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-accent btn-sm no-underline"
                    >
                      {t.view_ppt}
                    </a>
                  </div>
                )
              ) : (
                <div className="bg-neutral-100 rounded-xl p-10 text-center">
                  <p className="text-neutral-500">{t.no_file}</p>
                </div>
              )}
            </div>

            {/* YouTube Section */}
            <div>
              <h2 className="text-xl font-bold mb-4">{t.youtube_section}</h2>
              {song.youtube_url_en || song.youtube_url_es ? (
                <div className="space-y-6">
                  {song.youtube_url_en && (
                    <div>
                      <p className="text-sm font-semibold text-neutral-600 mb-2">{t.watch_en}</p>
                      <YouTubeEmbed url={song.youtube_url_en} title={`${title} (English)`} />
                    </div>
                  )}
                  {song.youtube_url_es && (
                    <div>
                      <p className="text-sm font-semibold text-neutral-600 mb-2">{t.watch_es}</p>
                      <YouTubeEmbed url={song.youtube_url_es} title={`${title} (Español)`} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-neutral-100 rounded-xl p-10 text-center">
                  <p className="text-neutral-500">{t.no_video}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
