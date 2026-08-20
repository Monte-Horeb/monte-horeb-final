import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { churchInfo } from '@/content/church-info'
import { getSiteUrl } from '@/lib/site-url'
import type { Lang } from '@/types'

const LOCALES = ['en', 'es']

interface LangLayoutProps {
  children: React.ReactNode
  params: { lang: string }
}

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string }
}): Promise<Metadata> {
  const lang = params.lang as Lang

  return {
    metadataBase: new URL(getSiteUrl()),
    alternates: {
      canonical: `/${lang}`,
      languages: { en: '/en', es: '/es' },
    },
    openGraph: {
      siteName: churchInfo.name,
      locale: lang === 'es' ? 'es_MX' : 'en_US',
    },
    icons: {
      icon: '/images/logo.jpg',
      apple: '/images/logo.jpg',
    },
  }
}

export default function LangLayout({ children, params }: LangLayoutProps) {
  const lang = params.lang

  if (!LOCALES.includes(lang)) {
    notFound()
  }

  return (
    <div lang={lang} className="flex flex-col min-h-screen">
      {/* Skip to main content - accessibility */}
      <a href="#main-content" className="skip-link">
        {lang === 'es' ? 'Ir al contenido principal' : 'Skip to main content'}
      </a>

      <Header lang={lang as Lang} />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <Footer lang={lang as Lang} />
    </div>
  )
}
