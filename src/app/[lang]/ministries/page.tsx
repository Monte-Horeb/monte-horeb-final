import type { Metadata } from 'next'
import { Users, Clock, MapPin, Mail } from 'lucide-react'
import { ministries } from '@/content/ministries'
import { getPageContent } from '@/lib/content'
import type { Lang } from '@/types'

interface MinistriesPageProps { params: { lang: string } }

export async function generateMetadata({ params }: MinistriesPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = await getPageContent('ministries', lang)
  return { title: t.meta_title, description: t.meta_description }
}

export default async function MinistriesPage({ params }: MinistriesPageProps) {
  const lang = params.lang as Lang
  const t = await getPageContent('ministries', lang)

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-900 text-white section-sm">
        <div className="container-narrow px-4 text-center">
          <Users className="w-12 h-12 text-accent-400 mx-auto mb-4" aria-hidden />
          <h1 className="text-white mb-4">{t.headline}</h1>
          <p className="text-primary-200 text-lg">{t.subheadline}</p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-site px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {ministries.map((ministry) => (
              <article key={ministry.id} className="card card-body">
                <h2 className="text-2xl font-bold mb-3">
                  {lang === 'es' ? ministry.name_es : ministry.name_en}
                </h2>
                <p className="text-neutral-600 leading-relaxed mb-5">
                  {lang === 'es' ? ministry.description_es : ministry.description_en}
                </p>

                <dl className="space-y-3 text-sm border-t border-neutral-100 pt-5">
                  <div className="flex gap-3">
                    <dt className="flex-shrink-0 text-neutral-400" title={t.who_label}>
                      <Users className="w-4 h-4 mt-0.5" aria-hidden />
                      <span className="sr-only">{t.who_label}</span>
                    </dt>
                    <dd className="text-neutral-700">
                      {lang === 'es' ? ministry.who_es : ministry.who_en}
                    </dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="flex-shrink-0 text-neutral-400" title={t.when_label}>
                      <Clock className="w-4 h-4 mt-0.5" aria-hidden />
                      <span className="sr-only">{t.when_label}</span>
                    </dt>
                    <dd className="text-neutral-700">
                      {lang === 'es' ? ministry.when_es : ministry.when_en}
                    </dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="flex-shrink-0 text-neutral-400">
                      <MapPin className="w-4 h-4 mt-0.5" aria-hidden />
                      <span className="sr-only">Location</span>
                    </dt>
                    <dd className="text-neutral-700">
                      {lang === 'es' ? ministry.where_es : ministry.where_en}
                    </dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="flex-shrink-0 text-neutral-400" title={t.contact_label}>
                      <Mail className="w-4 h-4 mt-0.5" aria-hidden />
                      <span className="sr-only">{t.contact_label}</span>
                    </dt>
                    <dd className="text-neutral-700">
                      {ministry.contact_email ? (
                        <a href={`mailto:${ministry.contact_email}`} className="text-primary-700 no-underline hover:underline">
                          {ministry.contact_person}
                        </a>
                      ) : (
                        ministry.contact_person
                      )}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
