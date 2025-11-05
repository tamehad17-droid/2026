-- Location: supabase/migrations/20241030240001_fix_user_registration_trigger.sql
-- Purpose: Fix user registration trigger to include all required columns
-- This fixes the "Database error saving new user" issue

-- Drop and recreate the trigger function with all required columns
CREATE OR REPLACE FUNCTION public.handle_new_user_with_verification()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    referral_code_text TEXT;
BEGIN
    -- Generate unique referral code
    referral_code_text := UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8));
    
    -- Create user profile with pending approval and all required fields
    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name, 
        role,
        status,
        approval_status,
        email_verified,
        referral_code,
        level,
        welcome_bonus_used
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')::user_role,
        'pending'::user_status,
        'pending',
        false,
        referral_code_text,
        0,
        false
    );
    
    RETURN NEW;
END;
$$;

-- No need to recreate trigger as it already exists, just updated the function
-- The trigger will use the new function automatically

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user_with_verification() IS 'Creates user profile with pending status and email verification required. Includes all necessary columns for proper user registration.';
