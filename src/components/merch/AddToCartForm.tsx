'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Loader2, CheckCircle, AlertCircle, Minus, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getSessionId } from '@/lib/session'
import type { Lang } from '@/types'

interface AddToCartFormProps {
  productId: string
  productName: string
  price: number
  stock: number
  inStock: boolean
  lang: Lang
  t: {
    add_to_cart?: string
    view_cart?: string
  }
}

export default function AddToCartForm({
  productId,
  productName,
  price,
  stock,
  inStock,
  lang,
  t,
}: AddToCartFormProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState<'idle' | 'saving' | 'added' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleAdd = async () => {
    setStatus('saving')
    setError('')

    const sessionId = getSessionId()
    const supabase = createClient()

    // If this product is already in the cart, top up the quantity
    // rather than creating a duplicate row.
    const { data: existing } = await supabase
      .from('merch_cart_items')
      .select('id, quantity')
      .eq('session_id', sessionId)
      .eq('product_id', productId)
      .maybeSingle()

    const { error: saveError } = existing
      ? await supabase
          .from('merch_cart_items')
          .update({ quantity: Math.min(existing.quantity + quantity, stock) })
          .eq('id', existing.id)
      : await supabase
          .from('merch_cart_items')
          .insert({ session_id: sessionId, product_id: productId, quantity })

    if (saveError) {
      setError(saveError.message)
      setStatus('error')
      return
    }

    setStatus('added')
    router.refresh()
  }

  if (!inStock) {
    return (
      <button disabled className="btn btn-primary w-full opacity-50 cursor-not-allowed">
        {lang === 'es' ? 'Agotado' : 'Out of stock'}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quantity stepper */}
      <div className="flex items-center gap-4">
        <span className="label mb-0">{lang === 'es' ? 'Cantidad' : 'Quantity'}</span>
        <div className="flex items-center gap-2 border border-neutral-300 rounded-lg">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="p-2.5 rounded-l-lg hover:bg-neutral-100 disabled:opacity-30"
            aria-label={lang === 'es' ? 'Reducir cantidad' : 'Decrease quantity'}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center font-semibold" aria-live="polite">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            disabled={quantity >= stock}
            className="p-2.5 rounded-r-lg hover:bg-neutral-100 disabled:opacity-30"
            aria-label={lang === 'es' ? 'Aumentar cantidad' : 'Increase quantity'}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-neutral-600">
        {lang === 'es' ? 'Total' : 'Total'}:{' '}
        <span className="font-bold text-neutral-900">
          ${(price * quantity).toFixed(2)}
        </span>
      </p>

      <button
        type="button"
        onClick={handleAdd}
        disabled={status === 'saving'}
        className="btn btn-primary w-full"
      >
        {status === 'saving' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ShoppingCart className="w-5 h-5" />
        )}
        {status === 'saving'
          ? lang === 'es' ? 'Agregando...' : 'Adding...'
          : t.add_to_cart || (lang === 'es' ? 'Agregar al Carrito' : 'Add to Cart')}
      </button>

      {status === 'added' && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm flex-1">
            {lang === 'es' ? `${productName} agregado.` : `${productName} added to cart.`}
          </p>
          <Link
            href={`/${lang}/bookstore/cart`}
            className="text-sm font-semibold underline whitespace-nowrap"
          >
            {t.view_cart || (lang === 'es' ? 'Ver Carrito' : 'View Cart')}
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            {error || (lang === 'es' ? 'Error. Intenta de nuevo.' : 'Error. Please try again.')}
          </p>
        </div>
      )}
    </div>
  )
}
