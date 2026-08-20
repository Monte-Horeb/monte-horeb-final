import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, User, ChevronRight, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import BlogFeed from '@/components/blog/BlogFeed'
import type { Lang, BlogPost, BlogCategory } from '@/types'

interface BlogPageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.blog : en.blog
  return { title: t.meta_title, description: t.meta_description }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.blog : en.blog

  const supabase = await createClient()

  const [
    { data: posts },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from('blog_posts')
      .select('*, category:blog_categories(*)')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(20),
    supabase
      .from('blog_categories')
      .select('*')
      .order('sort_order', { ascending: true }),
  ])

  const featuredPost = posts?.[0] || null
  const recentPosts = posts?.slice(1) || []

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-900 text-white section-sm">
        <div className="container-narrow px-4 text-center">
          <h1 className="text-white mb-4">{t.headline}</h1>
          <p className="text-primary-200">{t.subheadline}</p>
        </div>
      </section>

      {/* Featured post (if exists) */}
      {featuredPost && (
        <section className="section bg-white">
          <div className="container-site px-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-primary-700 mb-6">
              {lang === 'es' ? 'Destacado' : 'Featured'}
            </h2>
            <Link
              href={`/${lang}/blog/${featuredPost.slug}`}
              className="block group no-underline"
            >
              <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                {/* Image */}
                {featuredPost.featured_image_url && (
                  <div className="rounded-xl overflow-hidden bg-neutral-100 h-96 lg:h-auto">
                    <img
                      src={featuredPost.featured_image_url}
                      alt={lang === 'es' ? featuredPost.title_es : featuredPost.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-col justify-center">
                  {featuredPost.category && (
                    <span className="badge badge-blue w-fit mb-4">
                      {lang === 'es'
                        ? (featuredPost.category as any).name_es
                        : (featuredPost.category as any).name_en}
                    </span>
                  )}
                  <h3 className="text-3xl font-bold mb-3 group-hover:text-primary-700 transition-colors leading-tight">
                    {lang === 'es' ? featuredPost.title_es : featuredPost.title_en}
                  </h3>
                  {(lang === 'es' ? featuredPost.excerpt_es : featuredPost.excerpt_en) && (
                    <p className="text-neutral-600 text-lg mb-4 leading-relaxed">
                      {lang === 'es' ? featuredPost.excerpt_es : featuredPost.excerpt_en}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-neutral-500 mb-6">
                    {featuredPost.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(featuredPost.published_at).toLocaleDateString(
                          lang === 'es' ? 'es-MX' : 'en-US',
                          { year: 'numeric', month: 'long', day: 'numeric' }
                        )}
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-2 text-primary-700 font-semibold group-hover:underline">
                    {t.read_more}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Blog feed with search & filters */}
      <BlogFeed
        lang={lang}
        posts={recentPosts || []}
        categories={categories || []}
        t={t}
      />
    </div>
  )
}
