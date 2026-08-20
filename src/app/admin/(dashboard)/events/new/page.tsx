import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ResourceForm from '@/components/admin/ResourceForm'
import { eventFields } from '../fields'

export const metadata = { title: 'New Event - Admin | Iglesia Monte Horeb' }

export default function NewEventPage() {
  return (
    <div>
      <Link href="/admin/events" className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">New Event</h1>
      <ResourceForm table="events" fields={eventFields} redirectTo="/admin/events" />
    </div>
  )
}
