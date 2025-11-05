-- Migration: Fix Admin Approval Issues
-- Date: 2024-10-31
-- Purpose: Fix issues with user registration, approval system, and email notifications

-- 1. Ensure user_profiles table has correct structure
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- 2. Add index for faster queries on approval_status
CREATE INDEX IF NOT EXISTS idx_user_profiles_approval_status ON public.user_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);

-- 3. Update the handle_new_user trigger to ensure all fields are set correctly
CREATE OR REPLACE FUNCTION public.handle_new_user_with_verification()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    referral_code_text TEXT;
    v_wallet_id UUID;
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
    
    -- Create wallet for the user
    INSERT INTO public.wallets (user_id, available_balance, pending_balance)
    VALUES (NEW.id, 0, 0)
    RETURNING id INTO v_wallet_id;
    
    -- Log the registration
    INSERT INTO public.audit_logs (
        admin_id,
        action,
        table_name,
        record_id,
        new_values
    )
    VALUES (
        NEW.id,
        'user_registration',
        'user_profiles',
        NEW.id,
        jsonb_build_object(
            'email', NEW.email,
            'full_name', COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            'referral_code', referral_code_text
        )
    );
    
    RETURN NEW;
END;
$$;

-- 4. Ensure the trigger exists and is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_with_verification();

-- 5. Create or update the approve_user function
CREATE OR REPLACE FUNCTION public.approve_user_with_bonus(
    p_user_id UUID,
    p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_email TEXT;
    v_user_name TEXT;
    v_is_admin BOOLEAN;
BEGIN
    -- Check if the caller is an admin
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = p_admin_id 
        AND role IN ('admin', 'super_admin')
    ) INTO v_is_admin;

    IF NOT v_is_admin THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Admin role required'
        );
    END IF;

    -- Get user details
    SELECT email, full_name INTO v_user_email, v_user_name
    FROM public.user_profiles
    WHERE id = p_user_id;

    IF v_user_email IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;

    -- Update user profile to approved
    UPDATE public.user_profiles
    SET 
        approval_status = 'approved',
        approved_by = p_admin_id,
        approved_at = CURRENT_TIMESTAMP,
        status = 'active'
    WHERE id = p_user_id;

    -- Add welcome bonus transaction
    INSERT INTO public.transactions (
        user_id,
        type,
        amount,
        description,
        status
    )
    VALUES (
        p_user_id,
        'bonus',
        5.00,
        'Welcome bonus after approval',
        'completed'
    );

    -- Update wallet balance
    UPDATE public.wallets
    SET available_balance = available_balance + 5.00
    WHERE user_id = p_user_id;

    -- Log the approval action
    INSERT INTO public.audit_logs (
        admin_id,
        action,
        table_name,
        record_id,
        new_values
    )
    VALUES (
        p_admin_id,
        'approve_user',
        'user_profiles',
        p_user_id,
        jsonb_build_object(
            'approved_by', p_admin_id,
            'welcome_bonus', 5.00,
            'approved_at', CURRENT_TIMESTAMP
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'User approved successfully',
        'user_email', v_user_email,
        'user_name', v_user_name
    );
END;
$$;

-- 6. Create or update the reject_user function
CREATE OR REPLACE FUNCTION public.reject_user(
    target_user_id UUID,
    admin_id UUID,
    rejection_reason TEXT DEFAULT ''
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    -- Check if the caller is an admin
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = admin_id 
        AND role IN ('admin', 'super_admin')
    ) INTO v_is_admin;

    IF NOT v_is_admin THEN
        RETURN false;
    END IF;

    -- Update user profile to rejected
    UPDATE public.user_profiles
    SET 
        approval_status = 'rejected',
        approved_by = admin_id,
        approved_at = CURRENT_TIMESTAMP,
        status = 'suspended'
    WHERE id = target_user_id;

    -- Log the rejection action
    INSERT INTO public.audit_logs (
        admin_id,
        action,
        table_name,
        record_id,
        new_values
    )
    VALUES (
        admin_id,
        'reject_user',
        'user_profiles',
        target_user_id,
        jsonb_build_object(
            'rejected_by', admin_id,
            'reason', rejection_reason,
            'rejected_at', CURRENT_TIMESTAMP
        )
    );

    RETURN true;
END;
$$;

-- 7. Fix getDashboardStats to count pending users correctly
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_users INT;
    v_pending_approvals INT;
    v_active_tasks INT;
    v_pending_withdrawals INT;
    v_total_revenue DECIMAL(10,2);
BEGIN
    -- Count total users
    SELECT COUNT(*) INTO v_total_users
    FROM public.user_profiles;

    -- Count pending approvals (both null and 'pending')
    SELECT COUNT(*) INTO v_pending_approvals
    FROM public.user_profiles
    WHERE approval_status = 'pending' OR approval_status IS NULL;

    -- Count active tasks
    SELECT COUNT(*) INTO v_active_tasks
    FROM public.tasks
    WHERE status IN ('pending', 'in_progress');

    -- Count pending withdrawals
    SELECT COUNT(*) INTO v_pending_withdrawals
    FROM public.transactions
    WHERE type = 'withdrawal' AND status = 'pending';

    -- Calculate total revenue
    SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue
    FROM public.transactions
    WHERE status = 'completed';

    RETURN jsonb_build_object(
        'totalUsers', v_total_users,
        'pendingApprovals', v_pending_approvals,
        'activeTasks', v_active_tasks,
        'pendingWithdrawals', v_pending_withdrawals,
        'totalRevenue', v_total_revenue
    );
END;
$$;

-- 8. Add comment for documentation
COMMENT ON MIGRATION IS 'Fixes admin approval system, user registration trigger, and dashboard statistics';
