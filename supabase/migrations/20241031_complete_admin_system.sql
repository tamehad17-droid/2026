-- Complete Admin System with Levels, Referrals, Spin Wheel, USDT Addresses
-- Date: 2025-10-31

-- ============================================================================
-- 1. ADMIN SETTINGS TABLE (Comprehensive)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general', -- general, financial, rewards, limits
    data_type TEXT DEFAULT 'string', -- string, number, boolean, json
    is_public BOOLEAN DEFAULT false, -- Can users see this?
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert comprehensive settings
INSERT INTO public.admin_settings (key, value, description, category, data_type, is_public) VALUES
    -- Financial Settings
    ('min_withdrawal_amount', '10', 'Minimum withdrawal amount in USD', 'financial', 'number', true),
    ('min_deposit_amount', '50', 'Minimum deposit amount in USD', 'financial', 'number', true),
    ('max_daily_spin_reward', '0.30', 'Maximum daily spin wheel reward per user', 'rewards', 'number', false),
    ('welcome_bonus_amount', '5', 'Welcome bonus for new approved users', 'rewards', 'number', false),
    ('exchange_rate_usd_usdt', '1', 'Exchange rate from USD to USDT', 'financial', 'number', true),
    ('withdrawal_fee_percentage', '0', 'Withdrawal fee percentage (0-100)', 'financial', 'number', true),
    
    -- Level Pricing (Hidden from users)
    ('level_1_price', '50', 'Price to upgrade to Level 1 (USD)', 'levels', 'number', false),
    ('level_2_price', '100', 'Price to upgrade to Level 2 (USD)', 'levels', 'number', false),
    ('level_3_price', '150', 'Price to upgrade to Level 3 (USD)', 'levels', 'number', false),
    ('max_free_balance', '9.90', 'Maximum balance for Level 0 users', 'limits', 'number', false),
    
    -- Referral Rewards (Hidden)
    ('referral_level_1_count', '5', 'Number of same-level referrals needed for Level 1 reward', 'referrals', 'number', false),
    ('referral_level_1_reward', '80', 'Reward for Level 1 referral completion', 'referrals', 'number', false),
    ('referral_level_2_count', '5', 'Number of same-level referrals needed for Level 2 reward', 'referrals', 'number', false),
    ('referral_level_2_reward', '150', 'Reward for Level 2 referral completion', 'referrals', 'number', false),
    ('referral_min_active_days', '7', 'Minimum active days for referral to count', 'referrals', 'number', false),
    
    -- Contact Information (Public)
    ('customer_service_phone', '+17253348692', 'Customer service WhatsApp number', 'general', 'string', true),
    ('customer_service_email', 'promohive@globalpromonetwork.store', 'Customer service email', 'general', 'string', true),
    ('smtp_host', 'smtp.hostinger.com', 'SMTP server host', 'email', 'string', false),
    ('smtp_port', '465', 'SMTP server port', 'email', 'number', false),
    ('smtp_user', 'promohive@globalpromonetwork.store', 'SMTP username', 'email', 'string', false),
    ('smtp_from', 'promohive@globalpromonetwork.store', 'SMTP from address', 'email', 'string', false),
    
    -- Spin Wheel Settings
    ('spin_attempts_per_day', '1', 'Number of spin attempts per day per user', 'rewards', 'number', true),
    ('spin_prizes', '[0.05, 0.10, 0.15, 0.20, 0.25, 0.30]', 'Available spin prizes in USD', 'rewards', 'json', false)
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 2. USDT ADDRESSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.usdt_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT,
    address TEXT NOT NULL,
    network TEXT NOT NULL, -- TRC20, ERC20, BEP20
    is_verified BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, address)
);

CREATE INDEX IF NOT EXISTS idx_usdt_addresses_user_id ON public.usdt_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_usdt_addresses_network ON public.usdt_addresses(network);

-- RLS for USDT addresses
ALTER TABLE public.usdt_addresses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'usdt_addresses' 
          AND policyname = 'Users can view own USDT addresses'
    ) THEN
        CREATE POLICY "Users can view own USDT addresses"
        ON public.usdt_addresses FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'usdt_addresses' 
          AND policyname = 'Users can insert own USDT addresses'
    ) THEN
        CREATE POLICY "Users can insert own USDT addresses"
        ON public.usdt_addresses FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'usdt_addresses' 
          AND policyname = 'Users can update own USDT addresses'
    ) THEN
        CREATE POLICY "Users can update own USDT addresses"
        ON public.usdt_addresses FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'usdt_addresses' 
          AND policyname = 'Admins can view all USDT addresses'
    ) THEN
        CREATE POLICY "Admins can view all USDT addresses"
        ON public.usdt_addresses FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM auth.users
                WHERE id = auth.uid()
                AND (raw_user_meta_data->>'role' = 'admin' 
                     OR raw_user_meta_data->>'role' = 'super_admin')
            )
        );
    END IF;
END $$;

-- ============================================================================
-- 3. REFERRALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    level INT DEFAULT 0, -- Level of referred user when referred
    bonus NUMERIC DEFAULT 0,
    is_paid BOOLEAN DEFAULT false,
    is_qualified BOOLEAN DEFAULT false, -- Met hidden conditions?
    qualification_checked_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_referral UNIQUE(referrer_id, referred_id)
);

-- Ensure legacy installations have required columns before indexes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'referrals' AND column_name = 'is_qualified'
    ) THEN
        ALTER TABLE public.referrals ADD COLUMN is_qualified BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'referrals' AND column_name = 'is_paid'
    ) THEN
        ALTER TABLE public.referrals ADD COLUMN is_paid BOOLEAN DEFAULT false;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_is_qualified ON public.referrals(is_qualified, is_paid);

-- RLS for referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'referrals' 
          AND policyname = 'Users can view own referrals'
    ) THEN
        CREATE POLICY "Users can view own referrals"
        ON public.referrals FOR SELECT
        TO authenticated
        USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'referrals' 
          AND policyname = 'System can insert referrals'
    ) THEN
        CREATE POLICY "System can insert referrals"
        ON public.referrals FOR INSERT
        TO authenticated
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'referrals' 
          AND policyname = 'Admins can view all referrals'
    ) THEN
        CREATE POLICY "Admins can view all referrals"
        ON public.referrals FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM auth.users
                WHERE id = auth.uid()
                AND (raw_user_meta_data->>'role' = 'admin' 
                     OR raw_user_meta_data->>'role' = 'super_admin')
            )
        );
    END IF;
END $$;

-- ============================================================================
-- 4. SPIN WHEEL TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.spin_prizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prize_amount NUMERIC NOT NULL CHECK (prize_amount >= 0 AND prize_amount <= 0.30),
    spin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_daily_spin UNIQUE(user_id, spin_date)
);

CREATE INDEX IF NOT EXISTS idx_spin_prizes_user_date ON public.spin_prizes(user_id, spin_date);

-- RLS for spin prizes
ALTER TABLE public.spin_prizes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'spin_prizes' 
          AND policyname = 'Users can view own spin prizes'
    ) THEN
        CREATE POLICY "Users can view own spin prizes"
        ON public.spin_prizes FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 5. LEVEL UPGRADES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.level_upgrades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_level INT NOT NULL,
    to_level INT NOT NULL,
    price NUMERIC NOT NULL,
    payment_proof TEXT,
    payment_address TEXT,
    tx_hash TEXT,
    status TEXT DEFAULT 'pending', -- pending, verified, rejected
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_level_upgrades_user ON public.level_upgrades(user_id);
CREATE INDEX IF NOT EXISTS idx_level_upgrades_status ON public.level_upgrades(status);

-- RLS for level upgrades
ALTER TABLE public.level_upgrades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own level upgrades"
ON public.level_upgrades FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own level upgrade requests"
ON public.level_upgrades FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure admin policy uses user_profiles.role so real admin accounts can access
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'level_upgrades' 
          AND policyname = 'Admins can manage all level upgrades'
    ) THEN
        DROP POLICY "Admins can manage all level upgrades" ON public.level_upgrades;
    END IF;

    CREATE POLICY "Admins can manage all level upgrades"
    ON public.level_upgrades FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid()
              AND (up.role = 'admin' OR up.role = 'super_admin')
        )
    );
END $$;

-- ============================================================================
-- 6. ADMIN ACTIONS LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- 'update_user', 'approve_withdrawal', 'modify_balance', etc.
    target_type TEXT, -- 'user', 'withdrawal', 'task', etc.
    target_id UUID,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON public.admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON public.admin_actions(created_at DESC);

-- ============================================================================
-- 7. FUNCTIONS
-- ============================================================================

-- Function to get setting value
CREATE OR REPLACE FUNCTION public.get_setting(setting_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    setting_value TEXT;
BEGIN
    SELECT value INTO setting_value
    FROM public.admin_settings
    WHERE key = setting_key;
    
    RETURN setting_value;
END;
$$;

-- Function to check daily spin eligibility
CREATE OR REPLACE FUNCTION public.can_spin_today(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    spin_count INT;
    max_attempts INT;
BEGIN
    -- Get max attempts from settings
    SELECT CAST(value AS INT) INTO max_attempts
    FROM public.admin_settings
    WHERE key = 'spin_attempts_per_day';
    
    -- Count spins today
    SELECT COUNT(*) INTO spin_count
    FROM public.spin_prizes
    WHERE user_id = p_user_id
    AND spin_date = CURRENT_DATE;
    
    RETURN spin_count < COALESCE(max_attempts, 1);
END;
$$;

-- Function to process daily spin
CREATE OR REPLACE FUNCTION public.process_spin(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    can_spin BOOLEAN;
    prize_amount NUMERIC;
    max_daily NUMERIC;
    total_today NUMERIC;
    result JSONB;
BEGIN
    -- Check if user can spin
    SELECT public.can_spin_today(p_user_id) INTO can_spin;
    
    IF NOT can_spin THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Already spun today'
        );
    END IF;
    
    -- Get max daily reward
    SELECT CAST(value AS NUMERIC) INTO max_daily
    FROM public.admin_settings
    WHERE key = 'max_daily_spin_reward';
    
    -- Calculate total already won today
    SELECT COALESCE(SUM(prize_amount), 0) INTO total_today
    FROM public.spin_prizes
    WHERE user_id = p_user_id
    AND spin_date = CURRENT_DATE;
    
    -- Generate random prize (0.05 to 0.30)
    prize_amount := (FLOOR(RANDOM() * 6) + 1) * 0.05;
    
    -- Ensure doesn't exceed daily max
    IF (total_today + prize_amount) > max_daily THEN
        prize_amount := max_daily - total_today;
    END IF;
    
    -- Ensure minimum 0.05
    IF prize_amount < 0.05 THEN
        prize_amount := 0.05;
    END IF;
    
    -- Record spin
    INSERT INTO public.spin_prizes (user_id, prize_amount, spin_date)
    VALUES (p_user_id, prize_amount, CURRENT_DATE);
    
    -- Add to wallet
    PERFORM public.update_wallet_balance(p_user_id, prize_amount, 'add', 'bonuses');
    
    -- Create transaction
    INSERT INTO public.transactions (
        user_id,
        type,
        amount,
        description,
        status
    ) VALUES (
        p_user_id,
        'spin_reward',
        prize_amount,
        'Daily Spin Wheel Reward',
        'completed'
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'prize', prize_amount,
        'message', 'Congratulations! You won $' || prize_amount
    );
END;
$$;

-- Function to check and process referral rewards
CREATE OR REPLACE FUNCTION public.check_referral_rewards(p_referrer_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    referrer_level INT;
    required_count INT;
    reward_amount NUMERIC;
    qualified_count INT;
    min_active_days INT;
    result JSONB;
BEGIN
    -- Get referrer's level
    SELECT level INTO referrer_level
    FROM public.user_profiles
    WHERE id = p_referrer_id;
    
    -- Get settings based on level
    IF referrer_level = 1 THEN
        SELECT CAST(value AS INT) INTO required_count
        FROM public.admin_settings WHERE key = 'referral_level_1_count';
        
        SELECT CAST(value AS NUMERIC) INTO reward_amount
        FROM public.admin_settings WHERE key = 'referral_level_1_reward';
    ELSIF referrer_level = 2 THEN
        SELECT CAST(value AS INT) INTO required_count
        FROM public.admin_settings WHERE key = 'referral_level_2_count';
        
        SELECT CAST(value AS NUMERIC) INTO reward_amount
        FROM public.admin_settings WHERE key = 'referral_level_2_reward';
    ELSE
        RETURN jsonb_build_object('success', false, 'reason', 'Level not eligible for rewards');
    END IF;
    
    -- Get min active days
    SELECT CAST(value AS INT) INTO min_active_days
    FROM public.admin_settings WHERE key = 'referral_min_active_days';
    
    -- Count qualified referrals (same level, active for X days, not paid)
    SELECT COUNT(*) INTO qualified_count
    FROM public.referrals r
    JOIN public.user_profiles up ON r.referred_id = up.id
    WHERE r.referrer_id = p_referrer_id
    AND r.is_paid = false
    AND up.level = referrer_level
    AND up.status = 'active'
    AND up.created_at <= (CURRENT_TIMESTAMP - (min_active_days || ' days')::INTERVAL);
    
    -- If qualified, pay reward
    IF qualified_count >= required_count THEN
        -- Mark referrals as paid
        UPDATE public.referrals
        SET is_paid = true, 
            is_qualified = true,
            bonus = reward_amount / required_count,
            paid_at = CURRENT_TIMESTAMP,
            qualification_checked_at = CURRENT_TIMESTAMP
        WHERE referrer_id = p_referrer_id
        AND is_paid = false
        AND referred_id IN (
            SELECT up.id
            FROM public.user_profiles up
            WHERE up.level = referrer_level
            AND up.status = 'active'
            AND up.created_at <= (CURRENT_TIMESTAMP - (min_active_days || ' days')::INTERVAL)
            LIMIT required_count
        );
        
        -- Add to wallet
        PERFORM public.update_wallet_balance(p_referrer_id, reward_amount, 'add', 'referrals');
        
        -- Create transaction
        INSERT INTO public.transactions (
            user_id,
            type,
            amount,
            description,
            status
        ) VALUES (
            p_referrer_id,
            'referral_bonus',
            reward_amount,
            'Referral Bonus - ' || required_count || ' qualified referrals',
            'completed'
        );
        
        RETURN jsonb_build_object(
            'success', true,
            'reward', reward_amount,
            'message', 'Referral reward processed'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', false,
        'qualified_count', qualified_count,
        'required_count', required_count
    );
END;
$$;

-- Function to request level upgrade
CREATE OR REPLACE FUNCTION public.request_level_upgrade(
    p_user_id UUID,
    p_to_level INT,
    p_payment_proof TEXT DEFAULT NULL,
    p_payment_address TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_level INT;
    upgrade_price NUMERIC;
    upgrade_id UUID;
BEGIN
    -- Get current level
    SELECT level INTO current_level
    FROM public.user_profiles
    WHERE id = p_user_id;
    
    -- Validate upgrade
    IF p_to_level <= current_level THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid upgrade level');
    END IF;
    
    -- Get price for target level
    SELECT CAST(value AS NUMERIC) INTO upgrade_price
    FROM public.admin_settings
    WHERE key = 'level_' || p_to_level || '_price';
    
    IF upgrade_price IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Level price not found');
    END IF;
    
    -- Create upgrade request
    INSERT INTO public.level_upgrades (
        user_id,
        from_level,
        to_level,
        price,
        payment_proof,
        payment_address,
        status
    ) VALUES (
        p_user_id,
        current_level,
        p_to_level,
        upgrade_price,
        p_payment_proof,
        p_payment_address,
        'pending'
    ) RETURNING id INTO upgrade_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'upgrade_id', upgrade_id,
        'price', upgrade_price,
        'message', 'Upgrade request submitted'
    );
END;
$$;

-- ============================================================================
-- 8. UPDATE WITHDRAWALS TABLE
-- ============================================================================

-- Add network column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'withdrawals' AND column_name = 'network'
    ) THEN
        ALTER TABLE public.withdrawals ADD COLUMN network TEXT DEFAULT 'TRC20';
    END IF;
END $$;

-- ============================================================================
-- 9. UPDATE USER PROFILES
-- ============================================================================

-- Add welcome_bonus_used if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'welcome_bonus_used'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN welcome_bonus_used BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'referral_code'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN referral_code TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'referred_by'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN referred_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Generate referral codes for existing users
UPDATE public.user_profiles
SET referral_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT) FROM 1 FOR 8))
WHERE referral_code IS NULL;

-- ============================================================================
-- 10. COMMENTS
-- ============================================================================

COMMENT ON TABLE public.admin_settings IS 'Comprehensive admin settings for all system configurations';
COMMENT ON TABLE public.usdt_addresses IS 'USDT wallet addresses for users';
COMMENT ON TABLE public.referrals IS 'User referral tracking with hidden reward conditions';
COMMENT ON TABLE public.spin_prizes IS 'Daily spin wheel prizes (max $0.30/day)';
COMMENT ON TABLE public.level_upgrades IS 'User level upgrade requests and payments';
COMMENT ON TABLE public.admin_actions IS 'Audit log for all admin actions';

COMMENT ON FUNCTION public.process_spin IS 'Process daily spin wheel with $0.30 daily limit';
COMMENT ON FUNCTION public.check_referral_rewards IS 'Check and process referral rewards with hidden conditions';
COMMENT ON FUNCTION public.request_level_upgrade IS 'Request a paid level upgrade';
