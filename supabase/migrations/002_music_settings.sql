-- Migration: Add music_settings table
-- Created: 2026-01-12

CREATE TABLE IF NOT EXISTS music_settings (
  page_id UUID PRIMARY KEY REFERENCES pages(id) ON DELETE CASCADE,
  track_url TEXT,
  autoplay BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_music_settings_page_id ON music_settings(page_id);

-- RLS Policies
ALTER TABLE music_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read on music_settings" ON music_settings
  FOR SELECT
  USING (true);

-- Allow authenticated update (use with caution in production)
CREATE POLICY "Allow authenticated update on music_settings" ON music_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comment
COMMENT ON TABLE music_settings IS 'Background music settings for each page';
COMMENT ON COLUMN music_settings.track_url IS 'URL to the music track (MP3, OGG, etc.)';
COMMENT ON COLUMN music_settings.autoplay IS 'Whether to auto-play music on page load';
