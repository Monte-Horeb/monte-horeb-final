import type { Metadata } from 'next'
import { MapPin, Clock, Car, Shirt, Baby, Timer, Globe, Accessibility } from 'lucide-react'
import { churchInfo } from '@/content/church-info'
import { en } from '@/content/en/pages'
import { getPageContent } from '@/lib/content'
import type { Lang } from '@/types'

interface VisitPageProps { params: { lang: string } }

export async function generateMetadata({ params }: VisitPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = await getPageContent('visit', lang)
  return { title: t.meta_title, description: t.meta_description }
}

const visitSections = (t: typeof en.visit) => [
  { icon: Clock,         ...t.arrival },
  { icon: Car,           ...t.parking },
  { icon: Shirt,         ...t.attire },
  { icon: Baby,          ...t.children },
  { icon: Timer,         ...t.duration },
  { icon: Clock,         ...t.first_ten },
  { icon: Globe,         ...t.language },
  { icon: Accessibility, ...t.accessibility },
]

export default async function VisitPage({ params }: VisitPageProps) {
  const lang = params.lang as Lang
  const t = await getPageContent('visit', lang)
  const sections = visitSections(t)

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-900 text-white section-sm">
        <div className="container-narrow px-4 text-center">
          <h1 className="text-white mb-4">{t.headline}</h1>
          <p className="text-primary-200 text-lg">{t.subheadline}</p>
        </div>
      </section>

      {/* Service times - quick reference */}
      <section className="bg-accent-50 border-b border-accent-100 section-sm">
        <div className="container-site px-4">
          <h2 className="text-center mb-8">
            {lang === 'es' ? 'Horarios de Servicio' : 'Service Times'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {churchInfo.serviceTimes.map((s) => (
              <div key={s.id} className="service-time-block">
                <p className="service-time-day">
                  {lang === 'es' ? s.day_es : s.day}
                </p>
                <p className="service-time-hours">
                  {s.time === 'TBA'
                    ? (lang === 'es' ? 'Próximamente' : 'Time TBA')
                    : `${s.time} – ${s.endTime}`}
                </p>
                <p className="font-medium text-neutral-700 mt-1">
                  {lang === 'es' ? s.label_es : s.label_en}
                </p>
                {(lang === 'es' ? s.notes_es : s.notes_en) && (
                  <p className="service-time-note">
                    {lang === 'es' ? s.notes_es : s.notes_en}
                  </p>
                )}
                <p className="service-time-note mt-1">
                  <MapPin className="w-3 h-3 inline mr-1" aria-hidden />
                  {lang === 'es' ? s.location_es : s.location}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="section bg-white">
        <div className="container-narrow px-4">
          <div className="space-y-10">
            {sections.map((section, i) => {
              const Icon = section.icon
              return (
                <div key={i} className="flex gap-5">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-700" aria-hidden />
                  </div>
                  <div>
                    <h3 className="mb-2">{section.title}</h3>
                    <p className="text-neutral-600 leading-relaxed">{section.body}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center bg-primary-50 rounded-2xl p-10">
            <p className="text-2xl font-bold text-primary-900">{t.cta}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
