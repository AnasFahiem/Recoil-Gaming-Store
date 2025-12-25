-- Fix RLS for Orders and Order Items to allow Guest Checkout and User Checkout

-- 1. Orders Insert Policy
DROP POLICY IF EXISTS "Orders_Insert" ON orders;

CREATE POLICY "Orders_Insert" ON orders FOR INSERT 
WITH CHECK (
    (auth.uid() = user_id)       -- Authenticated User creating their own order
    OR 
    (user_id IS NULL)            -- Guest User (or User choosing to be anonymous)
);

-- 2. Order Items Insert Policy
DROP POLICY IF EXISTS "OrderItems_Insert" ON order_items;

CREATE POLICY "OrderItems_Insert" ON order_items FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND (
            (orders.user_id = auth.uid())  -- Order belongs to user
            OR 
            (orders.user_id IS NULL)       -- Order is anonymous
        )
    )
);

-- 3. Ensure Read Policies also support Guest (if they have the ID?)
-- Actually, typically Guests can't "list" orders. They only see success page via ID if public?
-- Or maybe standard Select polices are fine as is (Users see theirs, Admins see all).
-- Guests don't need to SELECT orders via API usually, the API returns the inserted row.
-- The INSERT ... SELECT mechanism uses the INSERT policy's RETURNING permissions?
-- Postgres RLS applies SELECT policy for RETURNING clause.

-- We need to make sure Guests can read the order they JUST created to get the ID.
-- Existing "Orders_Read": (auth.uid() = user_id) OR is_admin_check(auth.uid())
-- This BLOCKS Guests from seeing the returned row! 
-- This might cause "Error: new row violates... (Select)" or just empty return.

-- Fix Orders_Read to allow reading if user_id is NULL?
-- NO! That would allow ANYONE to dump all Guest orders!
-- Ideally, the API runs as Service Role so it can read it back.
-- But since we are relying on RLS and the API is running as "User/Anon":
-- If we want to return the row to the Anon user, we need a policy.
-- But we can't restrict it to "Just the one I created" easily without session/logic.

-- ALTERNATIVE:
-- The API uses `insert(...).select().single()`.
-- If RLS blocks Select, this fails.

-- FIX:
-- Since we know `src/app/api/checkout/route.ts` is running on the Server,
-- AND we really should have used Service Role there.
-- BUT changing code requires redeploy.
-- Can we allow "Select by ID" for anyone?
-- `auth.role() = 'anon'` AND `id` = ... ? No, that's broad.

-- Maybe we rely on the fact that if they can Insert, they know the ID?
-- No.

-- Let's checking if the previous error was INSERT or SELECT.
-- "new row violates row-level security policy for table 'orders'"
-- This is usually the INSERT check.

-- Let's apply the INSERT fixes first. 
-- If they get a Select error next, we know we progressed.
