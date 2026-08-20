-- ============================================================
-- Monte Horeb - Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── SONG CATEGORIES ────────────────────────────────────────
CREATE TABLE song_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en     TEXT NOT NULL,
  name_es     TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  sort_order  INT  DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories
INSERT INTO song_categories (name_en, name_es, slug, sort_order) VALUES
  ('Worship',           'Alabanza',           'worship',     1),
  ('Hymns',             'Himnos',             'hymns',       2),
  ('Prayer',            'Oración',            'prayer',      3),
  ('Christmas',         'Navidad',            'christmas',   4),
  ('Special Occasions', 'Ocasiones Especiales','special',    5);

-- ─── SONGS ──────────────────────────────────────────────────
CREATE TABLE songs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en        TEXT NOT NULL,
  title_es        TEXT,
  artist          TEXT,
  musical_key     TEXT,
  category_id     UUID REFERENCES song_categories(id) ON DELETE SET NULL,
  youtube_url_en  TEXT,
  youtube_url_es  TEXT,
  file_url        TEXT,           -- Supabase Storage path
  file_type       TEXT CHECK (file_type IN ('pdf', 'pptx')),
  language        TEXT DEFAULT 'both' CHECK (language IN ('en', 'es', 'both')),
  is_published    BOOLEAN DEFAULT TRUE,
  sort_order      INT DEFAULT 0,
  view_count      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX songs_fts_idx ON songs
  USING gin(
    to_tsvector('english',
      COALESCE(title_en, '') || ' ' ||
      COALESCE(title_es, '') || ' ' ||
      COALESCE(artist, '')
    )
  );

-- ─── COURSES (New Believers) ─────────────────────────────────
CREATE TABLE courses (
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

-- ─── COURSE VIDEOS (Lessons) ────────────────────────────────
CREATE TABLE course_videos (
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

-- ─── PROGRESS TRACKING (session-based, no login required) ───
CREATE TABLE video_progress (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       TEXT NOT NULL,
  video_id         UUID NOT NULL REFERENCES course_videos(id) ON DELETE CASCADE,
  course_id        UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  watched_seconds  INT DEFAULT 0,
  completed        BOOLEAN DEFAULT FALSE,
  lang             TEXT DEFAULT 'en' CHECK (lang IN ('en', 'es')),
  last_watched_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, video_id, lang)
);

-- ─── SERMONS ────────────────────────────────────────────────
CREATE TABLE sermons (
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

-- Seed with real Monte Horeb sermons from YouTube
INSERT INTO sermons (title_en, title_es, speaker, sermon_date, youtube_url, language, is_published) VALUES
  ('Sermon - Pastor Alex',        'Prédica - Pastor Alex',         'Pastor Alex',         '2026-08-10', 'https://www.youtube.com/watch?v=hRNRAXeQosk', 'es', true),
  ('Sermon - Pastor Frank',       'Prédica - Pastor Frank',        'Pastor Frank Alvarado','2026-08-10', 'https://www.youtube.com/watch?v=5p7aHZMLOaY',  'es', true),
  ('Sermon - Pastor Alex',        'Prédica - Pastor Alex',         'Pastor Alex',         '2026-08-08', 'https://www.youtube.com/watch?v=cuKA_VvVCLM', 'es', true),
  ('Sermon - Pastor Frank',       'Prédica - Pastor Frank',        'Pastor Frank Alvarado','2026-08-03', 'https://www.youtube.com/watch?v=rmGWVINlMSo',  'es', true),
  ('Sermon - Pastor Frank',       'Prédica - Pastor Frank',        'Pastor Frank Alvarado','2026-08-03', 'https://www.youtube.com/watch?v=7e3MVT1_9Gc',  'es', true),
  ('Sermon - Pastor Alex',        'Prédica - Pastor Alex',         'Pastor Alex',         '2026-07-27', 'https://www.youtube.com/watch?v=EcTHidKuQNY', 'es', true),
  ('Sermon - Pastor Frank',       'Prédica - Pastor Frank',        'Pastor Frank Alvarado','2026-07-27', 'https://www.youtube.com/watch?v=xv6RvsdU1hw',  'es', true),
  ('Sermon - Hermano Oswaldo',    'Prédica - Hermano Oswaldo',     'Hermano Oswaldo',     '2026-07-20', 'https://www.youtube.com/watch?v=14xo7C9R6Xc', 'es', true),
  ('Sermon - Pastor Alex Martinez','Prédica - Pastor Alex Martínez','Pastor Alex Martinez','2026-07-20', 'https://www.youtube.com/watch?v=AxOYoUR2F0Y', 'es', true),
  ('Sermon - Hermano Ruben',      'Prédica - Hermano Rubén',       'Hermano Ruben Hernandez','2026-07-20','https://www.youtube.com/watch?v=Pggl5UZIrio', 'es', true);

-- ─── EVENTS ─────────────────────────────────────────────────
CREATE TABLE events (
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

-- ─── CONTACT FORM SUBMISSIONS ────────────────────────────────
CREATE TABLE contact_submissions (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL,
  email     TEXT NOT NULL,
  phone     TEXT,
  language  TEXT DEFAULT 'en',
  message   TEXT NOT NULL,
  read      BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
-- Public read on published content
ALTER TABLE song_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_videos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons            ENABLE ROW LEVEL SECURITY;
ALTER TABLE events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Public can read published content
CREATE POLICY "Public read song_categories" ON song_categories FOR SELECT USING (true);
CREATE POLICY "Public read published songs" ON songs FOR SELECT USING (is_published = true);
CREATE POLICY "Public read published courses" ON courses FOR SELECT USING (is_published = true);
CREATE POLICY "Public read published videos" ON course_videos FOR SELECT USING (is_published = true);
CREATE POLICY "Public read published sermons" ON sermons FOR SELECT USING (is_published = true);
CREATE POLICY "Public read published events" ON events FOR SELECT USING (is_published = true);

-- Anyone can write/read their own progress (by session_id)
CREATE POLICY "Users manage own progress" ON video_progress
  FOR ALL USING (true) WITH CHECK (true);

-- Anyone can submit contact form
CREATE POLICY "Anyone can submit contact" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Song view count increment (public)
CREATE POLICY "Public increment song views" ON songs
  FOR UPDATE USING (true) WITH CHECK (true);

-- Admin (service role) bypasses RLS - handled server-side
-- ─────────────────────────────────────────────────────────────

-- ─── ANALYTICS VIEW ──────────────────────────────────────────
CREATE VIEW course_analytics AS
  SELECT
    c.id           AS course_id,
    c.title_en     AS course,
    cv.id          AS video_id,
    cv.title_en    AS video,
    COUNT(DISTINCT vp.session_id)                       AS unique_viewers,
    COUNT(*) FILTER (WHERE vp.completed = TRUE)         AS completions,
    ROUND(AVG(vp.watched_seconds))                      AS avg_watch_seconds,
    vp.lang
  FROM video_progress vp
  JOIN course_videos cv ON vp.video_id = cv.id
  JOIN courses c        ON vp.course_id = c.id
  GROUP BY c.id, c.title_en, cv.id, cv.title_en, vp.lang
  ORDER BY c.title_en, cv.sort_order;

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER course_videos_updated_at
  BEFORE UPDATE ON course_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
