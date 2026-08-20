import Link from 'next/link'
import { ChevronRight, FileText } from 'lucide-react'
import { editableSchema } from '@/content/editable-schema'

export const metadata = { title: 'Page Content - Admin | Iglesia Monte Horeb' }

export default function AdminContentIndexPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Page Content</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Edit the wording on the site&rsquo;s main pages. Changes go live immediately - no code deploy needed.
        </p>
      </div>

      <div className="card overflow-hidden divide-y divide-neutral-100">
        {editableSchema.map((page) => (
          <Link
            key={page.key}
            href={`/admin/content/${page.key}`}
            className="flex items-center gap-4 p-5 hover:bg-neutral-50 no-underline transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary-700" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-neutral-900">{page.label}</p>
              <p className="text-sm text-neutral-500">{page.description}</p>
            </div>
            <p className="text-xs text-neutral-400 flex-shrink-0">{page.fields.length} fields</p>
            <ChevronRight className="w-5 h-5 text-neutral-300 flex-shrink-0" aria-hidden />
          </Link>
        ))}
      </div>

      <p className="text-xs text-neutral-400 mt-6 max-w-2xl">
        This covers the headline/body copy on each page. Nav labels, button text and form
        field labels are intentionally not editable here - they&rsquo;re shared UI chrome rather
        than page-specific content. Song, sermon, event, blog, gallery and bookstore content
        already have their own editors in the sidebar.
      </p>
    </div>
  )
}
