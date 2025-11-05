-- ✅ COMPLETE FIX FOR VERIFICATION FUNCTIONS
-- Run this in: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql/new

-- Step 1: DROP existing functions (if any)
DROP FUNCTION IF EXISTS public.create_verification_code(TEXT, UUID);
DROP FUNCTION IF EXISTS public.create_verification_code(TEXT);
DROP FUNCTION IF EXISTS public.verify_email_code(UUID, TEXT);
DROP FUNCTION IF EXISTS public.generate_verification_code();

-- Step 2: Create table if not exists
CREATE TABLE IF NOT EXISTS public.email_verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes'),
    verified BOOLEAN DEFAULT false,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMPTZ
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_user_id 
ON public.email_verification_codes(user_id);

CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email 
ON public.email_verification_codes(email);

-- Step 4: Create generate_verification_code function
CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
END;
$$;

-- Step 5: Create create_verification_code function (WITH 2 PARAMETERS!)
CREATE OR REPLACE FUNCTION public.create_verification_code(
    user_email TEXT, 
    user_uuid UUID
)
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
DECLARE 
    verification_code TEXT;
BEGIN
    -- Generate new code
    verification_code := public.generate_verification_code();
    
    -- Mark old codes as verified (invalidate them)
    UPDATE public.email_verification_codes 
    SET verified = true 
    WHERE user_id = user_uuid 
    AND verified = false;
    
    -- Insert new code
    INSERT INTO public.email_verification_codes (
        user_id, 
        email, 
        code, 
        expires_at
    )
    VALUES (
        user_uuid, 
        user_email, 
        verification_code, 
        CURRENT_TIMESTAMP + INTERVAL '10 minutes'
    );
    
    RETURN verification_code;
END;
$$;

-- Step 6: Create verify_email_code function
CREATE OR REPLACE FUNCTION public.verify_email_code(
    user_uuid UUID, 
    input_code TEXT
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
DECLARE 
    code_record RECORD;
    is_valid BOOLEAN := false;
BEGIN
    -- Get most recent unverified code
    SELECT * INTO code_record 
    FROM public.email_verification_codes
    WHERE user_id = user_uuid 
    AND verified = false 
    AND expires_at > CURRENT_TIMESTAMP
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- If code exists
    IF code_record.id IS NOT NULL THEN
        -- Increment attempts
        UPDATE public.email_verification_codes 
        SET attempts = attempts + 1 
        WHERE id = code_record.id;
        
        -- Check if code matches and not too many attempts
        IF code_record.code = input_code AND code_record.attempts < 5 THEN
            -- Mark code as verified
            UPDATE public.email_verification_codes 
            SET verified = true, 
                verified_at = CURRENT_TIMESTAMP 
            WHERE id = code_record.id;
            
            -- Update user profile
            UPDATE public.user_profiles 
            SET email_verified = true 
            WHERE id = user_uuid;
            
            is_valid := true;
        END IF;
    END IF;
    
    RETURN is_valid;
END;
$$;

-- Step 7: Grant ALL necessary permissions
GRANT EXECUTE ON FUNCTION public.generate_verification_code() 
TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.create_verification_code(TEXT, UUID) 
TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.verify_email_code(UUID, TEXT) 
TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE ON TABLE public.email_verification_codes 
TO anon, authenticated, service_role;

-- Step 8: Force schema cache refresh
NOTIFY pgrst, 'reload schema';

-- Step 9: Verify functions exist
SELECT 
    routine_name as function_name,
    routine_type,
    routines.data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'create_verification_code',
    'verify_email_code',
    'generate_verification_code'
)
ORDER BY routine_name;

-- Success message
SELECT '✅ ALL VERIFICATION FUNCTIONS CREATED SUCCESSFULLY!' as status;
SELECT '✅ Table created with indexes' as table_status;
SELECT '✅ Permissions granted to anon, authenticated, service_role' as permissions_status;
SELECT '✅ Schema cache refreshed' as cache_status;
SELECT '⏳ Wait 30 seconds, then clear browser cache and try again!' as next_step;
