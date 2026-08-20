import { createAdminClient } from '@/lib/supabase/server'
import { BarChart3, Users, CheckCircle, PlayCircle, Music } from 'lucide-react'
import type { CourseAnalytics } from '@/types'

export const metadata = { title: 'Analytics - Admin | Iglesia Monte Horeb' }

type CourseAnalyticsRow = CourseAnalytics

export default async function AnalyticsPage() {
  const supabase = createAdminClient()

  const [
    { data: analytics },
    { count: totalViews },
    { count: totalCompletions },
    { count: songViews },
  ] = await Promise.all([
    supabase.from('course_analytics').select('*'),
    supabase.from('video_progress').select('*', { count: 'exact', head: true }),
    supabase.from('video_progress').select('*', { count: 'exact', head: true }).eq('completed', true),
    supabase
      .from('songs')
      .select('view_count')
      .then(({ data }) => ({
        count:
          (data as { view_count: number | null }[] | null)?.reduce(
            (sum, s) => sum + (s.view_count || 0),
            0
          ) || 0,
      })),
  ])

  // Group analytics by course
  const rows = (analytics || []) as CourseAnalyticsRow[]
  const byCourse: Record<
    string,
    { course: string; videos: CourseAnalyticsRow[]; totalViewers: number; totalCompletions: number }
  > = {}
  rows.forEach((row) => {
    if (!byCourse[row.course_id]) {
      byCourse[row.course_id] = {
        course: row.course,
        videos: [],
        totalViewers: 0,
        totalCompletions: 0,
      }
    }
    byCourse[row.course_id].videos.push(row)
    byCourse[row.course_id].totalViewers += row.unique_viewers
    byCourse[row.course_id].totalCompletions += row.completions
  })

  const overviewCards = [
    { label: 'Total Video Views', value: totalViews || 0, icon: PlayCircle, color: 'text-primary-700 bg-primary-50' },
    { label: 'Total Completions', value: totalCompletions || 0, icon: CheckCircle, color: 'text-green-700 bg-green-50' },
    { label: 'Song Page Views', value: songViews as unknown as number, icon: Music, color: 'text-accent-700 bg-accent-50' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-neutral-500 text-sm mt-1">Course progress and engagement</p>
      </div>

      {/* Overview cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {overviewCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="admin-card">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-neutral-900">{card.value.toLocaleString()}</p>
              <p className="text-sm text-neutral-500 mt-1">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Course breakdown */}
      <div className="space-y-8">
        <h2 className="text-xl font-bold">Course Breakdown</h2>

        {Object.entries(byCourse).length > 0 ? (
          Object.entries(byCourse).map(([courseId, data]) => (
            <div key={courseId} className="card overflow-hidden">
              <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="font-bold text-lg">{data.course}</h3>
                <div className="flex gap-4 text-sm text-neutral-500">
                  <span><strong className="text-neutral-900">{data.totalViewers}</strong> viewers</span>
                  <span><strong className="text-neutral-900">{data.totalCompletions}</strong> completions</span>
                </div>
              </div>

              <table className="admin-table">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="px-6 py-3">Lesson</th>
                    <th className="px-6 py-3">Language</th>
                    <th className="px-6 py-3">Unique Viewers</th>
                    <th className="px-6 py-3">Completions</th>
                    <th className="px-6 py-3">Avg Watch Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.videos.map((row, i) => (
                    <tr key={i} className="hover:bg-neutral-50">
                      <td className="px-6 py-3 font-medium text-sm">{row.video}</td>
                      <td className="px-6 py-3">
                        <span className="badge badge-blue text-xs uppercase">{row.lang}</span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-neutral-400" />
                          {row.unique_viewers}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {row.completions}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-neutral-500">
                        {row.avg_watch_seconds
                          ? `${Math.floor(row.avg_watch_seconds / 60)}m ${Math.floor(row.avg_watch_seconds % 60)}s`
                          : ' - '}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <div className="card card-body text-center py-16">
            <BarChart3 className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No analytics data yet. Share your courses to see stats here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
