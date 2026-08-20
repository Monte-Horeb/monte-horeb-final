import Link from 'next/link'
import { Plus, Pencil, Trash2, Images } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from '@/components/admin/DeleteSongButton'
import TogglePublishButton from '@/components/admin/TogglePublishButton'

export const metadata = { title: 'Photo Gallery - Admin | Iglesia Monte Horeb' }

export default async function AdminGalleryPage() {
  const supabase = await createClient()

  const { data: albums } = await supabase
    .from('gallery_albums')
    .select('*, photos:gallery_photos(id)')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Photo Gallery</h1>
          <p className="text-neutral-500 text-sm mt-1">{albums?.length || 0} albums</p>
        </div>
        <Link href="/admin/gallery/new" className="btn btn-primary btn-sm no-underline">
          <Plus className="w-4 h-4" /> New Album
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-4">Album</th>
              <th className="px-6 py-4">Photos</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {albums?.map((album: any) => (
              <tr key={album.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-neutral-900">{album.title_en}</p>
                  {album.title_es && <p className="text-sm text-neutral-500">{album.title_es}</p>}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-500">
                  {album.photos?.length || 0} photos
                </td>
                <td className="px-6 py-4">
                  <TogglePublishButton id={album.id} table="gallery_albums" isPublished={album.is_published} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/gallery/${album.id}/edit`} className="btn-ghost p-2 rounded text-neutral-600 hover:text-primary-700 no-underline">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <Link href={`/admin/gallery/${album.id}/photos`} className="btn-ghost p-2 rounded text-neutral-600 hover:text-primary-700 no-underline">
                      <Images className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={album.id} table="gallery_albums" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
