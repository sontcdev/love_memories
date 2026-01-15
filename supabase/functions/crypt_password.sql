-- Function to hash passwords/PINs for admin actions
CREATE OR REPLACE FUNCTION public.crypt_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.crypt_password TO authenticated, anon;
