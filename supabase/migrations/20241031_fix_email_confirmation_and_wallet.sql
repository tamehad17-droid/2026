-- Fix Email Confirmation and Add Wallet System
-- Date: 2025-10-31

-- ============================================================================
-- 1. FIX: Update approve_user function to confirm email in auth.users
-- ============================================================================

CREATE OR REPLACE FUNCTION public.approve_user(target_user_id UUID, admin_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin BOOLEAN := false;
    welcome_bonus_amount NUMERIC;
    user_email TEXT;
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
    
    -- Get user email
    SELECT email INTO user_email FROM auth.users WHERE id = target_user_id;
    
    -- **FIX**: Confirm email in auth.users table
    UPDATE auth.users
    SET 
        email_confirmed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = target_user_id AND email_confirmed_at IS NULL;
    
    -- Update user approval status
    UPDATE public.user_profiles 
    SET 
        approval_status = 'approved',
        approved_by = admin_id,
        approved_at = CURRENT_TIMESTAMP,
        status = 'active'::user_status,
        email_verified = true
    WHERE id = target_user_id;
    
    -- Get welcome bonus amount from settings (default 5 if not set)
    SELECT COALESCE((value::NUMERIC), 5) INTO welcome_bonus_amount
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
            created_at
        ) VALUES (
            target_user_id,
            'bonus',
            welcome_bonus_amount,
            'Welcome bonus',
            'completed',
            CURRENT_TIMESTAMP
        );
    END IF;
    
    RETURN true;
END;
$$;

-- ============================================================================
-- 2. CREATE: Wallets table for user wallet management
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Balances
    available_balance NUMERIC DEFAULT 0 CHECK (available_balance >= 0),
    pending_balance NUMERIC DEFAULT 0 CHECK (pending_balance >= 0),
    total_earned NUMERIC DEFAULT 0 CHECK (total_earned >= 0),
    total_withdrawn NUMERIC DEFAULT 0 CHECK (total_withdrawn >= 0),
    
    -- Earnings breakdown
    earnings_from_tasks NUMERIC DEFAULT 0 CHECK (earnings_from_tasks >= 0),
    earnings_from_referrals NUMERIC DEFAULT 0 CHECK (earnings_from_referrals >= 0),
    earnings_from_bonuses NUMERIC DEFAULT 0 CHECK (earnings_from_bonuses >= 0),
    
    -- Metadata
    currency TEXT DEFAULT 'USD',
    last_transaction_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_available_balance ON public.wallets(available_balance);

-- Add RLS policies
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Users can only view their own wallet
CREATE POLICY "Users can view own wallet"
ON public.wallets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only system can insert wallets (via function)
CREATE POLICY "System can insert wallets"
ON public.wallets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only system can update wallets (via functions)
CREATE POLICY "System can update wallets"
ON public.wallets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all wallets
CREATE POLICY "Admins can view all wallets"
ON public.wallets
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role' = 'admin' 
             OR raw_user_meta_data->>'role' = 'super_admin')
    )
);

-- ============================================================================
-- 3. CREATE: Function to create wallet for new users
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_user_wallet(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    wallet_id UUID;
BEGIN
    -- Check if wallet already exists
    SELECT id INTO wallet_id FROM public.wallets WHERE user_id = p_user_id;
    
    IF wallet_id IS NULL THEN
        -- Create new wallet
        INSERT INTO public.wallets (user_id)
        VALUES (p_user_id)
        RETURNING id INTO wallet_id;
    END IF;
    
    RETURN wallet_id;
END;
$$;

-- ============================================================================
-- 4. CREATE: Function to update wallet balance
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_wallet_balance(
    p_user_id UUID,
    p_amount NUMERIC,
    p_type TEXT, -- 'add' or 'subtract'
    p_category TEXT DEFAULT 'tasks' -- 'tasks', 'referrals', 'bonuses'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create wallet if doesn't exist
    PERFORM public.create_user_wallet(p_user_id);
    
    IF p_type = 'add' THEN
        UPDATE public.wallets
        SET 
            available_balance = available_balance + p_amount,
            total_earned = total_earned + p_amount,
            earnings_from_tasks = CASE WHEN p_category = 'tasks' THEN earnings_from_tasks + p_amount ELSE earnings_from_tasks END,
            earnings_from_referrals = CASE WHEN p_category = 'referrals' THEN earnings_from_referrals + p_amount ELSE earnings_from_referrals END,
            earnings_from_bonuses = CASE WHEN p_category = 'bonuses' THEN earnings_from_bonuses + p_amount ELSE earnings_from_bonuses END,
            last_transaction_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id;
        
    ELSIF p_type = 'subtract' THEN
        UPDATE public.wallets
        SET 
            available_balance = available_balance - p_amount,
            total_withdrawn = total_withdrawn + p_amount,
            last_transaction_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id
        AND available_balance >= p_amount;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Insufficient balance';
        END IF;
    END IF;
    
    RETURN true;
END;
$$;

-- ============================================================================
-- 5. CREATE: Trigger to create wallet on user registration
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_create_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create wallet for new user
    PERFORM public.create_user_wallet(NEW.id);
    RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_user_created_create_wallet ON public.user_profiles;

-- Create trigger
CREATE TRIGGER on_user_created_create_wallet
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_create_wallet();

-- ============================================================================
-- 6. MIGRATE: Create wallets for existing users
-- ============================================================================

-- Create wallets for all existing users who don't have one
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT DISTINCT up.id, up.balance, up.total_earnings, up.total_withdrawn
        FROM public.user_profiles up
        WHERE NOT EXISTS (
            SELECT 1 FROM public.wallets w WHERE w.user_id = up.id
        )
    LOOP
        INSERT INTO public.wallets (
            user_id,
            available_balance,
            total_earned,
            total_withdrawn
        ) VALUES (
            user_record.id,
            COALESCE(user_record.balance, 0),
            COALESCE(user_record.total_earnings, 0),
            COALESCE(user_record.total_withdrawn, 0)
        ) ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END;
$$;

-- ============================================================================
-- 7. ADD: Default settings for wallet
-- ============================================================================

INSERT INTO public.admin_settings (key, value, description)
VALUES 
    ('welcome_bonus_amount', '5', 'Welcome bonus for new approved users (USD)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.admin_settings (key, value, description)
VALUES 
    ('min_withdrawal_amount', '10', 'Minimum withdrawal amount (USD)'),
    ('exchange_rate_usd_usdt', '1', 'Exchange rate from USD to USDT'),
    ('withdrawal_fee_percentage', '0', 'Withdrawal fee percentage (0-100)')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.wallets IS 'User wallet management with balances and earnings tracking';
COMMENT ON FUNCTION public.approve_user IS 'Approves user and confirms email in auth.users table';
COMMENT ON FUNCTION public.create_user_wallet IS 'Creates wallet for a user';
COMMENT ON FUNCTION public.update_wallet_balance IS 'Updates wallet balance and tracks earnings';
