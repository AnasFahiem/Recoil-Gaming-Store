-- FIX INFINITE RECURSION & ADD PERFORMANCE INDEXES

-- 1. Create a secure function to check user role (Security Definer breaks recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_role text;
BEGIN
  SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();
  RETURN current_role = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Performance Indexes (CRITICAL FOR SPEED)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 3. Fix PROFILES Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing generic policies to avoid conflicts
DROP POLICY IF EXISTS "Profiles Access" ON profiles;
DROP POLICY IF EXISTS "Public profiles" ON profiles;
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
DROP POLICY IF EXISTS "Update Own Profile" ON profiles;

-- New Optimized Policies
CREATE POLICY "Profiles Access" ON profiles
FOR SELECT
USING (
    auth.uid() = id
    OR
    is_admin()
);

CREATE POLICY "Update Own Profile" ON profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Insert Own Profile" ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. Fix ORDERS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View Orders" ON orders;
DROP POLICY IF EXISTS "Create Orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

CREATE POLICY "View Orders" ON orders
FOR SELECT
USING (
    auth.uid() = user_id
    OR
    is_admin()
);

-- Users can create orders (needed for some flows, though API handles it mostly)
CREATE POLICY "Create Orders" ON orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Fix ORDER ITEMS Policies
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View Order Items" ON order_items;
DROP POLICY IF EXISTS "Create Order Items" ON order_items;

CREATE POLICY "View Order Items" ON order_items
FOR SELECT
USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    OR
    is_admin()
);

CREATE POLICY "Create Order Items" ON order_items
FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Confirm fix
NOTIFY pgrst, 'reload schema';
