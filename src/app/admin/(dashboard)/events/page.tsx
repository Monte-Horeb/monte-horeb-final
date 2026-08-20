import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from '@/components/admin/DeleteSongButton'
import TogglePublishButton from '@/components/admin/TogglePublishButton'

export const metadata = { title: 'Events - Admin | Iglesia Monte Horeb' }

export default async function AdminEventsPage() {
  const supabase = createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('start_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-neutral-500 text-sm mt-1">{events?.length || 0} events</p>
        </div>
        <Link href="/admin/events/new" className="btn btn-primary btn-sm no-underline">
          <Plus className="w-4 h-4" /> Add Event
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-4">Event</th>
              <th className="px-6 py-4">Starts</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Ministry</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events?.map((event) => (
              <tr key={event.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-neutral-900">{event.title_en}</p>
                  {event.title_es && <p className="text-sm text-neutral-500">{event.title_es}</p>}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">
                  {event.start_at ? new Date(event.start_at).toLocaleString() : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-500">{event.location_en || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  {event.ministry_tag ? <span className="badge badge-blue text-xs">{event.ministry_tag}</span> : '-'}
                </td>
                <td className="px-6 py-4">
                  <TogglePublishButton id={event.id} table="events" isPublished={event.is_published} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/events/${event.id}/edit`} className="p-2 rounded text-neutral-600 hover:text-primary-700 no-underline">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={event.id} table="events" label={event.title_en} />
                  </div>
                </td>
              </tr>
            ))}
            {!events?.length && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-500">No events yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
