-- Fix: Create verification code function
-- Run this in Supabase SQL Editor

-- 1. Function to generate 5-digit verification code
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

-- 2. Function to create verification code for user
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

-- 3. Function to verify email code
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

-- 4. Create email_verification_codes table if not exists
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

-- 5. Add indexes if not exist
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_user_id ON public.email_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email ON public.email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_code ON public.email_verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires_at ON public.email_verification_codes(expires_at);

-- Success message
SELECT 'Verification functions created successfully!' as status;
