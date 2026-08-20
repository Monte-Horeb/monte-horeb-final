import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import SermonsFeed from '@/components/sermons/SermonsFeed'
import type { Lang } from '@/types'

interface SermonsPageProps { params: { lang: string } }

export async function generateMetadata({ params }: SermonsPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.sermons : en.sermons
  return { title: t.meta_title, description: t.meta_description }
}

export default async function SermonsPage({ params }: SermonsPageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.sermons : en.sermons

  const supabase = await createClient()

  const { data: recentSermons } = await supabase
    .from('sermons')
    .select('*')
    .eq('is_published', true)
    .eq('is_foundational', false)
    .order('sermon_date', { ascending: false })
    .limit(20)

  const { data: foundationalSermons } = await supabase
    .from('sermons')
    .select('*')
    .eq('is_published', true)
    .eq('is_foundational', true)
    .order('topic', { ascending: true })

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-900 text-white section-sm">
        <div className="container-narrow px-4 text-center">
          <h1 className="text-white">{t.headline}</h1>
        </div>
      </section>

      <SermonsFeed
        lang={lang}
        recentSermons={recentSermons || []}
        foundationalSermons={foundationalSermons || []}
        t={t}
      />
    </div>
  )
}
