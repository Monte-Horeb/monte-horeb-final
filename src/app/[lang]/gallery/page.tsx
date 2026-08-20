import type { Metadata } from 'next'
import Link from 'next/link'
import { Images } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import type { Lang, GalleryAlbum } from '@/types'

interface GalleryPageProps { params: { lang: string } }

export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.gallery : en.gallery
  return { title: t.meta_title, description: t.meta_description }
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.gallery : en.gallery

  const supabase = createClient()

  const { data: albums } = await supabase
    .from('gallery_albums')
    .select('*, photos:gallery_photos(id)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-900 text-white section-sm">
        <div className="container-narrow px-4 text-center">
          <Images className="w-12 h-12 text-accent-400 mx-auto mb-4" aria-hidden />
          <h1 className="text-white mb-4">{t.headline}</h1>
          <p className="text-primary-200">{t.subheadline}</p>
        </div>
      </section>

      <section className="section bg-neutral-50">
        <div className="container-site px-4">
          {albums && albums.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album: GalleryAlbum & { photos?: { id: string }[] }) => {
                const title = lang === 'es' && album.title_es ? album.title_es : album.title_en
                const description = lang === 'es' ? album.description_es : album.description_en

                return (
                  <Link
                    key={album.id}
                    href={`/${lang}/gallery/${album.slug}`}
                    className="card hover:shadow-md transition-shadow no-underline group"
                  >
                    <div className="aspect-video bg-neutral-100 overflow-hidden">
                      {album.thumbnail_url ? (
                        <img
                          src={album.thumbnail_url}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Images className="w-12 h-12 text-neutral-300" />
                        </div>
                      )}
                    </div>
                    <div className="card-body">
                      <h2 className="text-lg font-bold mb-1 group-hover:text-primary-700 transition-colors">
                        {title}
                      </h2>
                      {description && (
                        <p className="text-neutral-600 text-sm line-clamp-2 mb-2">{description}</p>
                      )}
                      <p className="text-xs text-neutral-400">
                        {album.photos?.length || 0} {lang === 'es' ? 'fotos' : 'photos'}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Images className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">
                {lang === 'es' ? 'Galerías próximamente.' : 'Photo galleries coming soon.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
