-- Migration: Add Upgrade System and USDT Wallets
-- Date: 2024-10-31
-- Purpose: Add level upgrade system and USDT wallet management for deposits

-- ============================================
-- 1. Create USDT Wallets Table (Admin-managed)
-- ============================================

CREATE TABLE IF NOT EXISTS public.usdt_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL UNIQUE,
  wallet_name TEXT NOT NULL,
  network TEXT NOT NULL, -- 'TRC20', 'ERC20', 'BEP20', etc.
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.usdt_wallets IS 'USDT wallet addresses managed by admins for user deposits';

-- ============================================
-- 2. Create Level Upgrade Requests Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.level_upgrade_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_level INTEGER NOT NULL,
  to_level INTEGER NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  usdt_wallet_id UUID REFERENCES public.usdt_wallets(id),
  transaction_hash TEXT NOT NULL, -- رقم المعاملة (الإثبات)
  proof_screenshot_url TEXT, -- رابط صورة الإثبات (اختياري)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.level_upgrade_requests IS 'User requests to upgrade their level by paying USDT';

-- ============================================
-- 3. Create Level Prices Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.level_prices (
  level INTEGER PRIMARY KEY,
  price_usd DECIMAL(10,2) NOT NULL,
  benefits JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.level_prices IS 'Pricing for each level upgrade';

-- Insert default level prices
INSERT INTO public.level_prices (level, price_usd, benefits) VALUES
(1, 10.00, '{"percentage": 25, "description": "Earn 25% of task value"}'),
(2, 25.00, '{"percentage": 40, "description": "Earn 40% of task value"}'),
(3, 50.00, '{"percentage": 55, "description": "Earn 55% of task value"}'),
(4, 100.00, '{"percentage": 70, "description": "Earn 70% of task value"}'),
(5, 200.00, '{"percentage": 85, "description": "Earn 85% of task value"}')
ON CONFLICT (level) DO NOTHING;

-- ============================================
-- 4. Add Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_usdt_wallets_active ON public.usdt_wallets(is_active);
CREATE INDEX IF NOT EXISTS idx_level_upgrade_requests_user ON public.level_upgrade_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_level_upgrade_requests_status ON public.level_upgrade_requests(status);
CREATE INDEX IF NOT EXISTS idx_level_upgrade_requests_created ON public.level_upgrade_requests(created_at DESC);

-- ============================================
-- 5. Enable RLS
-- ============================================

ALTER TABLE public.usdt_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_upgrade_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_prices ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS Policies for USDT Wallets
-- ============================================

-- Users can view active wallets
CREATE POLICY "Users can view active USDT wallets"
ON public.usdt_wallets FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins can manage all wallets
CREATE POLICY "Admins can manage USDT wallets"
ON public.usdt_wallets FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- ============================================
-- 7. RLS Policies for Level Upgrade Requests
-- ============================================

-- Users can view their own requests
CREATE POLICY "Users can view own upgrade requests"
ON public.level_upgrade_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create their own requests
CREATE POLICY "Users can create upgrade requests"
ON public.level_upgrade_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admins can view all requests
CREATE POLICY "Admins can view all upgrade requests"
ON public.level_upgrade_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Admins can update requests (approve/reject)
CREATE POLICY "Admins can update upgrade requests"
ON public.level_upgrade_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- ============================================
-- 8. RLS Policies for Level Prices
-- ============================================

-- Everyone can view level prices
CREATE POLICY "Anyone can view level prices"
ON public.level_prices FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage level prices
CREATE POLICY "Admins can manage level prices"
ON public.level_prices FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- ============================================
-- 9. Function to Approve Upgrade Request
-- ============================================

CREATE OR REPLACE FUNCTION public.approve_level_upgrade(
  p_request_id UUID,
  p_admin_id UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request RECORD;
  v_result JSONB;
BEGIN
  -- Check if admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = p_admin_id
    AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get request details
  SELECT * INTO v_request
  FROM public.level_upgrade_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;

  IF v_request.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request already processed');
  END IF;

  -- Update request status
  UPDATE public.level_upgrade_requests
  SET 
    status = 'approved',
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    admin_notes = p_admin_notes,
    updated_at = NOW()
  WHERE id = p_request_id;

  -- Update user level
  UPDATE public.user_profiles
  SET 
    level = v_request.to_level,
    updated_at = NOW()
  WHERE id = v_request.user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Upgrade approved successfully'
  );
END;
$$;

-- ============================================
-- 10. Function to Reject Upgrade Request
-- ============================================

CREATE OR REPLACE FUNCTION public.reject_level_upgrade(
  p_request_id UUID,
  p_admin_id UUID,
  p_admin_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = p_admin_id
    AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Update request status
  UPDATE public.level_upgrade_requests
  SET 
    status = 'rejected',
    reviewed_by = p_admin_id,
    reviewed_at = NOW(),
    admin_notes = p_admin_notes,
    updated_at = NOW()
  WHERE id = p_request_id
  AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found or already processed');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Upgrade rejected'
  );
END;
$$;

-- ============================================
-- 11. Function to Update User Balance (Admin)
-- ============================================

CREATE OR REPLACE FUNCTION public.admin_update_user_balance(
  p_admin_id UUID,
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_type TEXT, -- 'add' or 'subtract'
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet RECORD;
BEGIN
  -- Check if admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = p_admin_id
    AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get user wallet
  SELECT * INTO v_wallet
  FROM public.wallets
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  -- Update balance
  IF p_type = 'add' THEN
    UPDATE public.wallets
    SET 
      available_balance = available_balance + p_amount,
      total_earned = total_earned + p_amount,
      earnings_from_bonuses = earnings_from_bonuses + p_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Create transaction record
    INSERT INTO public.transactions (user_id, type, amount, description, status)
    VALUES (p_user_id, 'admin_bonus', p_amount, p_reason, 'completed');

  ELSIF p_type = 'subtract' THEN
    IF v_wallet.available_balance < p_amount THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
    END IF;

    UPDATE public.wallets
    SET 
      available_balance = available_balance - p_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Create transaction record
    INSERT INTO public.transactions (user_id, type, amount, description, status)
    VALUES (p_user_id, 'admin_deduction', -p_amount, p_reason, 'completed');
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid type');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Balance updated successfully'
  );
END;
$$;

-- ============================================
-- 12. Triggers for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usdt_wallets_updated_at
BEFORE UPDATE ON public.usdt_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_level_upgrade_requests_updated_at
BEFORE UPDATE ON public.level_upgrade_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_level_prices_updated_at
BEFORE UPDATE ON public.level_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Done!
-- ============================================

COMMENT ON FUNCTION public.approve_level_upgrade IS 'Approve a level upgrade request and update user level';
COMMENT ON FUNCTION public.reject_level_upgrade IS 'Reject a level upgrade request';
COMMENT ON FUNCTION public.admin_update_user_balance IS 'Allow admins to manually adjust user balance';
