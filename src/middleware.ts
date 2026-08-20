import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

type CookiesToSet = { name: string; value: string; options: CookieOptions }[]

const LOCALES = ['en', 'es'] as const
const DEFAULT_LOCALE = 'en'
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function getLocaleFromRequest(request: NextRequest): string {
  // 1. Explicit choice, remembered in a cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && LOCALES.includes(cookieLocale as 'en' | 'es')) {
    return cookieLocale
  }

  // 2. Browser preference
  const acceptLang = request.headers.get('accept-language') || ''
  const preferred = acceptLang.split(',')[0].split('-')[0].toLowerCase()
  if (preferred === 'es') return 'es'

  return DEFAULT_LOCALE
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request })

  // ─── Admin route protection ──────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: CookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Being signed in is not enough: only the configured admin address may
    // reach the dashboard. Without this any self-signed-up Supabase user
    // could open /admin.
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()
    if (adminEmail && user.email?.toLowerCase() !== adminEmail) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('error', 'not-authorised')
      return NextResponse.redirect(loginUrl)
    }

    return response
  }

  // ─── Language routing (public routes) ───────────────────
  const isStaticOrApi =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.') // static files (favicon, images, etc.)

  if (!isStaticOrApi) {
    const pathnameHasLocale = LOCALES.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (!pathnameHasLocale) {
      const locale = getLocaleFromRequest(request)
      const newUrl = new URL(
        `/${locale}${pathname === '/' ? '' : pathname}`,
        request.url
      )
      newUrl.search = request.nextUrl.search
      const redirectResponse = NextResponse.redirect(newUrl)
      redirectResponse.cookies.set('NEXT_LOCALE', locale, {
        maxAge: LOCALE_COOKIE_MAX_AGE,
      })
      return redirectResponse
    }

    // Remember the locale the visitor is actually browsing
    const currentLocale = pathname.split('/')[1]
    if (LOCALES.includes(currentLocale as 'en' | 'es')) {
      response.cookies.set('NEXT_LOCALE', currentLocale, {
        maxAge: LOCALE_COOKIE_MAX_AGE,
      })
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
