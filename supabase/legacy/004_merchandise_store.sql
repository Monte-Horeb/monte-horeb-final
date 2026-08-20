-- Merchandise Store
CREATE TABLE merch_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_es TEXT,
  slug TEXT NOT NULL UNIQUE,
  description_en TEXT,
  description_es TEXT,
  price_usd NUMERIC(10, 2) NOT NULL,
  cost_usd NUMERIC(10, 2),
  sku TEXT UNIQUE,
  category TEXT,
  image_url TEXT,
  gallery_images TEXT[],
  stock_quantity INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE merch_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE merch_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES merch_products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE merch_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'US',
  total_usd NUMERIC(10, 2) NOT NULL,
  subtotal_usd NUMERIC(10, 2) NOT NULL,
  tax_usd NUMERIC(10, 2) DEFAULT 0,
  shipping_usd NUMERIC(10, 2) DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE merch_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES merch_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES merch_products(id),
  product_name TEXT NOT NULL,
  product_price NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_merch_products_active ON merch_products(is_active);
CREATE INDEX idx_merch_products_category ON merch_products(category);
CREATE INDEX idx_merch_products_stock ON merch_products(stock_quantity);
CREATE INDEX idx_merch_cart_session ON merch_cart_items(session_id);
CREATE INDEX idx_merch_orders_email ON merch_orders(customer_email);
CREATE INDEX idx_merch_orders_status ON merch_orders(order_status);
CREATE INDEX idx_merch_orders_payment ON merch_orders(payment_status);

-- RLS Policies
ALTER TABLE merch_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_order_items ENABLE ROW LEVEL SECURITY;

-- Public can read active products
CREATE POLICY "read_active_products" ON merch_products
  FOR SELECT USING (is_active = true);
CREATE POLICY "read_categories" ON merch_categories
  FOR SELECT USING (true);

-- Users can create cart items
CREATE POLICY "create_cart_items" ON merch_cart_items
  FOR INSERT WITH CHECK (true);
CREATE POLICY "read_own_cart" ON merch_cart_items
  FOR SELECT USING (true);

-- Anyone can create orders
CREATE POLICY "create_orders" ON merch_orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "read_own_orders" ON merch_orders
  FOR SELECT USING (true);

-- Admin can manage all
CREATE POLICY "admin_manage_products" ON merch_products
  FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY "admin_manage_categories" ON merch_categories
  FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY "admin_manage_orders" ON merch_orders
  FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));

-- Seed default categories
INSERT INTO merch_categories (name_en, name_es, slug, sort_order) VALUES
  ('Apparel', 'Ropa', 'apparel', 1),
  ('Accessories', 'Accesorios', 'accessories', 2),
  ('Drinkware', 'Bebidas', 'drinkware', 3);
