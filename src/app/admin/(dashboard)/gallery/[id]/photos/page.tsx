import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AlbumPhotoManager from '@/components/admin/AlbumPhotoManager'
import type { GalleryPhoto } from '@/types'

export const metadata = { title: 'Album Photos - Admin | Iglesia Monte Horeb' }

export default async function AlbumPhotosPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: album }, { data: photos }] = await Promise.all([
    supabase.from('gallery_albums').select('*').eq('id', params.id).single(),
    supabase
      .from('gallery_photos')
      .select('*')
      .eq('album_id', params.id)
      .order('sort_order', { ascending: true }),
  ])

  if (!album) notFound()

  return (
    <div>
      <Link href="/admin/gallery" className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Gallery
      </Link>
      <h1 className="text-2xl font-bold mb-1">{album.title_en}</h1>
      <p className="text-neutral-500 text-sm mb-6">Manage the photos in this album.</p>

      <AlbumPhotoManager albumId={params.id} initialPhotos={(photos as GalleryPhoto[]) || []} />
    </div>
  )
}
