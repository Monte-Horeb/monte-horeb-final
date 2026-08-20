import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from '@/components/admin/DeleteSongButton'
import TogglePublishButton from '@/components/admin/TogglePublishButton'

export const metadata = { title: 'Sermons - Admin | Iglesia Monte Horeb' }

export default async function AdminSermonsPage() {
  const supabase = createClient()
  const { data: sermons } = await supabase
    .from('sermons')
    .select('*')
    .order('sermon_date', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sermons</h1>
          <p className="text-neutral-500 text-sm mt-1">{sermons?.length || 0} sermons</p>
        </div>
        <Link href="/admin/sermons/new" className="btn btn-primary btn-sm no-underline">
          <Plus className="w-4 h-4" /> Add Sermon
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Speaker</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sermons?.map((sermon) => (
              <tr key={sermon.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-neutral-900">{sermon.title_en}</p>
                  {sermon.title_es && <p className="text-sm text-neutral-500">{sermon.title_es}</p>}
                </td>
                <td className="px-6 py-4 text-sm">{sermon.speaker}</td>
                <td className="px-6 py-4 text-sm text-neutral-500">
                  {sermon.sermon_date ? new Date(sermon.sermon_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4">
                  {sermon.is_foundational ? (
                    <span className="badge badge-gold text-xs">Foundational</span>
                  ) : (
                    <span className="badge badge-blue text-xs">Recent</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <TogglePublishButton id={sermon.id} table="sermons" isPublished={sermon.is_published} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/sermons/${sermon.id}/edit`} className="p-2 rounded text-neutral-600 hover:text-primary-700 no-underline">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={sermon.id} table="sermons" label={sermon.title_en} />
                  </div>
                </td>
              </tr>
            ))}
            {!sermons?.length && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-500">No sermons yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
