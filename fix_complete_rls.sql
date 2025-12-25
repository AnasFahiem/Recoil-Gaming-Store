-- FIX RLS FOR ORDERS AND ADMIN ACCESS

-- 1. Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- 3. Create Optimized Policies

-- READ: Users see own, Admins see all
CREATE POLICY "View Orders" ON orders
FOR SELECT
USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- INSERT: Authenticated users can create orders
CREATE POLICY "Create Orders" ON orders
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- UPDATE: Admins only (for status)
CREATE POLICY "Update Orders" ON orders
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- 4. Order Items Policies (Similar logic)
DROP POLICY IF EXISTS "View Order Items" ON order_items;
DROP POLICY IF EXISTS "Create Order Items" ON order_items;

CREATE POLICY "View Order Items" ON order_items
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

CREATE POLICY "Create Order Items" ON order_items
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- 5. Fix Profiles RLS (Crucial for Admin Dashboard)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles" ON profiles;
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;

-- Allow users to view own profile, Admins to view all
CREATE POLICY "Profiles Access" ON profiles
FOR SELECT
USING (
  auth.uid() = id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Allow users to update own profile
CREATE POLICY "Update Own Profile" ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- 6. Add Indexes for Performance (Fixes "hanging" queries)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
