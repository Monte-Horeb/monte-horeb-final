import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import GalleryLightbox from '@/components/gallery/GalleryLightbox'
import type { Lang, GalleryPhoto } from '@/types'

interface AlbumPageProps {
  params: { lang: string; slug: string }
}

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const supabase = createClient()

  const { data: album } = await supabase
    .from('gallery_albums')
    .select('title_en, title_es, description_en, description_es')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!album) return {}

  const title = lang === 'es' && album.title_es ? album.title_es : album.title_en
  return {
    title: `${title} | Iglesia Monte Horeb`,
    description:
      (lang === 'es' ? album.description_es : album.description_en) || undefined,
  }
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.gallery : en.gallery

  const supabase = createClient()

  const { data: album } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!album) notFound()

  const { data: photos } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('album_id', album.id)
    .order('sort_order', { ascending: true })

  const title = lang === 'es' && album.title_es ? album.title_es : album.title_en
  const description = lang === 'es' ? album.description_es : album.description_en

  return (
    <div>
      {/* Back nav */}
      <div className="bg-white border-b border-neutral-100 py-3 px-4">
        <div className="container-site">
          <Link
            href={`/${lang}/gallery`}
            className="inline-flex items-center gap-2 text-sm text-primary-700 no-underline hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'es' ? 'Volver a la Galería' : 'Back to Gallery'}
          </Link>
        </div>
      </div>

      <section className="section bg-white">
        <div className="container-site px-4">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {description && <p className="text-neutral-600 mb-8">{description}</p>}

          {photos && photos.length > 0 ? (
            <GalleryLightbox photos={photos as GalleryPhoto[]} lang={lang} t={t} />
          ) : (
            <p className="text-neutral-500 py-12 text-center">
              {lang === 'es' ? 'Este álbum aún no tiene fotos.' : 'This album has no photos yet.'}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
