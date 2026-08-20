import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ResourceForm from '@/components/admin/ResourceForm'
import { courseVideoFields } from '../../../fields'

export const metadata = { title: 'New Lesson - Admin | Iglesia Monte Horeb' }

export default function NewCourseVideoPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <Link href={`/admin/courses/${params.id}/videos`} className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Lessons
      </Link>
      <h1 className="text-2xl font-bold mb-6">New Lesson</h1>
      <ResourceForm
        table="course_videos"
        fields={courseVideoFields}
        record={{ course_id: params.id }}
        redirectTo={`/admin/courses/${params.id}/videos`}
      />
    </div>
  )
}
