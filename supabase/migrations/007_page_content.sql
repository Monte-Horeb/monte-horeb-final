-- ============================================================================
-- 007 - Editable page content (real-time admin editing of static copy)
-- ============================================================================
-- Run this in the Supabase SQL Editor AFTER schema.sql. Safe to re-run.
--
-- If you are setting up a brand new database, schema.sql already contains
-- everything in here and you can skip this file.
--
-- What this adds: a `page_content` table that lets the admin panel override
-- the headline/body copy on Home, Visit, About, Ministries, Give and Contact
-- without a code deploy. Until this migration runs, those pages keep working
-- exactly as before — the app falls back to the compiled-in text whenever a
-- row is missing.
-- ============================================================================

CREATE TABLE IF NOT EXISTS page_content (
  page_key    TEXT PRIMARY KEY,
  content_en  JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_es  JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_page_content" ON page_content;
CREATE POLICY "public_read_page_content" ON page_content FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "admin_all_page_content" ON page_content;
CREATE POLICY "admin_all_page_content" ON page_content FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Keep updated_at current on every admin edit, matching the other
-- content tables (see PART 10 of schema.sql for the trigger function).
DROP TRIGGER IF EXISTS page_content_updated_at ON page_content;
CREATE TRIGGER page_content_updated_at BEFORE UPDATE ON page_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- DONE
-- ============================================================================
