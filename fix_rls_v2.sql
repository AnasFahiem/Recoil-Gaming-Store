-- FIX RLS V2: Complete Reset and Recursion Fix
-- This script drops ALL existing policies to remove conflicts and re-applies a clean set.

-- 1. Helper Function (Recursion Safe)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_role text;
BEGIN
  -- Direct query to avoid RLS recursion on profiles table if policies are messy
  SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();
  RETURN current_role = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RESET ALL POLICIES (Drop everything explicitly)

-- Profiles
DROP POLICY IF EXISTS "Users can see own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can see all profiles" ON profiles;
DROP POLICY IF EXISTS "View Profiles" ON profiles;
DROP POLICY IF EXISTS "Update Profiles" ON profiles;
DROP POLICY IF EXISTS "Insert Profiles" ON profiles;
DROP POLICY IF EXISTS "Delete Profiles" ON profiles;
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins Update Profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins Delete Profiles" ON profiles;
DROP POLICY IF EXISTS "Update Own Profile" ON profiles;
DROP POLICY IF EXISTS "Insert Own Profile" ON profiles;

-- Products
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Orders
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "View Orders" ON orders;
DROP POLICY IF EXISTS "Update Orders" ON orders;
DROP POLICY IF EXISTS "Create Orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Admins Update Orders" ON orders;

-- Order Items
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "View Order Items" ON order_items;
DROP POLICY IF EXISTS "Create Order Items" ON order_items;

-- Bundles
DROP POLICY IF EXISTS "Public can view bundles" ON bundles;
DROP POLICY IF EXISTS "Admins can manage bundles" ON bundles;

-- Bundle Items
DROP POLICY IF EXISTS "Public can view bundle items" ON bundle_items;
DROP POLICY IF EXISTS "Admins can manage bundle items" ON bundle_items;

-- Analytics
DROP POLICY IF EXISTS "Public can record visit" ON analytics_visits;
DROP POLICY IF EXISTS "Admins can view visits" ON analytics_visits;

-- Subscribers
DROP POLICY IF EXISTS "Admins View Subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Public Subscribe" ON newsletter_subscribers;

-- Carts
DROP POLICY IF EXISTS "Users can view their own cart" ON carts;
DROP POLICY IF EXISTS "Users can insert their own cart" ON carts;
DROP POLICY IF EXISTS "Users can update their own cart" ON carts;
DROP POLICY IF EXISTS "Users can delete their own cart" ON carts;

-- 3. APPLY CLEAN POLICIES

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles_Read" ON profiles FOR SELECT
USING ( auth.uid() = id OR is_admin() );

CREATE POLICY "Profiles_Update" ON profiles FOR UPDATE
USING ( auth.uid() = id OR is_admin() );

CREATE POLICY "Profiles_Insert" ON profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

CREATE POLICY "Profiles_Delete" ON profiles FOR DELETE
USING ( is_admin() );

-- PRODUCTS (Public Read, Admin Write)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products_Read" ON products FOR SELECT
USING ( true );

CREATE POLICY "Products_Write" ON products FOR ALL
USING ( is_admin() );

-- ORDERS (User Own, Admin All)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders_Read" ON orders FOR SELECT
USING ( auth.uid() = user_id OR is_admin() );

CREATE POLICY "Orders_Write" ON orders FOR UPDATE
USING ( is_admin() );

CREATE POLICY "Orders_Insert" ON orders FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- ORDER ITEMS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "OrderItems_Read" ON order_items FOR SELECT
USING ( 
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()) 
    OR is_admin() 
);

CREATE POLICY "OrderItems_Insert" ON order_items FOR INSERT
WITH CHECK ( 
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- BUNDLES (Public Read, Admin Write)
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bundles_Read" ON bundles FOR SELECT
USING ( true );

CREATE POLICY "Bundles_Write" ON bundles FOR ALL
USING ( is_admin() );

-- BUNDLE ITEMS
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "BundleItems_Read" ON bundle_items FOR SELECT
USING ( true );

CREATE POLICY "BundleItems_Write" ON bundle_items FOR ALL
USING ( is_admin() );

-- ANALYTICS (Public Insert, Admin View)
ALTER TABLE analytics_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Analytics_Insert" ON analytics_visits FOR INSERT
WITH CHECK ( true );

CREATE POLICY "Analytics_Read" ON analytics_visits FOR SELECT
USING ( is_admin() );

-- SUBSCRIBERS (Public Insert, Admin View)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscribers_Insert" ON newsletter_subscribers FOR INSERT
WITH CHECK ( true );

CREATE POLICY "Subscribers_Read" ON newsletter_subscribers FOR SELECT
USING ( is_admin() );

-- CARTS (User Own Only)
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Carts_All" ON carts FOR ALL
USING ( auth.uid() = user_id );

-- 4. Reload Schema
NOTIFY pgrst, 'reload schema';
