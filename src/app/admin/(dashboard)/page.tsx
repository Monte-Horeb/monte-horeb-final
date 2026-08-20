import Link from 'next/link'
import { Music, BookOpen, MessageSquare, BarChart3, Radio, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Admin Dashboard - Iglesia Monte Horeb' }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: songCount },
    { count: courseCount },
    { count: contactCount },
    { count: viewCount },
  ] = await Promise.all([
    supabase.from('songs').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('read', false),
    supabase.from('video_progress').select('*', { count: 'exact', head: true }),
  ])

  const cards = [
    {
      title: 'Songs',
      value: songCount || 0,
      icon: Music,
      href: '/admin/songs',
      description: 'Manage song library',
      color: 'bg-primary-50 text-primary-700',
    },
    {
      title: 'Courses',
      value: courseCount || 0,
      icon: BookOpen,
      href: '/admin/courses',
      description: 'New Believers courses',
      color: 'bg-accent-50 text-accent-700',
    },
    {
      title: 'Sermons',
      value: null,
      icon: Radio,
      href: '/admin/sermons',
      description: 'Manage sermon entries',
      color: 'bg-green-50 text-green-700',
    },
    {
      title: 'Events',
      value: null,
      icon: Calendar,
      href: '/admin/events',
      description: 'Manage events',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Unread Messages',
      value: contactCount || 0,
      icon: MessageSquare,
      href: '/admin/messages',
      description: 'Contact form submissions',
      color: contactCount && contactCount > 0 ? 'bg-red-50 text-red-700' : 'bg-neutral-50 text-neutral-700',
    },
    {
      title: 'Video Views',
      value: viewCount || 0,
      icon: BarChart3,
      href: '/admin/analytics',
      description: 'Course analytics',
      color: 'bg-blue-50 text-blue-700',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Iglesia Monte Horeb - Admin Panel</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.href} href={card.href} className="admin-card hover:shadow-md transition-shadow no-underline group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {card.value !== null && (
                  <span className="text-3xl font-bold text-neutral-900">{card.value}</span>
                )}
              </div>
              <h3 className="font-bold text-neutral-900 group-hover:text-primary-900 transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-neutral-500 mt-1">{card.description}</p>
            </Link>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/songs/new" className="btn btn-primary btn-sm no-underline">
            <Music className="w-4 h-4" /> Add Song
          </Link>
          <Link href="/admin/courses/new" className="btn btn-accent btn-sm no-underline">
            <BookOpen className="w-4 h-4" /> Add Course
          </Link>
          <Link href="/admin/songs/categories" className="btn btn-outline btn-sm no-underline">
            Manage Categories
          </Link>
          <Link href="/admin/analytics" className="btn btn-outline btn-sm no-underline">
            <BarChart3 className="w-4 h-4" /> View Analytics
          </Link>
        </div>
      </div>
    </div>
  )
}
