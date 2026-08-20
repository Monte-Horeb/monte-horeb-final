import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ResourceForm from '@/components/admin/ResourceForm'
import { courseFields } from '../../fields'

export const metadata = { title: 'Edit Course - Admin | Iglesia Monte Horeb' }

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: record } = await supabase.from('courses').select('*').eq('id', params.id).single()

  if (!record) notFound()

  return (
    <div>
      <Link href="/admin/courses" className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
      <ResourceForm table="courses" fields={courseFields} record={record} redirectTo="/admin/courses" />
    </div>
  )
}
