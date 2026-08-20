import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ResourceForm from '@/components/admin/ResourceForm'
import { streamFields } from '../../fields'

export const metadata = { title: 'Edit Stream - Admin | Iglesia Monte Horeb' }

export default async function EditStreamPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: record } = await supabase.from('live_streams').select('*').eq('id', params.id).single()

  if (!record) notFound()

  return (
    <div>
      <Link href="/admin/live-streams" className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Stream</h1>
      <ResourceForm table="live_streams" fields={streamFields} record={record} redirectTo="/admin/live-streams" />
    </div>
  )
}
