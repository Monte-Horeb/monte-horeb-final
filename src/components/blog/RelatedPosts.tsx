import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Lang, BlogPost } from '@/types'

interface RelatedPostsProps {
  posts: BlogPost[]
  lang: Lang
}

export default function RelatedPosts({ posts, lang }: RelatedPostsProps) {
  return (
    <section className="section bg-neutral-50">
      <div className="container-site px-4">
        <h2 className="text-2xl font-bold mb-8">
          {lang === 'es' ? 'Artículos Relacionados' : 'Related Posts'}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const title = lang === 'es' && post.title_es ? post.title_es : post.title_en

            return (
              <Link
                key={post.id}
                href={`/${lang}/blog/${post.slug}`}
                className="card hover:shadow-md transition-shadow no-underline group"
              >
                {post.featured_image_url && (
                  <div className="aspect-video bg-neutral-100 overflow-hidden rounded-t-xl">
                    <img
                      src={post.featured_image_url}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="card-body">
                  <h3 className="font-bold group-hover:text-primary-700 transition-colors line-clamp-2">
                    {title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-primary-700 font-semibold text-sm mt-2">
                    {lang === 'es' ? 'Leer más' : 'Read more'}
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
