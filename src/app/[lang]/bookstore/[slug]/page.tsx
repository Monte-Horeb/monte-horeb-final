import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { en } from '@/content/en/pages'
import { es } from '@/content/es/pages'
import AddToCartForm from '@/components/merch/AddToCartForm'
import ProductGallery from '@/components/merch/ProductGallery'
import type { Lang } from '@/types'

interface ProductPageProps {
  params: { lang: string; slug: string }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const lang = params.lang as Lang
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('merch_products')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!product) return {}

  const title = lang === 'es' ? product.name_es : product.name_en
  return {
    title: `${title} | Book Store | Iglesia Monte Horeb`,
    description: (lang === 'es' ? product.description_es : product.description_en) || undefined,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const lang = params.lang as Lang
  const t = lang === 'es' ? es.bookstore : en.bookstore

  const supabase = await createClient()

  const { data: product } = await supabase
    .from('merch_products')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const title = lang === 'es' && product.name_es ? product.name_es : product.name_en
  const description = lang === 'es' ? product.description_es : product.description_en
  const inStock = product.stock_quantity > 0
  // Postgres NUMERIC can arrive as a string over PostgREST, so coerce before
  // calling toFixed - otherwise this throws at request time.
  const price = Number(product.price_usd) || 0

  return (
    <div>
      {/* Back nav */}
      <div className="bg-white border-b border-neutral-100 py-3 px-4">
        <div className="container-site">
          <Link
            href={`/${lang}/bookstore`}
            className="inline-flex items-center gap-2 text-sm text-primary-700 no-underline hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'es' ? 'Volver a la Tienda de Libros' : 'Back to Book Store'}
          </Link>
        </div>
      </div>

      {/* Product */}
      <section className="section bg-white">
        <div className="container-site px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <ProductGallery
              mainImage={product.image_url}
              galleryImages={product.gallery_images}
              title={title}
            />

            {/* Details */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{title}</h1>

              {/* Price */}
              <p className="text-3xl font-bold text-primary-700 mb-4">
                ${price.toFixed(2)}
              </p>

              {/* Stock */}
              {inStock ? (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-6 inline-block">
                  ✓ {lang === 'es' ? 'En stock' : 'In stock'} ({product.stock_quantity} {lang === 'es' ? 'disponibles' : 'available'})
                </p>
              ) : (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-6">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{lang === 'es' ? 'Agotado' : 'Out of stock'}</span>
                </div>
              )}

              {/* Description */}
              {description && (
                <div className="prose prose-sm max-w-none mb-8">
                  <p className="text-neutral-600 leading-relaxed whitespace-pre-line">{description}</p>
                </div>
              )}

              {/* Add to cart */}
              <AddToCartForm
                productId={product.id}
                productName={title}
                price={price}
                stock={product.stock_quantity}
                inStock={inStock}
                lang={lang}
                t={t}
              />

              {/* SKU */}
              {product.sku && (
                <p className="text-xs text-neutral-500 mt-6">
                  SKU: {product.sku}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
