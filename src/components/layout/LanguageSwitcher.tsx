'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { Globe } from 'lucide-react'
import type { Lang } from '@/types'

interface LanguageSwitcherProps {
  currentLang: Lang
}

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const targetLang: Lang = currentLang === 'en' ? 'es' : 'en'
  const label = currentLang === 'en' ? 'Español' : 'English'

  const handleSwitch = () => {
    // Replace language segment in path
    const segments = pathname.split('/')
    segments[1] = targetLang
    const newPath = segments.join('/')

    startTransition(() => {
      // Set cookie for future visits
      document.cookie = `NEXT_LOCALE=${targetLang}; path=/; max-age=${60 * 60 * 24 * 365}`
      router.push(newPath)
    })
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      aria-label={`Switch to ${label}`}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                 border border-neutral-200 bg-white
                 text-sm font-medium text-neutral-700
                 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-900
                 transition-colors min-h-[44px] min-w-touch
                 disabled:opacity-50"
    >
      <Globe className="w-4 h-4" aria-hidden />
      <span>{isPending ? '...' : label}</span>
    </button>
  )
}
