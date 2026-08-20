'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * Mark a paid order as collected.
 *
 * Orders are not writable with the anon key (they hold customer contact
 * details), so this runs server-side with the service-role client. The
 * middleware already guards /admin, but this re-checks the caller's identity
 * itself - a server action is a POST endpoint and should not rely solely on
 * an upstream guard.
 */
export async function markOrderPickedUp(orderId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()
  if (!user || !adminEmail || user.email?.toLowerCase() !== adminEmail) {
    return { ok: false, error: 'Not authorised' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('merch_orders')
    .update({ order_status: 'collected', picked_up_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('payment_status', 'paid')

  if (error) {
    console.error('markOrderPickedUp failed:', error)
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin/orders')
  return { ok: true }
}
