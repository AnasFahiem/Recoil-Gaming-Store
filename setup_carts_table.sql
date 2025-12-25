-- 1. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.carts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- 3. Cleanup old policies to prevent duplicates
DROP POLICY IF EXISTS "Users can view their own cart" ON public.carts;
DROP POLICY IF EXISTS "Users can insert their own cart" ON public.carts;
DROP POLICY IF EXISTS "Users can update their own cart" ON public.carts;
DROP POLICY IF EXISTS "Users can upsert their own cart" ON public.carts;
DROP POLICY IF EXISTS "Users can delete their own cart" ON public.carts;

-- 4. Create Policies (CRUD)

-- Select
CREATE POLICY "Users can view their own cart"
ON public.carts FOR SELECT
USING (auth.uid() = user_id);

-- Insert
CREATE POLICY "Users can insert their own cart"
ON public.carts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update
CREATE POLICY "Users can update their own cart"
ON public.carts FOR UPDATE
USING (auth.uid() = user_id);

-- Delete
CREATE POLICY "Users can delete their own cart"
ON public.carts FOR DELETE
USING (auth.uid() = user_id);

-- 5. Grant permissions to authenticated users
GRANT ALL ON public.carts TO postgres;
GRANT ALL ON public.carts TO anon;
GRANT ALL ON public.carts TO authenticated;
GRANT ALL ON public.carts TO service_role;
