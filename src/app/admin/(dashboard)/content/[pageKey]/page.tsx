import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getPageSchema } from '@/content/editable-schema'
import { getPageContentOverrides, type EditablePageKey } from '@/lib/content'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import PageContentForm from '@/components/admin/PageContentForm'

interface ContentEditPageProps {
  params: { pageKey: string }
}

// Where each editable page actually lives on the public site, for the
// "View live page" link.
const PUBLIC_PATH: Record<EditablePageKey, string> = {
  home: '',
  visit: '/visit',
  about: '/about',
  ministries: '/ministries',
  give: '/give',
  contact: '/contact',
}

export async function generateMetadata({ params }: ContentEditPageProps) {
  const schema = getPageSchema(params.pageKey as EditablePageKey)
  return { title: schema ? `${schema.label} - Page Content - Admin` : 'Page Content - Admin' }
}

export default async function AdminContentEditPage({ params }: ContentEditPageProps) {
  const pageKey = params.pageKey as EditablePageKey
  const schema = getPageSchema(pageKey)
  if (!schema) notFound()

  const { content_en: savedEn, content_es: savedEs } = await getPageContentOverrides(pageKey)

  return (
    <div>
      <Link href="/admin/content" className="inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Page Content
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{schema.label}</h1>
          <p className="text-neutral-500 text-sm mt-1">{schema.description}</p>
        </div>
        <a
          href={`/en${PUBLIC_PATH[pageKey]}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline btn-sm no-underline flex-shrink-0"
        >
          View live page <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <PageContentForm
        pageKey={pageKey}
        pageLabel={schema.label}
        fields={schema.fields}
        savedEn={savedEn}
        savedEs={savedEs}
        defaultsEn={en[pageKey]}
        defaultsEs={es[pageKey]}
      />
    </div>
  )
}
