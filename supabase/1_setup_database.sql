-- =====================================================
-- SUPABASE SETUP - RUN THIS ONCE
-- =====================================================
-- Chạy file này một lần duy nhất trong Supabase SQL Editor
-- =====================================================

-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create crypt_password function (for admin operations)
CREATE OR REPLACE FUNCTION public.crypt_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.crypt_password(TEXT) TO anon, authenticated, service_role;

-- 3. Create verification functions
CREATE OR REPLACE FUNCTION public.verify_guest_password(p_link_id UUID, p_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_password_hash TEXT;
BEGIN
    SELECT guest_password_hash INTO v_password_hash
    FROM public.links
    WHERE id = p_link_id AND is_active = true;
    
    IF v_password_hash IS NULL THEN RETURN true; END IF;
    RETURN crypt(p_password, v_password_hash) = v_password_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.verify_owner_pin(p_link_id UUID, p_pin TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_pin_hash TEXT;
BEGIN
    SELECT owner_pin_hash INTO v_pin_hash
    FROM public.links
    WHERE id = p_link_id AND is_active = true;
    
    IF v_pin_hash IS NULL THEN RETURN false; END IF;
    RETURN crypt(p_pin, v_pin_hash) = v_pin_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_server_time()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  RETURN NOW();
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.verify_guest_password TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_owner_pin TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_server_time TO anon, authenticated;

-- 4. Create tables (if not exist)
CREATE TABLE IF NOT EXISTS public.links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    template_type VARCHAR(50) DEFAULT 'love' NOT NULL,
    guest_password_hash TEXT,
    owner_pin_hash TEXT NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_admin UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_-]+$')
);

CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    caption TEXT,
    taken_at DATE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_gallery_order UNIQUE (link_id, sort_order)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
    title VARCHAR(200),
    content TEXT NOT NULL,
    open_at TIMESTAMPTZ NOT NULL,
    is_opened BOOLEAN DEFAULT false,
    opened_at TIMESTAMPTZ,
    visible_to VARCHAR(20) DEFAULT 'both',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    audio_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_memory_order UNIQUE (link_id, sort_order)
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_gallery_link_id ON public.gallery(link_id);
CREATE INDEX IF NOT EXISTS idx_messages_link_id ON public.messages(link_id);
CREATE INDEX IF NOT EXISTS idx_games_link_id ON public.games(link_id);
CREATE INDEX IF NOT EXISTS idx_memories_link_id ON public.memories(link_id);

-- 6. Enable RLS
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- 7. Drop old policies (if exist)
DROP POLICY IF EXISTS "Admin full access to links" ON public.links;
DROP POLICY IF EXISTS "Guest read access to active links" ON public.links;
DROP POLICY IF EXISTS "Owner update own link" ON public.links;
DROP POLICY IF EXISTS "Admin full access to gallery" ON public.gallery;
DROP POLICY IF EXISTS "Guest read gallery" ON public.gallery;
DROP POLICY IF EXISTS "Owner manage own gallery" ON public.gallery;
DROP POLICY IF EXISTS "Anyone can manage gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admin full access to messages" ON public.messages;
DROP POLICY IF EXISTS "Guest read available messages" ON public.messages;
DROP POLICY IF EXISTS "Owner manage own messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can manage messages" ON public.messages;
DROP POLICY IF EXISTS "Admin full access to games" ON public.games;
DROP POLICY IF EXISTS "Guest read games" ON public.games;
DROP POLICY IF EXISTS "Owner manage own games" ON public.games;
DROP POLICY IF EXISTS "Anyone can manage games" ON public.games;
DROP POLICY IF EXISTS "Admin full access to memories" ON public.memories;
DROP POLICY IF EXISTS "Guest read memories" ON public.memories;
DROP POLICY IF EXISTS "Owner manage own memories" ON public.memories;
DROP POLICY IF EXISTS "Anyone can manage memories" ON public.memories;

-- 8. Create new RLS policies (permissive for client-side operations)
-- Links: Anyone can read active links, service role can manage
CREATE POLICY "Anyone can read active links" ON public.links FOR SELECT TO public
USING (is_active = true);

CREATE POLICY "Service role can manage links" ON public.links FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Gallery: Anyone can manage if link is active
CREATE POLICY "Anyone can manage gallery" ON public.gallery FOR ALL TO public
USING (EXISTS (SELECT 1 FROM public.links WHERE id = gallery.link_id AND is_active = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.links WHERE id = gallery.link_id AND is_active = true));

-- Messages: Anyone can manage if link is active
CREATE POLICY "Anyone can manage messages" ON public.messages FOR ALL TO public
USING (EXISTS (SELECT 1 FROM public.links WHERE id = messages.link_id AND is_active = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.links WHERE id = messages.link_id AND is_active = true));

-- Games: Anyone can manage if link is active
CREATE POLICY "Anyone can manage games" ON public.games FOR ALL TO public
USING (EXISTS (SELECT 1 FROM public.links WHERE id = games.link_id AND is_active = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.links WHERE id = games.link_id AND is_active = true));

-- Memories: Anyone can manage if link is active
CREATE POLICY "Anyone can manage memories" ON public.memories FOR ALL TO public
USING (EXISTS (SELECT 1 FROM public.links WHERE id = memories.link_id AND is_active = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.links WHERE id = memories.link_id AND is_active = true));

-- 9. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.links TO anon, authenticated;
GRANT ALL ON public.links TO service_role;
GRANT ALL ON public.gallery TO anon, authenticated;
GRANT ALL ON public.messages TO anon, authenticated;
GRANT ALL ON public.games TO anon, authenticated;
GRANT ALL ON public.memories TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE 'Next step: Create storage bucket "gallery" in Supabase Dashboard';
END $$;
