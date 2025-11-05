-- PromoHive: Wallet + update_user_level compatibility fixes
-- Date: 2025-10-30
-- Idempotent: safe to paste multiple times

-- 1) Ensure wallets table exists
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    available_balance NUMERIC DEFAULT 0 CHECK (available_balance >= 0),
    pending_balance NUMERIC DEFAULT 0 CHECK (pending_balance >= 0),
    total_earned NUMERIC DEFAULT 0 CHECK (total_earned >= 0),
    total_withdrawn NUMERIC DEFAULT 0 CHECK (total_withdrawn >= 0),
    earnings_from_tasks NUMERIC DEFAULT 0 CHECK (earnings_from_tasks >= 0),
    earnings_from_referrals NUMERIC DEFAULT 0 CHECK (earnings_from_referrals >= 0),
    earnings_from_bonuses NUMERIC DEFAULT 0 CHECK (earnings_from_bonuses >= 0),
    currency TEXT DEFAULT 'USD',
    last_transaction_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 2) Create helper to create wallet if missing
CREATE OR REPLACE FUNCTION public.create_user_wallet(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    wallet_id UUID;
BEGIN
    SELECT id INTO wallet_id FROM public.wallets WHERE user_id = p_user_id;
    IF wallet_id IS NULL THEN
        INSERT INTO public.wallets (user_id) VALUES (p_user_id) RETURNING id INTO wallet_id;
    END IF;
    RETURN wallet_id;
END;
$$;

-- 3) update_wallet_balance: add/subtract amounts on wallets table
CREATE OR REPLACE FUNCTION public.update_wallet_balance(
    p_user_id UUID,
    p_amount NUMERIC,
    p_type TEXT,
    p_category TEXT DEFAULT 'tasks'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
    ELSE
        RAISE EXCEPTION 'Invalid p_type value: %', p_type;
    END IF;

    RETURN TRUE;
END;
$$;

-- 4) Back-compat wrapper for increment_user_balance (calls wallet function)
CREATE OR REPLACE FUNCTION public.increment_user_balance(user_uuid UUID, amount NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM public.update_wallet_balance(user_uuid, amount, 'add', 'compat');
    RETURN TRUE;
END;
$$;

-- 5) Safe replacement for update_user_level that uses wallets (charges fee via update_wallet_balance)
CREATE OR REPLACE FUNCTION public.update_user_level(target_user_id UUID, admin_id UUID, new_level INT, admin_note TEXT DEFAULT '')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin BOOLEAN;
    old_level INT := 0;
    updated_user RECORD;
    fee NUMERIC := 0;
BEGIN
    -- Check admin role in auth.users (service role or admin account required)
    SELECT EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = admin_id
        AND (au.raw_user_meta_data->>'role' = 'admin' OR au.raw_user_meta_data->>'role' = 'super_admin')
    ) INTO is_admin;

    IF NOT is_admin THEN
        RETURN jsonb_build_object('success', false, 'error', 'No permission: Admin role required');
    END IF;

    -- Get old level (default 0 when NULL)
    SELECT COALESCE(level,0) INTO old_level FROM public.user_profiles WHERE id = target_user_id;

    -- Update user_profiles level
    UPDATE public.user_profiles
    SET level = new_level,
        level_updated_at = CURRENT_TIMESTAMP,
        level_updated_by = admin_id
    WHERE id = target_user_id
    RETURNING * INTO updated_user;

    -- Log level change
    INSERT INTO public.audit_logs (admin_id, action, table_name, record_id, old_values, new_values, notes)
    VALUES (
        admin_id,
        'LEVEL_CHANGE',
        'user_profiles',
        target_user_id,
        jsonb_build_object('level', old_level),
        jsonb_build_object('level', new_level),
        COALESCE(admin_note, format('Level changed from %s to %s', old_level, new_level))
    );

    -- If upgrading, charge fee using wallet system (idempotent)
    IF new_level > old_level THEN
        fee := (new_level - old_level) * 10; -- $10 per level (adjust if needed)
        PERFORM public.update_wallet_balance(target_user_id, fee, 'subtract', 'level_upgrade');

        INSERT INTO public.transactions (
            user_id, type, amount, description, status, reference_type, reference_id
        ) VALUES (
            target_user_id,
            'level_upgrade',
            fee,
            format('Level upgrade from %s to %s', old_level, new_level),
            'completed',
            'level_upgrade',
            gen_random_uuid() -- reference id placeholder
        );
    END IF;

    RETURN jsonb_build_object('success', true, 'message', format('User level updated from %s to %s', old_level, new_level), 'user', row_to_json(updated_user));
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 6) Grants (so authenticated users / service_role can call necessary functions where appropriate)
GRANT EXECUTE ON FUNCTION public.update_wallet_balance(UUID, NUMERIC, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_user_wallet(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_user_balance(UUID, NUMERIC) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_user_level(UUID, UUID, INT, TEXT) TO authenticated, service_role;

-- 7) Ensure indexes for wallets
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_available_balance ON public.wallets(available_balance);

-- End of script
