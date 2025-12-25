-- CLEAN SLATE RLS FIX
-- Removes ALL existing policies and applies a single, clean set of rules.

-- 1. Helper Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_role text;
BEGIN
  SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();
  RETURN current_role = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles Access" ON profiles;
DROP POLICY IF EXISTS "Public profiles" ON profiles;
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins Update Profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles; -- Old one
DROP POLICY IF EXISTS "Admins Delete Profiles" ON profiles;
DROP POLICY IF EXISTS "Update Own Profile" ON profiles;
DROP POLICY IF EXISTS "Insert Own Profile" ON profiles;

-- View: User sees own, Admin sees all
CREATE POLICY "View Profiles" ON profiles
FOR SELECT
USING (auth.uid() = id OR is_admin());

-- Update: User updates own, Admin updates all
CREATE POLICY "Update Profiles" ON profiles
FOR UPDATE
USING (auth.uid() = id OR is_admin());

-- Insert: User creates own
CREATE POLICY "Insert Profiles" ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Delete: Admin only
CREATE POLICY "Delete Profiles" ON profiles
FOR DELETE
USING (is_admin());

-- 3. ORDERS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View Orders" ON orders;
DROP POLICY IF EXISTS "Create Orders" ON orders;
DROP POLICY IF EXISTS "Update Orders" ON orders;
DROP POLICY IF EXISTS "Admins Update Orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- View: User sees own, Admin sees all
CREATE POLICY "View Orders" ON orders
FOR SELECT
USING (auth.uid() = user_id OR is_admin());

-- Update: Admin only (for status)
CREATE POLICY "Update Orders" ON orders
FOR UPDATE
USING (is_admin());

-- Create: Authenticated users
CREATE POLICY "Create Orders" ON orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. ORDER ITEMS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View Order Items" ON order_items;
DROP POLICY IF EXISTS "Create Order Items" ON order_items;

CREATE POLICY "View Order Items" ON order_items
FOR SELECT
USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()) OR is_admin()
);

CREATE POLICY "Create Order Items" ON order_items
FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- 5. Force Refresh
NOTIFY pgrst, 'reload schema';
