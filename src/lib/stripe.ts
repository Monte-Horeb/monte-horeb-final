import 'server-only'
import Stripe from 'stripe'

/**
 * Server-only Stripe client.
 *
 * Constructed lazily so that a missing key surfaces as a clear error inside
 * the request that needs it, rather than crashing the module at import time
 * (which would take down unrelated routes in the same bundle).
 */
let cached: Stripe | null = null

export function getStripe(): Stripe {
  if (cached) return cached

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it in .env.local (local) or in the ' +
        'Vercel project environment variables (deployed).'
    )
  }

  cached = new Stripe(key, {
    // Pin the API version so a Stripe-side upgrade cannot silently change
    // response shapes underneath this code.
    apiVersion: '2026-07-29.dahlia',
    appInfo: { name: 'Iglesia Monte Horeb Book Store' },
  })

  return cached
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}
