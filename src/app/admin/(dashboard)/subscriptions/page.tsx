import { createClient } from '@/lib/supabase/server'
import { Mail, Trash2 } from 'lucide-react'
import DeleteButton from '@/components/admin/DeleteSongButton'

export const metadata = { title: 'Email Subscribers - Admin | Iglesia Monte Horeb' }

export default async function SubscribersPage() {
  const supabase = await createClient()

  const { data: subscribers } = await supabase
    .from('email_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false })

  const activeCount = subscribers?.filter((s) => s.is_active).length || 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Email Subscribers</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {activeCount} active • {subscribers?.length || 0} total
        </p>
      </div>

      <div className="card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Language</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Subscribed</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {subscribers?.map((sub: any) => (
              <tr key={sub.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 font-medium">{sub.email}</td>
                <td className="px-6 py-4 text-sm text-neutral-500">{sub.name || ' - '}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="badge badge-blue text-xs uppercase">{sub.preferred_lang}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge text-xs ${sub.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
                    {sub.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-neutral-500">
                  {new Date(sub.subscribed_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <DeleteButton id={sub.id} table="email_subscribers" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
