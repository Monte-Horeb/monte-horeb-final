import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { formatUsd } from '@/lib/commerce'

// Stripe's SDK needs Node, and the raw body must not be parsed or cached.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!isStripeConfigured() || !webhookSecret) {
    console.error('Stripe webhook received but Stripe is not configured.')
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  // Signature verification needs the EXACT bytes Stripe sent. Reading the
  // body as text (never request.json()) is what keeps the signature valid.
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    // An unverified payload is either misconfiguration or a forgery.
    // Either way it must never reach the fulfilment logic below.
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // ── Idempotency ────────────────────────────────────────────────────────
  // Stripe retries for up to three days and may deliver the same event more
  // than once. Claiming the event id first means fulfilment runs exactly
  // once even under concurrent retries (the primary key does the locking).
  const { error: claimError } = await supabase
    .from('processed_stripe_events')
    .insert({ id: event.id, event_type: event.type })

  if (claimError) {
    if (claimError.code === '23505') {
      // Already handled - acknowledge so Stripe stops retrying.
      return NextResponse.json({ received: true, duplicate: true })
    }
    console.error('Stripe webhook: could not record event:', claimError)
    return NextResponse.json({ error: 'Storage error' }, { status: 500 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await fulfillOrder(event.data.object as Stripe.Checkout.Session, supabase)
    } else if (
      event.type === 'checkout.session.expired' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id
      if (orderId) {
        await supabase
          .from('merch_orders')
          .update({ payment_status: 'failed', order_status: 'cancelled' })
          .eq('id', orderId)
          .eq('payment_status', 'pending')
      }
    }
  } catch (err) {
    console.error(`Stripe webhook: failed handling ${event.type}:`, err)
    // Release the idempotency claim so Stripe's retry can try again.
    await supabase.from('processed_stripe_events').delete().eq('id', event.id)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

type AdminClient = ReturnType<typeof createAdminClient>

async function fulfillOrder(session: Stripe.Checkout.Session, supabase: AdminClient) {
  const orderId = session.metadata?.order_id
  const cartSessionId = session.metadata?.cart_session_id

  if (!orderId) {
    console.error('Stripe webhook: checkout session has no order_id metadata')
    return
  }

  // Only treat it as paid when Stripe says it is.
  if (session.payment_status !== 'paid') {
    console.warn(
      `Stripe webhook: session ${session.id} completed with payment_status=${session.payment_status}`
    )
    return
  }

  const customerEmail =
    session.customer_details?.email || session.customer_email || 'unknown@unknown'
  const customerName = session.customer_details?.name || 'Customer'
  const customerPhone = session.customer_details?.phone || null

  // Mark paid. The `.eq('payment_status', 'pending')` guard means a
  // duplicate delivery can never double-apply the stock decrement below.
  const { data: updated, error: updateError } = await supabase
    .from('merch_orders')
    .update({
      payment_status: 'paid',
      order_status: 'awaiting_pickup',
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: customerPhone,
      stripe_payment_intent_id:
        typeof session.payment_intent === 'string' ? session.payment_intent : null,
    })
    .eq('id', orderId)
    .eq('payment_status', 'pending')
    .select('id, order_number, total_usd')

  if (updateError) throw updateError

  if (!updated || updated.length === 0) {
    // Someone already fulfilled this order - nothing more to do.
    return
  }

  const order = updated[0]

  // ── Decrement stock atomically ─────────────────────────────────────────
  const { data: items } = await supabase
    .from('merch_order_items')
    .select('product_id, quantity, product_name')
    .eq('order_id', orderId)

  for (const item of items || []) {
    const { error: stockError } = await supabase.rpc('decrement_product_stock', {
      product_id: item.product_id,
      quantity: item.quantity,
    })
    if (stockError) {
      // Don't fail the whole webhook - the money is taken and the order is
      // recorded. Flag it loudly so staff can correct inventory by hand.
      console.error(
        `Stripe webhook: stock decrement failed for ${item.product_name} on order ${order.order_number}:`,
        stockError
      )
    }
  }

  // ── Clear the cart ─────────────────────────────────────────────────────
  if (cartSessionId) {
    await supabase.from('merch_cart_items').delete().eq('session_id', cartSessionId)
  }

  // ── Notify (best effort - never fail the webhook over email) ───────────
  await sendOrderEmails({
    orderNumber: order.order_number,
    total: Number(order.total_usd) || 0,
    customerEmail,
    customerName,
    customerPhone,
    items: (items || []).map((i) => ({ name: i.product_name, quantity: i.quantity })),
  })
}

async function sendOrderEmails(order: {
  orderNumber: string
  total: number
  customerEmail: string
  customerName: string
  customerPhone: string | null
  items: { name: string; quantity: number }[]
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn(`Order ${order.orderNumber} paid - RESEND_API_KEY unset, no email sent.`)
    return
  }

  const from = process.env.RESEND_FROM_EMAIL || 'noreply@sdcmontehoreb.com'
  const churchEmail = process.env.CHURCH_CONTACT_EMAIL || 'sdcmontehoreb@gmail.com'
  const itemList = order.items
    .map((i) => `<li>${escapeHtml(i.name)} &times; ${i.quantity}</li>`)
    .join('')

  try {
    const resend = new Resend(apiKey)

    await resend.emails.send({
      from,
      to: churchEmail,
      subject: `New book store order ${order.orderNumber}`,
      html: `
        <h2>New order for pickup</h2>
        <p><strong>Order:</strong> ${escapeHtml(order.orderNumber)}</p>
        <p><strong>Name:</strong> ${escapeHtml(order.customerName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(order.customerEmail)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(order.customerPhone || '-')}</p>
        <p><strong>Total paid:</strong> ${formatUsd(order.total)}</p>
        <ul>${itemList}</ul>
        <p>Set the order aside for pickup and mark it collected in the admin panel.</p>
      `,
    })

    await resend.emails.send({
      from,
      to: order.customerEmail,
      subject: `Your Monte Horeb order ${order.orderNumber}`,
      html: `
        <h2>Thank you for your order</h2>
        <p>Hi ${escapeHtml(order.customerName)}, we have received your payment of
        <strong>${formatUsd(order.total)}</strong>.</p>
        <ul>${itemList}</ul>
        <p><strong>Your order is ready to collect at church:</strong><br/>
        7910 Seville Ave, Huntington Park, CA 90255</p>
        <p>Order reference: ${escapeHtml(order.orderNumber)}</p>
        <p>Questions? Just reply to this email.</p>
      `,
    })
  } catch (err) {
    console.error(`Order ${order.orderNumber} paid but email failed:`, err)
  }
}
