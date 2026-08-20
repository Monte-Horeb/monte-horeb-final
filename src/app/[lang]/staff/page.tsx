import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import type { Lang, StaffMember } from '@/types'

interface StaffPageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: StaffPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.staff : en.staff
  return { title: t.meta_title, description: t.meta_description }
}

export default async function StaffPage({ params }: StaffPageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.staff : en.staff

  const supabase = await createClient()

  const { data: staff } = await supabase
    .from('staff_directory')
    .select('*')
    .eq('is_public', true)
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

      {/* Staff grid */}
      <section className="section bg-white">
        <div className="container-site px-4">
          {staff && staff.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((member: StaffMember) => {
                const role = lang === 'es' ? member.role_es : member.role_en
                const bio = lang === 'es' ? member.bio_es : member.bio_en

                return (
                  <div key={member.id} className="card text-center hover:shadow-md transition-shadow">
                    {/* Photo */}
                    <div className="aspect-square bg-neutral-100">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={`${member.first_name} ${member.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <span className="text-4xl font-bold">{member.first_name.charAt(0)}{member.last_name.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    <div className="card-body">
                      <h3 className="text-xl font-bold mb-0.5">
                        {member.first_name} {member.last_name}
                      </h3>
                      <p className="text-accent-600 font-semibold text-sm mb-3">{role}</p>

                      {bio && (
                        <p className="text-neutral-600 text-sm mb-4 line-clamp-3">{bio}</p>
                      )}

                      {/* Contact */}
                      <div className="flex flex-col gap-2 pt-4 border-t border-neutral-100">
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="inline-flex items-center gap-2 text-xs text-primary-700 hover:underline no-underline"
                          >
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </a>
                        )}
                        {member.phone && (
                          <a
                            href={`tel:${member.phone}`}
                            className="inline-flex items-center gap-2 text-xs text-primary-700 hover:underline no-underline"
                          >
                            <Phone className="w-3 h-3" />
                            {member.phone}
                          </a>
                        )}
                      </div>

                      {/* Social links */}
                      {(member.social_facebook || member.social_instagram) && (
                        <div className="flex justify-center gap-2 mt-4">
                          {member.social_facebook && (
                            <a
                              href={member.social_facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 hover:bg-primary-200 transition-colors text-sm"
                              aria-label="Facebook"
                            >
                              f
                            </a>
                          )}
                          {member.social_instagram && (
                            <a
                              href={member.social_instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 hover:bg-primary-200 transition-colors text-sm"
                              aria-label="Instagram"
                            >
                              @
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-neutral-500">
                {lang === 'es' ? 'Directorio de personal próximamente.' : 'Staff directory coming soon.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
