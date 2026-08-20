/**
 * Shared book store money rules.
 *
 * Everything that touches an amount - the cart display, the Checkout Session
 * and the stored order - reads from here, so the cart total and the amount
 * actually charged can never drift apart.
 */

/** Flat sales tax rate, e.g. 0.0975 for 9.75%. Set to 0 to charge no tax. */
export const SALES_TAX_RATE = Number(
  process.env.NEXT_PUBLIC_SALES_TAX_RATE ?? '0.0975'
)

/** Pickup only: nothing is shipped, so there is never a shipping charge. */
export const SHIPPING_FLAT_USD = 0

export const CURRENCY = 'usd'

/** Dollars -> integer cents, which is the only unit Stripe accepts. */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

export function fromCents(cents: number): number {
  return cents / 100
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export interface PricedLine {
  quantity: number
  unitPriceUsd: number
}

/**
 * The single definition of an order total. Rounded to cents at each step so
 * the sum always matches what Stripe charges.
 */
export function calculateTotals(lines: PricedLine[]) {
  const subtotalCents = lines.reduce(
    (sum, line) => sum + toCents(line.unitPriceUsd) * line.quantity,
    0
  )
  const taxCents = Math.round(subtotalCents * SALES_TAX_RATE)
  const shippingCents = toCents(SHIPPING_FLAT_USD)
  const totalCents = subtotalCents + taxCents + shippingCents

  return {
    subtotalCents,
    taxCents,
    shippingCents,
    totalCents,
    subtotal: fromCents(subtotalCents),
    tax: fromCents(taxCents),
    shipping: fromCents(shippingCents),
    total: fromCents(totalCents),
  }
}

/**
 * Human-readable order reference, e.g. MH-20260818-K3F9.
 * The random suffix avoids collisions without needing a database sequence.
 */
export function generateOrderNumber(now: Date = new Date()): string {
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = Math.random().toString(36).toUpperCase().slice(2, 6)
  return `MH-${date}-${suffix}`
}
