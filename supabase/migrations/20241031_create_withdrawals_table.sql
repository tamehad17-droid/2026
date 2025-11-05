-- ============================================================================
-- PromoHive - Withdrawal System Migration
-- Version: 2.0 (Fixed and Enhanced)
-- Date: 2024-10-31
-- Description: Complete withdrawal system with admin approval
-- ============================================================================

-- ============================================================================
-- 1. CREATE WITHDRAWALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 10.00),
    usdt_address TEXT NOT NULL,
    network TEXT NOT NULL DEFAULT 'TRC20',
    status TEXT NOT NULL DEFAULT 'pending',
    tx_hash TEXT,
    admin_notes TEXT,
    rejection_reason TEXT,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_network_withdrawal CHECK (network IN ('TRC20', 'ERC20', 'BEP20')),
    CONSTRAINT valid_status_withdrawal CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON public.withdrawals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_processed_by ON public.withdrawals(processed_by) WHERE processed_by IS NOT NULL;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_withdrawals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_withdrawals_updated_at ON public.withdrawals;
CREATE TRIGGER trigger_withdrawals_updated_at
    BEFORE UPDATE ON public.withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_withdrawals_updated_at();

-- ============================================================================
-- 2. RLS POLICIES
-- ============================================================================

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Users can view their own withdrawals
DROP POLICY IF EXISTS "users_view_own_withdrawals" ON public.withdrawals;
CREATE POLICY "users_view_own_withdrawals"
ON public.withdrawals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own withdrawal requests
DROP POLICY IF EXISTS "users_create_own_withdrawals" ON public.withdrawals;
CREATE POLICY "users_create_own_withdrawals"
ON public.withdrawals FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id 
    AND status = 'pending'
);

-- Admins can view all withdrawals
DROP POLICY IF EXISTS "admins_view_all_withdrawals" ON public.withdrawals;
CREATE POLICY "admins_view_all_withdrawals"
ON public.withdrawals FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
);

-- Admins can update withdrawals
DROP POLICY IF EXISTS "admins_update_withdrawals" ON public.withdrawals;
CREATE POLICY "admins_update_withdrawals"
ON public.withdrawals FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
);

-- ============================================================================
-- 3. FUNCTIONS
-- ============================================================================

-- Function to request withdrawal
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
    min_withdrawal NUMERIC;
    user_balance NUMERIC;
    user_pending NUMERIC;
    withdrawal_id UUID;
BEGIN
    -- Get minimum withdrawal amount from settings
    SELECT COALESCE(CAST(value AS NUMERIC), 10) INTO min_withdrawal
    FROM public.admin_settings
    WHERE key = 'min_withdrawal_amount';
    
    -- Validate amount
    IF p_amount < min_withdrawal THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Amount below minimum withdrawal of $' || min_withdrawal
        );
    END IF;
    
    -- Get user balance
    SELECT balance, pending_balance INTO user_balance, user_pending
    FROM public.user_profiles
    WHERE id = p_user_id;
    
    -- Check if user has enough balance
    IF user_balance < p_amount THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient balance. Available: $' || user_balance
        );
    END IF;
    
    -- Deduct from balance and add to pending
    UPDATE public.user_profiles
    SET 
        balance = balance - p_amount,
        pending_balance = pending_balance + p_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id;
    
    -- Create withdrawal request
    INSERT INTO public.withdrawals (
        user_id,
        amount,
        usdt_address,
        network,
        status
    ) VALUES (
        p_user_id,
        p_amount,
        p_usdt_address,
        p_network,
        'pending'
    ) RETURNING id INTO withdrawal_id;
    
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
        p_user_id,
        'withdrawal',
        -p_amount,
        'Withdrawal request to ' || p_network || ' - Pending approval',
        'pending',
        'withdrawal',
        withdrawal_id
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'withdrawal_id', withdrawal_id,
        'message', 'Withdrawal request submitted successfully. Awaiting admin approval.'
    );
END;
$$;

-- Function to approve withdrawal (admin only)
CREATE OR REPLACE FUNCTION public.approve_withdrawal(
    p_withdrawal_id UUID,
    p_admin_id UUID,
    p_tx_hash TEXT,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    withdrawal_record RECORD;
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
    
    -- Get withdrawal details
    SELECT * INTO withdrawal_record
    FROM public.withdrawals
    WHERE id = p_withdrawal_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Withdrawal not found');
    END IF;
    
    IF withdrawal_record.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Withdrawal already processed');
    END IF;
    
    -- Update withdrawal status
    UPDATE public.withdrawals
    SET 
        status = 'completed',
        tx_hash = p_tx_hash,
        admin_notes = p_admin_notes,
        processed_by = p_admin_id,
        processed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_withdrawal_id;
    
    -- Deduct from pending balance
    UPDATE public.user_profiles
    SET 
        pending_balance = pending_balance - withdrawal_record.amount,
        total_withdrawn = COALESCE(total_withdrawn, 0) + withdrawal_record.amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = withdrawal_record.user_id;
    
    -- Update transaction status
    UPDATE public.transactions
    SET 
        status = 'completed',
        description = 'Withdrawal to ' || withdrawal_record.network || ' - Completed (TX: ' || COALESCE(p_tx_hash, 'N/A') || ')',
        updated_at = CURRENT_TIMESTAMP
    WHERE reference_type = 'withdrawal' 
    AND reference_id = p_withdrawal_id;
    
    -- Log admin action
    INSERT INTO public.audit_logs (
        admin_id,
        action_type,
        target_type,
        target_id,
        details
    ) VALUES (
        p_admin_id,
        'approve_withdrawal',
        'withdrawal',
        p_withdrawal_id,
        jsonb_build_object(
            'amount', withdrawal_record.amount,
            'user_id', withdrawal_record.user_id,
            'network', withdrawal_record.network,
            'tx_hash', p_tx_hash
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Withdrawal approved and processed successfully'
    );
END;
$$;

-- Function to reject withdrawal (admin only)
CREATE OR REPLACE FUNCTION public.reject_withdrawal(
    p_withdrawal_id UUID,
    p_admin_id UUID,
    p_rejection_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    withdrawal_record RECORD;
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
    
    -- Get withdrawal details
    SELECT * INTO withdrawal_record
    FROM public.withdrawals
    WHERE id = p_withdrawal_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Withdrawal not found');
    END IF;
    
    IF withdrawal_record.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Withdrawal already processed');
    END IF;
    
    -- Update withdrawal status
    UPDATE public.withdrawals
    SET 
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        processed_by = p_admin_id,
        processed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_withdrawal_id;
    
    -- Return amount from pending to available balance
    UPDATE public.user_profiles
    SET 
        balance = balance + withdrawal_record.amount,
        pending_balance = pending_balance - withdrawal_record.amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = withdrawal_record.user_id;
    
    -- Update transaction status
    UPDATE public.transactions
    SET 
        status = 'rejected',
        description = 'Withdrawal rejected - ' || p_rejection_reason,
        updated_at = CURRENT_TIMESTAMP
    WHERE reference_type = 'withdrawal' 
    AND reference_id = p_withdrawal_id;
    
    -- Log admin action
    INSERT INTO public.audit_logs (
        admin_id,
        action_type,
        target_type,
        target_id,
        details
    ) VALUES (
        p_admin_id,
        'reject_withdrawal',
        'withdrawal',
        p_withdrawal_id,
        jsonb_build_object(
            'amount', withdrawal_record.amount,
            'user_id', withdrawal_record.user_id,
            'reason', p_rejection_reason
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Withdrawal rejected and amount returned to user balance'
    );
END;
$$;

-- ============================================================================
-- 4. COMMENTS
-- ============================================================================

COMMENT ON TABLE public.withdrawals IS 'User withdrawal requests with admin approval workflow';
COMMENT ON COLUMN public.withdrawals.amount IS 'Withdrawal amount in USD (minimum $10)';
COMMENT ON COLUMN public.withdrawals.network IS 'USDT network: TRC20, ERC20, or BEP20';
COMMENT ON COLUMN public.withdrawals.status IS 'Status: pending, approved, rejected, completed, cancelled';
COMMENT ON FUNCTION public.request_withdrawal IS 'Create a withdrawal request (minimum $10)';
COMMENT ON FUNCTION public.approve_withdrawal IS 'Approve withdrawal and process payment (admin only)';
COMMENT ON FUNCTION public.reject_withdrawal IS 'Reject withdrawal and return funds (admin only)';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
