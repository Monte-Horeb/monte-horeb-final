import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle, PlayCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import type { Lang } from '@/types'

interface CoursePageProps {
  params: { lang: string; courseId: string }
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const supabase = await createClient()
  const { data: course } = await supabase
    .from('courses')
    .select('title_en, title_es')
    .eq('id', params.courseId)
    .single()
  if (!course) return {}
  const title = lang === 'es' ? course.title_es : course.title_en
  return { title: `${title} - Iglesia Monte Horeb` }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.newBelievers : en.newBelievers

  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.courseId)
    .eq('is_published', true)
    .single()

  if (!course) notFound()

  const { data: videos } = await supabase
    .from('course_videos')
    .select('*')
    .eq('course_id', params.courseId)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  const title = lang === 'es' ? course.title_es : course.title_en
  const description = lang === 'es' ? course.description_es : course.description_en

  return (
    <div>
      {/* Back nav */}
      <div className="bg-white border-b border-neutral-100 py-3 px-4">
        <div className="container-site">
          <Link href={`/${lang}/new-believers`} className="inline-flex items-center gap-2 text-sm text-primary-700 no-underline hover:underline font-medium">
            <ArrowLeft className="w-4 h-4" />
            {t.back_to_courses}
          </Link>
        </div>
      </div>

      {/* Course header */}
      <section className="bg-primary-900 text-white section-sm">
        <div className="container-narrow px-4">
          <h1 className="text-white mb-3">{title}</h1>
          {description && <p className="text-primary-200 text-lg">{description}</p>}
          <p className="text-primary-300 text-sm mt-3">
            {t.videos_count(videos?.length || 0)}
          </p>
        </div>
      </section>

      {/* Video list */}
      <section className="section bg-neutral-50">
        <div className="container-narrow px-4">
          <div className="space-y-3">
            {videos && videos.length > 0 ? (
              videos.map((video, index) => {
                const videoTitle = lang === 'es' ? video.title_es : video.title_en
                const videoDesc = lang === 'es' ? video.description_es : video.description_en
                const hasVideo = lang === 'es' ? !!video.youtube_url_es : !!video.youtube_url_en

                return (
                  <Link
                    key={video.id}
                    href={`/${lang}/new-believers/${params.courseId}/${video.id}`}
                    className="card hover:shadow-md transition-shadow no-underline group flex items-center gap-4 p-5"
                  >
                    {/* Number */}
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                      {hasVideo ? (
                        <PlayCircle className="w-5 h-5 text-primary-700" />
                      ) : (
                        <span className="text-primary-700 font-bold text-sm">{index + 1}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-neutral-900 group-hover:text-primary-900 transition-colors">
                        {t.video_title} {index + 1}: {videoTitle}
                      </p>
                      {videoDesc && (
                        <p className="text-neutral-500 text-sm mt-0.5 line-clamp-1">{videoDesc}</p>
                      )}
                    </div>

                    {/* Duration */}
                    {video.duration_seconds && (
                      <div className="flex items-center gap-1 text-sm text-neutral-400 flex-shrink-0">
                        <Clock className="w-4 h-4" />
                        {formatDuration(video.duration_seconds)}
                      </div>
                    )}
                  </Link>
                )
              })
            ) : (
              <div className="text-center py-20">
                <p className="text-neutral-500">
                  {lang === 'es' ? 'Videos próximamente.' : 'Videos coming soon.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
