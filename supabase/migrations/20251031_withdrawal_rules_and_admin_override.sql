-- PromoHive - Enforce Level 0 withdrawal constraints with referral unlock and admin override
-- Date: 2025-10-31

-- 1) Extend user_profiles with flags used by the rule (idempotent)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS admin_withdrawal_override BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS referral_withdrawal_used_count INT DEFAULT 0;

-- 2) Helper: count qualifying referrals (referred user level >= 1)
CREATE OR REPLACE FUNCTION public.get_qualifying_referral_count(p_user_id UUID)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)
  FROM public.referrals r
  JOIN public.user_profiles u ON u.id = r.referred_id
  WHERE r.referrer_id = p_user_id AND u.level >= 1;
$$;

-- 3) Admin toggle for per-user withdrawal override
CREATE OR REPLACE FUNCTION public.set_withdrawal_override(p_user_id UUID, p_enabled BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT public.is_admin_or_super_admin() INTO is_admin;
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  UPDATE public.user_profiles
  SET admin_withdrawal_override = COALESCE(p_enabled, FALSE), updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- 4) Replace withdrawal request logic to enforce business rule
--    Rules:
--    - min withdrawal comes from admin_settings.key = 'min_withdrawal' (default 10)
--    - Level 0 users are capped to $9.90 and cannot withdraw unless:
--        a) admin_withdrawal_override = TRUE (does not consume referral), or
--        b) They have at least one qualifying referral (level >= 1) not yet consumed; on request we consume one by incrementing referral_withdrawal_used_count
--    - On approval, balance already moves from pending; separate cap enforcement exists in other functions

CREATE OR REPLACE FUNCTION public.request_withdrawal(
    p_user_id UUID,
    p_amount NUMERIC,
    p_usdt_address TEXT,
    p_network TEXT DEFAULT 'TRC20'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    min_withdrawal NUMERIC := 10.00;
    user_balance NUMERIC;
    user_pending NUMERIC;
    user_level INT;
    admin_override BOOLEAN;
    used_count INT;
    qualifying_count INT;
    withdrawal_id UUID;
BEGIN
    -- Get configured minimum withdrawal (fallback to 10.00)
    SELECT COALESCE(CAST(value AS NUMERIC), 10.00) INTO min_withdrawal
    FROM public.admin_settings WHERE key = 'min_withdrawal';

    IF p_amount < min_withdrawal THEN
        RETURN jsonb_build_object('success', false, 'error', 'Amount below minimum withdrawal of $' || min_withdrawal);
    END IF;

    -- Load user state
    SELECT balance, pending_balance, level, admin_withdrawal_override, referral_withdrawal_used_count
    INTO user_balance, user_pending, user_level, admin_override, used_count
    FROM public.user_profiles WHERE id = p_user_id;

    IF user_balance IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Check available balance
    IF user_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance. Available: $' || user_balance);
    END IF;

    -- Level 0 special rule: require upgrade, admin override, or referral unlock
    IF COALESCE(user_level, 0) = 0 THEN
        SELECT public.get_qualifying_referral_count(p_user_id) INTO qualifying_count;

        IF NOT COALESCE(admin_override, FALSE) AND (COALESCE(qualifying_count, 0) <= COALESCE(used_count, 0)) THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Upgrade to Level 1 or invite one Level 1 friend to withdraw.'
            );
        END IF;
    END IF;

    -- Move funds from balance to pending
    UPDATE public.user_profiles
    SET 
        balance = balance - p_amount,
        pending_balance = pending_balance + p_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id;

    -- Create withdrawal record
    INSERT INTO public.withdrawals (user_id, amount, usdt_address, network, status)
    VALUES (p_user_id, p_amount, p_usdt_address, p_network, 'pending')
    RETURNING id INTO withdrawal_id;

    -- Create transaction record
    INSERT INTO public.transactions (
        user_id, type, amount, description, status, reference_type, reference_id
    ) VALUES (
        p_user_id, 'withdrawal', -p_amount,
        'Withdrawal request to ' || p_network || ' - Pending approval',
        'pending', 'withdrawal', withdrawal_id
    );

    -- Consume referral unlock when applicable (only for level 0 and when not via admin override)
    IF COALESCE(user_level, 0) = 0 AND NOT COALESCE(admin_override, FALSE) THEN
        UPDATE public.user_profiles
        SET referral_withdrawal_used_count = COALESCE(referral_withdrawal_used_count, 0) + 1
        WHERE id = p_user_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'withdrawal_id', withdrawal_id,
        'message', 'Withdrawal request submitted successfully. Awaiting admin approval.'
    );
END;
$$;


