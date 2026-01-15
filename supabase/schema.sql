-- =====================================================
-- Digital Memories (Kỷ Niệm Số) - Database Schema
-- =====================================================
-- This schema supports a unique access model:
-- 1. Admin: Full access via Supabase Auth
-- 2. Owner: Update access via 6-digit PIN
-- 3. Guest: Read access via shared password
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLES
-- =====================================================

-- Links table: Core table storing each unique link/couple profile
CREATE TABLE public.links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL, -- URL-friendly username
    template_type VARCHAR(50) DEFAULT 'love' NOT NULL, -- 'love', 'friendship', etc.
    
    -- Security
    guest_password_hash TEXT, -- bcrypt hash for guest access (nullable for public links)
    owner_pin_hash TEXT NOT NULL, -- bcrypt hash for owner's 6-digit PIN
    
    -- Profile data (stored as JSON for flexibility)
    settings JSONB DEFAULT '{}'::jsonb, -- Contains: names, anniversary_date, theme, colors, fonts, etc.
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Admin reference (optional - links to Supabase Auth user who created this)
    created_by_admin UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_-]+$')
);

-- Timeline/Memories table: Stores timeline events
CREATE TABLE public.memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
    
    title VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL, -- The actual date of the memory
    description TEXT,
    
    -- Media
    image_url TEXT,
    video_url TEXT,
    audio_url TEXT,
    
    -- Ordering
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index for efficient querying
    CONSTRAINT unique_memory_order UNIQUE (link_id, sort_order)
);

-- Gallery table: Stores images for masonry grid
CREATE TABLE public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
    
    image_url TEXT NOT NULL,
    
    -- Image dimensions for masonry layout
    width INTEGER,
    height INTEGER,
    
    -- Optional metadata
    caption TEXT,
    taken_at DATE,
    
    -- Ordering
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_gallery_order UNIQUE (link_id, sort_order)
);

-- Games table: Stores flashcard Q&A pairs
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
    
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    
    -- Optional category for filtering
    category VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages/Letters table: Stores time capsule letters
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
    
    title VARCHAR(200),
    content TEXT NOT NULL,
    
    -- Time capsule functionality
    open_at TIMESTAMPTZ NOT NULL, -- When the letter can be opened
    is_opened BOOLEAN DEFAULT false,
    opened_at TIMESTAMPTZ, -- When it was actually opened
    
    -- Optional: specify who can open (owner/guest/both)
    visible_to VARCHAR(20) DEFAULT 'both', -- 'owner', 'guest', 'both'
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_memories_link_id ON public.memories(link_id);
CREATE INDEX idx_memories_date ON public.memories(event_date DESC);
CREATE INDEX idx_memories_order ON public.memories(link_id, sort_order);

CREATE INDEX idx_gallery_link_id ON public.gallery(link_id);
CREATE INDEX idx_gallery_order ON public.gallery(link_id, sort_order);

CREATE INDEX idx_games_link_id ON public.games(link_id);

CREATE INDEX idx_messages_link_id ON public.messages(link_id);
CREATE INDEX idx_messages_open_at ON public.messages(open_at);
CREATE INDEX idx_messages_unopened ON public.messages(link_id, is_opened) WHERE is_opened = false;

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON public.links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON public.memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AUTHENTICATION HELPER FUNCTIONS
-- =====================================================

-- Function to validate guest password (to be called from application)
CREATE OR REPLACE FUNCTION public.verify_guest_password(
    p_link_id UUID,
    p_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_password_hash TEXT;
BEGIN
    SELECT guest_password_hash INTO v_password_hash
    FROM public.links
    WHERE id = p_link_id AND is_active = true;
    
    -- If no password hash exists, link is public
    IF v_password_hash IS NULL THEN
        RETURN true;
    END IF;
    
    -- Verify password using bcrypt
    RETURN crypt(p_password, v_password_hash) = v_password_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate owner PIN (to be called from application)
CREATE OR REPLACE FUNCTION public.verify_owner_pin(
    p_link_id UUID,
    p_pin TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_pin_hash TEXT;
BEGIN
    SELECT owner_pin_hash INTO v_pin_hash
    FROM public.links
    WHERE id = p_link_id AND is_active = true;
    
    IF v_pin_hash IS NULL THEN
        RETURN false;
    END IF;
    
    -- Verify PIN using bcrypt
    RETURN crypt(p_pin, v_pin_hash) = v_pin_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create JWT claims for custom auth
-- After PIN/Password validation, call this to get a session token
CREATE OR REPLACE FUNCTION public.create_access_token(
    p_link_id UUID,
    p_role TEXT -- 'owner' or 'guest'
)
RETURNS TABLE(token TEXT, expires_at TIMESTAMPTZ) AS $$
DECLARE
    v_token TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Set expiration (e.g., 24 hours for guest, 7 days for owner)
    v_expires_at := NOW() + CASE 
        WHEN p_role = 'owner' THEN INTERVAL '7 days'
        ELSE INTERVAL '24 hours'
    END;
    
    -- Generate a secure random token
    v_token := encode(gen_random_bytes(32), 'base64');
    
    -- Store in session table (you'll need to create this)
    -- Or return the token to be stored in JWT on client side
    
    RETURN QUERY SELECT v_token, v_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION FOR RLS: Check if user is admin
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if current user has admin role in Supabase Auth
    RETURN (
        SELECT COALESCE(
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
            false
        )
        OR
        -- Alternative: check if user is in a specific admin table
        EXISTS (
            SELECT 1 FROM public.links 
            WHERE created_by_admin = auth.uid()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES FOR LINKS TABLE
-- =====================================================

-- Admin: Full access
CREATE POLICY "Admin full access to links"
    ON public.links
    FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Guest: READ access to active links only
-- Note: Guest access validation happens at application level
-- They can read if link is active (password check done before granting session)
CREATE POLICY "Guest read access to active links"
    ON public.links
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Owner: UPDATE access to their own link
-- Note: Owner validation happens at application level (PIN check)
-- This policy allows update if they have a valid session with link_id claim
CREATE POLICY "Owner update own link"
    ON public.links
    FOR UPDATE
    TO authenticated
    USING (
        is_active = true
        -- Check if JWT contains claim for this specific link_id
        -- You'll set this claim after PIN validation
        AND id::text = COALESCE(
            current_setting('request.jwt.claims', true)::json->>'link_id',
            ''
        )
    )
    WITH CHECK (
        is_active = true
        AND id::text = COALESCE(
            current_setting('request.jwt.claims', true)::json->>'link_id',
            ''
        )
    );

-- =====================================================
-- RLS POLICIES FOR MEMORIES TABLE
-- =====================================================

-- Admin: Full access
CREATE POLICY "Admin full access to memories"
    ON public.memories
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.links 
            WHERE id = memories.link_id 
            AND is_admin()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.links 
            WHERE id = memories.link_id 
            AND is_admin()
        )
    );

-- Guest: READ access (if they have access to the link)
CREATE POLICY "Guest read memories"
    ON public.memories
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.links
            WHERE id = memories.link_id
            AND is_active = true
        )
    );

-- Owner: Full access to their own link's memories
CREATE POLICY "Owner manage own memories"
    ON public.memories
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.links
            WHERE id = memories.link_id
            AND is_active = true
            AND id::text = COALESCE(
                current_setting('request.jwt.claims', true)::json->>'link_id',
                ''
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.links
            WHERE id = memories.link_id
            AND is_active = true
            AND id::text = COALESCE(
                current_setting('request.jwt.claims', true)::json->>'link_id',
                ''
            )
        )
    );

-- =====================================================
-- RLS POLICIES FOR GALLERY TABLE
-- =====================================================

-- Admin: Full access
CREATE POLICY "Admin full access to gallery"
    ON public.gallery
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.links 
            WHERE id = gallery.link_id 
            AND is_admin()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.links 
            WHERE id = gallery.link_id 
            AND is_admin()
        )
    );

-- Guest: READ access
CREATE POLICY "Guest read gallery"
    ON public.gallery
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.links
            WHERE id = gallery.link_id
            AND is_active = true
        )
    );

-- Owner: Full access
CREATE POLICY "Owner manage own gallery"
    ON public.gallery
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.links
            WHERE id = gallery.link_id
            AND is_active = true
            AND id::text = COALESCE(
                current_setting('request.jwt.claims', true)::json->>'link_id',
                ''
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.links
            WHERE id = gallery.link_id
            AND is_active = true
            AND id::text = COALESCE(
                current_setting('request.jwt.claims', true)::json->>'link_id',
                ''
            )
        )
    );

-- =====================================================
-- RLS POLICIES FOR GAMES TABLE
-- =====================================================

-- Admin: Full access
CREATE POLICY "Admin full access to games"
    ON public.games
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.links 
            WHERE id = games.link_id 
            AND is_admin()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.links 
            WHERE id = games.link_id 
            AND is_admin()
        )
    );

-- Guest: READ access
CREATE POLICY "Guest read games"
    ON public.games
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.links
            WHERE id = games.link_id
            AND is_active = true
        )
    );

-- Owner: Full access
CREATE POLICY "Owner manage own games"
    ON public.games
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.links
            WHERE id = games.link_id
            AND is_active = true
            AND id::text = COALESCE(
                current_setting('request.jwt.claims', true)::json->>'link_id',
                ''
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.links
            WHERE id = games.link_id
            AND is_active = true
            AND id::text = COALESCE(
                current_setting('request.jwt.claims', true)::json->>'link_id',
                ''
            )
        )
    );

-- =====================================================
-- RLS POLICIES FOR MESSAGES TABLE
-- =====================================================

-- Admin: Full access
CREATE POLICY "Admin full access to messages"
    ON public.messages
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.links 
            WHERE id = messages.link_id 
            AND is_admin()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.links 
            WHERE id = messages.link_id 
            AND is_admin()
        )
    );

-- Guest: READ access to opened messages or messages past open_at time
CREATE POLICY "Guest read available messages"
    ON public.messages
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.links
            WHERE id = messages.link_id
            AND is_active = true
        )
        AND (
            messages.open_at <= NOW()
            OR messages.is_opened = true
        )
        AND messages.visible_to IN ('guest', 'both')
    );

-- Owner: Full access to their own messages
CREATE POLICY "Owner manage own messages"
    ON public.messages
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.links
            WHERE id = messages.link_id
            AND is_active = true
            AND id::text = COALESCE(
                current_setting('request.jwt.claims', true)::json->>'link_id',
                ''
            )
        )
        AND messages.visible_to IN ('owner', 'both')
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.links
            WHERE id = messages.link_id
            AND is_active = true
            AND id::text = COALESCE(
                current_setting('request.jwt.claims', true)::json->>'link_id',
                ''
            )
        )
    );

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT SELECT ON public.links TO anon, authenticated;
GRANT ALL ON public.links TO authenticated;

GRANT SELECT ON public.memories TO anon, authenticated;
GRANT ALL ON public.memories TO authenticated;

GRANT SELECT ON public.gallery TO anon, authenticated;
GRANT ALL ON public.gallery TO authenticated;

GRANT SELECT ON public.games TO anon, authenticated;
GRANT ALL ON public.games TO authenticated;

GRANT SELECT ON public.messages TO anon, authenticated;
GRANT ALL ON public.messages TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.verify_guest_password TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_owner_pin TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_access_token TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
