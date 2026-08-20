import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import VideoPlayerClient from '@/components/courses/VideoPlayerClient'
import type { Lang } from '@/types'

interface VideoPageProps {
  params: { lang: string; courseId: string; videoId: string }
}

function getYouTubeId(url: string): string {
  const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/)
  return match ? match[1] : ''
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const supabase = await createClient()
  const { data: video } = await supabase
    .from('course_videos')
    .select('title_en, title_es')
    .eq('id', params.videoId)
    .single()
  if (!video) return {}
  return { title: `${lang === 'es' ? video.title_es : video.title_en} - Iglesia Monte Horeb` }
}

export default async function VideoPage({ params }: VideoPageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.newBelievers : en.newBelievers

  const supabase = await createClient()

  // Get current video
  const { data: video } = await supabase
    .from('course_videos')
    .select('*')
    .eq('id', params.videoId)
    .eq('is_published', true)
    .single()

  if (!video) notFound()

  // Get all videos in course for prev/next nav
  const { data: allVideos } = await supabase
    .from('course_videos')
    .select('id, title_en, title_es, sort_order')
    .eq('course_id', params.courseId)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  // Get course info
  const { data: course } = await supabase
    .from('courses')
    .select('title_en, title_es')
    .eq('id', params.courseId)
    .single()

  const currentIndex = allVideos?.findIndex((v) => v.id === params.videoId) ?? 0
  const prevVideo = allVideos?.[currentIndex - 1] || null
  const nextVideo = allVideos?.[currentIndex + 1] || null

  const videoTitle = lang === 'es' ? video.title_es : video.title_en
  const videoDesc = lang === 'es' ? video.description_es : video.description_en
  const youtubeUrl = lang === 'es' ? video.youtube_url_es : video.youtube_url_en
  const youtubeId = youtubeUrl ? getYouTubeId(youtubeUrl) : null

  return (
    <div>
      {/* Back nav */}
      <div className="bg-white border-b border-neutral-100 py-3 px-4">
        <div className="container-site">
          <Link href={`/${lang}/new-believers/${params.courseId}`} className="inline-flex items-center gap-2 text-sm text-primary-700 no-underline hover:underline font-medium">
            <ArrowLeft className="w-4 h-4" />
            {t.back_to_course}
          </Link>
        </div>
      </div>

      <div className="section bg-neutral-50">
        <div className="container-site px-4">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* Main: Video player */}
            <div className="lg:col-span-2">
              <p className="text-sm text-neutral-500 mb-2">
                {course && (lang === 'es' ? course.title_es : course.title_en)}
                {' '} - {t.video_title} {currentIndex + 1}
              </p>
              <h1 className="text-2xl font-bold mb-4">{videoTitle}</h1>

              {/* Player */}
              {youtubeId ? (
                <VideoPlayerClient
                  videoId={params.videoId}
                  courseId={params.courseId}
                  youtubeId={youtubeId}
                  title={videoTitle}
                  lang={lang}
                  // Pass only the two strings this component needs. The full
                  // `t` object contains functions (videos_count,
                  // progress_label), and React cannot serialise functions
                  // across the server/client boundary - passing the whole
                  // object threw at request time on this page.
                  t={{ mark_watched: t.mark_watched, watched_badge: t.watched_badge }}
                />
              ) : (
                <div className="aspect-video bg-neutral-100 rounded-xl flex items-center justify-center">
                  <p className="text-neutral-500">
                    {lang === 'es' ? t.no_video_es : t.no_video_en}
                  </p>
                </div>
              )}

              {videoDesc && (
                <p className="mt-6 text-neutral-600 leading-relaxed">{videoDesc}</p>
              )}

              {/* Prev / Next navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
                {prevVideo ? (
                  <Link
                    href={`/${lang}/new-believers/${params.courseId}/${prevVideo.id}`}
                    className="flex items-center gap-2 btn btn-outline btn-sm no-underline"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t.prev_lesson}
                  </Link>
                ) : <div />}

                {nextVideo ? (
                  <Link
                    href={`/${lang}/new-believers/${params.courseId}/${nextVideo.id}`}
                    className="flex items-center gap-2 btn btn-primary btn-sm no-underline"
                  >
                    {t.next_lesson}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : <div />}
              </div>
            </div>

            {/* Sidebar: Lesson list */}
            <div>
              <h2 className="text-lg font-bold mb-4">
                {lang === 'es' ? 'Lecciones del Curso' : 'Course Lessons'}
              </h2>
              <div className="space-y-2">
                {allVideos?.map((v, i) => {
                  const isActive = v.id === params.videoId
                  const vTitle = lang === 'es' ? v.title_es : v.title_en
                  return (
                    <Link
                      key={v.id}
                      href={`/${lang}/new-believers/${params.courseId}/${v.id}`}
                      className={`flex items-center gap-3 p-3 rounded-lg no-underline transition-colors
                        ${isActive
                          ? 'bg-primary-900 text-white'
                          : 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-100'
                        }`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                        ${isActive ? 'bg-white text-primary-900' : 'bg-neutral-100 text-neutral-600'}`}>
                        {i + 1}
                      </span>
                      <span className="text-sm leading-snug line-clamp-2">{vTitle}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
