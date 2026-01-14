-- Supabase Edge Function (SQL)
-- Create this function in Supabase Dashboard > Database > Functions

-- Function to get current server time
CREATE OR REPLACE FUNCTION get_server_time()
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_server_time() TO anon, authenticated;
