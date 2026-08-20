import { createAdminClient } from '@/lib/supabase/server'
import { BarChart3, TrendingUp, Users, Mail, Heart, Radio } from 'lucide-react'

export const metadata = { title: 'Advanced Analytics - Admin | Iglesia Monte Horeb' }

export default async function AdvancedAnalyticsPage() {
  const supabase = createAdminClient()

  // Overall stats
  const [
    { count: totalVisitors },
    { count: totalSubscribers },
    { count: totalPrayerRequests },
    { count: totalBlogViews },
    { count: totalSongViews },
    { count: totalCourseViews },
    { data: dailyStats },
  ] = await Promise.all([
    supabase.from('analytics_events').select('*', { count: 'exact', head: true }),
    supabase.from('email_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('prayer_requests').select('*', { count: 'exact', head: true }),
    // These sum a column, so the rows must actually be returned.
    // `head: true` returns no rows at all, which made both totals always 0.
    supabase
      .from('blog_posts')
      .select('view_count')
      .then(({ data }) => ({
        count:
          (data as { view_count: number | null }[] | null)?.reduce(
            (sum, p) => sum + (p.view_count || 0),
            0
          ) || 0,
      })),
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
    supabase.from('video_progress').select('*', { count: 'exact', head: true }).eq('completed', true),
    supabase.from('analytics_daily').select('*').order('date', { ascending: false }).limit(30),
  ])

  const cards = [
    { label: 'Total Visitors', value: totalVisitors || 0, icon: Users, color: 'text-primary-700 bg-primary-50' },
    { label: 'Email Subscribers', value: totalSubscribers || 0, icon: Mail, color: 'text-accent-700 bg-accent-50' },
    { label: 'Prayer Requests', value: totalPrayerRequests || 0, icon: Heart, color: 'text-red-700 bg-red-50' },
    { label: 'Blog Views', value: totalBlogViews, icon: BarChart3, color: 'text-blue-700 bg-blue-50' },
    { label: 'Song Library Views', value: totalSongViews, icon: Radio, color: 'text-green-700 bg-green-50' },
    { label: 'Course Completions', value: totalCourseViews || 0, icon: TrendingUp, color: 'text-purple-700 bg-purple-50' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Advanced Analytics</h1>
        <p className="text-neutral-500 text-sm mt-1">Comprehensive engagement metrics and insights</p>
      </div>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="admin-card">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-neutral-900">{(card.value as number).toLocaleString()}</p>
              <p className="text-sm text-neutral-500 mt-1">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Daily breakdown */}
      <div className="card">
        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-100">
          <h2 className="font-bold">Last 30 Days</h2>
        </div>

        <table className="admin-table">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Page Views</th>
              <th className="px-6 py-3">Unique Visitors</th>
              <th className="px-6 py-3">New Subscribers</th>
              <th className="px-6 py-3">Prayer Requests</th>
              <th className="px-6 py-3">Avg Session (sec)</th>
              <th className="px-6 py-3">Bounce Rate</th>
            </tr>
          </thead>
          <tbody>
            {dailyStats?.map((day: any) => (
              <tr key={day.id} className="hover:bg-neutral-50">
                <td className="px-6 py-3 font-medium text-sm">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-6 py-3 text-sm">{day.page_views || 0}</td>
                <td className="px-6 py-3 text-sm">{day.unique_visitors || 0}</td>
                <td className="px-6 py-3 text-sm">{day.new_subscribers || 0}</td>
                <td className="px-6 py-3 text-sm">{day.prayer_requests || 0}</td>
                <td className="px-6 py-3 text-sm text-neutral-500">
                  {day.avg_session_duration ? `${Math.floor(day.avg_session_duration / 60)}m ${day.avg_session_duration % 60}s` : ' - '}
                </td>
                <td className="px-6 py-3 text-sm text-neutral-500">
                  {day.bounce_rate ? `${Math.round(day.bounce_rate)}%` : ' - '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
