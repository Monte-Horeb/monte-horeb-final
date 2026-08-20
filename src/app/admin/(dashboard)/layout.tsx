import Link from 'next/link'
import Image from 'next/image'
import {
  Music, BookOpen, BarChart3, MessageSquare, LayoutDashboard, Radio, Calendar,
  Tag, Newspaper, Images, Heart, Mail, Users, Store, Video, TrendingUp, ShoppingBag,
  FileText,
} from 'lucide-react'
import { churchInfo } from '@/content/church-info'
import AdminLogoutButton from '@/components/admin/AdminLogoutButton'

// Grouped so the sidebar stays readable as the admin area grows.
// Every entry here corresponds to a route that actually exists.
const navGroups = [
  {
    label: null,
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/content', label: 'Page Content', icon: FileText },
      { href: '/admin/songs', label: 'Songs', icon: Music },
      { href: '/admin/songs/categories', label: 'Song Categories', icon: Tag },
      { href: '/admin/courses', label: 'Courses', icon: BookOpen },
      { href: '/admin/sermons', label: 'Sermons', icon: Radio },
      { href: '/admin/events', label: 'Events', icon: Calendar },
      { href: '/admin/blog', label: 'Blog', icon: Newspaper },
      { href: '/admin/gallery', label: 'Photo Gallery', icon: Images },
      { href: '/admin/live-streams', label: 'Live Streams', icon: Video },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
      { href: '/admin/prayers', label: 'Prayer Requests', icon: Heart },
      { href: '/admin/subscriptions', label: 'Subscribers', icon: Mail },
      { href: '/admin/staff', label: 'Staff Directory', icon: Users },
    ],
  },
  {
    label: 'Store & Insights',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
      { href: '/admin/bookstore', label: 'Book Store', icon: Store },
      { href: '/admin/analytics', label: 'Course Analytics', icon: BarChart3 },
      { href: '/admin/advanced-analytics', label: 'Advanced Analytics', icon: TrendingUp },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-100">
          <Link href="/admin" className="flex items-center gap-3 no-underline">
            <Image src={churchInfo.logo} alt="Logo" width={36} height={36} className="rounded-full" />
            <div>
              <p className="font-bold text-neutral-900 text-sm leading-tight">Admin Panel</p>
              <p className="text-xs text-neutral-400 leading-tight">{churchInfo.name}</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {navGroups.map((group, gi) => (
            <div key={group.label ?? `group-${gi}`} className="space-y-1">
              {group.label && (
                <p className="px-3 pt-2 text-[0.65rem] font-bold uppercase tracking-wider text-neutral-400">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700
                               hover:bg-primary-50 hover:text-primary-900 no-underline transition-colors min-h-[44px]"
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100">
          <Link
            href="/en"
            className="flex items-center gap-2 text-xs text-neutral-500 hover:text-primary-700 no-underline mb-3"
            target="_blank"
          >
            View Live Site →
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
