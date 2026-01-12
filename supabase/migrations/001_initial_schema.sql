-- ============================================================================
-- Love Page Platform - Initial Database Schema
-- Version: 001
-- Created: 2026-01-12
-- Description: Complete database schema for Love Page Platform supporting
--              LOVE, EVERY, and IDOL templates with customizable content
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Template types for different page themes
CREATE TYPE template_type_enum AS ENUM ('LOVE', 'EVERY', 'IDOL');

-- Count modes for date counting feature
CREATE TYPE mode_count_enum AS ENUM ('UP', 'DOWN', 'NONE');

-- Content item types for unified content management
CREATE TYPE content_type_enum AS ENUM ('GALLERY', 'TIMELINE', 'LETTER', 'IDOL_MILESTONE');

-- Difficulty levels for game cards
CREATE TYPE difficulty_level_enum AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Pages Table
-- Stores basic page configuration and authentication
-- ----------------------------------------------------------------------------
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    passcode_hash VARCHAR(255) NOT NULL,
    template_type template_type_enum NOT NULL DEFAULT 'LOVE',
    theme_config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT username_lowercase CHECK (username = LOWER(username)),
    CONSTRAINT username_alphanumeric CHECK (username ~ '^[a-z0-9_-]+$'),
    CONSTRAINT username_length CHECK (LENGTH(username) >= 3 AND LENGTH(username) <= 50)
);

-- Add comments for documentation
COMMENT ON TABLE pages IS 'Stores page configuration and authentication data';
COMMENT ON COLUMN pages.username IS 'Unique slug for URL routing (lowercase, alphanumeric, -, _)';
COMMENT ON COLUMN pages.passcode_hash IS 'Bcrypt hashed 6-digit PIN code';
COMMENT ON COLUMN pages.theme_config IS 'Custom theme colors in JSON format: {"background": "#FFCDD4", "primary": "#E30523"}';
COMMENT ON COLUMN pages.is_active IS 'Controls page visibility (false = page is hidden)';

-- ----------------------------------------------------------------------------
-- Page Data Table
-- Stores homepage display data (1:1 relationship with pages)
-- ----------------------------------------------------------------------------
CREATE TABLE page_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID UNIQUE NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    mode_count mode_count_enum NOT NULL DEFAULT 'NONE',
    target_date DATE,
    title_text TEXT NOT NULL,
    participants JSONB NOT NULL DEFAULT '[]',
    background_music_url TEXT,
    is_music_autoplay BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT target_date_required_for_counting CHECK (
        (mode_count = 'NONE' AND target_date IS NULL) OR
        (mode_count IN ('UP', 'DOWN') AND target_date IS NOT NULL)
    ),
    CONSTRAINT participants_is_array CHECK (jsonb_typeof(participants) = 'array')
);

-- Add comments
COMMENT ON TABLE page_data IS 'Stores homepage display configuration for each page';
COMMENT ON COLUMN page_data.mode_count IS 'Date counting mode: UP (count days since), DOWN (countdown to), NONE (no counting)';
COMMENT ON COLUMN page_data.target_date IS 'Reference date for counting (required if mode_count is UP or DOWN)';
COMMENT ON COLUMN page_data.title_text IS 'Dynamic title displayed on homepage (e.g., "Chúng mình đã bên nhau...")';
COMMENT ON COLUMN page_data.participants IS 'Array of participant objects: [{"name": "...", "dob": "YYYY-MM-DD", "role": "...", "avatar_url": "..."}]';

-- ----------------------------------------------------------------------------
-- Content Items Table
-- Stores all content types (gallery, timeline, letters, milestones)
-- ----------------------------------------------------------------------------
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    type content_type_enum NOT NULL,
    title VARCHAR(255),
    content TEXT,
    image_url TEXT,
    date_event DATE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT content_or_image_required CHECK (
        content IS NOT NULL OR image_url IS NOT NULL OR title IS NOT NULL
    )
);

-- Add comments
COMMENT ON TABLE content_items IS 'Unified content storage for gallery, timeline, letters, and milestones';
COMMENT ON COLUMN content_items.type IS 'Content type: GALLERY (photos), TIMELINE (events), LETTER (messages), IDOL_MILESTONE (achievements)';
COMMENT ON COLUMN content_items.sort_order IS 'Display order within the same type (lower number = higher priority)';
COMMENT ON COLUMN content_items.date_event IS 'Event date for timeline and milestone items';

-- ----------------------------------------------------------------------------
-- Game Cards Table
-- Global game card library (shared across all pages)
-- ----------------------------------------------------------------------------
CREATE TABLE game_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    level difficulty_level_enum NOT NULL DEFAULT 'EASY',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- Add comments
COMMENT ON TABLE game_cards IS 'Global game card library for interactive couple games';
COMMENT ON COLUMN game_cards.content IS 'Question or challenge text';
COMMENT ON COLUMN game_cards.level IS 'Difficulty level: EASY, MEDIUM, HARD';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Pages table indexes
CREATE INDEX idx_pages_username ON pages(username);
CREATE INDEX idx_pages_is_active ON pages(is_active);
CREATE INDEX idx_pages_template_type ON pages(template_type);
CREATE INDEX idx_pages_created_at ON pages(created_at DESC);

-- Page data table indexes
CREATE INDEX idx_page_data_page_id ON page_data(page_id);

-- Content items table indexes
CREATE INDEX idx_content_items_page_id ON content_items(page_id);
CREATE INDEX idx_content_items_type ON content_items(type);
CREATE INDEX idx_content_items_page_sort ON content_items(page_id, type, sort_order);
CREATE INDEX idx_content_items_date_event ON content_items(date_event) WHERE date_event IS NOT NULL;

-- Game cards table indexes
CREATE INDEX idx_game_cards_level ON game_cards(level);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_data_updated_at
    BEFORE UPDATE ON page_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_items_updated_at
    BEFORE UPDATE ON content_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_cards_updated_at
    BEFORE UPDATE ON game_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_cards ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Pages Table Policies
-- ----------------------------------------------------------------------------

-- Allow public to view active pages
CREATE POLICY pages_select_active
    ON pages
    FOR SELECT
    USING (is_active = true);

-- Allow authenticated users to insert their own pages
CREATE POLICY pages_insert_authenticated
    ON pages
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own pages (authenticated via passcode verification)
CREATE POLICY pages_update_owner
    ON pages
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Allow users to delete their own pages
CREATE POLICY pages_delete_owner
    ON pages
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- Page Data Table Policies
-- ----------------------------------------------------------------------------

-- Allow public to view page data for active pages
CREATE POLICY page_data_select_active
    ON page_data
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM pages
            WHERE pages.id = page_data.page_id
            AND pages.is_active = true
        )
    );

-- Allow authenticated users to manage their page data
CREATE POLICY page_data_insert_authenticated
    ON page_data
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY page_data_update_authenticated
    ON page_data
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY page_data_delete_authenticated
    ON page_data
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- Content Items Table Policies
-- ----------------------------------------------------------------------------

-- Allow public to view content items for active pages
CREATE POLICY content_items_select_active
    ON content_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM pages
            WHERE pages.id = content_items.page_id
            AND pages.is_active = true
        )
    );

-- Allow authenticated users to manage their content items
CREATE POLICY content_items_insert_authenticated
    ON content_items
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY content_items_update_authenticated
    ON content_items
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY content_items_delete_authenticated
    ON content_items
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- Game Cards Table Policies
-- ----------------------------------------------------------------------------

-- Allow public read access to game cards
CREATE POLICY game_cards_select_all
    ON game_cards
    FOR SELECT
    USING (true);

-- Only authenticated users can manage game cards
CREATE POLICY game_cards_insert_authenticated
    ON game_cards
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY game_cards_update_authenticated
    ON game_cards
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY game_cards_delete_authenticated
    ON game_cards
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: verify_page_passcode
-- Description: Verifies a passcode against a page's stored hash
-- Parameters:
--   p_username: Page username/slug
--   p_passcode: Plain text 6-digit PIN
-- Returns: Boolean (true if passcode matches)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION verify_page_passcode(
    p_username VARCHAR,
    p_passcode VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    v_passcode_hash VARCHAR;
BEGIN
    -- Validate input
    IF p_passcode IS NULL OR LENGTH(p_passcode) != 6 THEN
        RETURN false;
    END IF;
    
    -- Get stored hash
    SELECT passcode_hash INTO v_passcode_hash
    FROM pages
    WHERE username = p_username
    AND is_active = true;
    
    -- Check if page exists
    IF v_passcode_hash IS NULL THEN
        RETURN false;
    END IF;
    
    -- Verify passcode using crypt (requires pgcrypto extension)
    -- Note: This assumes bcrypt hashing. Adjust if using different algorithm.
    RETURN (crypt(p_passcode, v_passcode_hash) = v_passcode_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- Function: get_full_page_data
-- Description: Retrieves complete page data including related tables
-- Parameters:
--   p_username: Page username/slug
-- Returns: JSON object with page, page_data, and content_items
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_full_page_data(p_username VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'page', (
            SELECT row_to_json(p.*)
            FROM pages p
            WHERE p.username = p_username
            AND p.is_active = true
        ),
        'page_data', (
            SELECT row_to_json(pd.*)
            FROM page_data pd
            JOIN pages p ON p.id = pd.page_id
            WHERE p.username = p_username
            AND p.is_active = true
        ),
        'content_items', (
            SELECT json_agg(ci.* ORDER BY ci.type, ci.sort_order)
            FROM content_items ci
            JOIN pages p ON p.id = ci.page_id
            WHERE p.username = p_username
            AND p.is_active = true
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Function: generate_random_game_cards
-- Description: Returns random game cards based on difficulty level
-- Parameters:
--   p_level: Difficulty level (EASY, MEDIUM, HARD, or NULL for all)
--   p_limit: Number of cards to return (default: 10)
-- Returns: Table of game cards
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_random_game_cards(
    p_level difficulty_level_enum DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    level difficulty_level_enum
) AS $$
BEGIN
    RETURN QUERY
    SELECT gc.id, gc.content, gc.level
    FROM game_cards gc
    WHERE (p_level IS NULL OR gc.level = p_level)
    ORDER BY RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- Insert sample game cards
INSERT INTO game_cards (content, level) VALUES
    ('Kể một kỷ niệm đáng nhớ nhất về đối phương?', 'EASY'),
    ('Điều gì khiến bạn yêu người ấy từ cái nhìn đầu tiên?', 'EASY'),
    ('Món quà ý nghĩa nhất bạn từng tặng/nhận từ người ấy?', 'MEDIUM'),
    ('Nếu có cơ hội quay lại quá khứ, bạn muốn thay đổi điều gì trong mối quan hệ?', 'MEDIUM'),
    ('Bạn nghĩ mình và người ấy sẽ ở đâu sau 10 năm nữa?', 'HARD'),
    ('Điều gì bạn chưa bao giờ dám nói với người ấy?', 'HARD');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify installation
DO $$
BEGIN
    RAISE NOTICE '✅ Love Page Platform schema installed successfully!';
    RAISE NOTICE 'Tables created: pages, page_data, content_items, game_cards';
    RAISE NOTICE 'ENUM types: template_type_enum, mode_count_enum, content_type_enum, difficulty_level_enum';
    RAISE NOTICE 'RLS policies: Enabled on all tables';
    RAISE NOTICE 'Helper functions: verify_page_passcode, get_full_page_data, generate_random_game_cards';
END $$;
