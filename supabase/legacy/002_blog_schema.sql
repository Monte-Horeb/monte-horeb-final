-- Blog posts table
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_es TEXT,
  slug TEXT NOT NULL UNIQUE,
  excerpt_en TEXT,
  excerpt_es TEXT,
  content_en TEXT NOT NULL,
  content_es TEXT,
  author_id UUID REFERENCES auth.users(id),
  category_id UUID REFERENCES blog_categories(id),
  featured_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Blog categories
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL UNIQUE,
  name_es TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Blog comments (optional - for later)
CREATE TABLE blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX idx_blog_comments_post ON blog_comments(post_id, is_approved);

-- RLS Policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "read_published_posts" ON blog_posts
  FOR SELECT USING (is_published = true);

-- Admin can read all posts
CREATE POLICY "admin_read_all_posts" ON blog_posts
  FOR SELECT USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));

-- Admin can create, update, delete
CREATE POLICY "admin_manage_posts" ON blog_posts
  FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));

-- Anyone can read categories
CREATE POLICY "read_categories" ON blog_categories
  FOR SELECT USING (true);

-- Admin can manage categories
CREATE POLICY "admin_manage_categories" ON blog_categories
  FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));

-- Anyone can read approved comments
CREATE POLICY "read_approved_comments" ON blog_comments
  FOR SELECT USING (is_approved = true);

-- Anyone can create comments
CREATE POLICY "create_comments" ON blog_comments
  FOR INSERT WITH CHECK (true);

-- Admin can manage comments
CREATE POLICY "admin_manage_comments" ON blog_comments
  FOR ALL USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'robinsonramos96@gmail.com'));

-- Seed default categories
INSERT INTO blog_categories (name_en, name_es, slug, sort_order) VALUES
  ('News', 'Noticias', 'news', 1),
  ('Sermon Notes', 'Notas del Sermón', 'sermon-notes', 2),
  ('Announcements', 'Anuncios', 'announcements', 3),
  ('Ministry Updates', 'Actualizaciones del Ministerio', 'ministry-updates', 4),
  ('Testimonies', 'Testimonios', 'testimonies', 5);
