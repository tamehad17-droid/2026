-- Allow users to view admin-managed USDT addresses and add referral linking by code

-- 1) Read policy for admin-managed USDT addresses (authenticated users)
DO $$
BEGIN
  DROP POLICY IF EXISTS "public_read_admin_usdt_addresses" ON public.usdt_addresses;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE POLICY "public_read_admin_usdt_addresses"
ON public.usdt_addresses
FOR SELECT
TO authenticated
USING (is_admin_managed = TRUE);

-- 2) Create function to link referral by referral_code after signup
CREATE OR REPLACE FUNCTION public.link_referral_by_code(
  p_referral_code TEXT,
  p_new_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id UUID;
  v_referrer_level INT;
  v_existing UUID;
BEGIN
  IF p_referral_code IS NULL OR length(trim(p_referral_code)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing referral code');
  END IF;

  -- Resolve code to referrer
  SELECT id, level INTO v_referrer_id, v_referrer_level
  FROM public.user_profiles
  WHERE referral_code = upper(p_referral_code)
  LIMIT 1;

  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
  END IF;

  -- Prevent self-referral
  IF v_referrer_id = p_new_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Self referral not allowed');
  END IF;

  -- If already linked, skip
  SELECT referred_by INTO v_existing FROM public.user_profiles WHERE id = p_new_user_id;
  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already linked');
  END IF;

  -- Link profile
  UPDATE public.user_profiles
  SET referred_by = v_referrer_id, referred_level = v_referrer_level
  WHERE id = p_new_user_id;

  -- Create referral row
  INSERT INTO public.referrals (referrer_id, referred_id, bonus_amount)
  VALUES (v_referrer_id, p_new_user_id, 0.00);

  -- Immediate tiny reward for level 0 referrer
  IF COALESCE(v_referrer_level,0) = 0 THEN
    UPDATE public.user_profiles SET pending_balance = pending_balance + 0.01 WHERE id = v_referrer_id;
    INSERT INTO public.transactions (user_id, type, amount, description, status)
    VALUES (v_referrer_id, 'referral_bonus', 0.01, 'Level 0 referral instant bonus', 'completed');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;


