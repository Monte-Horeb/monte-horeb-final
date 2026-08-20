import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ResourceForm from '@/components/admin/ResourceForm'
import { staffFields } from '../fields'

export const metadata = { title: 'New Staff Member - Admin | Iglesia Monte Horeb' }

export default function NewStaffPage() {
  return (
    <div>
      <Link href="/admin/staff" className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">New Staff Member</h1>
      <ResourceForm table="staff_directory" fields={staffFields} redirectTo="/admin/staff" />
    </div>
  )
}
