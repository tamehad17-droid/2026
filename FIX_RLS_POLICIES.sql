-- ✅ FIX RLS POLICIES FOR email_verification_codes TABLE
-- Run in: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql/new

-- Step 1: Enable RLS on the table
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can insert their own verification codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Users can view their own verification codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Users can update their own verification codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Allow anon to insert codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Allow authenticated to insert codes" ON public.email_verification_codes;

-- Step 3: Create policies for authenticated users
CREATE POLICY "Authenticated users can insert verification codes"
ON public.email_verification_codes
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can view their own codes"
ON public.email_verification_codes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own codes"
ON public.email_verification_codes
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 4: CRITICAL - Allow anonymous users (for registration before auth)
CREATE POLICY "Anonymous users can insert codes during registration"
ON public.email_verification_codes
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anonymous users can view codes by email"
ON public.email_verification_codes
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anonymous users can update codes"
ON public.email_verification_codes
FOR UPDATE
TO anon
USING (true);

-- Step 5: Grant table permissions
GRANT SELECT, INSERT, UPDATE ON TABLE public.email_verification_codes TO anon, authenticated, service_role;

-- Step 6: Check user_profiles RLS policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow user registration" ON public.user_profiles;

-- Create new policies
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow profile creation during registration"
ON public.user_profiles
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_profiles TO anon, authenticated, service_role;

-- Step 7: Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('email_verification_codes', 'user_profiles')
ORDER BY tablename, policyname;

-- Success message
SELECT '✅ RLS Policies created successfully!' as status;
SELECT '✅ Anonymous users can now insert/read verification codes' as anon_status;
SELECT '✅ Authenticated users can access their own data' as auth_status;
