import Link from 'next/link'
import { Plus, Pencil, Film } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from '@/components/admin/DeleteSongButton'
import TogglePublishButton from '@/components/admin/TogglePublishButton'

export const metadata = { title: 'Courses - Admin | Iglesia Monte Horeb' }

export default async function AdminCoursesPage() {
  const supabase = createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*, videos:course_videos(id)')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-neutral-500 text-sm mt-1">{courses?.length || 0} courses</p>
        </div>
        <Link href="/admin/courses/new" className="btn btn-primary btn-sm no-underline">
          <Plus className="w-4 h-4" /> Add Course
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Lessons</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses?.map((course: any) => (
              <tr key={course.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-neutral-900">{course.title_en}</p>
                  {course.title_es && <p className="text-sm text-neutral-500">{course.title_es}</p>}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-500">{course.videos?.length || 0} lessons</td>
                <td className="px-6 py-4">
                  <TogglePublishButton id={course.id} table="courses" isPublished={course.is_published} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/courses/${course.id}/videos`} className="p-2 rounded text-neutral-600 hover:text-primary-700 no-underline" title="Manage lessons">
                      <Film className="w-4 h-4" />
                    </Link>
                    <Link href={`/admin/courses/${course.id}/edit`} className="p-2 rounded text-neutral-600 hover:text-primary-700 no-underline">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={course.id} table="courses" label={course.title_en} />
                  </div>
                </td>
              </tr>
            ))}
            {!courses?.length && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-500">No courses yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
