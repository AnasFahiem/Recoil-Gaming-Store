
DO $$
DECLARE
    user_id uuid := '14472592-b7a4-4f7a-aab8-d78c18926f50';
    is_admin_result boolean;
BEGIN
    -- Only check the function logic logic directly
    -- We assume auth.uid() is correctly populated by Supabase
    
    SELECT public.is_admin_check(user_id) INTO is_admin_result;
    
    IF is_admin_result THEN
        RAISE EXCEPTION 'SUCCESS: User is ADMIN';
    ELSE
        RAISE EXCEPTION 'FAILURE: User is NOT ADMIN';
    END IF;
END $$;
