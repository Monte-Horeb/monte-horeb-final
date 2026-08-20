import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import { Radio } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from '@/components/admin/DeleteSongButton'

export const metadata = { title: 'Live Streams - Admin | Iglesia Monte Horeb' }

export default async function LiveStreamsPage() {
  const supabase = await createClient()

  const { data: streams } = await supabase
    .from('live_streams')
    .select('*')
    .order('scheduled_at', { ascending: false })

  const isLive = streams?.find((s) => s.is_live)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Live Streams</h1>
          <p className="text-neutral-500 text-sm mt-1">{streams?.length || 0} total</p>
        </div>
        <Link href="/admin/live-streams/new" className="btn btn-primary btn-sm no-underline">
          <Plus className="w-4 h-4" /> New Stream
        </Link>
      </div>

      {isLive && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Radio className="w-6 h-6 text-red-600 animate-pulse flex-shrink-0" />
          <div>
            <p className="font-bold text-red-900">{isLive.title_en} is LIVE NOW</p>
            <p className="text-sm text-red-700">{isLive.viewer_count} viewers</p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Scheduled</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {streams?.map((stream: any) => (
              <tr key={stream.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-neutral-900">{stream.title_en}</p>
                  {stream.title_es && <p className="text-sm text-neutral-500">{stream.title_es}</p>}
                </td>
                <td className="px-6 py-4">
                  {stream.is_live ? (
                    <span className="badge bg-red-100 text-red-700 text-xs animate-pulse">
                      <Radio className="w-3 h-3 inline mr-1" />
                      LIVE
                    </span>
                  ) : (
                    <span className="badge bg-neutral-100 text-neutral-600 text-xs">Scheduled</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">
                  {stream.scheduled_at
                    ? new Date(stream.scheduled_at).toLocaleString()
                    : ' - '}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/live-streams/${stream.id}/edit`} className="btn-ghost p-2 rounded text-neutral-600 hover:text-primary-700 no-underline">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={stream.id} table="live_streams" />
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
