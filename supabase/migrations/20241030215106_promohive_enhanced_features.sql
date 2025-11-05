-- PromoHive Enhanced Features Migration (Final Fix - Idempotent)
-- Schema Analysis: Existing tables (user_profiles, transactions, referrals, daily_spin_rewards, tasks, task_submissions)
-- Integration Type: Extension with new admin features, level system, USDT management
-- Dependencies: Extends existing user_profiles, transactions, referrals tables
-- Fix: Split into two transactions to avoid enum safety issues

-- ================================================
-- TRANSACTION 1: ENUM MODIFICATIONS ONLY
-- ================================================
BEGIN;

-- Step 1: Add new enum values safely (must be in separate transaction)
DO $$
BEGIN
    -- Add super_admin to user_role enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'super_admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
        ALTER TYPE public.user_role ADD VALUE 'super_admin';
    END IF;
    
    -- Add level_upgrade to transaction_type enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'level_upgrade' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transaction_type')) THEN
        ALTER TYPE public.transaction_type ADD VALUE 'level_upgrade';
    END IF;
    
    -- Add welcome_bonus to transaction_type enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'welcome_bonus' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transaction_type')) THEN
        ALTER TYPE public.transaction_type ADD VALUE 'welcome_bonus';
    END IF;
    
    -- Add spin_reward to transaction_type enum if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'spin_reward' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transaction_type')) THEN
        ALTER TYPE public.transaction_type ADD VALUE 'spin_reward';
    END IF;
END $$;

COMMIT;

-- ================================================
-- TRANSACTION 2: ALL OTHER CHANGES
-- ================================================
BEGIN;

-- Step 2: Add new columns to existing user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pending_balance NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS welcome_bonus_used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS min_withdrawal_amount NUMERIC(10,2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS min_deposit_amount NUMERIC(10,2) DEFAULT 50.00;

-- Step 3: Create USDT addresses table
CREATE TABLE IF NOT EXISTS public.usdt_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    label TEXT,
    address TEXT NOT NULL,
    network TEXT NOT NULL DEFAULT 'TRC20',
    is_admin_managed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create level plans table
CREATE TABLE IF NOT EXISTS public.level_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    benefits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Create admin settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Create referral bonus rules table (hidden from users)
CREATE TABLE IF NOT EXISTS public.referral_bonus_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level INTEGER NOT NULL,
    required_referrals INTEGER NOT NULL,
    bonus_amount NUMERIC(10,2) NOT NULL,
    conditions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Create audit log table for admin actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.user_profiles(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 8: Extend referrals table with level tracking
ALTER TABLE public.referrals
ADD COLUMN IF NOT EXISTS referrer_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referred_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level_requirement_met BOOLEAN DEFAULT FALSE;

-- Step 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usdt_addresses_user_id ON public.usdt_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_usdt_addresses_network ON public.usdt_addresses(network);
CREATE INDEX IF NOT EXISTS idx_level_plans_level ON public.level_plans(level);
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON public.admin_settings(key);
CREATE INDEX IF NOT EXISTS idx_referral_bonus_rules_level ON public.referral_bonus_rules(level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON public.user_profiles(level);

-- Step 10: Enable RLS on new tables
ALTER TABLE public.usdt_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_bonus_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Step 11: Create functions (now safe to use new enum values)
-- Enhanced admin function for role checking
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role::text IN ('admin', 'super_admin')
)
$$;

-- Function to check daily spin limits (max $0.30 per user per day)
CREATE OR REPLACE FUNCTION public.can_user_spin_today(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(
    (SELECT SUM(reward_amount) FROM public.daily_spin_rewards 
     WHERE user_id = user_uuid AND spin_date = CURRENT_DATE), 0
) < 0.30
$$;

-- Function to process referral bonuses (hidden logic)
CREATE OR REPLACE FUNCTION public.process_referral_bonuses(referrer_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    user_level INTEGER;
    referral_count INTEGER;
    bonus_rule RECORD;
BEGIN
    -- Get referrer level
    SELECT level INTO user_level FROM public.user_profiles WHERE id = referrer_uuid;
    
    -- Count eligible referrals for this level
    SELECT COUNT(*) INTO referral_count 
    FROM public.referrals r
    JOIN public.user_profiles up ON r.referred_id = up.id
    WHERE r.referrer_id = referrer_uuid 
    AND up.level >= user_level
    AND r.level_requirement_met = FALSE;
    
    -- Check if bonus rule exists and requirements are met
    SELECT * INTO bonus_rule
    FROM public.referral_bonus_rules
    WHERE level = user_level 
    AND required_referrals <= referral_count
    AND is_active = TRUE
    ORDER BY required_referrals DESC
    LIMIT 1;
    
    IF bonus_rule.id IS NOT NULL THEN
        -- Mark referrals as processed
        UPDATE public.referrals 
        SET level_requirement_met = TRUE,
            bonus_amount = bonus_rule.bonus_amount
        WHERE referrer_id = referrer_uuid 
        AND level_requirement_met = FALSE;
        
        -- Add bonus to pending balance
        UPDATE public.user_profiles 
        SET pending_balance = pending_balance + bonus_rule.bonus_amount
        WHERE id = referrer_uuid;
        
        -- Create transaction record
        INSERT INTO public.transactions (
            user_id, type, amount, description, status, reference_type, reference_id
        ) VALUES (
            referrer_uuid, 
            'referral_bonus', 
            bonus_rule.bonus_amount,
            'Hidden referral bonus - Level ' || user_level,
            'completed',
            'referral_bonus_rule',
            bonus_rule.id
        );
    END IF;
END;
$func$;

-- Function to give welcome bonus (hidden)
CREATE OR REPLACE FUNCTION public.give_welcome_bonus(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    welcome_amount NUMERIC := 5.00;
    max_level_0_balance NUMERIC := 9.90;
BEGIN
    -- Check if user hasn't received welcome bonus and is level 0
    IF EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = user_uuid 
        AND level = 0 
        AND welcome_bonus_used = FALSE
        AND balance < max_level_0_balance
    ) THEN
        -- Give welcome bonus
        UPDATE public.user_profiles 
        SET balance = LEAST(balance + welcome_amount, max_level_0_balance),
            welcome_bonus_used = TRUE
        WHERE id = user_uuid;
        
        -- Create transaction
        INSERT INTO public.transactions (
            user_id, type, amount, description, status
        ) VALUES (
            user_uuid,
            'welcome_bonus',
            welcome_amount,
            'Welcome bonus for new user',
            'completed'
        );
    END IF;
END;
$func$;

-- Step 12: Create RLS Policies (using idempotent approach)

-- Drop existing policies if they exist to avoid conflicts
DO $$
BEGIN
    -- Drop USDT address policies if they exist
    DROP POLICY IF EXISTS "users_manage_own_usdt_addresses" ON public.usdt_addresses;
    DROP POLICY IF EXISTS "admin_manage_all_usdt_addresses" ON public.usdt_addresses;
    DROP POLICY IF EXISTS "public_can_read_level_plans" ON public.level_plans;
    DROP POLICY IF EXISTS "admin_manage_level_plans" ON public.level_plans;
    DROP POLICY IF EXISTS "super_admin_manage_settings" ON public.admin_settings;
    DROP POLICY IF EXISTS "admin_manage_referral_bonus_rules" ON public.referral_bonus_rules;
    DROP POLICY IF EXISTS "admin_read_audit_logs" ON public.audit_logs;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if policies don't exist
        NULL;
END $$;

-- USDT Addresses policies
CREATE POLICY "users_manage_own_usdt_addresses"
ON public.usdt_addresses
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_manage_all_usdt_addresses"
ON public.usdt_addresses
FOR ALL
TO authenticated
USING (public.is_admin_or_super_admin())
WITH CHECK (public.is_admin_or_super_admin());

-- Level plans policies (public read, admin write)
CREATE POLICY "public_can_read_level_plans"
ON public.level_plans
FOR SELECT
TO public
USING (is_active = TRUE);

CREATE POLICY "admin_manage_level_plans"
ON public.level_plans
FOR ALL
TO authenticated
USING (public.is_admin_or_super_admin())
WITH CHECK (public.is_admin_or_super_admin());

-- Admin settings policies (super admin only)
CREATE POLICY "super_admin_manage_settings"
ON public.admin_settings
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role::text = 'super_admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role::text = 'super_admin'
    )
);

-- Referral bonus rules policies (admin only, hidden from users)
CREATE POLICY "admin_manage_referral_bonus_rules"
ON public.referral_bonus_rules
FOR ALL
TO authenticated
USING (public.is_admin_or_super_admin())
WITH CHECK (public.is_admin_or_super_admin());

-- Audit logs policies (admin read only)
CREATE POLICY "admin_read_audit_logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.is_admin_or_super_admin());

-- Step 13: Insert default data

-- Level plans
INSERT INTO public.level_plans (level, name, price, benefits) VALUES
(1, 'Bronze Level', 50.00, '{"description": "Basic premium features", "max_daily_tasks": 10}'),
(2, 'Silver Level', 100.00, '{"description": "Enhanced features and rewards", "max_daily_tasks": 20}'),
(3, 'Gold Level', 150.00, '{"description": "Premium features and priority support", "max_daily_tasks": 50}')
ON CONFLICT (level) DO NOTHING;

-- Admin settings (updated with 2022 year and correct limits)
INSERT INTO public.admin_settings (key, value, description) VALUES
('site_year', '"2022"', 'Website establishment year (changed from 2025)'),
('min_withdrawal', '10.00', 'Minimum withdrawal amount in USD'),
('min_deposit', '50.00', 'Minimum deposit amount in USD'),
('welcome_bonus_amount', '5.00', 'Welcome bonus for new users'),
('max_level_0_balance', '9.90', 'Maximum balance for level 0 users'),
('daily_spin_max_reward', '0.30', 'Maximum daily spin reward per user'),
('customer_service_phone', '"+17253348692"', 'Customer service WhatsApp number'),
('customer_service_email', '"promohive@globalpromonetwork.store"', 'Customer service email'),
('smtp_settings', '{"host": "smtp.hostinger.com", "port": "465", "secure": "true", "user": "promohive@globalpromonetwork.store", "pass": "PromoHive@2025!"}', 'SMTP configuration for emails')
ON CONFLICT (key) DO NOTHING;

-- Hidden referral bonus rules
INSERT INTO public.referral_bonus_rules (level, required_referrals, bonus_amount, conditions) VALUES
(1, 5, 80.00, '{"description": "Level 1 users need 5 same-level referrals", "hidden": true}'),
(2, 5, 150.00, '{"description": "Level 2 users need 5 same-level referrals", "hidden": true}'),
(3, 3, 200.00, '{"description": "Level 3 users need 3 same-level referrals", "hidden": true}')
ON CONFLICT DO NOTHING;

-- Step 14: Enhanced trigger for welcome bonus on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_enhanced()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $trigger$
BEGIN
    -- Create user profile
    INSERT INTO public.user_profiles (id, email, full_name, role, level, balance, welcome_bonus_used)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')::public.user_role,
        0,
        0.00,
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;

    -- Give welcome bonus after user creation
    PERFORM public.give_welcome_bonus(NEW.id);
    
    RETURN NEW;
END;
$trigger$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_enhanced();

-- Step 15: Create super admin user (now safe to use super_admin enum value)
DO $$
DECLARE
    super_admin_id UUID;
    existing_super_admin UUID;
BEGIN
    -- Check if super admin already exists
    SELECT id INTO existing_super_admin 
    FROM auth.users 
    WHERE email = 'superadmin@promohive.com'
    LIMIT 1;
    
    IF existing_super_admin IS NULL THEN
        -- Generate new UUID for super admin
        super_admin_id := gen_random_uuid();
        
        -- Create super admin in auth.users (simplified approach)
        INSERT INTO auth.users (
            id, 
            instance_id, 
            aud, 
            role, 
            email, 
            encrypted_password, 
            email_confirmed_at,
            created_at, 
            updated_at, 
            raw_user_meta_data,
            raw_app_meta_data
        ) VALUES (
            super_admin_id, 
            '00000000-0000-0000-0000-000000000000', 
            'authenticated', 
            'authenticated',
            'superadmin@promohive.com', 
            crypt('SuperAdmin2022!', gen_salt('bf', 10)), 
            now(), 
            now(), 
            now(),
            '{"full_name": "Super Administrator", "role": "super_admin"}'::jsonb, 
            '{"provider": "email", "providers": ["email"]}'::jsonb
        );
        
        -- Create user profile with super_admin role
        INSERT INTO public.user_profiles (
            id, email, full_name, role, level, balance, welcome_bonus_used, created_at, updated_at
        ) VALUES (
            super_admin_id,
            'superadmin@promohive.com',
            'Super Administrator',
            'super_admin'::public.user_role,
            0,
            0.00,
            TRUE,
            now(),
            now()
        );
        
        RAISE NOTICE 'Super admin created successfully with ID: %', super_admin_id;
    ELSE
        -- Update existing user to super_admin role
        UPDATE public.user_profiles 
        SET role = 'super_admin'::public.user_role
        WHERE id = existing_super_admin;
        
        RAISE NOTICE 'Existing super admin updated with ID: %', existing_super_admin;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Super admin creation/update failed: %', SQLERRM;
        -- Continue execution even if super admin creation fails
END $$;

-- Step 16: Update existing admin settings with corrected values
UPDATE public.admin_settings 
SET value = '"2022"'
WHERE key = 'site_year';

UPDATE public.admin_settings 
SET value = '10.00'
WHERE key = 'min_withdrawal';

UPDATE public.admin_settings 
SET value = '50.00'
WHERE key = 'min_deposit';

COMMIT;

-- Add success confirmation
DO $$
BEGIN
    RAISE NOTICE 'PromoHive Enhanced Features migration completed successfully!';
    RAISE NOTICE 'Key updates: Super Admin role added, Level system created, USDT management enabled';
    RAISE NOTICE 'Site year corrected to 2022, Min withdrawal: $10, Min deposit: $50';
    RAISE NOTICE 'Welcome bonus: $5, Max Level 0 balance: $9.90, Daily spin max: $0.30';
    RAISE NOTICE 'Note: If super admin creation failed, create manually via Supabase dashboard';
END $$;