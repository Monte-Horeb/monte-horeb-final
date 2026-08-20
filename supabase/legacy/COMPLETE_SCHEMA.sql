-- ============================================================================
-- COMPLETE MONTE HOREB CHURCH DATABASE SCHEMA
-- All tables, indexes, RLS policies, and seed data
-- Run this ONCE - do not run multiple times
-- ============================================================================

-- ============================================================================
-- PART 1: CORE TABLES (Songs, Courses, Events, Sermons)
-- ============================================================================

CREATE TABLE IF NOT EXISTS song_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_es TEXT,
  slug TEXT NOT NULL UNIQUE,
  artist_en TEXT,
  artist_es TEXT,
  category TEXT,
  lyrics_en TEXT,
  lyrics_es TEXT,
  youtube_url TEXT,
  pdf_url TEXT,
  powerpoint_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_es TEXT,
  slug TEXT NOT NULL UNIQUE,
  description_en TEXT,
  description_es TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_es TEXT,
  description_en TEXT,
  description_es TEXT,
  youtube_url TEXT NOT NULL,
  duration_seconds INT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  session_id TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES course_videos(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  progress_percent INT DEFAULT 0,
  last_position_seconds INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_es TEXT,
  slug TEXT NOT NULL UNIQUE,
  speaker_name TEXT,
  description_en TEXT,
  description_es TEXT,
  youtube_url TEXT,
  audio_url TEXT,
  sermon_date DATE,
  is_published BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_es TEXT,
  slug TEXT NOT NULL UNIQUE,
  description_en TEXT,
  description_es TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location_en TEXT,
  location_es TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- PART 2: BLOG SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_es TEXT,
  slug TEXT NOT NULL UNIQUE,
  content_en TEXT NOT NULL,
  content_es TEXT,
  excerpt_en TEXT,
  excerpt_es TEXT,
  featured_image_url TEXT,
  author_en TEXT,
  author_es TEXT,
  category TEXT,
  view_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- PART 3: PHOTO GALLERY
-- ============================================================================

CREATE TABLE IF NOT EXISTS gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_es TEXT,
  slug TEXT NOT NULL UNIQUE,
  description_en TEXT,
  description_es TEXT,
  thumbnail_url TEXT,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption_en TEXT,
  caption_es TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- PART 4: EMAIL SUBSCRIPTIONS & COMMUNICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  preferred_lang TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  prayer_title TEXT NOT NULL,
  prayer_request TEXT NOT NULL,
  preferred_lang TEXT DEFAULT 'en',
  is_public BOOLEAN DEFAULT false,
  prayer_count INT DEFAULT 0,
  is_answered BOOLEAN DEFAULT false,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- PART 5: LIVE STREAMING
-- ============================================================================

CREATE TABLE IF NOT EXISTS live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_es TEXT,
  description_en TEXT,
  description_es TEXT,
  youtube_url TEXT NOT NULL,
  is_live BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  viewer_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- PART 6: STAFF DIRECTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role_en TEXT NOT NULL,
  role_es TEXT NOT NULL,
  bio_en TEXT,
  bio_es TEXT,
  photo_url TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  sort_order INT DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- PART 7: ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  page_views INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  new_subscribers INT DEFAULT 0,
  prayer_requests INT DEFAULT 0,
  blog_views INT DEFAULT 0,
  song_library_views INT DEFAULT 0,
  course_views INT DEFAULT 0,
  avg_session_duration INT,
  bounce_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- PART 8: BOOK STORE / MERCHANDISE
-- ============================================================================

CREATE TABLE IF NOT EXISTS merch_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS merch_products (
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

CREATE TABLE IF NOT EXISTS merch_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES merch_products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS merch_orders (
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

CREATE TABLE IF NOT EXISTS merch_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES merch_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES merch_products(id),
  product_name TEXT NOT NULL,
  product_price NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- PART 9: INDEXES (Performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_songs_category ON songs(category);
CREATE INDEX IF NOT EXISTS idx_songs_featured ON songs(is_featured);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_course_videos_course ON course_videos(course_id);
CREATE INDEX IF NOT EXISTS idx_sermons_published ON sermons(is_published);
CREATE INDEX IF NOT EXISTS idx_sermons_date ON sermons(sermon_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON blog_comments(is_approved);

CREATE INDEX IF NOT EXISTS idx_gallery_albums_published ON gallery_albums(is_published);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_album ON gallery_photos(album_id);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON email_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_answered ON prayer_requests(is_answered);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_lang ON prayer_requests(preferred_lang);

CREATE INDEX IF NOT EXISTS idx_live_streams_live ON live_streams(is_live);

CREATE INDEX IF NOT EXISTS idx_staff_public ON staff_directory(is_public);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff_directory(email);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily(date);

CREATE INDEX IF NOT EXISTS idx_merch_products_active ON merch_products(is_active);
CREATE INDEX IF NOT EXISTS idx_merch_products_category ON merch_products(category);
CREATE INDEX IF NOT EXISTS idx_merch_cart_session ON merch_cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_merch_orders_email ON merch_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_merch_orders_status ON merch_orders(order_status);

-- ============================================================================
-- PART 10: ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_directory ENABLE ROW LEVEL SECURITY;

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

ALTER TABLE merch_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 11: PUBLIC READ POLICIES
-- ============================================================================

-- Songs (public read)
CREATE POLICY IF NOT EXISTS "read_songs" ON songs FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "read_song_categories" ON song_categories FOR SELECT USING (true);

-- Courses (public read published)
CREATE POLICY IF NOT EXISTS "read_published_courses" ON courses FOR SELECT USING (is_published = true);
CREATE POLICY IF NOT EXISTS "read_course_videos" ON course_videos FOR SELECT USING (EXISTS (SELECT 1 FROM courses WHERE id = course_id AND is_published = true));

-- Sermons (public read published)
CREATE POLICY IF NOT EXISTS "read_published_sermons" ON sermons FOR SELECT USING (is_published = true);

-- Events (public read published)
CREATE POLICY IF NOT EXISTS "read_published_events" ON events FOR SELECT USING (is_published = true);

-- Blog (public read published)
CREATE POLICY IF NOT EXISTS "read_published_blog_posts" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY IF NOT EXISTS "read_blog_categories" ON blog_categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "read_approved_blog_comments" ON blog_comments FOR SELECT USING (is_approved = true);
CREATE POLICY IF NOT EXISTS "create_blog_comments" ON blog_comments FOR INSERT WITH CHECK (true);

-- Gallery (public read published)
CREATE POLICY IF NOT EXISTS "read_published_gallery_albums" ON gallery_albums FOR SELECT USING (is_published = true);
CREATE POLICY IF NOT EXISTS "read_gallery_photos" ON gallery_photos FOR SELECT USING (EXISTS (SELECT 1 FROM gallery_albums WHERE id = album_id AND is_published = true));

-- Subscriptions & Communications (public insert)
CREATE POLICY IF NOT EXISTS "create_email_subscribers" ON email_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "create_prayer_requests" ON prayer_requests FOR INSERT WITH CHECK (true);

-- Live Streams (public read)
CREATE POLICY IF NOT EXISTS "read_live_streams" ON live_streams FOR SELECT USING (true);

-- Staff (public read if public)
CREATE POLICY IF NOT EXISTS "read_public_staff" ON staff_directory FOR SELECT USING (is_public = true);

-- Merch (public read active)
CREATE POLICY IF NOT EXISTS "read_active_merch_products" ON merch_products FOR SELECT USING (is_active = true);
CREATE POLICY IF NOT EXISTS "read_merch_categories" ON merch_categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "create_merch_cart_items" ON merch_cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "read_own_merch_cart" ON merch_cart_items FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "create_merch_orders" ON merch_orders FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "read_own_merch_orders" ON merch_orders FOR SELECT USING (true);

-- ============================================================================
-- PART 12: ADMIN POLICIES
-- ============================================================================

CREATE POLICY IF NOT EXISTS "admin_manage_songs" ON songs FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY IF NOT EXISTS "admin_manage_song_categories" ON song_categories FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY IF NOT EXISTS "admin_manage_courses" ON courses FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY IF NOT EXISTS "admin_manage_course_videos" ON course_videos FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY IF NOT EXISTS "admin_manage_sermons" ON sermons FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY IF NOT EXISTS "admin_manage_events" ON events FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY IF NOT EXISTS "admin_manage_contact_submissions" ON contact_submissions FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));

CREATE POLICY IF NOT EXISTS "admin_manage_blog_posts" ON blog_posts FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY IF NOT EXISTS "admin_manage_blog_categories" ON blog_categories FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY IF NOT EXISTS "admin_manage_blog_comments" ON blog_comments FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));

CREATE POLICY IF NOT EXISTS "admin_manage_gallery_albums" ON gallery_albums FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY IF NOT EXISTS "admin_manage_gallery_photos" ON gallery_photos FOR ALL USING (EXISTS (SELECT 1 FROM gallery_albums ga WHERE ga.id = album_id AND auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com')));

CREATE POLICY IF NOT EXISTS "admin_manage_email_subscribers" ON email_subscribers FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY IF NOT EXISTS "admin_manage_prayer_requests" ON prayer_requests FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));

CREATE POLICY IF NOT EXISTS "admin_manage_live_streams" ON live_streams FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));

CREATE POLICY IF NOT EXISTS "admin_manage_staff" ON staff_directory FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));

CREATE POLICY IF NOT EXISTS "admin_manage_analytics_events" ON analytics_events FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY IF NOT EXISTS "admin_manage_analytics_daily" ON analytics_daily FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));

CREATE POLICY IF NOT EXISTS "admin_manage_merch_categories" ON merch_categories FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY IF NOT EXISTS "admin_manage_merch_products" ON merch_products FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY IF NOT EXISTS "admin_manage_merch_orders" ON merch_orders FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));

-- ============================================================================
-- PART 13: SEED DATA
-- ============================================================================

INSERT INTO merch_categories (name_en, name_es, slug, sort_order) VALUES
  ('Books', 'Libros', 'books', 1),
  ('Journals', 'Diarios', 'journals', 2),
  ('Apparel', 'Ropa', 'apparel', 3),
  ('Gifts', 'Regalos', 'gifts', 4)
ON CONFLICT (name_en) DO NOTHING;

-- ============================================================================
-- ALL DONE!
-- ============================================================================
