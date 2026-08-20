import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import BlogComments from '@/components/blog/BlogComments'
import RelatedPosts from '@/components/blog/RelatedPosts'
import { getSiteUrl } from '@/lib/site-url'
import type { Lang, BlogCategory } from '@/types'

interface BlogPostPageProps {
  params: { lang: string; slug: string }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!post) return {}

  const title = lang === 'es' ? post.title_es : post.title_en
  const description = lang === 'es' ? post.excerpt_es : post.excerpt_en

  return {
    title: `${title} | Iglesia Monte Horeb`,
    description: description || undefined,
    openGraph: {
      title,
      description: description || undefined,
      type: 'article',
      publishedTime: post.published_at,
      authors: ['Iglesia Monte Horeb'],
      images: post.featured_image_url ? [{ url: post.featured_image_url }] : [],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.blog : en.blog

  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*, category:blog_categories(*)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!post) notFound()

  // Atomic increment via SECURITY DEFINER function. The previous
  // read-modify-write lost concurrent views and was blocked by RLS.
  await supabase.rpc('increment_blog_view', { post_id: post.id })

  const title = lang === 'es' && post.title_es ? post.title_es : post.title_en
  const content = lang === 'es' && post.content_es ? post.content_es : post.content_en
  const category = post.category as BlogCategory | null

  // Related posts (same category). Skipped entirely for uncategorised posts -
  // filtering on a null category_id previously matched nothing useful.
  const { data: relatedPosts } = post.category_id
    ? await supabase
        .from('blog_posts')
        .select('*')
        .eq('category_id', post.category_id)
        .eq('is_published', true)
        .neq('id', post.id)
        .order('published_at', { ascending: false })
        .limit(3)
    : { data: null }

  return (
    <div>
      {/* Back nav */}
      <div className="bg-white border-b border-neutral-100 py-3 px-4">
        <div className="container-site">
          <Link
            href={`/${lang}/blog`}
            className="inline-flex items-center gap-2 text-sm text-primary-700 no-underline hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'es' ? 'Volver al Blog' : 'Back to Blog'}
          </Link>
        </div>
      </div>

      {/* Featured image */}
      {post.featured_image_url && (
        <div className="w-full aspect-video bg-neutral-100">
          <img
            src={post.featured_image_url}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article */}
      <article className="section bg-white">
        <div className="container-narrow px-4">
          {/* Header */}
          <div className="mb-8">
            {category && (
              <Link
                href={`/${lang}/blog?category=${post.category_id}`}
                className="badge badge-blue mb-4 no-underline hover:opacity-80"
              >
                {lang === 'es' ? category.name_es : category.name_en}
              </Link>
            )}
            <h1 className="text-4xl font-bold mb-4 leading-tight">{title}</h1>

            {/* Meta */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-neutral-500 mb-8 pb-8 border-b border-neutral-200">
              {post.published_at && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.published_at).toLocaleDateString(
                    lang === 'es' ? 'es-MX' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </span>
              )}
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {lang === 'es' ? 'Iglesia Monte Horeb' : 'Iglesia Monte Horeb'}
              </span>
              <span className="flex items-center gap-2">
                {post.view_count} {lang === 'es' ? 'vistas' : 'views'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div
              dangerouslySetInnerHTML={{ __html: content }}
              className="text-neutral-700 leading-relaxed"
            />
          </div>

          {/* Share */}
          <div className="py-6 border-t border-neutral-200 mb-12">
            <p className="text-sm font-semibold text-neutral-700 mb-3">
              {lang === 'es' ? 'Compartir' : 'Share'}
            </p>
            <div className="flex gap-3">
              {[
                { name: 'Facebook', url: `https://facebook.com/sharer/sharer.php?u=${getSiteUrl()}/${lang}/blog/${post.slug}` },
                { name: 'Twitter', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${getSiteUrl()}/${lang}/blog/${post.slug}` },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-primary-50 rounded-lg text-sm font-medium text-neutral-700 no-underline transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="py-12 border-t border-neutral-200">
            <BlogComments postId={post.id} lang={lang} t={t} />
          </div>
        </div>
      </article>

      {/* Related posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <RelatedPosts posts={relatedPosts} lang={lang} />
      )}
    </div>
  )
}
