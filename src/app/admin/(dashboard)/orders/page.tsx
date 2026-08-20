import Link from 'next/link'
import { ShoppingBag, ExternalLink } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import MarkPickedUpButton from '@/components/admin/MarkPickedUpButton'
import { formatUsd } from '@/lib/commerce'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Orders - Admin | Iglesia Monte Horeb' }

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-neutral-100 text-neutral-600',
}

export default async function AdminOrdersPage() {
  // Service-role client: orders are intentionally invisible to the anon key.
  const supabase = createAdminClient()

  const { data: orders } = await supabase
    .from('merch_orders')
    .select('*, items:merch_order_items(product_name, quantity)')
    .order('created_at', { ascending: false })
    .limit(200)

  const paidOrders = orders?.filter((o) => o.payment_status === 'paid') || []
  const awaiting = paidOrders.filter((o) => o.order_status === 'awaiting_pickup')
  const revenue = paidOrders.reduce((sum, o) => sum + (Number(o.total_usd) || 0), 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {awaiting.length} awaiting pickup - {paidOrders.length} paid - {formatUsd(revenue)} total
        </p>
      </div>

      {orders?.length ? (
        <div className="card overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <p className="font-mono font-semibold text-sm">{order.order_number}</p>
                    <p className="text-xs text-neutral-400">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <p className="font-medium">{order.customer_name}</p>
                    <a href={`mailto:${order.customer_email}`} className="text-xs text-primary-700 hover:underline">
                      {order.customer_email}
                    </a>
                    {order.customer_phone && (
                      <p className="text-xs text-neutral-500">{order.customer_phone}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {order.items?.map((i: any, n: number) => (
                      <p key={n} className="text-xs">{i.product_name} &times; {i.quantity}</p>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    {formatUsd(Number(order.total_usd) || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge text-xs ${STATUS_STYLES[order.payment_status] || 'bg-neutral-100 text-neutral-600'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge bg-neutral-100 text-neutral-700 text-xs">
                      {order.order_status?.replace(/_/g, ' ')}
                    </span>
                    {order.picked_up_at && (
                      <p className="text-xs text-neutral-400 mt-1">
                        {new Date(order.picked_up_at).toLocaleDateString()}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {order.payment_status === 'paid' && !order.picked_up_at && (
                        <MarkPickedUpButton id={order.id} />
                      )}
                      {order.stripe_payment_intent_id && (
                        <a
                          href={`https://dashboard.stripe.com/payments/${order.stripe_payment_intent_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View in Stripe"
                          className="p-2 rounded text-neutral-500 hover:text-primary-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card card-body text-center py-16">
          <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 mb-2">No orders yet.</p>
          <Link href="/admin/bookstore" className="text-primary-700 text-sm hover:underline">
            Manage the book store
          </Link>
        </div>
      )}
    </div>
  )
}
