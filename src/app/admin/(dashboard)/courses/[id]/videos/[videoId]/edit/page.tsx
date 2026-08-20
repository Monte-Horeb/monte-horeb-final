import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ResourceForm from '@/components/admin/ResourceForm'
import { courseVideoFields } from '../../../../fields'

export const metadata = { title: 'Edit Lesson - Admin | Iglesia Monte Horeb' }

export default async function EditCourseVideoPage({
  params,
}: {
  params: { id: string; videoId: string }
}) {
  const supabase = createClient()
  const { data: video } = await supabase
    .from('course_videos')
    .select('*')
    .eq('id', params.videoId)
    .single()

  if (!video) notFound()

  return (
    <div>
      <Link href={`/admin/courses/${params.id}/videos`} className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Lessons
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Lesson</h1>
      <ResourceForm
        table="course_videos"
        fields={courseVideoFields}
        record={video}
        redirectTo={`/admin/courses/${params.id}/videos`}
      />
    </div>
  )
}
