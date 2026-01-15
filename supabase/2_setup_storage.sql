-- =====================================================
-- STORAGE SETUP - RUN THIS SECOND  
-- =====================================================
-- Run after creating the "gallery" bucket in Supabase Dashboard
-- =====================================================

-- Drop old storage policies
DROP POLICY IF EXISTS "Public can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to gallery" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to gallery" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete gallery images" ON storage.objects;

-- Create new permissive storage policies
CREATE POLICY "Public can view gallery images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery');

CREATE POLICY "Anyone can upload to gallery"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Anyone can update gallery images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'gallery')
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Anyone can delete gallery images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'gallery');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Storage policies configured!';
  RAISE NOTICE 'Users can now upload images to the gallery bucket.';
END $$;
