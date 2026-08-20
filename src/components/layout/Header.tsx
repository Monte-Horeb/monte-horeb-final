'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import { churchInfo } from '@/content/church-info'
import LanguageSwitcher from './LanguageSwitcher'
import type { Lang } from '@/types'

interface HeaderProps {
  lang: Lang
}

export default function Header({ lang }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const t = lang === 'es' ? es.nav : en.nav

  const links = [
    { href: `/${lang}`,              label: t.home },
    { href: `/${lang}/visit`,        label: t.visit },
    { href: `/${lang}/about`,        label: t.about },
    { href: `/${lang}/sermons`,      label: t.sermons },
    { href: `/${lang}/events`,       label: t.events },
    { href: `/${lang}/ministries`,   label: t.ministries },
    { href: `/${lang}/give`,         label: t.give },
    { href: `/${lang}/contact`,      label: t.contact },
  ]

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
      <div className="container-site px-4">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link
            href={`/${lang}`}
            className="flex items-center gap-3 no-underline"
            aria-label={churchInfo.name}
          >
            <Image
              src={churchInfo.logo}
              alt={`${churchInfo.ministry} logo`}
              width={48}
              height={48}
              className="rounded-full object-contain"
              priority
            />
            <div className="hidden sm:block">
              <p className="font-bold text-primary-900 leading-tight text-base">
                {churchInfo.name}
              </p>
              <p className="text-xs text-neutral-500 leading-tight">
                {churchInfo.ministry}
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Primary navigation"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-neutral-700
                           hover:text-primary-900 hover:bg-primary-50
                           rounded-md transition-colors no-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: language switcher + mobile menu */}
          <div className="flex items-center gap-2">
            {/* Language switcher - ALWAYS visible, not inside mobile menu */}
            <LanguageSwitcher currentLang={lang} />

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden btn-ghost p-2 rounded-md"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="w-6 h-6" aria-hidden />
              ) : (
                <Menu className="w-6 h-6" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="lg:hidden bg-white border-t border-neutral-100 px-4 py-4"
          aria-label="Mobile navigation"
        >
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-3 text-base font-medium text-neutral-800
                             hover:bg-primary-50 hover:text-primary-900 rounded-lg
                             no-underline min-h-[48px]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {/* New Believers + Song Library in mobile */}
            <li className="pt-2 border-t border-neutral-100">
              <Link
                href={`/${lang}/new-believers`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-4 py-3 text-base font-medium text-neutral-800
                           hover:bg-primary-50 hover:text-primary-900 rounded-lg
                           no-underline min-h-[48px]"
              >
                {t.newBelievers}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
