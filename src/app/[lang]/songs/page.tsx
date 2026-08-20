import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import SongLibrary from '@/components/songs/SongLibrary'
import type { Lang } from '@/types'

interface SongsPageProps { params: { lang: string } }

export async function generateMetadata({ params }: SongsPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.songs : en.songs
  return { title: t.meta_title, description: t.meta_description }
}

export default async function SongsPage({ params }: SongsPageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.songs : en.songs

  const supabase = await createClient()

  const { data: songs } = await supabase
    .from('songs')
    .select('*, category:song_categories(*)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('title_en', { ascending: true })

  const { data: categories } = await supabase
    .from('song_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-900 text-white section-sm">
        <div className="container-narrow px-4 text-center">
          <h1 className="text-white mb-4">{t.headline}</h1>
          <p className="text-primary-200">{t.subheadline}</p>
        </div>
      </section>

      <SongLibrary
        lang={lang}
        songs={songs || []}
        categories={categories || []}
        t={t}
      />
    </div>
  )
}
