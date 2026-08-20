import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import {
  CURRENCY,
  SALES_TAX_RATE,
  calculateTotals,
  generateOrderNumber,
} from '@/lib/commerce'
import { sanitizeSiteUrl } from '@/lib/site-url'

// The Stripe SDK needs the Node runtime, not the edge runtime.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const schema = z.object({
  sessionId: z.string().min(1),
  lang: z.enum(['en', 'es']).default('en'),
})

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Online payment is not configured yet.' },
      { status: 503 }
    )
  }

  try {
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const { sessionId, lang } = parsed.data

    const supabase = createAdminClient()

    // ── Load the cart server-side ────────────────────────────────────────
    // Prices, names and stock all come from the database. Nothing about the
    // amount charged is taken from the browser - otherwise a visitor could
    // simply post their own price.
    const { data: cartItems, error: cartError } = await supabase
      .from('merch_cart_items')
      .select('id, quantity, product:merch_products(*)')
      .eq('session_id', sessionId)

    if (cartError) {
      console.error('Checkout: failed to load cart:', cartError)
      return NextResponse.json({ error: 'Could not load cart' }, { status: 500 })
    }

    const lines = (cartItems || [])
      .map((item) => ({
        quantity: item.quantity,
        product: item.product as unknown as {
          id: string
          name_en: string
          name_es: string | null
          price_usd: number | string
          stock_quantity: number
          is_active: boolean
          image_url: string | null
        } | null,
      }))
      .filter((line) => line.product && line.product.is_active)

    if (lines.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
    }

    // ── Stock check before taking any money ──────────────────────────────
    const outOfStock = lines.filter(
      (line) => line.quantity > (line.product?.stock_quantity ?? 0)
    )
    if (outOfStock.length > 0) {
      const names = outOfStock.map((l) => l.product?.name_en).join(', ')
      return NextResponse.json(
        {
          error:
            lang === 'es'
              ? `No hay suficiente inventario: ${names}`
              : `Not enough stock for: ${names}`,
        },
        { status: 409 }
      )
    }

    const priced = lines.map((line) => ({
      quantity: line.quantity,
      unitPriceUsd: Number(line.product!.price_usd) || 0,
    }))
    const totals = calculateTotals(priced)

    // ── Record a pending order before redirecting ────────────────────────
    // If the customer pays and the webhook is delayed, the order already
    // exists and simply flips to paid.
    const orderNumber = generateOrderNumber()

    const { data: order, error: orderError } = await supabase
      .from('merch_orders')
      .insert({
        order_number: orderNumber,
        customer_email: 'pending@checkout',
        customer_name: 'Pending',
        fulfillment_method: 'pickup',
        subtotal_usd: totals.subtotal,
        tax_usd: totals.tax,
        shipping_usd: totals.shipping,
        total_usd: totals.total,
        payment_method: 'stripe',
        payment_status: 'pending',
        order_status: 'pending',
      })
      .select('id, order_number')
      .single()

    if (orderError || !order) {
      console.error('Checkout: failed to create order:', orderError)
      return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 })
    }

    const { error: itemsError } = await supabase.from('merch_order_items').insert(
      lines.map((line) => ({
        order_id: order.id,
        product_id: line.product!.id,
        product_name: line.product!.name_en,
        product_price: Number(line.product!.price_usd) || 0,
        quantity: line.quantity,
        subtotal: (Number(line.product!.price_usd) || 0) * line.quantity,
      }))
    )

    if (itemsError) {
      console.error('Checkout: failed to create order items:', itemsError)
      return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 })
    }

    // ── Build the Stripe Checkout Session ────────────────────────────────
    const stripe = getStripe()
    const origin =
      sanitizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
      request.headers.get('origin') ||
      new URL(request.url).origin

    const lineItems = lines.map((line) => {
      const product = line.product!
      const name =
        lang === 'es' && product.name_es ? product.name_es : product.name_en

      return {
        quantity: line.quantity,
        price_data: {
          currency: CURRENCY,
          unit_amount: Math.round((Number(product.price_usd) || 0) * 100),
          product_data: {
            name,
            ...(product.image_url ? { images: [product.image_url] } : {}),
          },
        },
      }
    })

    // Flat sales tax as its own visible line, so the buyer sees exactly what
    // they are paying. (To have Stripe report this as tax rather than
    // revenue, switch to Stripe Tax - see DEPLOY.md.)
    if (totals.taxCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: totals.taxCents,
          product_data: {
            name:
              lang === 'es'
                ? `Impuesto sobre ventas (${(SALES_TAX_RATE * 100).toFixed(2)}%)`
                : `Sales tax (${(SALES_TAX_RATE * 100).toFixed(2)}%)`,
          },
        },
      })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      // Pickup only - no shipping address is collected.
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: true },
      success_url: `${origin}/${lang}/bookstore/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${lang}/bookstore/cart`,
      // The webhook reads these to attach the payment to the right order.
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        cart_session_id: sessionId,
        lang,
      },
      payment_intent_data: {
        metadata: { order_id: order.id, order_number: order.order_number },
      },
    })

    await supabase
      .from('merch_orders')
      .update({ stripe_checkout_session_id: checkoutSession.id })
      .eq('id', order.id)

    if (!checkoutSession.url) {
      return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 })
    }

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
