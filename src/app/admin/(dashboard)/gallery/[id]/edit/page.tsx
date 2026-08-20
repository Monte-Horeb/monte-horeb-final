import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ResourceForm from '@/components/admin/ResourceForm'
import { albumFields } from '../../fields'

export const metadata = { title: 'Edit Album - Admin | Iglesia Monte Horeb' }

export default async function EditAlbumPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: record } = await supabase.from('gallery_albums').select('*').eq('id', params.id).single()

  if (!record) notFound()

  return (
    <div>
      <Link href="/admin/gallery" className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Album</h1>
      <ResourceForm table="gallery_albums" fields={albumFields} record={record} redirectTo="/admin/gallery" />
    </div>
  )
}
