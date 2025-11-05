-- Location: supabase/migrations/20241029221757_promohive_auth_system.sql
-- Schema Analysis: Fresh project - no existing schema
-- Integration Type: Complete authentication system
-- Dependencies: None (fresh project)

-- 1. Types
CREATE TYPE public.user_role AS ENUM ('admin', 'user', 'manager');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.task_category AS ENUM ('survey', 'social_media', 'app_download', 'review', 'referral', 'video_watch');
CREATE TYPE public.transaction_type AS ENUM ('earning', 'withdrawal', 'bonus', 'referral_bonus', 'penalty');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE public.withdrawal_method AS ENUM ('usdt_trc20', 'usdt_erc20', 'paypal', 'bank_transfer');
CREATE TYPE public.proof_status AS ENUM ('pending', 'approved', 'rejected', 'needs_revision');

-- 2. Core user profiles table (intermediary for PostgREST compatibility)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role,
    status public.user_status DEFAULT 'active'::public.user_status,
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    phone TEXT,
    avatar_url TEXT,
    country TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category public.task_category NOT NULL,
    reward_amount DECIMAL(8,2) NOT NULL,
    total_slots INTEGER DEFAULT 100,
    completed_slots INTEGER DEFAULT 0,
    requirements JSONB,
    external_url TEXT,
    status public.task_status DEFAULT 'pending'::public.task_status,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Task submissions table
CREATE TABLE public.task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    proof_text TEXT,
    proof_urls TEXT[],
    status public.proof_status DEFAULT 'pending'::public.proof_status,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, user_id)
);

-- 5. Transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type public.transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status public.transaction_status DEFAULT 'pending'::public.transaction_status,
    description TEXT,
    reference_id UUID,
    reference_type TEXT,
    withdrawal_method public.withdrawal_method,
    withdrawal_address TEXT,
    admin_notes TEXT,
    processed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ
);

-- 6. Referrals table
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    bonus_amount DECIMAL(8,2) DEFAULT 0.00,
    is_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(referrer_id, referred_id)
);

-- 7. Daily spin rewards table
CREATE TABLE public.daily_spin_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    reward_amount DECIMAL(8,2) NOT NULL,
    spin_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, spin_date)
);

-- 8. Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_referral_code ON public.user_profiles(referral_code);
CREATE INDEX idx_tasks_category ON public.tasks(category);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_task_submissions_task_id ON public.task_submissions(task_id);
CREATE INDEX idx_task_submissions_user_id ON public.task_submissions(user_id);
CREATE INDEX idx_task_submissions_status ON public.task_submissions(status);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX idx_daily_spin_rewards_user_id ON public.daily_spin_rewards(user_id);
CREATE INDEX idx_daily_spin_rewards_spin_date ON public.daily_spin_rewards(spin_date);

-- 9. Functions (MUST BE BEFORE RLS POLICIES)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    referral_code_text TEXT;
BEGIN
    -- Generate unique referral code
    referral_code_text := UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8));
    
    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name, 
        role,
        referral_code
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role),
        referral_code_text
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

-- 10. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_spin_rewards ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies

-- Pattern 1: Core user table (user_profiles) - Simple only, no functions
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin access to all user profiles
CREATE POLICY "admin_full_access_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 4: Public read, private write for tasks
CREATE POLICY "public_can_read_tasks"
ON public.tasks
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_all_tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 2: Simple user ownership for task submissions
CREATE POLICY "users_manage_own_task_submissions"
ON public.task_submissions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_manage_all_task_submissions"
ON public.task_submissions
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 2: Simple user ownership for transactions
CREATE POLICY "users_view_own_transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admin_manage_all_transactions"
ON public.transactions
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 2: Referrals access
CREATE POLICY "users_view_own_referrals"
ON public.referrals
FOR SELECT
TO authenticated
USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "admin_manage_all_referrals"
ON public.referrals
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 2: Daily spin rewards
CREATE POLICY "users_manage_own_daily_spin_rewards"
ON public.daily_spin_rewards
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_manage_all_daily_spin_rewards"
ON public.daily_spin_rewards
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- 12. Triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. Mock Data
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user1_uuid UUID := gen_random_uuid();
    user2_uuid UUID := gen_random_uuid();
    task1_uuid UUID := gen_random_uuid();
    task2_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    -- **ALWAYS include all fields for auth.users** All of them even the null. Without it the user will not be able to signin.
    -- Use the mock credential like email and password which is available in the code.
    -- Always display these users into the Login form with email and password
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@promohive.com', crypt('Admin123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'user@promohive.com', crypt('User123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "John Doe", "role": "user"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'john.doe@promohive.com', crypt('John123!', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "John Doe", "role": "user"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create sample tasks
    INSERT INTO public.tasks (id, title, description, category, reward_amount, total_slots, created_by) VALUES
        (task1_uuid, 'Follow our Instagram account', 'Follow @promohive on Instagram and like our latest post', 'social_media'::public.task_category, 2.50, 1000, admin_uuid),
        (task2_uuid, 'Complete Survey about Mobile Apps', 'Answer 10 questions about your mobile app usage preferences', 'survey'::public.task_category, 5.00, 500, admin_uuid);

    -- Create sample transactions
    INSERT INTO public.transactions (user_id, type, amount, status, description) VALUES
        (user1_uuid, 'earning'::public.transaction_type, 2.50, 'completed'::public.transaction_status, 'Task completion reward'),
        (user2_uuid, 'earning'::public.transaction_type, 5.00, 'completed'::public.transaction_status, 'Survey completion reward');

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;