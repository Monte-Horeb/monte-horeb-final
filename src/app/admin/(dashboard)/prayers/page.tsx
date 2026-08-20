import { createClient } from '@/lib/supabase/server'
import { Heart, Eye, EyeOff } from 'lucide-react'
import DeleteButton from '@/components/admin/DeleteSongButton'

export const metadata = { title: 'Prayer Requests - Admin | Iglesia Monte Horeb' }

export default async function PrayersPage() {
  const supabase = await createClient()

  const { data: prayers } = await supabase
    .from('prayer_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const publicCount = prayers?.filter((p) => p.is_public).length || 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Prayer Requests</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {publicCount} public • {prayers?.length || 0} total received
        </p>
      </div>

      <div className="card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-4">Prayer Title</th>
              <th className="px-6 py-4">Requester</th>
              <th className="px-6 py-4">Visibility</th>
              <th className="px-6 py-4">Prayer Count</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {prayers?.map((prayer: any) => (
              <tr key={prayer.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-neutral-900">{prayer.prayer_title}</p>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{prayer.prayer_request}</p>
                </td>
                <td className="px-6 py-4 text-sm">
                  <p>{prayer.requester_name}</p>
                  <p className="text-xs text-neutral-500">{prayer.requester_email}</p>
                </td>
                <td className="px-6 py-4">
                  {prayer.is_public ? (
                    <span className="inline-flex items-center gap-1 badge bg-blue-100 text-blue-700 text-xs">
                      <Eye className="w-3 h-3" /> Public
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 badge bg-neutral-100 text-neutral-600 text-xs">
                      <EyeOff className="w-3 h-3" /> Private
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">{prayer.prayer_count}</td>
                <td className="px-6 py-4 text-xs text-neutral-500">
                  {new Date(prayer.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <DeleteButton id={prayer.id} table="prayer_requests" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
