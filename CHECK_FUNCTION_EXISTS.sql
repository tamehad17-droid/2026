-- ✅ Run this in Supabase SQL Editor to verify functions exist
-- https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql/new

-- Check if functions exist
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'create_verification_code',
    'verify_email_code',
    'generate_verification_code'
)
ORDER BY routine_name;

-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'email_verification_codes'
) as table_exists;

-- If above returns empty, the functions are missing!
-- If functions exist but still getting error, run this:

-- Force refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Grant execute permissions (important!)
GRANT EXECUTE ON FUNCTION public.create_verification_code(TEXT, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_email_code(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_verification_code() TO anon, authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON TABLE public.email_verification_codes TO anon, authenticated;

SELECT '✅ Permissions granted and schema refreshed!' as status;
