import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { churchInfo } from '@/content/church-info'
import ContactForm from '@/components/shared/ContactForm'
import { getPageContent } from '@/lib/content'
import type { Lang } from '@/types'

interface ContactPageProps { params: { lang: string } }

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = await getPageContent('contact', lang)
  return { title: t.meta_title, description: t.meta_description }
}

export default async function ContactPage({ params }: ContactPageProps) {
  const lang = params.lang as Lang
  const t = await getPageContent('contact', lang)

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
            {/* Form */}
            <div>
              <h2 className="mb-6">{t.form_title}</h2>
              <ContactForm lang={lang} t={t} />
            </div>

            {/* Details */}
            <div className="space-y-8">
              <div>
                <h2 className="mb-6">{lang === 'es' ? 'Visítanos' : 'Visit Us'}</h2>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <MapPin className="w-5 h-5 text-primary-700 flex-shrink-0 mt-1" aria-hidden />
                    <address className="not-italic text-neutral-700">{churchInfo.fullAddress}</address>
                  </li>
                  <li className="flex gap-4">
                    <Phone className="w-5 h-5 text-primary-700 flex-shrink-0 mt-1" aria-hidden />
                    <a href={`tel:${churchInfo.phone}`} className="text-neutral-700 no-underline hover:underline">
                      {churchInfo.phone}
                    </a>
                  </li>
                  <li className="flex gap-4">
                    <Mail className="w-5 h-5 text-primary-700 flex-shrink-0 mt-1" aria-hidden />
                    <a href={`mailto:${churchInfo.email}`} className="text-neutral-700 no-underline hover:underline break-all">
                      {churchInfo.email}
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary-700" aria-hidden />
                  {lang === 'es' ? 'Horarios de Servicio' : 'Service Times'}
                </h3>
                <ul className="space-y-3">
                  {churchInfo.serviceTimes.map((s) => (
                    <li key={s.id} className="text-sm">
                      <span className="font-semibold text-neutral-900">
                        {lang === 'es' ? s.day_es : s.day}
                      </span>
                      {' - '}
                      <span className="text-neutral-600">
                        {s.time === 'TBA'
                          ? (lang === 'es' ? 'Próximamente' : 'TBA')
                          : `${s.time} – ${s.endTime}`}
                      </span>
                      <br />
                      <span className="text-neutral-500">{lang === 'es' ? s.label_es : s.label_en}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-accent-50 border border-accent-200 rounded-xl p-5">
                <p className="text-accent-900 text-sm">{t.prayer_note}</p>
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-neutral-200 h-64">
                <iframe
                  title={lang === 'es' ? 'Mapa de ubicación de la iglesia' : 'Church location map'}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(churchInfo.fullAddress)}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
