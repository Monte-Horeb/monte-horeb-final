-- ============================================================================
-- IGLESIA MONTE HOREB - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- It is idempotent: re-running it is safe and will not duplicate anything.
--
-- This file replaces the old COMPLETE_SCHEMA.sql, which could not run at all
-- (it used `CREATE POLICY IF NOT EXISTS`, which PostgreSQL does not support)
-- and which described a different set of columns than the application
-- actually queries.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PART 0: ADMIN HELPER
-- ============================================================================
-- Policies must not read from auth.users directly: the `authenticated` role
-- has no SELECT privilege on that table, so `(SELECT id FROM auth.users ...)`
-- inside a policy fails with "permission denied for table users".
-- Reading the email claim out of the JWT is the supported approach.
--
-- To change who is an admin, edit the list below and re-run this block.

-- SECURITY DEFINER matters here: a plain SQL function gets inlined into the
-- calling query, which then needs USAGE on the auth schema. Running as the
-- definer keeps the check working for anonymous visitors regardless of what
-- the anon role is granted. The JWT claims are a per-request setting, so the
-- function still sees the *caller's* identity.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  claim_email TEXT;
BEGIN
  claim_email := lower(coalesce(
    nullif(current_setting('request.jwt.claims', TRUE), '')::jsonb ->> 'email',
    ''
  ));
  RETURN claim_email IN (
    'robinsonramos96@gmail.com'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- No/!malformed JWT (anonymous visitor) means "not an admin", never an error.
    RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ============================================================================
-- PART 1: CORE CONTENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS song_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en     TEXT NOT NULL,
  name_es     TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS songs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en        TEXT NOT NULL,
  title_es        TEXT,
  artist          TEXT,
  musical_key     TEXT,
  category_id     UUID REFERENCES song_categories(id) ON DELETE SET NULL,
  youtube_url_en  TEXT,
  youtube_url_es  TEXT,
  file_url        TEXT,           -- Supabase Storage public URL
  file_type       TEXT CHECK (file_type IN ('pdf', 'pptx')),
  language        TEXT DEFAULT 'both' CHECK (language IN ('en', 'es', 'both')),
  is_published    BOOLEAN DEFAULT TRUE,
  sort_order      INT DEFAULT 0,
  view_count      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en        TEXT NOT NULL,
  title_es        TEXT NOT NULL,
  description_en  TEXT,
  description_es  TEXT,
  thumbnail_url   TEXT,
  is_published    BOOLEAN DEFAULT FALSE,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_videos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id         UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title_en          TEXT NOT NULL,
  title_es          TEXT NOT NULL,
  description_en    TEXT,
  description_es    TEXT,
  youtube_url_en    TEXT,
  youtube_url_es    TEXT,
  duration_seconds  INT,
  sort_order        INT NOT NULL DEFAULT 0,
  is_published      BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Session-based progress: no login required for course viewers.
CREATE TABLE IF NOT EXISTS video_progress (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       TEXT NOT NULL,
  video_id         UUID NOT NULL REFERENCES course_videos(id) ON DELETE CASCADE,
  course_id        UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  watched_seconds  INT DEFAULT 0,
  completed        BOOLEAN DEFAULT FALSE,
  lang             TEXT DEFAULT 'en' CHECK (lang IN ('en', 'es')),
  last_watched_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, video_id, lang)
);

CREATE TABLE IF NOT EXISTS sermons (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en            TEXT NOT NULL,
  title_es            TEXT,
  speaker             TEXT NOT NULL,
  scripture_reference TEXT,
  sermon_date         DATE,
  youtube_url         TEXT,
  facebook_url        TEXT,
  language            TEXT DEFAULT 'es' CHECK (language IN ('en', 'es', 'both')),
  is_foundational     BOOLEAN DEFAULT FALSE,
  topic               TEXT,
  is_published        BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en         TEXT NOT NULL,
  title_es         TEXT NOT NULL,
  description_en   TEXT,
  description_es   TEXT,
  start_at         TIMESTAMPTZ NOT NULL,
  end_at           TIMESTAMPTZ,
  location_en      TEXT,
  location_es      TEXT,
  contact_person   TEXT,
  contact_email    TEXT,
  ministry_tag     TEXT,
  audience_tag     TEXT,
  is_recurring     BOOLEAN DEFAULT FALSE,
  recurrence_rule  TEXT,
  is_published     BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  language   TEXT DEFAULT 'en',
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 1B: EDITABLE PAGE CONTENT
-- ============================================================================
-- The bulk of the site's page copy (headlines, welcome text, FAQ answers,
-- giving instructions, etc.) used to live only in src/content/*/pages.ts,
-- which meant changing a sentence required a code deploy. This table lets
-- the admin panel override any of that copy in real time. One row per
-- editable "page" (home, visit, about, ministries, give, contact); each row
-- holds a JSON blob of field overrides per language. Missing keys, missing
-- rows, or an empty table all fall back to the compiled-in defaults, so the
-- site never breaks if this table is empty or not yet migrated.
CREATE TABLE IF NOT EXISTS page_content (
  page_key    TEXT PRIMARY KEY,
  content_en  JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_es  JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 2: BLOG
-- ============================================================================
-- blog_categories is created BEFORE blog_posts: the original 002 migration
-- declared the foreign key before the referenced table existed and failed.

CREATE TABLE IF NOT EXISTS blog_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en     TEXT NOT NULL UNIQUE,
  name_es     TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en           TEXT NOT NULL,
  title_es           TEXT,
  slug               TEXT NOT NULL UNIQUE,
  excerpt_en         TEXT,
  excerpt_es         TEXT,
  content_en         TEXT NOT NULL,
  content_es         TEXT,
  author_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id        UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  featured_image_url TEXT,
  is_published       BOOLEAN DEFAULT FALSE,
  view_count         INT DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW(),
  published_at       TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS blog_comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name  TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content      TEXT NOT NULL,
  is_approved  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 3: GALLERY
-- ============================================================================

CREATE TABLE IF NOT EXISTS gallery_albums (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en       TEXT NOT NULL,
  title_es       TEXT,
  slug           TEXT NOT NULL UNIQUE,
  description_en TEXT,
  description_es TEXT,
  thumbnail_url  TEXT,
  sort_order     INT DEFAULT 0,
  is_published   BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id   UUID NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  caption_en TEXT,
  caption_es TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 4: SUBSCRIBERS, PRAYER, LIVE, STAFF
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_subscribers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  name            TEXT,
  preferred_lang  TEXT DEFAULT 'en',
  is_active       BOOLEAN DEFAULT TRUE,
  subscribed_at   TIMESTAMPTZ DEFAULT NOW(),
  verified_at     TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS prayer_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name  TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  prayer_title    TEXT NOT NULL,
  prayer_request  TEXT NOT NULL,
  preferred_lang  TEXT DEFAULT 'en',
  is_public       BOOLEAN DEFAULT FALSE,
  prayer_count    INT DEFAULT 0,
  is_answered     BOOLEAN DEFAULT FALSE,
  answered_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_streams (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en       TEXT NOT NULL,
  title_es       TEXT,
  description_en TEXT,
  description_es TEXT,
  youtube_url    TEXT NOT NULL,
  is_live        BOOLEAN DEFAULT FALSE,
  scheduled_at   TIMESTAMPTZ,
  started_at     TIMESTAMPTZ,
  ended_at       TIMESTAMPTZ,
  viewer_count   INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_directory (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name       TEXT NOT NULL,
  last_name        TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  phone            TEXT,
  role_en          TEXT NOT NULL,
  role_es          TEXT NOT NULL,
  bio_en           TEXT,
  bio_es           TEXT,
  photo_url        TEXT,
  social_facebook  TEXT,
  social_instagram TEXT,
  sort_order       INT DEFAULT 0,
  is_public        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 5: ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  user_agent TEXT,
  ip_address TEXT,
  referrer   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_daily (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date                 DATE NOT NULL UNIQUE,
  page_views           INT DEFAULT 0,
  unique_visitors      INT DEFAULT 0,
  new_subscribers      INT DEFAULT 0,
  prayer_requests      INT DEFAULT 0,
  blog_views           INT DEFAULT 0,
  song_library_views   INT DEFAULT 0,
  course_views         INT DEFAULT 0,
  avg_session_duration INT,
  bounce_rate          NUMERIC,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 6: BOOK STORE
-- ============================================================================

CREATE TABLE IF NOT EXISTS merch_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en    TEXT NOT NULL UNIQUE,
  name_es    TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merch_products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en        TEXT NOT NULL,
  name_es        TEXT,
  slug           TEXT NOT NULL UNIQUE,
  description_en TEXT,
  description_es TEXT,
  price_usd      NUMERIC(10, 2) NOT NULL,
  cost_usd       NUMERIC(10, 2),
  sku            TEXT UNIQUE,
  category       TEXT,
  image_url      TEXT,
  gallery_images TEXT[],
  stock_quantity INT DEFAULT 0,
  is_active      BOOLEAN DEFAULT TRUE,
  sort_order     INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merch_cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES merch_products(id) ON DELETE CASCADE,
  quantity   INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, product_id)
);

CREATE TABLE IF NOT EXISTS merch_orders (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number             TEXT NOT NULL UNIQUE,
  customer_email           TEXT NOT NULL,
  customer_name            TEXT NOT NULL,
  customer_phone           TEXT,
  -- Nullable: the store is pickup-only, so most orders have no address.
  fulfillment_method       TEXT NOT NULL DEFAULT 'pickup'
                             CHECK (fulfillment_method IN ('pickup', 'shipping')),
  picked_up_at             TIMESTAMPTZ,
  shipping_address         TEXT,
  shipping_city            TEXT,
  shipping_state           TEXT,
  shipping_zip             TEXT,
  shipping_country         TEXT DEFAULT 'US',
  total_usd                NUMERIC(10, 2) NOT NULL,
  subtotal_usd             NUMERIC(10, 2) NOT NULL,
  tax_usd                  NUMERIC(10, 2) DEFAULT 0,
  shipping_usd             NUMERIC(10, 2) DEFAULT 0,
  payment_method           TEXT,
  payment_status           TEXT DEFAULT 'pending',
  order_status             TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  notes                    TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merch_order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES merch_orders(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES merch_products(id),
  product_name  TEXT NOT NULL,
  product_price NUMERIC(10, 2) NOT NULL,
  quantity      INT NOT NULL,
  subtotal      NUMERIC(10, 2) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 7: INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS songs_fts_idx ON songs
  USING gin(
    to_tsvector('english',
      COALESCE(title_en, '') || ' ' || COALESCE(title_es, '') || ' ' || COALESCE(artist, '')
    )
  );
CREATE INDEX IF NOT EXISTS idx_songs_category    ON songs(category_id);
CREATE INDEX IF NOT EXISTS idx_songs_published   ON songs(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_course_videos_course ON course_videos(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_video_progress_lookup ON video_progress(session_id, video_id, lang);
CREATE INDEX IF NOT EXISTS idx_sermons_published ON sermons(is_published, sermon_date DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_foundational ON sermons(is_foundational);
CREATE INDEX IF NOT EXISTS idx_events_published  ON events(is_published, start_at);
CREATE INDEX IF NOT EXISTS idx_contact_read      ON contact_submissions(read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category  ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug      ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post   ON blog_comments(post_id, is_approved);

CREATE INDEX IF NOT EXISTS idx_gallery_albums_published ON gallery_albums(is_published);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_album     ON gallery_photos(album_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_subscribers_email  ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON email_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_public ON prayer_requests(is_public, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_live_streams_live ON live_streams(is_live);
CREATE INDEX IF NOT EXISTS idx_staff_public      ON staff_directory(is_public, sort_order);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date  ON analytics_daily(date);

CREATE INDEX IF NOT EXISTS idx_merch_products_active ON merch_products(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_merch_products_slug   ON merch_products(slug);
CREATE INDEX IF NOT EXISTS idx_merch_cart_session    ON merch_cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_merch_orders_email    ON merch_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_merch_order_items_order ON merch_order_items(order_id);

-- ── Stripe checkout support ────────────────────────────────────────────────
-- Stripe retries webhook deliveries for up to three days and may deliver the
-- same event twice. This table is what makes fulfilment exactly-once.
CREATE TABLE IF NOT EXISTS processed_stripe_events (
  id           TEXT PRIMARY KEY,
  event_type   TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_merch_orders_checkout_session
  ON merch_orders (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_merch_orders_created ON merch_orders (created_at DESC);

-- ============================================================================
-- PART 8: VIEW COUNTERS
-- ============================================================================
-- The pages used to do read-modify-write on view_count, which loses
-- concurrent views and is blocked by RLS. These run as the definer instead.

CREATE OR REPLACE FUNCTION public.increment_song_view(song_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE songs SET view_count = COALESCE(view_count, 0) + 1 WHERE id = song_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_blog_view(post_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE blog_posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = post_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_song_view(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_blog_view(UUID) TO anon, authenticated;

-- Atomic stock decrement, used by the Stripe webhook after payment.
-- Read-modify-write from the app would lose concurrent purchases;
-- GREATEST(...) stops stock going negative if two orders race.
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

-- Deliberately NOT granted to anon/authenticated: only the webhook, which
-- uses the service-role key, may change stock levels.
REVOKE ALL ON FUNCTION public.decrement_product_stock(UUID, INT) FROM PUBLIC;

-- ============================================================================
-- PART 9: COURSE ANALYTICS VIEW
-- ============================================================================

DROP VIEW IF EXISTS course_analytics;
CREATE VIEW course_analytics AS
  SELECT
    c.id        AS course_id,
    c.title_en  AS course,
    cv.id       AS video_id,
    cv.title_en AS video,
    COUNT(DISTINCT vp.session_id)               AS unique_viewers,
    COUNT(*) FILTER (WHERE vp.completed = TRUE) AS completions,
    ROUND(AVG(vp.watched_seconds))              AS avg_watch_seconds,
    vp.lang
  FROM video_progress vp
  JOIN course_videos cv ON vp.video_id = cv.id
  JOIN courses c        ON vp.course_id = c.id
  GROUP BY c.id, c.title_en, cv.id, cv.title_en, vp.lang
  ORDER BY c.title_en, cv.sort_order;

-- ============================================================================
-- PART 10: updated_at TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS page_content_updated_at ON page_content;
CREATE TRIGGER page_content_updated_at BEFORE UPDATE ON page_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS songs_updated_at ON songs;
CREATE TRIGGER songs_updated_at BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS courses_updated_at ON courses;
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS course_videos_updated_at ON course_videos;
CREATE TRIGGER course_videos_updated_at BEFORE UPDATE ON course_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS merch_products_updated_at ON merch_products;
CREATE TRIGGER merch_products_updated_at BEFORE UPDATE ON merch_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS merch_orders_updated_at ON merch_orders;
CREATE TRIGGER merch_orders_updated_at BEFORE UPDATE ON merch_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- PART 11: ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE page_content        ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_videos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams        ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_directory     ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily     ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_cart_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_order_items   ENABLE ROW LEVEL SECURITY;
-- No policies at all: only the service-role key (webhook) touches this.
ALTER TABLE processed_stripe_events ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Public read policies
-- PostgreSQL has no `CREATE POLICY IF NOT EXISTS`, so each policy is dropped
-- first. This is what makes the whole file safe to re-run.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "public_read_page_content" ON page_content;
CREATE POLICY "public_read_page_content" ON page_content FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public_read_song_categories" ON song_categories;
CREATE POLICY "public_read_song_categories" ON song_categories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public_read_songs" ON songs;
CREATE POLICY "public_read_songs" ON songs FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "public_read_courses" ON courses;
CREATE POLICY "public_read_courses" ON courses FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "public_read_course_videos" ON course_videos;
CREATE POLICY "public_read_course_videos" ON course_videos FOR SELECT
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "public_read_sermons" ON sermons;
CREATE POLICY "public_read_sermons" ON sermons FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "public_read_events" ON events;
CREATE POLICY "public_read_events" ON events FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "public_read_blog_categories" ON blog_categories;
CREATE POLICY "public_read_blog_categories" ON blog_categories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public_read_blog_posts" ON blog_posts;
CREATE POLICY "public_read_blog_posts" ON blog_posts FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "public_read_blog_comments" ON blog_comments;
CREATE POLICY "public_read_blog_comments" ON blog_comments FOR SELECT USING (is_approved = TRUE);

DROP POLICY IF EXISTS "public_create_blog_comments" ON blog_comments;
CREATE POLICY "public_create_blog_comments" ON blog_comments FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "public_read_gallery_albums" ON gallery_albums;
CREATE POLICY "public_read_gallery_albums" ON gallery_albums FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "public_read_gallery_photos" ON gallery_photos;
CREATE POLICY "public_read_gallery_photos" ON gallery_photos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM gallery_albums ga
    WHERE ga.id = gallery_photos.album_id AND ga.is_published = TRUE
  ));

DROP POLICY IF EXISTS "public_read_live_streams" ON live_streams;
CREATE POLICY "public_read_live_streams" ON live_streams FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public_read_staff" ON staff_directory;
CREATE POLICY "public_read_staff" ON staff_directory FOR SELECT USING (is_public = TRUE);

DROP POLICY IF EXISTS "public_read_merch_categories" ON merch_categories;
CREATE POLICY "public_read_merch_categories" ON merch_categories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public_read_merch_products" ON merch_products;
CREATE POLICY "public_read_merch_products" ON merch_products FOR SELECT USING (is_active = TRUE);

-- Public read of prayer requests is limited to the ones marked public.
DROP POLICY IF EXISTS "public_read_prayer_requests" ON prayer_requests;
CREATE POLICY "public_read_prayer_requests" ON prayer_requests FOR SELECT
  USING (is_public = TRUE);

-- ---------------------------------------------------------------------------
-- Public write policies (anonymous visitors)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "public_submit_contact" ON contact_submissions;
CREATE POLICY "public_submit_contact" ON contact_submissions FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "public_subscribe" ON email_subscribers;
CREATE POLICY "public_subscribe" ON email_subscribers FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "public_submit_prayer" ON prayer_requests;
CREATE POLICY "public_submit_prayer" ON prayer_requests FOR INSERT WITH CHECK (TRUE);

-- Course progress is keyed by an anonymous session id.
DROP POLICY IF EXISTS "public_manage_progress" ON video_progress;
CREATE POLICY "public_manage_progress" ON video_progress FOR ALL
  USING (TRUE) WITH CHECK (TRUE);

-- Cart lines are keyed by an anonymous session id.
DROP POLICY IF EXISTS "public_read_cart" ON merch_cart_items;
CREATE POLICY "public_read_cart" ON merch_cart_items FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "public_insert_cart" ON merch_cart_items;
CREATE POLICY "public_insert_cart" ON merch_cart_items FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "public_update_cart" ON merch_cart_items;
CREATE POLICY "public_update_cart" ON merch_cart_items FOR UPDATE
  USING (TRUE) WITH CHECK (TRUE);

DROP POLICY IF EXISTS "public_delete_cart" ON merch_cart_items;
CREATE POLICY "public_delete_cart" ON merch_cart_items FOR DELETE USING (TRUE);

-- NOTE: orders are deliberately NOT writable or readable with the anon key.
-- They are created by /api/checkout and completed by /api/stripe/webhook,
-- both of which use the service-role key and bypass RLS. A public INSERT
-- policy here would let anyone forge orders; a public SELECT policy would
-- expose every customer's name, email and phone number.

-- NOTE: songs previously had a public `FOR UPDATE USING (true)` policy so the
-- site could bump view_count. That let anyone rewrite any song row. View
-- counting now goes through increment_song_view() instead, so no public
-- UPDATE policy on songs exists.

-- ---------------------------------------------------------------------------
-- Admin policies - full control for the address(es) in public.is_admin()
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  t TEXT;
  admin_tables TEXT[] := ARRAY[
    'page_content',
    'song_categories', 'songs', 'courses', 'course_videos', 'video_progress',
    'sermons', 'events', 'contact_submissions', 'blog_categories', 'blog_posts',
    'blog_comments', 'gallery_albums', 'gallery_photos', 'email_subscribers',
    'prayer_requests', 'live_streams', 'staff_directory', 'analytics_events',
    'analytics_daily', 'merch_categories', 'merch_products', 'merch_cart_items',
    'merch_orders', 'merch_order_items'
  ];
BEGIN
  FOREACH t IN ARRAY admin_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "admin_all_%1$s" ON public.%1$I', t);
    EXECUTE format(
      'CREATE POLICY "admin_all_%1$s" ON public.%1$I FOR ALL
         USING (public.is_admin()) WITH CHECK (public.is_admin())', t
    );
  END LOOP;
END $$;

-- ============================================================================
-- PART 12: SEED DATA
-- ============================================================================

INSERT INTO song_categories (name_en, name_es, slug, sort_order) VALUES
  ('Worship',           'Alabanza',            'worship',   1),
  ('Hymns',             'Himnos',              'hymns',     2),
  ('Prayer',            'Oración',             'prayer',    3),
  ('Christmas',         'Navidad',             'christmas', 4),
  ('Special Occasions', 'Ocasiones Especiales', 'special',  5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_categories (name_en, name_es, slug, sort_order) VALUES
  ('News',              'Noticias',                        'news',              1),
  ('Sermon Notes',      'Notas del Sermón',                'sermon-notes',      2),
  ('Announcements',     'Anuncios',                        'announcements',     3),
  ('Ministry Updates',  'Actualizaciones del Ministerio',  'ministry-updates',  4),
  ('Testimonies',       'Testimonios',                     'testimonies',       5)
ON CONFLICT (slug) DO NOTHING;

-- Book store categories (this is the post-rename set from migration 005)
INSERT INTO merch_categories (name_en, name_es, slug, sort_order) VALUES
  ('Books',    'Libros',  'books',    1),
  ('Journals', 'Diarios', 'journals', 2),
  ('Apparel',  'Ropa',    'apparel',  3),
  ('Gifts',    'Regalos', 'gifts',    4)
ON CONFLICT (slug) DO NOTHING;

-- Real Monte Horeb sermons from the church YouTube channel.
-- The unique index gives the INSERT something to conflict on; a bare
-- `ON CONFLICT DO NOTHING` has no constraint to match and re-seeds
-- duplicates every time the file is run.
CREATE UNIQUE INDEX IF NOT EXISTS sermons_youtube_url_key
  ON sermons (youtube_url) WHERE youtube_url IS NOT NULL;

INSERT INTO sermons (title_en, title_es, speaker, sermon_date, youtube_url, language, is_published) VALUES
  ('Sermon - Pastor Alex',          'Prédica - Pastor Alex',          'Pastor Alex',              '2026-08-10', 'https://www.youtube.com/watch?v=hRNRAXeQosk', 'es', TRUE),
  ('Sermon - Pastor Frank',         'Prédica - Pastor Frank',         'Pastor Frank Alvarado',    '2026-08-10', 'https://www.youtube.com/watch?v=5p7aHZMLOaY', 'es', TRUE),
  ('Sermon - Pastor Alex',          'Prédica - Pastor Alex',          'Pastor Alex',              '2026-08-08', 'https://www.youtube.com/watch?v=cuKA_VvVCLM', 'es', TRUE),
  ('Sermon - Pastor Frank',         'Prédica - Pastor Frank',         'Pastor Frank Alvarado',    '2026-08-03', 'https://www.youtube.com/watch?v=rmGWVINlMSo', 'es', TRUE),
  ('Sermon - Pastor Frank',         'Prédica - Pastor Frank',         'Pastor Frank Alvarado',    '2026-08-03', 'https://www.youtube.com/watch?v=7e3MVT1_9Gc', 'es', TRUE),
  ('Sermon - Pastor Alex',          'Prédica - Pastor Alex',          'Pastor Alex',              '2026-07-27', 'https://www.youtube.com/watch?v=EcTHidKuQNY', 'es', TRUE),
  ('Sermon - Pastor Frank',         'Prédica - Pastor Frank',         'Pastor Frank Alvarado',    '2026-07-27', 'https://www.youtube.com/watch?v=xv6RvsdU1hw', 'es', TRUE),
  ('Sermon - Hermano Oswaldo',      'Prédica - Hermano Oswaldo',      'Hermano Oswaldo',          '2026-07-20', 'https://www.youtube.com/watch?v=14xo7C9R6Xc', 'es', TRUE),
  ('Sermon - Pastor Alex Martinez', 'Prédica - Pastor Alex Martínez', 'Pastor Alex Martinez',     '2026-07-20', 'https://www.youtube.com/watch?v=AxOYoUR2F0Y', 'es', TRUE),
  ('Sermon - Hermano Ruben',        'Prédica - Hermano Rubén',        'Hermano Ruben Hernandez',  '2026-07-20', 'https://www.youtube.com/watch?v=Pggl5UZIrio', 'es', TRUE)
ON CONFLICT (youtube_url) WHERE youtube_url IS NOT NULL DO NOTHING;

-- ============================================================================
-- DONE
-- ============================================================================
