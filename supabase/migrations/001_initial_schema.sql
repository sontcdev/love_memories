-- Supabase Database Schema for Kỷ Niệm Số
-- Tables: links, profiles, gallery, timeline, time_capsule, flashcards
-- With Row Level Security (RLS) for Admin/Guest/Owner access levels

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. Links Table (Main user link records)
CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('LOVE', 'EVERY', 'IDOL')),
  access_password TEXT,  -- Guest password (nullable)
  owner_pin TEXT NOT NULL,  -- 6-digit owner PIN
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,  -- Soft delete flag
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT valid_pin CHECK (owner_pin ~ '^\d{6}$')
);

CREATE INDEX IF NOT EXISTS idx_links_username ON links(username);
CREATE INDEX IF NOT EXISTS idx_links_deleted ON links(is_deleted) WHERE is_deleted = FALSE;

-- 2. Profiles Table (LOVE template data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  partner_name_1 TEXT,
  partner_name_2 TEXT,
  birth_date_1 DATE,
  birth_date_2 DATE,
  avatar_url_1 TEXT,
  avatar_url_2 TEXT,
  anniversary_date DATE,
  is_countdown BOOLEAN DEFAULT FALSE,
  short_note TEXT CHECK (char_length(short_note) <= 50),
  day_count_title TEXT CHECK (char_length(day_count_title) <= 50),
  cover_url TEXT,
  couple_image_url TEXT,
  music_url TEXT,
  
  UNIQUE(link_id)
);

CREATE INDEX IF NOT EXISTS idx_profiles_link ON profiles(link_id);

-- 3. Gallery Table (Image gallery)
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT CHECK (char_length(caption) <= 50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_link ON gallery(link_id);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery(link_id, display_order);

-- 4. Timeline Table (Timeline events)
CREATE TABLE IF NOT EXISTS timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 50),
  description TEXT CHECK (char_length(description) <= 100),
  image_url TEXT,
  audio_url TEXT,  -- Max 1 minute (enforced by app)
  event_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_link ON timeline(link_id);
CREATE INDEX IF NOT EXISTS idx_timeline_date ON timeline(event_date);

-- 5. Time Capsule Table
CREATE TABLE IF NOT EXISTS time_capsule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 50),
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  open_date TIMESTAMPTZ NOT NULL,
  youtube_url TEXT,
  audio_url TEXT,
  response TEXT CHECK (char_length(response) <= 300),
  is_opened BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capsule_link ON time_capsule(link_id);
CREATE INDEX IF NOT EXISTS idx_capsule_open_date ON time_capsule(open_date);

-- 6. Flashcards Table (Game flashcards)
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('EASY', 'MEDIUM', 'HARD')),
  question TEXT NOT NULL,
  is_revealed BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,  -- Seeded by system
  display_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_flashcards_link ON flashcards(link_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_level ON flashcards(level);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role' = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify guest access password
CREATE OR REPLACE FUNCTION verify_guest_access(link_username TEXT, password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM links
    WHERE username = link_username
    AND (access_password IS NULL OR access_password = password)
    AND is_deleted = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify owner PIN
CREATE OR REPLACE FUNCTION verify_owner_pin(link_username TEXT, pin TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM links
    WHERE username = link_username
    AND owner_pin = pin
    AND is_deleted = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get link_id from JWT claims
CREATE OR REPLACE FUNCTION get_current_link_id()
RETURNS UUID AS $$
BEGIN
  RETURN (current_setting('request.jwt.claims', true)::json->>'link_id')::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_capsule ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: LINKS TABLE
-- ============================================================================

-- Admin: Full access to all links
CREATE POLICY admin_all_links ON links
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Guest: SELECT only (no password required if access_password is NULL)
CREATE POLICY guest_select_links ON links
  FOR SELECT
  USING (is_deleted = FALSE);

-- Owner: UPDATE with PIN verification
CREATE POLICY owner_update_links ON links
  FOR UPDATE
  USING (
    is_deleted = FALSE AND
    verify_owner_pin(username, current_setting('request.jwt.claims', true)::json->>'pin')
  );

-- ============================================================================
-- RLS POLICIES: PROFILES TABLE
-- ============================================================================

-- Admin: Full access
CREATE POLICY admin_all_profiles ON profiles
  FOR ALL
  USING (is_admin());

-- Guest: SELECT via link access
CREATE POLICY guest_select_profiles ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = profiles.link_id
      AND links.is_deleted = FALSE
    )
  );

-- Owner: Full CRUD with PIN
CREATE POLICY owner_all_profiles ON profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = profiles.link_id
      AND verify_owner_pin(links.username, current_setting('request.jwt.claims', true)::json->>'pin')
    )
  );

-- ============================================================================
-- RLS POLICIES: GALLERY TABLE
-- ============================================================================

CREATE POLICY admin_all_gallery ON gallery FOR ALL USING (is_admin());

CREATE POLICY guest_select_gallery ON gallery
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = gallery.link_id
      AND links.is_deleted = FALSE
    )
  );

CREATE POLICY owner_all_gallery ON gallery
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = gallery.link_id
      AND verify_owner_pin(links.username, current_setting('request.jwt.claims', true)::json->>'pin')
    )
  );

-- ============================================================================
-- RLS POLICIES: TIMELINE TABLE
-- ============================================================================

CREATE POLICY admin_all_timeline ON timeline FOR ALL USING (is_admin());

CREATE POLICY guest_select_timeline ON timeline
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = timeline.link_id
      AND links.is_deleted = FALSE
    )
  );

CREATE POLICY owner_all_timeline ON timeline
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = timeline.link_id
      AND verify_owner_pin(links.username, current_setting('request.jwt.claims', true)::json->>'pin')
    )
  );

-- ============================================================================
-- RLS POLICIES: TIME CAPSULE TABLE
-- ============================================================================

CREATE POLICY admin_all_capsule ON time_capsule FOR ALL USING (is_admin());

CREATE POLICY guest_select_capsule ON time_capsule
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = time_capsule.link_id
      AND links.is_deleted = FALSE
    )
  );

CREATE POLICY owner_all_capsule ON time_capsule
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = time_capsule.link_id
      AND verify_owner_pin(links.username, current_setting('request.jwt.claims', true)::json->>'pin')
    )
  );

-- ============================================================================
-- RLS POLICIES: FLASHCARDS TABLE
-- ============================================================================

CREATE POLICY admin_all_flashcards ON flashcards FOR ALL USING (is_admin());

CREATE POLICY guest_select_flashcards ON flashcards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = flashcards.link_id
      AND links.is_deleted = FALSE
    )
  );

CREATE POLICY owner_all_flashcards ON flashcards
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = flashcards.link_id
      AND verify_owner_pin(links.username, current_setting('request.jwt.claims', true)::json->>'pin')
    )
  );

-- ============================================================================
-- DONE
-- ============================================================================

-- Verify tables created
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('links', 'profiles', 'gallery', 'timeline', 'time_capsule', 'flashcards')
ORDER BY tablename;
