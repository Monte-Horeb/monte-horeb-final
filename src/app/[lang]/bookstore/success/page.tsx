import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, MapPin, Clock } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { churchInfo } from '@/content/church-info'
import { formatUsd } from '@/lib/commerce'
import type { Lang } from '@/types'

export const dynamic = 'force-dynamic'

interface SuccessPageProps {
  params: { lang: string }
  searchParams: { session_id?: string }
}

export const metadata: Metadata = {
  title: 'Order Confirmed | Iglesia Monte Horeb',
  robots: { index: false, follow: false },
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const lang = params.lang as Lang
  const sessionId = searchParams.session_id

  let orderNumber: string | null = null
  let total: number | null = null
  let email: string | null = null
  let paid = false

  if (sessionId && isStripeConfigured()) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId)
      paid = session.payment_status === 'paid'
      email = session.customer_details?.email ?? null
      orderNumber = session.metadata?.order_number ?? null
      total = typeof session.amount_total === 'number' ? session.amount_total / 100 : null

      // The webhook is the source of truth and usually lands first, but this
      // page can render before it does. Fall back to the stored order so the
      // customer always sees their reference number.
      if (!orderNumber && session.metadata?.order_id) {
        const supabase = createAdminClient()
        const { data } = await supabase
          .from('merch_orders')
          .select('order_number, total_usd')
          .eq('id', session.metadata.order_id)
          .single()
        if (data) {
          orderNumber = data.order_number
          total = Number(data.total_usd)
        }
      }
    } catch (err) {
      console.error('Success page: could not retrieve Checkout Session:', err)
    }
  }

  const es = lang === 'es'

  return (
    <div className="section bg-white">
      <div className="container-narrow px-4 py-12 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-9 h-9 text-green-600" aria-hidden />
        </div>

        <h1 className="text-3xl font-bold mb-3">
          {paid
            ? es ? '¡Gracias por tu pedido!' : 'Thank you for your order!'
            : es ? 'Pedido recibido' : 'Order received'}
        </h1>

        <p className="text-neutral-600 mb-2 leading-relaxed">
          {paid
            ? es
              ? 'Tu pago se recibió correctamente.'
              : 'Your payment went through successfully.'
            : es
              ? 'Estamos confirmando tu pago. Recibirás un correo en breve.'
              : 'We are confirming your payment. You will get an email shortly.'}
        </p>

        {email && (
          <p className="text-neutral-500 text-sm mb-8">
            {es ? 'Confirmación enviada a ' : 'Confirmation sent to '}
            <strong>{email}</strong>
          </p>
        )}

        {(orderNumber || total !== null) && (
          <div className="card card-body max-w-sm mx-auto mb-8 text-left">
            {orderNumber && (
              <div className="flex justify-between py-1">
                <span className="text-neutral-600">{es ? 'Pedido' : 'Order'}</span>
                <span className="font-mono font-semibold">{orderNumber}</span>
              </div>
            )}
            {total !== null && (
              <div className="flex justify-between py-1">
                <span className="text-neutral-600">{es ? 'Total pagado' : 'Total paid'}</span>
                <span className="font-semibold">{formatUsd(total)}</span>
              </div>
            )}
          </div>
        )}

        {/* Pickup instructions */}
        <div className="bg-accent-50 border border-accent-200 rounded-xl p-6 text-left max-w-md mx-auto mb-8">
          <h2 className="font-bold text-accent-900 mb-3">
            {es ? 'Recoge tu pedido' : 'Collecting your order'}
          </h2>
          <p className="flex items-start gap-2 text-sm text-accent-900 mb-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
            {churchInfo.fullAddress}
          </p>
          <p className="flex items-start gap-2 text-sm text-accent-900">
            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
            {es
              ? 'Disponible en cualquier servicio. Menciona tu número de pedido.'
              : 'Available at any service. Just mention your order number.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/${lang}/bookstore`} className="btn btn-primary no-underline">
            {es ? 'Seguir Comprando' : 'Continue Shopping'}
          </Link>
          <Link href={`/${lang}/contact`} className="btn btn-outline no-underline">
            {es ? '¿Preguntas? Contáctanos' : 'Questions? Contact us'}
          </Link>
        </div>
      </div>
    </div>
  )
}
