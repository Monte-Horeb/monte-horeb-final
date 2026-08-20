import type { Metadata } from 'next'
import { Mail, Heart } from 'lucide-react'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import SubscribeForm from '@/components/subscriptions/SubscribeForm'
import PrayerRequestForm from '@/components/prayers/PrayerRequestForm'
import type { Lang } from '@/types'

interface CommunityPageProps { params: { lang: string } }

export async function generateMetadata({ params }: CommunityPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.community : en.community
  return { title: t.meta_title, description: t.meta_description }
}

export default function CommunityPage({ params }: CommunityPageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.community : en.community

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-900 text-white section-sm">
        <div className="container-narrow px-4 text-center">
          <h1 className="text-white mb-4">{t.headline}</h1>
          <p className="text-primary-200 text-lg">{t.subheadline}</p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-site px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Subscribe */}
            <div className="card card-body">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary-700" aria-hidden />
              </div>
              <h2 className="text-2xl font-bold mb-2">{t.subscribe_heading}</h2>
              <p className="text-neutral-600 mb-6">{t.subscribe_body}</p>
              <SubscribeForm lang={lang} t={t} />
            </div>

            {/* Prayer requests */}
            <div className="card card-body">
              <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-accent-700" aria-hidden />
              </div>
              <h2 className="text-2xl font-bold mb-2">{t.prayer_heading}</h2>
              <p className="text-neutral-600 mb-6">{t.prayer_body}</p>
              <PrayerRequestForm lang={lang} t={t} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
