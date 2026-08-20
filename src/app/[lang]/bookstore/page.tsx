import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import MerchGrid from '@/components/merch/MerchGrid'
import type { Lang, MerchProduct } from '@/types'

interface BookstorePage {
  params: { lang: string }
}

export async function generateMetadata({ params }: BookstorePage): Promise<Metadata> {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.bookstore : en.bookstore
  return { title: t.meta_title, description: t.meta_description }
}

export default async function BookstorePage({ params }: BookstorePage) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.bookstore : en.bookstore

  const supabase = await createClient()

  const { data: products } = await supabase
    .from('merch_products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const { data: categories } = await supabase
    .from('merch_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-900 text-white section-sm">
        <div className="container-narrow px-4 text-center">
          <BookOpen className="w-12 h-12 text-accent-400 mx-auto mb-4" aria-hidden />
          <h1 className="text-white mb-4">{t.headline}</h1>
          <p className="text-primary-200">{t.subheadline}</p>
        </div>
      </section>

      {/* Store */}
      <section className="section bg-white">
        <div className="container-site px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t.all_products}</h2>
            <Link href={`/${lang}/bookstore/cart`} className="inline-flex items-center gap-2 text-primary-700 hover:underline no-underline font-medium">
              {t.view_cart}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {products && products.length > 0 ? (
            <MerchGrid products={products as MerchProduct[]} lang={lang} />
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">{t.no_products}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
