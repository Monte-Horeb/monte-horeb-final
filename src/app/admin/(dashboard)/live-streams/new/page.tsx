import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ResourceForm from '@/components/admin/ResourceForm'
import { streamFields } from '../fields'

export const metadata = { title: 'New Stream - Admin | Iglesia Monte Horeb' }

export default function NewStreamPage() {
  return (
    <div>
      <Link href="/admin/live-streams" className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">New Stream</h1>
      <ResourceForm table="live_streams" fields={streamFields} redirectTo="/admin/live-streams" />
    </div>
  )
}
