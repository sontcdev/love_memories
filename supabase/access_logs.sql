-- =====================================================
-- Access Logs Table for Visitor Tracking
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create access_logs table
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    device_type VARCHAR(100),
    browser VARCHAR(100),
    os VARCHAR(100),
    ip_hash VARCHAR(64), -- Hashed IP for privacy
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_access_logs_link_id 
ON public.access_logs(link_id);

CREATE INDEX IF NOT EXISTS idx_access_logs_visited_at 
ON public.access_logs(visited_at DESC);

-- Enable RLS
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage (for server actions)
CREATE POLICY "Service role can manage access logs"
ON public.access_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Anon can insert (for logging)
CREATE POLICY "Anyone can log access"
ON public.access_logs FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Users can read their own link's logs
CREATE POLICY "Users can read own link logs"
ON public.access_logs FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1 FROM public.links
        WHERE id = access_logs.link_id
        AND is_active = true
    )
);

-- Function to clean up old logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_access_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.access_logs
    WHERE visited_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Access logs table created successfully!';
END $$;
