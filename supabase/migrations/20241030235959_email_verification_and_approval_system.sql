-- Location: supabase/migrations/20241030235959_email_verification_and_approval_system.sql
-- Schema Analysis: Existing PromoHive schema with user_profiles, authentication system
-- Integration Type: Addition - Email verification codes and user approval workflow
-- Dependencies: user_profiles, auth.users

-- Add verification codes table for 5-digit email verification
CREATE TABLE public.email_verification_codes (
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

-- Add indexes for verification codes
CREATE INDEX idx_email_verification_codes_user_id ON public.email_verification_codes(user_id);
CREATE INDEX idx_email_verification_codes_email ON public.email_verification_codes(email);
CREATE INDEX idx_email_verification_codes_code ON public.email_verification_codes(code);
CREATE INDEX idx_email_verification_codes_expires_at ON public.email_verification_codes(expires_at);

-- Add approval-related columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN email_verified BOOLEAN DEFAULT false,
ADD COLUMN approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
ADD COLUMN approved_at TIMESTAMPTZ,
ADD COLUMN approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add index for approval tracking
CREATE INDEX idx_user_profiles_approval_status ON public.user_profiles(approval_status);
CREATE INDEX idx_user_profiles_approved_by ON public.user_profiles(approved_by);

-- Enable RLS for verification codes
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policy for verification codes - users can only access their own codes
CREATE POLICY "users_manage_own_verification_codes"
ON public.email_verification_codes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin access to verification codes
CREATE POLICY "admin_manage_verification_codes"
ON public.email_verification_codes
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid() 
        AND (au.raw_user_meta_data->>'role' = 'admin' 
             OR au.raw_user_meta_data->>'role' = 'super_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid() 
        AND (au.raw_user_meta_data->>'role' = 'admin' 
             OR au.raw_user_meta_data->>'role' = 'super_admin')
    )
);

-- Function to generate 5-digit verification code
CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Generate random 5-digit code
    RETURN LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
END;
$$;

-- Function to create verification code for user
CREATE OR REPLACE FUNCTION public.create_verification_code(user_email TEXT, user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    verification_code TEXT;
BEGIN
    -- Generate new verification code
    verification_code := public.generate_verification_code();
    
    -- Invalidate any existing codes for this user
    UPDATE public.email_verification_codes 
    SET verified = true 
    WHERE user_id = user_uuid AND verified = false;
    
    -- Insert new verification code
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

-- Function to verify email code
CREATE OR REPLACE FUNCTION public.verify_email_code(user_uuid UUID, input_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    code_record RECORD;
    is_valid BOOLEAN := false;
BEGIN
    -- Get the latest verification code for user
    SELECT * INTO code_record
    FROM public.email_verification_codes
    WHERE user_id = user_uuid 
    AND verified = false
    AND expires_at > CURRENT_TIMESTAMP
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Check if code exists and is valid
    IF code_record.id IS NOT NULL THEN
        -- Increment attempts
        UPDATE public.email_verification_codes 
        SET attempts = attempts + 1
        WHERE id = code_record.id;
        
        -- Check if code matches and attempts < 5
        IF code_record.code = input_code AND code_record.attempts < 5 THEN
            -- Mark code as verified
            UPDATE public.email_verification_codes 
            SET verified = true, verified_at = CURRENT_TIMESTAMP
            WHERE id = code_record.id;
            
            -- Mark user email as verified
            UPDATE public.user_profiles 
            SET email_verified = true
            WHERE id = user_uuid;
            
            is_valid := true;
        END IF;
    END IF;
    
    RETURN is_valid;
END;
$$;

-- Function to approve user (admin only)
CREATE OR REPLACE FUNCTION public.approve_user(target_user_id UUID, admin_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin BOOLEAN := false;
    welcome_bonus_amount NUMERIC;
BEGIN
    -- Check if admin has permission
    SELECT EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = admin_id 
        AND (au.raw_user_meta_data->>'role' = 'admin' 
             OR au.raw_user_meta_data->>'role' = 'super_admin')
    ) INTO is_admin;
    
    IF NOT is_admin THEN
        RETURN false;
    END IF;
    
    -- Update user approval status
    UPDATE public.user_profiles 
    SET 
        approval_status = 'approved',
        approved_by = admin_id,
        approved_at = CURRENT_TIMESTAMP,
        status = 'active'::user_status
    WHERE id = target_user_id;
    
    -- Get welcome bonus amount from settings
    SELECT (value::NUMERIC) INTO welcome_bonus_amount
    FROM public.admin_settings
    WHERE key = 'welcome_bonus_amount';
    
    -- Give welcome bonus if not already given
    IF welcome_bonus_amount IS NOT NULL THEN
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
    END IF;
    
    RETURN true;
END;
$$;

-- Function to reject user (admin only)
CREATE OR REPLACE FUNCTION public.reject_user(target_user_id UUID, admin_id UUID, rejection_reason TEXT DEFAULT '')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin BOOLEAN := false;
BEGIN
    -- Check if admin has permission
    SELECT EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = admin_id 
        AND (au.raw_user_meta_data->>'role' = 'admin' 
             OR au.raw_user_meta_data->>'role' = 'super_admin')
    ) INTO is_admin;
    
    IF NOT is_admin THEN
        RETURN false;
    END IF;
    
    -- Update user approval status
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

-- Enhanced trigger for new user creation with email verification
CREATE OR REPLACE FUNCTION public.handle_new_user_with_verification()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create user profile with pending approval
    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name, 
        role,
        status,
        approval_status,
        email_verified
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')::user_role,
        'pending'::user_status,
        'pending',
        false
    );
    
    RETURN NEW;
END;
$$;

-- Update existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_verification();

-- Function to clean expired verification codes
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

-- Mock data for testing verification system
DO $$
DECLARE
    test_user_id UUID;
    verification_code TEXT;
BEGIN
    -- Create a test pending user
    SELECT id INTO test_user_id 
    FROM public.user_profiles 
    WHERE email = 'user@promohive.com';
    
    IF test_user_id IS NOT NULL THEN
        -- Update existing user to pending status for testing
        UPDATE public.user_profiles 
        SET 
            email_verified = false,
            approval_status = 'pending',
            status = 'pending'::user_status,
            welcome_bonus_used = false
        WHERE id = test_user_id;
        
        -- Create a verification code for testing
        verification_code := public.create_verification_code('user@promohive.com', test_user_id);
        
        -- Log the verification code for testing purposes
        RAISE NOTICE 'Test verification code for user@promohive.com: %', verification_code;
    END IF;
END $$;