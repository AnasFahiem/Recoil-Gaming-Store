-- 1. Enable RLS on the table (idempotent)
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own cart" ON public.carts;
DROP POLICY IF EXISTS "Users can insert their own cart" ON public.carts;
DROP POLICY IF EXISTS "Users can update their own cart" ON public.carts;
DROP POLICY IF EXISTS "Users can upsert their own cart" ON public.carts;
DROP POLICY IF EXISTS "Users can delete their own cart" ON public.carts;

-- 3. Create comprehensive policies

-- allow SELECT
CREATE POLICY "Users can view their own cart"
ON public.carts FOR SELECT
USING (auth.uid() = user_id);

-- allow INSERT
CREATE POLICY "Users can insert their own cart"
ON public.carts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- allow UPDATE
CREATE POLICY "Users can update their own cart"
ON public.carts FOR UPDATE
USING (auth.uid() = user_id);

-- allow DELETE
CREATE POLICY "Users can delete their own cart"
ON public.carts FOR DELETE
USING (auth.uid() = user_id);

-- 4. Verify table definition (Unique constraint is required for UPSERT)
-- Ensure 'user_id' is unique. If not, add constraint.
-- ALTER TABLE public.carts ADD CONSTRAINT carts_user_id_key UNIQUE (user_id);
