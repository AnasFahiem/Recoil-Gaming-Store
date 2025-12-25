-- FIX ADMIN UPDATE PERMISSIONS

-- The previous script fixed "Viewing" data (Select). 
-- This script fixes "Changing" data (Update) for Admins.

-- 1. Get the Helper Function (Ensure it exists)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_role text;
BEGIN
  SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();
  RETURN current_role = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Allow Admins to PROMOTE/DEMOTE (Update Profiles)
-- This was missing, causing promotions to fail.
CREATE POLICY "Admins Update Profiles" ON profiles
FOR UPDATE
USING (is_admin());

-- 3. Allow Admins to UPDATE ORDER STATUS
-- This was missing, causing "Status" changes to fail or not save.
CREATE POLICY "Admins Update Orders" ON orders
FOR UPDATE
USING (is_admin());

-- 4. Allow Admins to DELETE Users (if using RLS on profiles)
CREATE POLICY "Admins Delete Profiles" ON profiles
FOR DELETE
USING (is_admin());

-- 5. Helper to Restore Your Admin Status (Just in case you got locked out)
-- Replace 'YOUR_EMAIL' with your actual email if you are currently stuck as "USER"
-- UPDATE profiles SET role = 'ADMIN' WHERE id IN (SELECT id FROM auth.users WHERE email = 'anasf.wb@gmail.com');
-- (Uncomment and run the above line if you need to force-restore yourself)

NOTIFY pgrst, 'reload schema';
