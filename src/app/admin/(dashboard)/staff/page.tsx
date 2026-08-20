import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from '@/components/admin/DeleteSongButton'
import TogglePublishButton from '@/components/admin/TogglePublishButton'

export const metadata = { title: 'Staff Directory - Admin | Iglesia Monte Horeb' }

export default async function StaffPage() {
  const supabase = await createClient()

  const { data: staff } = await supabase
    .from('staff_directory')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Staff Directory</h1>
          <p className="text-neutral-500 text-sm mt-1">{staff?.length || 0} staff members</p>
        </div>
        <Link href="/admin/staff/new" className="btn btn-primary btn-sm no-underline">
          <Plus className="w-4 h-4" /> Add Staff
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Visibility</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff?.map((member: any) => (
              <tr key={member.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 font-semibold">
                  {member.first_name} {member.last_name}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="badge badge-blue text-xs">{member.role_en}</span>
                </td>
                <td className="px-6 py-4 text-sm">{member.email}</td>
                <td className="px-6 py-4 text-sm text-neutral-500">{member.phone || ' - '}</td>
                <td className="px-6 py-4">
                  <TogglePublishButton
                    id={member.id}
                    table="staff_directory"
                    column="is_public"
                    isPublished={member.is_public}
                    labels={{ on: 'Public', off: 'Hidden' }}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/staff/${member.id}/edit`} className="btn-ghost p-2 rounded text-neutral-600 hover:text-primary-700 no-underline">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={member.id} table="staff_directory" />
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
