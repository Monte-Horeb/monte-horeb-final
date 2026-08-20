-- ============================================================================
-- 006 - Stripe checkout (pickup-only fulfilment)
-- ============================================================================
-- Run this in the Supabase SQL Editor AFTER schema.sql.
-- Safe to re-run.
--
-- If you are setting up a brand new database, schema.sql already contains
-- everything in here and you can skip this file.
-- ============================================================================

-- ── Orders: pickup instead of shipping ──────────────────────────────────────
-- The original table required a full shipping address on every order, which
-- makes pickup orders impossible to insert.
ALTER TABLE merch_orders ALTER COLUMN shipping_address DROP NOT NULL;
ALTER TABLE merch_orders ALTER COLUMN shipping_city    DROP NOT NULL;
ALTER TABLE merch_orders ALTER COLUMN shipping_state   DROP NOT NULL;
ALTER TABLE merch_orders ALTER COLUMN shipping_zip     DROP NOT NULL;

ALTER TABLE merch_orders
  ADD COLUMN IF NOT EXISTS fulfillment_method TEXT NOT NULL DEFAULT 'pickup'
    CHECK (fulfillment_method IN ('pickup', 'shipping'));

ALTER TABLE merch_orders
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

ALTER TABLE merch_orders
  ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_merch_orders_checkout_session
  ON merch_orders (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_merch_orders_created
  ON merch_orders (created_at DESC);

-- ── Webhook idempotency ─────────────────────────────────────────────────────
-- Stripe retries deliveries for up to three days. The primary key here is
-- what guarantees an order is fulfilled exactly once.
CREATE TABLE IF NOT EXISTS processed_stripe_events (
  id           TEXT PRIMARY KEY,
  event_type   TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE processed_stripe_events ENABLE ROW LEVEL SECURITY;
-- No policies: only the service-role key (used by the webhook) may touch it.

-- ── Atomic stock decrement ──────────────────────────────────────────────────
-- Read-modify-write from the application would lose concurrent purchases.
-- GREATEST(...) keeps stock from going negative if two orders race.
CREATE OR REPLACE FUNCTION public.decrement_product_stock(
  product_id UUID,
  quantity   INT
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE merch_products
  SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - quantity)
  WHERE id = product_id;
$$;

REVOKE ALL ON FUNCTION public.decrement_product_stock(UUID, INT) FROM PUBLIC;
-- Deliberately NOT granted to anon/authenticated: stock may only be changed
-- by the webhook, which uses the service-role key.

-- ── Order visibility ────────────────────────────────────────────────────────
-- Orders contain customer contact details, so the public must not read them.
-- The old "read_own_merch_orders ... USING (true)" policy exposed every
-- order to anyone with the anon key.
DROP POLICY IF EXISTS "read_own_merch_orders" ON merch_orders;
DROP POLICY IF EXISTS "public_read_own_merch_orders" ON merch_orders;
DROP POLICY IF EXISTS "read_own_orders" ON merch_orders;

-- Order items likewise.
DROP POLICY IF EXISTS "read_own_merch_order_items" ON merch_order_items;

-- Orders are now created by /api/checkout using the service-role key, so the
-- anon key needs no write access at all. Leaving these in place would let
-- anyone forge order rows.
DROP POLICY IF EXISTS "public_create_orders" ON merch_orders;
DROP POLICY IF EXISTS "create_orders" ON merch_orders;
DROP POLICY IF EXISTS "public_create_order_items" ON merch_order_items;

DROP POLICY IF EXISTS "admin_all_processed_stripe_events" ON processed_stripe_events;

-- ============================================================================
-- DONE
-- ============================================================================
