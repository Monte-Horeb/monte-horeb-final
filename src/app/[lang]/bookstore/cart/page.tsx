'use client'

import Link from 'next/link'
import { Trash2, Minus, Plus, ArrowRight, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSessionId } from '@/lib/session'
import { SALES_TAX_RATE } from '@/lib/commerce'
import type { Lang, CartItem } from '@/types'

interface CartPageProps {
  params: { lang: string }
}

export default function CartPage({ params }: CartPageProps) {
  const lang = params.lang as Lang
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  // Read localStorage in an effect, not during render: touching it during
  // render produces a server/client hydration mismatch.
  useEffect(() => {
    let cancelled = false

    const fetchCart = async () => {
      const sessionId = getSessionId()
      if (!sessionId) {
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('merch_cart_items')
        .select('*, product:merch_products(*)')
        .eq('session_id', sessionId)

      if (cancelled) return
      if (fetchError) setError(fetchError.message)
      setCartItems((data as CartItem[]) || [])
      setLoading(false)
    }

    fetchCart()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const removeItem = useCallback(
    async (itemId: string) => {
      const { error: deleteError } = await supabase
        .from('merch_cart_items')
        .delete()
        .eq('id', itemId)
      if (deleteError) {
        setError(deleteError.message)
        return
      }
      setCartItems((items) => items.filter((i) => i.id !== itemId))
    },
    [supabase]
  )

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      // Dropping to zero removes the line entirely. Previously the row was
      // deleted but the item was left in local state with quantity 0.
      if (quantity <= 0) {
        await removeItem(itemId)
        return
      }

      const { error: updateError } = await supabase
        .from('merch_cart_items')
        .update({ quantity })
        .eq('id', itemId)
      if (updateError) {
        setError(updateError.message)
        return
      }
      setCartItems((items) =>
        items.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      )
    },
    [supabase, removeItem]
  )

  // Same rate the server uses when it builds the Stripe session, so the
  // displayed total and the amount charged cannot drift apart.
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.product?.price_usd) || 0) * item.quantity,
    0
  )
  const tax = Math.round(subtotal * SALES_TAX_RATE * 100) / 100
  const total = subtotal + tax

  const handleCheckout = async () => {
    setCheckingOut(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: getSessionId(), lang }),
      })
      const data = await res.json()

      if (!res.ok || !data.url) {
        setError(
          data.error ||
            (lang === 'es'
              ? 'No se pudo iniciar el pago.'
              : 'Could not start checkout.')
        )
        setCheckingOut(false)
        return
      }

      // Hand off to Stripe's hosted payment page.
      window.location.href = data.url
    } catch {
      setError(
        lang === 'es'
          ? 'No se pudo iniciar el pago.'
          : 'Could not start checkout.'
      )
      setCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="section bg-white">
        <div className="container-narrow px-4 text-center">
          <p className="text-neutral-500">{lang === 'es' ? 'Cargando...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="section bg-white">
        <div className="container-narrow px-4 text-center py-20">
          <h1 className="text-2xl font-bold mb-4">
            {lang === 'es' ? 'Carrito Vacío' : 'Empty Cart'}
          </h1>
          <p className="text-neutral-600 mb-6">
            {lang === 'es'
              ? 'No hay productos en tu carrito.'
              : "You haven't added any books yet."}
          </p>
          <Link href={`/${lang}/bookstore`} className="btn btn-primary no-underline">
            {lang === 'es' ? 'Volver a la Tienda' : 'Continue Shopping'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="section bg-white">
      <div className="container-narrow px-4">
        <h1 className="text-2xl font-bold mb-8">
          {lang === 'es' ? 'Tu Carrito' : 'Your Cart'}
        </h1>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            {error}
          </p>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const name =
                lang === 'es' && item.product?.name_es
                  ? item.product.name_es
                  : item.product?.name_en
              const unitPrice = Number(item.product?.price_usd) || 0

              return (
                <div key={item.id} className="card card-body flex flex-row gap-4 items-center">
                  {item.product?.image_url && (
                    <img
                      src={item.product.image_url}
                      alt={name || ''}
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold mb-1 truncate">{name}</h2>
                    <p className="text-primary-700 font-semibold">${unitPrice.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded hover:bg-neutral-100"
                      aria-label={lang === 'es' ? 'Reducir cantidad' : 'Decrease quantity'}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded hover:bg-neutral-100"
                      aria-label={lang === 'es' ? 'Aumentar cantidad' : 'Increase quantity'}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded hover:bg-red-50 text-red-600"
                    aria-label={lang === 'es' ? 'Eliminar' : 'Remove'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="card card-body h-fit">
            <h2 className="font-bold text-lg mb-4">
              {lang === 'es' ? 'Resumen' : 'Order Summary'}
            </h2>

            <div className="space-y-3 text-sm mb-4 pb-4 border-b border-neutral-200">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">{lang === 'es' ? 'Impuesto' : 'Tax'}</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">
                  {lang === 'es' ? 'Recoger en la iglesia' : 'Pickup at church'}
                </span>
                <span className="text-green-700 font-medium">
                  {lang === 'es' ? 'Gratis' : 'Free'}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkingOut}
              className="btn btn-primary w-full flex items-center justify-center gap-2 mb-3"
            >
              {checkingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {lang === 'es' ? 'Redirigiendo...' : 'Redirecting...'}
                </>
              ) : (
                <>
                  {lang === 'es' ? 'Proceder al Pago' : 'Checkout'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-xs text-neutral-500 mb-4 text-center leading-relaxed">
              {lang === 'es'
                ? 'Pago seguro con Stripe. Recoge tu pedido en la iglesia.'
                : 'Secure payment by Stripe. Collect your order at church.'}
            </p>

            <Link
              href={`/${lang}/bookstore`}
              className="btn btn-outline w-full no-underline text-center"
            >
              {lang === 'es' ? 'Seguir Comprando' : 'Continue Shopping'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
