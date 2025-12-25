
DO $$
DECLARE
    user_id uuid := '14472592-b7a4-4f7a-aab8-d78c18926f50';
    is_admin_result boolean;
BEGIN
    -- Simulate authenticated user
    EXECUTE 'SET LOCAL role TO authenticated';
    EXECUTE 'SET LOCAL "request.jwt.claim.sub" TO ''' || user_id || '''';
    
    -- Check is_admin
    SELECT public.is_admin() INTO is_admin_result;
    
    RAISE NOTICE 'User ID: %, is_admin: %', user_id, is_admin_result;
END $$;
