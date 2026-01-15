-- =====================================================
-- Rate Limiting Table for Guest Authentication
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create login_attempts table
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address VARCHAR(45) NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_ip UNIQUE (ip_address)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip 
ON public.login_attempts(ip_address);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage (API routes use service role)
CREATE POLICY "Service role can manage login attempts"
ON public.login_attempts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create function to clean up old attempts (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM public.login_attempts
    WHERE last_attempt_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Rate limiting table created successfully!';
END $$;
