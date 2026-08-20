import Link from 'next/link'
import { Facebook, Youtube, MessageCircle, Heart } from 'lucide-react'
import { churchInfo } from '@/content/church-info'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import type { Lang } from '@/types'

interface FooterProps {
  lang: Lang
}

export default function Footer({ lang }: FooterProps) {
  const t = lang === 'es' ? es : en
  const year = new Date().getFullYear()

  const quickLinks = [
    { href: `/${lang}/visit`,       label: t.nav.visit },
    { href: `/${lang}/sermons`,     label: t.nav.sermons },
    { href: `/${lang}/events`,      label: t.nav.events },
    { href: `/${lang}/give`,        label: t.nav.give },
    { href: `/${lang}/contact`,     label: t.nav.contact },
    { href: `/${lang}/new-believers`, label: t.nav.newBelievers },
    { href: `/${lang}/songs`,       label: t.footer.song_library },
  ]

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-site px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ─── Church identity ─────────────────────────── */}
          <div>
            <h2 className="font-bold text-lg text-white mb-1">
              {churchInfo.name}
            </h2>
            <p className="text-primary-300 text-sm mb-4">
              {churchInfo.ministry}
            </p>
            <div className="flex gap-3">
              <a
                href={churchInfo.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-primary-300 hover:text-white transition-colors"
              >
                <Facebook className="w-6 h-6" aria-hidden />
              </a>
              <a
                href={churchInfo.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-primary-300 hover:text-white transition-colors"
              >
                <Youtube className="w-6 h-6" aria-hidden />
              </a>
              <a
                href={churchInfo.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-primary-300 hover:text-white transition-colors"
              >
                <MessageCircle className="w-6 h-6" aria-hidden />
              </a>
            </div>
          </div>

          {/* ─── Service times ────────────────────────────── */}
          <div>
            <h3 className="font-bold text-base text-white mb-4">
              {t.footer.service_times}
            </h3>
            <ul className="space-y-2">
              {churchInfo.serviceTimes.map((s) => (
                <li key={s.id} className="text-sm">
                  <span className="font-semibold text-accent-300">
                    {lang === 'es' ? s.day_es : s.day}
                  </span>
                  <br />
                  <span className="text-primary-200">
                    {lang === 'es' ? s.label_es : s.label_en}
                  </span>
                  <br />
                  <span className="text-primary-300">
                    {s.time === 'TBA' ? (lang === 'es' ? 'Próximamente' : 'TBA') : `${s.time} – ${s.endTime}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Address ──────────────────────────────────── */}
          <div>
            <h3 className="font-bold text-base text-white mb-4">
              {t.footer.address}
            </h3>
            <address className="not-italic text-sm text-primary-200 space-y-1">
              <p>{churchInfo.fullAddress}</p>
              <p>
                <a
                  href={`tel:${churchInfo.phone}`}
                  className="text-primary-200 hover:text-white transition-colors no-underline"
                >
                  {churchInfo.phone}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${churchInfo.email}`}
                  className="text-primary-200 hover:text-white transition-colors no-underline"
                >
                  {churchInfo.email}
                </a>
              </p>
            </address>

            {/* Give button in footer */}
            <Link
              href={`/${lang}/give`}
              className="mt-4 inline-flex btn btn-accent btn-sm no-underline"
            >
              <Heart className="w-4 h-4" aria-hidden />
              {t.nav.give}
            </Link>
          </div>

          {/* ─── Quick links ──────────────────────────────── */}
          <div>
            <h3 className="font-bold text-base text-white mb-4">
              {t.footer.quick_links}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-200 hover:text-white
                               transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ─── Bottom bar ─────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-primary-800 flex flex-col sm:flex-row
                        items-center justify-between gap-4 text-sm text-primary-400">
          <p>{t.footer.copyright(year)}</p>
          <div className="flex gap-4">
            <Link
              href={`/${lang === 'en' ? 'es' : 'en'}`}
              className="text-primary-300 hover:text-white transition-colors no-underline"
            >
              {t.nav.language}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
