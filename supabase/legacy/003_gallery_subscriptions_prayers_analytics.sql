-- Photo Gallery
CREATE TABLE gallery_albums (
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

CREATE TABLE gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption_en TEXT,
  caption_es TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Email Subscriptions
CREATE TABLE email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  preferred_lang TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Prayer Requests
CREATE TABLE prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  prayer_title TEXT NOT NULL,
  prayer_request TEXT NOT NULL,
  preferred_lang TEXT DEFAULT 'en',
  is_public BOOLEAN DEFAULT false,
  prayer_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Live Streaming
CREATE TABLE live_streams (
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

-- Staff Directory (extends from users table)
CREATE TABLE staff_directory (
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

-- Analytics (aggregated data)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE analytics_daily (
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

-- Indexes
CREATE INDEX idx_gallery_albums_published ON gallery_albums(is_published);
CREATE INDEX idx_gallery_photos_album ON gallery_photos(album_id);
CREATE INDEX idx_subscribers_email ON email_subscribers(email);
CREATE INDEX idx_subscribers_active ON email_subscribers(is_active);
CREATE INDEX idx_prayer_requests_lang ON prayer_requests(preferred_lang);
CREATE INDEX idx_live_streams_live ON live_streams(is_live);
CREATE INDEX idx_staff_public ON staff_directory(is_public);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type, created_at);
CREATE INDEX idx_analytics_daily_date ON analytics_daily(date);

-- RLS Policies
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

-- Public can read published galleries
CREATE POLICY "read_published_albums" ON gallery_albums
  FOR SELECT USING (is_published = true);
CREATE POLICY "read_album_photos" ON gallery_photos
  FOR SELECT USING (EXISTS (SELECT 1 FROM gallery_albums WHERE id = album_id AND is_published = true));

-- Public can read staff
CREATE POLICY "read_public_staff" ON staff_directory
  FOR SELECT USING (is_public = true);

-- Public can read live streams
CREATE POLICY "read_live_streams" ON live_streams
  FOR SELECT USING (true);

-- Anyone can create subscribers + prayer requests
CREATE POLICY "create_subscribers" ON email_subscribers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "create_prayer_requests" ON prayer_requests
  FOR INSERT WITH CHECK (true);

-- Admin can manage all
CREATE POLICY "admin_manage_galleries" ON gallery_albums
  FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY "admin_manage_gallery_photos" ON gallery_photos
  FOR ALL USING (EXISTS (SELECT 1 FROM gallery_albums ga WHERE ga.id = album_id AND auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com')));
CREATE POLICY "admin_manage_subscribers" ON email_subscribers
  FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY "admin_manage_prayer_requests" ON prayer_requests
  FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY "admin_manage_live_streams" ON live_streams
  FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY "admin_manage_staff" ON staff_directory
  FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY "admin_manage_analytics" ON analytics_events
  FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
CREATE POLICY "admin_read_analytics" ON analytics_daily
  FOR SELECT USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));
