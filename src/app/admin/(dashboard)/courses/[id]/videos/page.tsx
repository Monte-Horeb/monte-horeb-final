import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Plus, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DeleteButton from '@/components/admin/DeleteSongButton'
import TogglePublishButton from '@/components/admin/TogglePublishButton'

export const metadata = { title: 'Course Lessons - Admin | Iglesia Monte Horeb' }

export default async function CourseVideosPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [{ data: course }, { data: videos }] = await Promise.all([
    supabase.from('courses').select('*').eq('id', params.id).single(),
    supabase
      .from('course_videos')
      .select('*')
      .eq('course_id', params.id)
      .order('sort_order', { ascending: true }),
  ])

  if (!course) notFound()

  return (
    <div>
      <Link href="/admin/courses" className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{course.title_en}</h1>
          <p className="text-neutral-500 text-sm mt-1">{videos?.length || 0} lessons</p>
        </div>
        <Link href={`/admin/courses/${params.id}/videos/new`} className="btn btn-primary btn-sm no-underline">
          <Plus className="w-4 h-4" /> Add Lesson
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Lesson</th>
              <th className="px-6 py-4">Videos</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos?.map((video, i) => (
              <tr key={video.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 text-sm text-neutral-400">{i + 1}</td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-neutral-900">{video.title_en}</p>
                  {video.title_es && <p className="text-sm text-neutral-500">{video.title_es}</p>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    {video.youtube_url_en && <span className="badge bg-red-100 text-red-700 text-xs">EN</span>}
                    {video.youtube_url_es && <span className="badge bg-red-100 text-red-700 text-xs">ES</span>}
                    {!video.youtube_url_en && !video.youtube_url_es && <span className="text-neutral-400 text-xs">-</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <TogglePublishButton id={video.id} table="course_videos" isPublished={video.is_published} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/courses/${params.id}/videos/${video.id}/edit`} className="p-2 rounded text-neutral-600 hover:text-primary-700 no-underline">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteButton id={video.id} table="course_videos" label={video.title_en} />
                  </div>
                </td>
              </tr>
            ))}
            {!videos?.length && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500">No lessons yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
