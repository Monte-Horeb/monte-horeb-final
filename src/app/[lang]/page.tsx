import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Heart, ChevronRight } from 'lucide-react'
import { churchInfo } from '@/content/church-info'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import { createClient } from '@/lib/supabase/server'
import { getPageContent } from '@/lib/content'
import { getSiteUrl } from '@/lib/site-url'
import type { Lang, Sermon, ChurchEvent } from '@/types'

interface HomePageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const home = await getPageContent('home', lang)
  return {
    title: home.meta_title,
    description: home.meta_description,
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es : en
  const home = await getPageContent('home', lang)

  // Fetch latest sermon + next 3 events from Supabase
  const supabase = await createClient()

  const { data: latestSermon } = await supabase
    .from('sermons')
    .select('*')
    .eq('is_published', true)
    .order('sermon_date', { ascending: false })
    .limit(1)
    .single()

  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(3)

  // Structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: churchInfo.name,
    alternateName: churchInfo.ministry,
    url: getSiteUrl(),
    telephone: churchInfo.phone,
    email: churchInfo.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: churchInfo.address,
      addressLocality: churchInfo.city,
      addressRegion: churchInfo.state,
      postalCode: churchInfo.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 33.9822,
      longitude: -118.2239,
    },
    sameAs: [churchInfo.social.facebook, churchInfo.social.youtube],
    openingHoursSpecification: churchInfo.serviceTimes.map((s) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: s.day,
      opens: s.time,
      closes: s.endTime,
    })),
    inLanguage: ['en', 'es'],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ═══ ABOVE THE FOLD ═══════════════════════════════════ */}
      {/* Hero - service times visible within 2 seconds on mobile */}
      <section className="bg-primary-900 text-white">
        <div className="container-site px-4 py-10 md:py-16">
          <div className="grid md:grid-cols-2 gap-10 items-start">

            {/* Left: Headline + CTA */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src={churchInfo.logo}
                  alt={`${churchInfo.ministry} logo`}
                  width={64}
                  height={64}
                  className="rounded-full"
                  priority
                />
                <p className="text-primary-300 text-sm font-medium uppercase tracking-wide">
                  {churchInfo.ministry}
                </p>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {home.hero_headline}
              </h1>
              <p className="text-primary-200 text-lg mb-8 leading-relaxed">
                {home.hero_subheadline}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/${lang}/give`} className="btn btn-accent btn-lg no-underline">
                  <Heart className="w-5 h-5" aria-hidden />
                  {home.give_button}
                </Link>
                <Link href={`/${lang}/contact`} className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary-900 no-underline">
                  {home.contact_button}
                </Link>
              </div>
            </div>

            {/* Right: Service times - CRITICAL, readable in 2s */}
            <div>
              <h2 className="text-accent-400 font-bold text-sm uppercase tracking-wide mb-4">
                {home.service_times_heading}
              </h2>
              <div className="space-y-3">
                {churchInfo.serviceTimes.map((s) => (
                  <div key={s.id} className="bg-primary-800 rounded-xl p-4 border border-primary-700">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-white text-lg">
                          {lang === 'es' ? s.day_es : s.day}
                          {' '}
                          <span className="text-accent-300">
                            {s.time === 'TBA'
                              ? (lang === 'es' ? ' - Próximamente' : ' - TBA')
                              : `${s.time} – ${s.endTime}`}
                          </span>
                        </p>
                        <p className="text-primary-300 text-sm mt-0.5">
                          {lang === 'es' ? s.label_es : s.label_en}
                        </p>
                        {(lang === 'es' ? s.notes_es : s.notes_en) && (
                          <p className="text-primary-400 text-xs mt-1">
                            {lang === 'es' ? s.notes_es : s.notes_en}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Address bar - always visible */}
      <section className="bg-accent-600 text-white">
        <div className="container-site px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden />
              <span>{churchInfo.fullAddress}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a href={`tel:${churchInfo.phone}`} className="flex items-center gap-1 hover:underline no-underline text-white">
                <Phone className="w-4 h-4" aria-hidden />
                {churchInfo.phone}
              </a>
              <a href={`mailto:${churchInfo.email}`} className="flex items-center gap-1 hover:underline no-underline text-white">
                <Mail className="w-4 h-4" aria-hidden />
                {churchInfo.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BELOW THE FOLD ═══════════════════════════════════ */}

      {/* Welcome */}
      <section className="section bg-neutral-50">
        <div className="container-narrow text-center">
          <h2 className="mb-4">{home.welcome_title}</h2>
          <p className="text-neutral-600 text-lg mb-6">{home.welcome_body}</p>
          <Link href={`/${lang}/visit`} className="inline-flex items-center gap-1 text-primary-700 font-semibold no-underline hover:underline">
            {home.new_here_link}
            <ChevronRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Map */}
      <section className="bg-white">
        <div className="container-site px-4 pb-12">
          <h2 className="text-center mb-6">{home.address_heading}</h2>
          <div className="rounded-2xl overflow-hidden shadow-sm border border-neutral-200 h-64 md:h-96">
            <iframe
              title={lang === 'es' ? 'Mapa de ubicación de la iglesia' : 'Church location map'}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(churchInfo.fullAddress)}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Latest Sermon */}
      {latestSermon && (
        <section className="section bg-neutral-50">
          <div className="container-site px-4">
            <h2 className="mb-6">{home.latest_sermon}</h2>
            <div className="card max-w-2xl">
              <div className="card-body">
                <p className="text-sm text-neutral-500 mb-1">{latestSermon.speaker}</p>
                <h3 className="text-xl font-bold mb-4">
                  {lang === 'es' && latestSermon.title_es
                    ? latestSermon.title_es
                    : latestSermon.title_en}
                </h3>
                {latestSermon.youtube_url && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(latestSermon.youtube_url)}`}
                      title={latestSermon.title_en}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                )}
              </div>
            </div>
            <Link href={`/${lang}/sermons`} className="mt-4 inline-flex items-center gap-1 text-primary-700 font-semibold no-underline hover:underline">
              {t.sermons.youtube_channel}
            </Link>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="section bg-white">
        <div className="container-site px-4">
          <h2 className="mb-6">{home.upcoming_events}</h2>
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingEvents.map((event: ChurchEvent) => (
                <div key={event.id} className="card card-body">
                  <p className="text-accent-600 font-semibold text-sm mb-1">
                    {new Date(event.start_at).toLocaleDateString(
                      lang === 'es' ? 'es-MX' : 'en-US',
                      { weekday: 'long', month: 'long', day: 'numeric' }
                    )}
                  </p>
                  <h3 className="text-lg font-bold mb-2">
                    {lang === 'es' ? event.title_es : event.title_en}
                  </h3>
                  {(lang === 'es' ? event.description_es : event.description_en) && (
                    <p className="text-neutral-600 text-sm line-clamp-2">
                      {lang === 'es' ? event.description_es : event.description_en}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">{home.no_events}</p>
          )}
          <Link href={`/${lang}/events`} className="mt-6 inline-flex items-center gap-1 text-primary-700 font-semibold no-underline hover:underline">
            {lang === 'es' ? 'Ver todos los eventos →' : 'See all events →'}
          </Link>
        </div>
      </section>

      {/* Ministries CTA */}
      <section className="section bg-primary-900 text-white">
        <div className="container-narrow text-center">
          <h2 className="text-white mb-4">{home.our_ministries}</h2>
          <p className="text-primary-200 mb-8">
            {lang === 'es'
              ? 'Hay un lugar para ti en Monte Horeb. Descubre nuestros ministerios y grupos.'
              : 'There is a place for you at Monte Horeb. Discover our ministries and groups.'}
          </p>
          <Link href={`/${lang}/ministries`} className="btn btn-accent btn-lg no-underline">
            {lang === 'es' ? 'Ver Ministerios' : 'View Ministries'}
            <ChevronRight className="w-5 h-5" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  )
}

function getYouTubeId(url: string): string {
  const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/)
  return match ? match[1] : ''
}
