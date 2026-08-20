import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ResourceForm from '@/components/admin/ResourceForm'
import { sermonFields } from '../fields'

export const metadata = { title: 'New Sermon - Admin | Iglesia Monte Horeb' }

export default function NewSermonPage() {
  return (
    <div>
      <Link href="/admin/sermons" className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">New Sermon</h1>
      <ResourceForm table="sermons" fields={sermonFields} redirectTo="/admin/sermons" />
    </div>
  )
}
