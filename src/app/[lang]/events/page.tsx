import type { Metadata } from 'next'
import { Calendar, MapPin, Mail, Repeat } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import type { Lang, ChurchEvent } from '@/types'

interface EventsPageProps { params: { lang: string } }

export async function generateMetadata({ params }: EventsPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.events : en.events
  return { title: t.meta_title, description: t.meta_description }
}

export default async function EventsPage({ params }: EventsPageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.events : en.events

  const supabase = createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })

  const locale = lang === 'es' ? 'es-MX' : 'en-US'

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-900 text-white section-sm">
        <div className="container-narrow px-4 text-center">
          <Calendar className="w-12 h-12 text-accent-400 mx-auto mb-4" aria-hidden />
          <h1 className="text-white">{t.headline}</h1>
        </div>
      </section>

      <section className="section bg-neutral-50">
        <div className="container-site px-4">
          {events && events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event: ChurchEvent) => {
                const title = lang === 'es' ? event.title_es : event.title_en
                const description = lang === 'es' ? event.description_es : event.description_en
                const location = lang === 'es' ? event.location_es : event.location_en
                const start = new Date(event.start_at)

                return (
                  <article key={event.id} className="card card-body flex flex-col sm:flex-row gap-6">
                    {/* Date block */}
                    <div className="flex-shrink-0 w-full sm:w-24 text-center bg-primary-50 rounded-xl py-4">
                      <p className="text-primary-700 text-sm font-semibold uppercase">
                        {start.toLocaleDateString(locale, { month: 'short' })}
                      </p>
                      <p className="text-primary-900 text-3xl font-bold leading-none">
                        {start.getDate()}
                      </p>
                      <p className="text-primary-600 text-xs mt-1">
                        {start.toLocaleDateString(locale, { weekday: 'short' })}
                      </p>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h2 className="text-xl font-bold">{title}</h2>
                        {event.ministry_tag && (
                          <span className="badge badge-blue text-xs">{event.ministry_tag}</span>
                        )}
                        {event.is_recurring && (
                          <span className="badge badge-gold text-xs inline-flex items-center gap-1">
                            <Repeat className="w-3 h-3" /> {t.recurring_label}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-neutral-500 mb-3">
                        {start.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}
                        {event.end_at &&
                          ` – ${new Date(event.end_at).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}`}
                      </p>

                      {description && (
                        <p className="text-neutral-600 leading-relaxed mb-3">{description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                        {location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-4 h-4" aria-hidden /> {location}
                          </span>
                        )}
                        {event.contact_email && (
                          <a
                            href={`mailto:${event.contact_email}`}
                            className="inline-flex items-center gap-1 text-primary-700 no-underline hover:underline"
                          >
                            <Mail className="w-4 h-4" aria-hidden />
                            {event.contact_person || t.contact_label}
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">{t.no_events}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
