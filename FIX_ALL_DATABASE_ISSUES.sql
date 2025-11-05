-- ============================================================
-- FIX ALL DATABASE ISSUES - PromoHive
-- ============================================================
-- Run this script in Supabase SQL Editor
-- Project: jtxmijnxrgcwjvtdlgxy
-- URL: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql/new
-- ============================================================

-- ==========================================
-- SECTION 1: ENSURE ALL TABLES EXIST
-- ==========================================

-- 1.1 Email verification codes table
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

-- 1.2 Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_user_id ON public.email_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email ON public.email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_code ON public.email_verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires_at ON public.email_verification_codes(expires_at);

-- 1.3 Ensure user_profiles has verification columns
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'approval_status'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'approved_by'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'approved_at'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN approved_at TIMESTAMPTZ;
    END IF;
END $$;

-- ==========================================
-- SECTION 2: CREATE/UPDATE ALL FUNCTIONS
-- ==========================================

-- 2.1 Function: Generate verification code
CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
END;
$$;

-- 2.2 Function: Create verification code
CREATE OR REPLACE FUNCTION public.create_verification_code(user_email TEXT, user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    verification_code TEXT;
BEGIN
    verification_code := public.generate_verification_code();
    
    UPDATE public.email_verification_codes 
    SET verified = true 
    WHERE user_id = user_uuid AND verified = false;
    
    INSERT INTO public.email_verification_codes (user_id, email, code, expires_at)
    VALUES (
        user_uuid, 
        user_email, 
        verification_code,
        CURRENT_TIMESTAMP + INTERVAL '10 minutes'
    );
    
    RETURN verification_code;
END;
$$;

-- 2.3 Function: Verify email code
CREATE OR REPLACE FUNCTION public.verify_email_code(user_uuid UUID, input_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    code_record RECORD;
    is_valid BOOLEAN := false;
BEGIN
    SELECT * INTO code_record
    FROM public.email_verification_codes
    WHERE user_id = user_uuid 
    AND verified = false
    AND expires_at > CURRENT_TIMESTAMP
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF code_record.id IS NOT NULL THEN
        UPDATE public.email_verification_codes 
        SET attempts = attempts + 1
        WHERE id = code_record.id;
        
        IF code_record.code = input_code AND code_record.attempts < 5 THEN
            UPDATE public.email_verification_codes 
            SET verified = true, verified_at = CURRENT_TIMESTAMP
            WHERE id = code_record.id;
            
            UPDATE public.user_profiles 
            SET email_verified = true
            WHERE id = user_uuid;
            
            is_valid := true;
        END IF;
    END IF;
    
    RETURN is_valid;
END;
$$;

-- 2.4 Function: Approve user (admin only)
CREATE OR REPLACE FUNCTION public.approve_user(target_user_id UUID, admin_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin BOOLEAN := false;
    welcome_bonus_amount NUMERIC := 5.00;
    user_email TEXT;
    user_name TEXT;
BEGIN
    -- Check if admin has permission
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = admin_id 
        AND (role = 'admin' OR role = 'super_admin')
    ) INTO is_admin;
    
    IF NOT is_admin THEN
        RAISE NOTICE 'User % is not an admin', admin_id;
        RETURN false;
    END IF;
    
    -- Get user details
    SELECT email, full_name INTO user_email, user_name
    FROM public.user_profiles
    WHERE id = target_user_id;
    
    -- Update user approval status
    UPDATE public.user_profiles 
    SET 
        approval_status = 'approved',
        approved_by = admin_id,
        approved_at = CURRENT_TIMESTAMP,
        status = 'active'::user_status
    WHERE id = target_user_id;
    
    -- Give welcome bonus if not already given
    UPDATE public.user_profiles 
    SET 
        balance = balance + welcome_bonus_amount,
        total_earnings = total_earnings + welcome_bonus_amount,
        welcome_bonus_used = true
    WHERE id = target_user_id AND welcome_bonus_used = false;
    
    -- Create transaction record for welcome bonus
    INSERT INTO public.transactions (
        user_id, 
        type, 
        amount, 
        description, 
        status,
        processed_by
    )
    VALUES (
        target_user_id,
        'welcome_bonus'::transaction_type,
        welcome_bonus_amount,
        'Welcome bonus after admin approval',
        'completed'::transaction_status,
        admin_id
    );
    
    -- Try to send welcome email via Edge Function
    -- Note: This will only work if RESEND_API_KEY is configured
    BEGIN
        PERFORM net.http_post(
            url := (SELECT current_setting('app.settings.supabase_url', true) || '/functions/v1/send-notification-email'),
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true)
            ),
            body := jsonb_build_object(
                'type', 'welcome',
                'to', user_email,
                'data', jsonb_build_object(
                    'fullName', user_name,
                    'loginUrl', 'https://promohive.com/login'
                )
            )
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to send welcome email: %', SQLERRM;
    END;
    
    RETURN true;
END;
$$;

-- 2.5 Function: Reject user (admin only)
CREATE OR REPLACE FUNCTION public.reject_user(target_user_id UUID, admin_id UUID, rejection_reason TEXT DEFAULT '')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin BOOLEAN := false;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = admin_id 
        AND (role = 'admin' OR role = 'super_admin')
    ) INTO is_admin;
    
    IF NOT is_admin THEN
        RETURN false;
    END IF;
    
    UPDATE public.user_profiles 
    SET 
        approval_status = 'rejected',
        approved_by = admin_id,
        approved_at = CURRENT_TIMESTAMP,
        status = 'suspended'::user_status
    WHERE id = target_user_id;
    
    RETURN true;
END;
$$;

-- 2.6 Function: Increment user balance
CREATE OR REPLACE FUNCTION public.increment_user_balance(user_uuid UUID, amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_profiles 
    SET balance = balance + amount
    WHERE id = user_uuid;
    
    RETURN FOUND;
END;
$$;

-- 2.7 Function: Clean expired verification codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.email_verification_codes
    WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '1 hour';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- ==========================================
-- SECTION 3: FIX RLS POLICIES
-- ==========================================

-- 3.1 Enable RLS on tables
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3.2 Drop ALL existing policies for email_verification_codes
DROP POLICY IF EXISTS "users_manage_own_verification_codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "admin_manage_verification_codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Users can insert their own verification codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Users can view their own verification codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Users can update their own verification codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Allow anon to insert codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Allow authenticated to insert codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Authenticated users can insert verification codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Authenticated users can view their own codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Authenticated users can update their own codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Anonymous users can insert codes during registration" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Anonymous users can view codes by email" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Anonymous users can update codes" ON public.email_verification_codes;

-- 3.3 Create CORRECT policies for verification codes
-- CRITICAL: Allow service_role to bypass RLS for Edge Functions
CREATE POLICY "service_role_all_access"
ON public.email_verification_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to manage their own codes
CREATE POLICY "authenticated_users_own_codes"
ON public.email_verification_codes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- CRITICAL: Allow anonymous users during registration
CREATE POLICY "anon_users_create_codes"
ON public.email_verification_codes
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "anon_users_read_codes"
ON public.email_verification_codes
FOR SELECT
TO anon
USING (true);

CREATE POLICY "anon_users_update_codes"
ON public.email_verification_codes
FOR UPDATE
TO anon
USING (true);

-- 3.4 Fix user_profiles RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow user registration" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Service role has full access
CREATE POLICY "service_role_user_profiles_all"
ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own profile
CREATE POLICY "users_view_own_profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow profile creation during registration (anon + authenticated)
CREATE POLICY "allow_profile_creation"
ON public.user_profiles
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admins can view all profiles
CREATE POLICY "admins_view_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
);

-- Admins can update any profile
CREATE POLICY "admins_update_all_profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
);

-- ==========================================
-- SECTION 4: GRANT PERMISSIONS
-- ==========================================

GRANT ALL ON TABLE public.email_verification_codes TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.email_verification_codes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.email_verification_codes TO authenticated;

GRANT ALL ON TABLE public.user_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_profiles TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.generate_verification_code() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_verification_code(TEXT, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_email_code(UUID, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.approve_user(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reject_user(UUID, UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_user_balance(UUID, NUMERIC) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_verification_codes() TO service_role;

-- ==========================================
-- SECTION 5: VERIFICATION CHECKS
-- ==========================================

-- Check if all functions exist
SELECT 
    routine_name as function_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'generate_verification_code',
    'create_verification_code',
    'verify_email_code',
    'approve_user',
    'reject_user',
    'increment_user_balance',
    'cleanup_expired_verification_codes'
)
ORDER BY routine_name;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('email_verification_codes', 'user_profiles')
ORDER BY tablename, policyname;

-- ==========================================
-- SECTION 6: TEST DATA (OPTIONAL)
-- ==========================================

-- Create a test verification code (for testing purposes)
-- Uncomment the lines below if you want to test
/*
DO $$
DECLARE
    test_code TEXT;
BEGIN
    -- Find a pending user
    PERFORM id FROM public.user_profiles WHERE approval_status = 'pending' LIMIT 1;
    
    IF FOUND THEN
        SELECT public.create_verification_code(email, id) INTO test_code
        FROM public.user_profiles 
        WHERE approval_status = 'pending' 
        LIMIT 1;
        
        RAISE NOTICE 'Test verification code created: %', test_code;
    END IF;
END $$;
*/

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

SELECT '✅ DATABASE FIXES COMPLETED SUCCESSFULLY!' as status;
SELECT '✅ All functions created/updated' as functions_status;
SELECT '✅ RLS policies fixed' as rls_status;
SELECT '✅ Permissions granted' as permissions_status;
SELECT '⚠️  IMPORTANT: Configure RESEND_API_KEY in Supabase Edge Functions for email to work' as email_reminder;
