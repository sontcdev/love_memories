-- ============================================================================
-- SUPABASE DATABASE SCHEMA
-- Web Embee - Flutter Web Application
-- ============================================================================

-- Drop existing types if they exist (for clean re-run)
DROP TYPE IF EXISTS template_type_enum CASCADE;
DROP TYPE IF EXISTS status_enum CASCADE;
DROP TYPE IF EXISTS mode_count_enum CASCADE;
DROP TYPE IF EXISTS level_enum CASCADE;
DROP TYPE IF EXISTS content_type_enum CASCADE;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE template_type_enum AS ENUM ('LOVE', 'EVERY', 'IDOL');
CREATE TYPE status_enum AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE mode_count_enum AS ENUM ('UP', 'DOWN', 'NONE');
CREATE TYPE level_enum AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE content_type_enum AS ENUM ('GALLERY', 'TIMELINE', 'LETTER');

-- ============================================================================
-- TABLE: pages
-- ============================================================================

CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    passcode_hash VARCHAR,
    template_type template_type_enum NOT NULL DEFAULT 'LOVE',
    status status_enum NOT NULL DEFAULT 'ACTIVE',
    theme_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast username lookups
CREATE UNIQUE INDEX idx_pages_username ON pages(username);

-- Index for filtering by status
CREATE INDEX idx_pages_status ON pages(status);

-- ============================================================================
-- TABLE: page_data
-- ============================================================================

CREATE TABLE page_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    mode_count mode_count_enum DEFAULT 'UP',
    participants JSONB,
    title_text TEXT,
    main_image_url TEXT,
    music_url TEXT,
    is_music_autoplay BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast page_id lookups
CREATE INDEX idx_page_data_page_id ON page_data(page_id);

-- Ensure one page_data per page
CREATE UNIQUE INDEX idx_page_data_unique_page ON page_data(page_id);

-- ============================================================================
-- TABLE: game_cards (Global - không có FK)
-- ============================================================================

CREATE TABLE game_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    level level_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for filtering by level
CREATE INDEX idx_game_cards_level ON game_cards(level);

-- ============================================================================
-- TABLE: content_items (Gộp Gallery, Timeline, Letter)
-- ============================================================================

CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    type content_type_enum NOT NULL,
    image_url TEXT,
    title TEXT,
    content TEXT,
    date_event DATE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast page_id lookups
CREATE INDEX idx_content_items_page_id ON content_items(page_id);

-- Index for filtering by type
CREATE INDEX idx_content_items_type ON content_items(type);

-- Index for ordering
CREATE INDEX idx_content_items_sort_order ON content_items(page_id, sort_order);

-- ============================================================================
-- TABLE: letter_replies
-- ============================================================================

CREATE TABLE letter_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast content_item_id lookups
CREATE INDEX idx_letter_replies_content_item_id ON letter_replies(content_item_id);

-- ============================================================================
-- FUNCTIONS: Auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_data_updated_at BEFORE UPDATE ON page_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_cards_updated_at BEFORE UPDATE ON game_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_replies ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: Public Read Access
-- ============================================================================

-- pages: Public read, authenticated write
CREATE POLICY "Public can view active pages"
    ON pages FOR SELECT
    USING (status = 'ACTIVE');

CREATE POLICY "Authenticated users can insert pages"
    ON pages FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update their pages"
    ON pages FOR UPDATE
    TO authenticated
    USING (true);

-- page_data: Public read, authenticated write
CREATE POLICY "Public can view page data"
    ON page_data FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage page data"
    ON page_data FOR ALL
    TO authenticated
    USING (true);

-- game_cards: Public read, authenticated write (global cards)
CREATE POLICY "Public can view game cards"
    ON game_cards FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage game cards"
    ON game_cards FOR ALL
    TO authenticated
    USING (true);

-- content_items: Public read, authenticated write
CREATE POLICY "Public can view content items"
    ON content_items FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage content items"
    ON content_items FOR ALL
    TO authenticated
    USING (true);

-- letter_replies: Public read and write (anyone can reply)
CREATE POLICY "Public can view letter replies"
    ON letter_replies FOR SELECT
    USING (true);

CREATE POLICY "Public can insert letter replies"
    ON letter_replies FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Authenticated users can manage letter replies"
    ON letter_replies FOR ALL
    TO authenticated
    USING (true);

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample page
INSERT INTO pages (username, template_type, status)
VALUES ('demo_love', 'LOVE', 'ACTIVE');

-- Get the page_id for sample data
DO $$
DECLARE
    sample_page_id UUID;
BEGIN
    SELECT id INTO sample_page_id FROM pages WHERE username = 'demo_love';
    
    -- Insert sample page_data
    INSERT INTO page_data (
        page_id,
        mode_count,
        participants,
        title_text,
        is_music_autoplay
    ) VALUES (
        sample_page_id,
        'UP',
        '[
            {"name": "Alice", "age": 25, "role": "Partner 1", "avatar_url": "https://example.com/alice.jpg"},
            {"name": "Bob", "age": 27, "role": "Partner 2", "avatar_url": "https://example.com/bob.jpg"}
        ]'::jsonb,
        'Our Love Story',
        false
    );
    
    -- Insert sample gallery items
    INSERT INTO content_items (page_id, type, image_url, title, sort_order)
    VALUES 
        (sample_page_id, 'GALLERY', 'https://example.com/photo1.jpg', 'First Date', 1),
        (sample_page_id, 'GALLERY', 'https://example.com/photo2.jpg', 'Vacation', 2);
    
    -- Insert sample timeline item
    INSERT INTO content_items (page_id, type, title, content, date_event, sort_order)
    VALUES (
        sample_page_id,
        'TIMELINE',
        'First Meeting',
        'We met at the coffee shop',
        '2024-01-15',
        1
    );
    
    -- Insert sample letter
    INSERT INTO content_items (page_id, type, title, content, sort_order)
    VALUES (
        sample_page_id,
        'LETTER',
        'Love Letter',
        'Dear Alice, you make every day special...',
        1
    );
END $$;

-- Insert sample game cards
INSERT INTO game_cards (content, level) VALUES
    ('What is your partner''s favorite color?', 'EASY'),
    ('Describe your first kiss', 'MEDIUM'),
    ('What are your partner''s biggest dreams?', 'HARD');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check all ENUMs created
SELECT typname 
FROM pg_type 
WHERE typtype = 'e' 
ORDER BY typname;

-- Verify sample data
SELECT * FROM pages;
SELECT * FROM page_data;
SELECT * FROM content_items;
SELECT * FROM game_cards;
