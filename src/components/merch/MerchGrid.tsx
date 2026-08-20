'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Search } from 'lucide-react'
import type { Lang, MerchProduct } from '@/types'

interface MerchGridProps {
  products: MerchProduct[]
  lang: Lang
}

export default function MerchGrid({ products, lang }: MerchGridProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
    [products]
  )

  const filtered = useMemo(() => {
    let result = products
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name_en.toLowerCase().includes(q) ||
          (p.name_es || '').toLowerCase().includes(q) ||
          (p.description_en || '').toLowerCase().includes(q)
      )
    }
    if (category !== 'all') result = result.filter((p) => p.category === category)
    return result
  }, [products, search, category])

  return (
    <div>
      {/* Search + filter */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'es' ? 'Buscar libros...' : 'Search books...'}
            aria-label={lang === 'es' ? 'Buscar libros' : 'Search books'}
            className="input pl-12"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <button
              onClick={() => setCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors min-h-[40px]
                ${category === 'all'
                  ? 'bg-primary-900 text-white border-primary-900'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400'
                }`}
            >
              {lang === 'es' ? 'Todos' : 'All'}
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors min-h-[40px]
                  ${category === c
                    ? 'bg-primary-900 text-white border-primary-900'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => {
            const title = lang === 'es' && product.name_es ? product.name_es : product.name_en
            const price = Number(product.price_usd) || 0
            const inStock = product.stock_quantity > 0

            return (
              <Link
                key={product.id}
                href={`/${lang}/bookstore/${product.slug}`}
                className="card hover:shadow-md transition-shadow no-underline group flex flex-col"
              >
                <div className="aspect-square bg-neutral-100 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-neutral-300" />
                    </div>
                  )}
                </div>

                <div className="card-body flex flex-col flex-1">
                  <h3 className="font-bold text-base mb-1 group-hover:text-primary-700 transition-colors line-clamp-2">
                    {title}
                  </h3>
                  <p className="text-primary-700 font-bold text-lg mb-2">${price.toFixed(2)}</p>
                  <p className={`text-xs mt-auto ${inStock ? 'text-green-700' : 'text-red-600'}`}>
                    {inStock
                      ? lang === 'es' ? 'En stock' : 'In stock'
                      : lang === 'es' ? 'Agotado' : 'Out of stock'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">
            {lang === 'es' ? 'No se encontraron libros.' : 'No books found.'}
          </p>
        </div>
      )}
    </div>
  )
}
