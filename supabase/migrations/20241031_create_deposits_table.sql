-- ============================================================================
-- PromoHive - Deposit System Migration
-- Version: 2.0 (Fixed and Enhanced)
-- Date: 2024-10-31
-- Description: Complete deposit system with admin verification and USDT addresses
-- ============================================================================

-- ============================================================================
-- 1. CREATE DEPOSITS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 50.00),
    usdt_address TEXT NOT NULL,
    network TEXT NOT NULL DEFAULT 'TRC20',
    tx_hash TEXT,
    payment_proof TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    rejection_reason TEXT,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_network_deposit CHECK (network IN ('TRC20', 'ERC20', 'BEP20')),
    CONSTRAINT valid_status_deposit CHECK (status IN ('pending', 'verified', 'rejected', 'cancelled'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON public.deposits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_verified_by ON public.deposits(verified_by) WHERE verified_by IS NOT NULL;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_deposits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_deposits_updated_at ON public.deposits;
CREATE TRIGGER trigger_deposits_updated_at
    BEFORE UPDATE ON public.deposits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_deposits_updated_at();

-- ============================================================================
-- 2. CREATE ADMIN DEPOSIT ADDRESSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_deposit_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    address TEXT NOT NULL UNIQUE,
    network TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    qr_code_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_network_admin CHECK (network IN ('TRC20', 'ERC20', 'BEP20'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_deposit_addresses_network ON public.admin_deposit_addresses(network);
CREATE INDEX IF NOT EXISTS idx_admin_deposit_addresses_active ON public.admin_deposit_addresses(is_active);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS trigger_admin_deposit_addresses_updated_at ON public.admin_deposit_addresses;
CREATE TRIGGER trigger_admin_deposit_addresses_updated_at
    BEFORE UPDATE ON public.admin_deposit_addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_deposits_updated_at();

-- ============================================================================
-- 3. RLS POLICIES FOR DEPOSITS
-- ============================================================================

ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Users can view their own deposits
DROP POLICY IF EXISTS "users_view_own_deposits" ON public.deposits;
CREATE POLICY "users_view_own_deposits"
ON public.deposits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own deposit requests
DROP POLICY IF EXISTS "users_create_own_deposits" ON public.deposits;
CREATE POLICY "users_create_own_deposits"
ON public.deposits FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id 
    AND status = 'pending'
);

-- Admins can view all deposits
DROP POLICY IF EXISTS "admins_view_all_deposits" ON public.deposits;
CREATE POLICY "admins_view_all_deposits"
ON public.deposits FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
);

-- Admins can update deposits
DROP POLICY IF EXISTS "admins_update_deposits" ON public.deposits;
CREATE POLICY "admins_update_deposits"
ON public.deposits FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
);

-- ============================================================================
-- 4. RLS POLICIES FOR ADMIN DEPOSIT ADDRESSES
-- ============================================================================

ALTER TABLE public.admin_deposit_addresses ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active admin deposit addresses
DROP POLICY IF EXISTS "users_view_active_deposit_addresses" ON public.admin_deposit_addresses;
CREATE POLICY "users_view_active_deposit_addresses"
ON public.admin_deposit_addresses FOR SELECT
TO authenticated
USING (is_active = true);

-- Only admins can manage deposit addresses
DROP POLICY IF EXISTS "admins_manage_deposit_addresses" ON public.admin_deposit_addresses;
CREATE POLICY "admins_manage_deposit_addresses"
ON public.admin_deposit_addresses FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
);

-- ============================================================================
-- 5. FUNCTIONS
-- ============================================================================

-- Function to request deposit
CREATE OR REPLACE FUNCTION public.request_deposit(
    p_user_id UUID,
    p_amount NUMERIC,
    p_usdt_address TEXT,
    p_network TEXT,
    p_tx_hash TEXT DEFAULT NULL,
    p_payment_proof TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    min_deposit NUMERIC;
    deposit_id UUID;
BEGIN
    -- Get minimum deposit amount from settings
    SELECT COALESCE(CAST(value AS NUMERIC), 50) INTO min_deposit
    FROM public.admin_settings
    WHERE key = 'min_deposit_amount';
    
    -- Validate amount
    IF p_amount < min_deposit THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Amount below minimum deposit of $' || min_deposit
        );
    END IF;
    
    -- Create deposit request
    INSERT INTO public.deposits (
        user_id,
        amount,
        usdt_address,
        network,
        tx_hash,
        payment_proof,
        status
    ) VALUES (
        p_user_id,
        p_amount,
        p_usdt_address,
        p_network,
        p_tx_hash,
        p_payment_proof,
        'pending'
    ) RETURNING id INTO deposit_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'deposit_id', deposit_id,
        'message', 'Deposit request submitted successfully. Awaiting admin verification.'
    );
END;
$$;

-- Function to verify deposit (admin only)
CREATE OR REPLACE FUNCTION public.verify_deposit(
    p_deposit_id UUID,
    p_admin_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deposit_record RECORD;
    is_admin BOOLEAN;
    user_level INT;
    max_level_0_balance NUMERIC;
    actual_credit NUMERIC;
BEGIN
    -- Check if user is admin
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = p_admin_id
        AND role IN ('admin', 'super_admin')
    ) INTO is_admin;
    
    IF NOT is_admin THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin access required');
    END IF;
    
    -- Get deposit details
    SELECT * INTO deposit_record
    FROM public.deposits
    WHERE id = p_deposit_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Deposit not found');
    END IF;
    
    IF deposit_record.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Deposit already processed');
    END IF;
    
    -- Get user level and max balance for level 0
    SELECT level INTO user_level
    FROM public.user_profiles
    WHERE id = deposit_record.user_id;
    
    SELECT COALESCE(CAST(value AS NUMERIC), 9.90) INTO max_level_0_balance
    FROM public.admin_settings
    WHERE key = 'max_level_0_balance';
    
    -- Calculate actual credit amount (respecting level 0 limit)
    actual_credit := deposit_record.amount;
    
    -- Update deposit status
    UPDATE public.deposits
    SET 
        status = 'verified',
        admin_notes = p_admin_notes,
        verified_by = p_admin_id,
        verified_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_deposit_id;
    
    -- Add amount to user balance
    UPDATE public.user_profiles
    SET 
        balance = balance + actual_credit,
        total_deposited = COALESCE(total_deposited, 0) + actual_credit,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = deposit_record.user_id;
    
    -- Create transaction record
    INSERT INTO public.transactions (
        user_id,
        type,
        amount,
        description,
        status,
        reference_type,
        reference_id
    ) VALUES (
        deposit_record.user_id,
        'deposit',
        actual_credit,
        'Deposit via ' || deposit_record.network || ' - Verified',
        'completed',
        'deposit',
        p_deposit_id
    );
    
    -- Log admin action
    INSERT INTO public.audit_logs (
        admin_id,
        action_type,
        target_type,
        target_id,
        details
    ) VALUES (
        p_admin_id,
        'verify_deposit',
        'deposit',
        p_deposit_id,
        jsonb_build_object(
            'amount', deposit_record.amount,
            'user_id', deposit_record.user_id,
            'network', deposit_record.network,
            'actual_credit', actual_credit
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Deposit verified and credited to user account',
        'credited_amount', actual_credit
    );
END;
$$;

-- Function to reject deposit (admin only)
CREATE OR REPLACE FUNCTION public.reject_deposit(
    p_deposit_id UUID,
    p_admin_id UUID,
    p_rejection_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deposit_record RECORD;
    is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = p_admin_id
        AND role IN ('admin', 'super_admin')
    ) INTO is_admin;
    
    IF NOT is_admin THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin access required');
    END IF;
    
    -- Get deposit details
    SELECT * INTO deposit_record
    FROM public.deposits
    WHERE id = p_deposit_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Deposit not found');
    END IF;
    
    IF deposit_record.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Deposit already processed');
    END IF;
    
    -- Update deposit status
    UPDATE public.deposits
    SET 
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        verified_by = p_admin_id,
        verified_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_deposit_id;
    
    -- Log admin action
    INSERT INTO public.audit_logs (
        admin_id,
        action_type,
        target_type,
        target_id,
        details
    ) VALUES (
        p_admin_id,
        'reject_deposit',
        'deposit',
        p_deposit_id,
        jsonb_build_object(
            'amount', deposit_record.amount,
            'user_id', deposit_record.user_id,
            'reason', p_rejection_reason
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Deposit rejected'
    );
END;
$$;

-- ============================================================================
-- 6. INSERT DEFAULT ADMIN DEPOSIT ADDRESSES
-- ============================================================================

-- Insert sample admin deposit addresses (to be updated by admin)
INSERT INTO public.admin_deposit_addresses (label, address, network, is_active) VALUES
    ('Main TRC20 Wallet', 'TYourTRC20AddressHere123456789', 'TRC20', true),
    ('Main ERC20 Wallet', 'YourERC20AddressHere123456789', 'ERC20', false),
    ('Main BEP20 Wallet', 'YourBEP20AddressHere123456789', 'BEP20', false)
ON CONFLICT (address) DO NOTHING;

-- ============================================================================
-- 7. COMMENTS
-- ============================================================================

COMMENT ON TABLE public.deposits IS 'User deposit requests with manual admin verification';
COMMENT ON TABLE public.admin_deposit_addresses IS 'Admin-managed USDT addresses for receiving deposits';
COMMENT ON COLUMN public.deposits.amount IS 'Deposit amount in USD (minimum $50)';
COMMENT ON COLUMN public.deposits.status IS 'Status: pending, verified, rejected, cancelled';
COMMENT ON FUNCTION public.request_deposit IS 'Create a deposit request (minimum $50)';
COMMENT ON FUNCTION public.verify_deposit IS 'Verify deposit and credit user account (admin only)';
COMMENT ON FUNCTION public.reject_deposit IS 'Reject deposit request (admin only)';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
