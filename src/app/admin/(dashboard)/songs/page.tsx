import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye, EyeOff, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DeleteSongButton from '@/components/admin/DeleteSongButton'
import TogglePublishButton from '@/components/admin/TogglePublishButton'

export const metadata = { title: 'Songs - Admin | Iglesia Monte Horeb' }

export default async function AdminSongsPage() {
  const supabase = await createClient()

  const { data: songs } = await supabase
    .from('songs')
    .select('*, category:song_categories(name_en, name_es)')
    .order('sort_order', { ascending: true })
    .order('title_en', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Song Library</h1>
          <p className="text-neutral-500 text-sm mt-1">{songs?.length || 0} songs</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/songs/categories" className="btn btn-outline btn-sm no-underline">
            <Tag className="w-4 h-4" /> Categories
          </Link>
          <Link href="/admin/songs/new" className="btn btn-primary btn-sm no-underline">
            <Plus className="w-4 h-4" /> Add Song
          </Link>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr className="bg-neutral-50 px-6">
              <th className="px-6 py-4">Song</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">File</th>
              <th className="px-6 py-4">Video</th>
              <th className="px-6 py-4">Views</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {songs?.map((song) => (
              <tr key={song.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-neutral-900">{song.title_en}</p>
                  {song.title_es && <p className="text-sm text-neutral-500">{song.title_es}</p>}
                  {song.artist && <p className="text-xs text-neutral-400">{song.artist}</p>}
                </td>
                <td className="px-6 py-4">
                  <span className="badge badge-blue text-xs">
                    {song.category?.name_en || ' - '}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {song.file_type ? (
                    <span className="badge badge-gold text-xs uppercase">{song.file_type}</span>
                  ) : (
                    <span className="text-neutral-400 text-xs"> - </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {song.youtube_url_en && <span className="badge bg-red-100 text-red-700 text-xs">EN</span>}
                    {song.youtube_url_es && <span className="badge bg-red-100 text-red-700 text-xs">ES</span>}
                    {!song.youtube_url_en && !song.youtube_url_es && <span className="text-neutral-400 text-xs"> - </span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-neutral-600 text-sm">{song.view_count}</td>
                <td className="px-6 py-4">
                  <TogglePublishButton
                    id={song.id}
                    table="songs"
                    isPublished={song.is_published}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/songs/${song.id}/edit`} className="btn-ghost p-2 rounded text-neutral-600 hover:text-primary-700">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteSongButton id={song.id} table="songs" />
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
