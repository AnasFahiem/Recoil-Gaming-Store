
-- Update storage.objects policies to use the robust is_admin_check function
-- This aligns storage permissions with the products table permissions

-- Drop likely existing policies to ensure clean slate for these specific ones
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- Recreate them using public.is_admin_check(auth.uid())
-- We specify schema 'public' explicitly for the function to be safe.

CREATE POLICY "Admin Upload" ON storage.objects
FOR INSERT TO public
WITH CHECK (
  bucket_id = 'products' 
  AND public.is_admin_check(auth.uid())
);

CREATE POLICY "Admin Update" ON storage.objects
FOR UPDATE TO public
USING (
  bucket_id = 'products' 
  AND public.is_admin_check(auth.uid())
);

CREATE POLICY "Admin Delete" ON storage.objects
FOR DELETE TO public
USING (
  bucket_id = 'products' 
  AND public.is_admin_check(auth.uid())
);
