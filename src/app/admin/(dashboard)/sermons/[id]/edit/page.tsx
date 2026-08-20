import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ResourceForm from '@/components/admin/ResourceForm'
import { sermonFields } from '../../fields'

export const metadata = { title: 'Edit Sermon - Admin | Iglesia Monte Horeb' }

export default async function EditSermonPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: record } = await supabase.from('sermons').select('*').eq('id', params.id).single()

  if (!record) notFound()

  return (
    <div>
      <Link href="/admin/sermons" className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Sermon</h1>
      <ResourceForm table="sermons" fields={sermonFields} record={record} redirectTo="/admin/sermons" />
    </div>
  )
}
