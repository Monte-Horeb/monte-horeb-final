import type { Metadata } from 'next'
import { Heart, Send, MapPin, Smartphone } from 'lucide-react'
import { churchInfo } from '@/content/church-info'
import { getPageContent } from '@/lib/content'
import type { Lang } from '@/types'

interface GivePageProps { params: { lang: string } }

export async function generateMetadata({ params }: GivePageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = await getPageContent('give', lang)
  return { title: t.meta_title, description: t.meta_description }
}

export default async function GivePage({ params }: GivePageProps) {
  const lang = params.lang as Lang
  const t = await getPageContent('give', lang)

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-900 text-white section-sm">
        <div className="container-narrow px-4 text-center">
          <Heart className="w-12 h-12 text-accent-400 mx-auto mb-4" aria-hidden />
          <h1 className="text-white mb-4">{t.headline}</h1>
          <p className="text-primary-200 text-lg">{t.stewardship}</p>
        </div>
      </section>

      {/* Ways to Give */}
      <section className="section bg-white">
        <div className="container-site px-4">
          <h2 className="text-center mb-10">{t.ways_title}</h2>
          <div className="grid md:grid-cols-3 gap-8">

            {/* Zelle */}
            <div className="card card-body text-center">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-7 h-7 text-primary-700" aria-hidden />
              </div>
              <h3 className="mb-3">{t.zelle_title}</h3>
              <p className="text-neutral-600 mb-4">{t.zelle_body}</p>
              <div className="bg-accent-50 rounded-xl p-4 border border-accent-200">
                <p className="text-accent-800 font-medium text-sm">{t.zelle_coming}</p>
              </div>
            </div>

            {/* In Person */}
            <div className="card card-body text-center">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-7 h-7 text-primary-700" aria-hidden />
              </div>
              <h3 className="mb-3">{t.in_person_title}</h3>
              <p className="text-neutral-600">{t.in_person_body}</p>
            </div>

            {/* Mail */}
            <div className="card card-body text-center">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Send className="w-7 h-7 text-primary-700" aria-hidden />
              </div>
              <h3 className="mb-3">{t.mail_title}</h3>
              <p className="text-neutral-600 mb-3">{t.mail_body}</p>
              <address className="not-italic text-sm text-neutral-700 font-medium">
                <p>Iglesia Monte Horeb</p>
                <p>{churchInfo.address}</p>
                <p>{churchInfo.city}, {churchInfo.state} {churchInfo.zip}</p>
              </address>
            </div>
          </div>
        </div>
      </section>

      {/* Non-pressure statement */}
      <section className="section bg-neutral-50">
        <div className="container-narrow px-4 text-center">
          <p className="text-lg text-neutral-600 italic mb-4">&ldquo;{t.non_pressure}&rdquo;</p>
          <p className="text-sm text-neutral-500">{t.tax_note}</p>
        </div>
      </section>
    </div>
  )
}
