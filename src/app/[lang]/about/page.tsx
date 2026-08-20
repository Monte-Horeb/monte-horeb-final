import type { Metadata } from 'next'
import Image from 'next/image'
import { Mail } from 'lucide-react'
import { leadership } from '@/content/leadership'
import { getPageContent } from '@/lib/content'
import type { Lang } from '@/types'

interface AboutPageProps { params: { lang: string } }

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = await getPageContent('about', lang)
  return { title: t.meta_title, description: t.meta_description }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const lang = params.lang as Lang
  const t = await getPageContent('about', lang)

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-900 text-white section-sm">
        <div className="container-narrow px-4 text-center">
          <h1 className="text-white">{t.headline}</h1>
        </div>
      </section>

      {/* Who We Are + History */}
      <section className="section bg-white">
        <div className="container-narrow px-4 space-y-12">
          <div>
            <h2 className="mb-4">{t.who_title}</h2>
            <p className="text-neutral-600 leading-relaxed text-lg">{t.who_body}</p>
          </div>
          <div>
            <h2 className="mb-4">{t.history_title}</h2>
            <p className="text-neutral-600 leading-relaxed text-lg">{t.history_body}</p>
          </div>
        </div>
      </section>

      {/* Beliefs */}
      <section className="section bg-neutral-50">
        <div className="container-site px-4">
          <h2 className="text-center mb-10">{t.beliefs_title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.beliefs.map((belief, i) => (
              <div key={i} className="card card-body">
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-accent-700 font-bold text-lg">{i + 1}</span>
                </div>
                <h3 className="text-xl mb-2">{belief.title}</h3>
                <p className="text-neutral-600">{belief.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section bg-white">
        <div className="container-site px-4">
          <h2 className="text-center mb-4">{t.leadership_title}</h2>
          <p className="text-center text-neutral-600 mb-10">{t.leadership_body}</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((leader) => (
              <div key={leader.id} className="card text-center">
                {/* Photo */}
                <div className="relative w-full aspect-square bg-neutral-100 img-placeholder">
                  {/* No onError handler here: this is a server component and
                      passing an event handler would be a build error. The
                      placeholder background shows through if the file is
                      missing. */}
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="card-body">
                  <h3 className="text-lg font-bold mb-0.5">{leader.name}</h3>
                  <p className="text-accent-600 font-semibold text-sm mb-3">
                    {lang === 'es' ? leader.role_es : leader.role_en}
                  </p>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {lang === 'es' ? leader.bio_es : leader.bio_en}
                  </p>
                  {leader.contact && (
                    <a
                      href={`mailto:${leader.contact}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm text-primary-700 no-underline hover:underline"
                    >
                      <Mail className="w-3 h-3" aria-hidden />
                      {lang === 'es' ? 'Contactar' : 'Contact'}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-neutral-500 mt-10">{t.contact_leadership}</p>
        </div>
      </section>
    </div>
  )
}
