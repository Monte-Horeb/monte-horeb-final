import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import type { Lang, Course, CourseVideo } from '@/types'

interface NewBelieversPageProps { params: { lang: string } }

export async function generateMetadata({ params }: NewBelieversPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.newBelievers : en.newBelievers
  return { title: t.meta_title, description: t.meta_description }
}

export default async function NewBelieversPage({ params }: NewBelieversPageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.newBelievers : en.newBelievers

  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('*, videos:course_videos(id, is_published)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-900 text-white section-sm">
        <div className="container-narrow px-4 text-center">
          <BookOpen className="w-12 h-12 text-accent-400 mx-auto mb-4" aria-hidden />
          <h1 className="text-white mb-4">{t.headline}</h1>
          <p className="text-primary-200 text-lg">{t.subheadline}</p>
        </div>
      </section>

      {/* Welcome message */}
      <section className="section-sm bg-accent-50 border-b border-accent-100">
        <div className="container-narrow px-4 text-center">
          <p className="text-lg text-neutral-700 leading-relaxed">{t.welcome_body}</p>
        </div>
      </section>

      {/* Course Catalog */}
      <section className="section bg-white">
        <div className="container-site px-4">
          <h2 className="mb-8">{t.courses_title}</h2>

          {courses && courses.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: Course & { videos: { id: string; is_published: boolean }[] }) => {
                const publishedVideos = (course.videos || []).filter((v) => v.is_published)
                const videoCount = publishedVideos.length
                const title = lang === 'es' ? course.title_es : course.title_en
                const description = lang === 'es' ? course.description_es : course.description_en

                return (
                  <Link
                    key={course.id}
                    href={`/${lang}/new-believers/${course.id}`}
                    className="card hover:shadow-md transition-shadow no-underline group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-primary-100 overflow-hidden">
                      {course.thumbnail_url ? (
                        <Image
                          src={course.thumbnail_url}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlayCircle className="w-16 h-16 text-primary-300" />
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full">
                        {t.videos_count(videoCount)}
                      </div>
                    </div>

                    <div className="card-body">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary-900 transition-colors">
                        {title}
                      </h3>
                      {description && (
                        <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3 mb-4">
                          {description}
                        </p>
                      )}
                      <span className="btn btn-primary btn-sm no-underline w-full justify-center">
                        <PlayCircle className="w-4 h-4" />
                        {t.start_course}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">
                {lang === 'es' ? 'Cursos próximamente.' : 'Courses coming soon.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
