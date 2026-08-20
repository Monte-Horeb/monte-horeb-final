import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Iglesia Monte Horeb - Servidores de Cristo',
    template: '%s',
  },
  description:
    'Iglesia Monte Horeb - a bilingual church in Huntington Park, CA. Services Wednesday, Friday and Sunday.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1E3A8A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // `lang` is set per-locale by the [lang] layout; `en` is the safe default
  // for the admin area and any non-localised route.
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
