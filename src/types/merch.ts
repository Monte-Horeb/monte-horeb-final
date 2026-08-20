// ─── Book Store / Merchandise ───────────────────────────────

export interface MerchCategory {
  id: string
  name_en: string
  name_es: string
  slug: string
  sort_order: number
  created_at: string
}

export interface MerchProduct {
  id: string
  name_en: string
  name_es: string | null
  slug: string
  description_en: string | null
  description_es: string | null
  price_usd: number
  cost_usd: number | null
  sku: string | null
  category: string | null
  image_url: string | null
  gallery_images: string[] | null
  stock_quantity: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  session_id: string
  product_id: string
  quantity: number
  added_at: string
  product?: MerchProduct
}

export interface MerchOrder {
  id: string
  order_number: string
  customer_email: string
  customer_name: string
  customer_phone: string | null
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_zip: string
  shipping_country: string
  total_usd: number
  subtotal_usd: number
  tax_usd: number
  shipping_usd: number
  payment_method: string | null
  payment_status: string
  order_status: string
  stripe_payment_intent_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MerchOrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
  created_at: string
}
