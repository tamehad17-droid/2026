-- ✅ RUN THIS TO VERIFY FUNCTIONS EXIST
-- https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql/new

-- Check if functions exist
SELECT 
    routine_name,
    routine_type,
    routine_schema,
    data_type as return_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'create_verification_code',
    'verify_email_code',
    'generate_verification_code'
)
ORDER BY routine_name;

-- Check function parameters
SELECT 
    r.routine_name,
    p.parameter_name,
    p.data_type,
    p.parameter_mode
FROM information_schema.routines r
LEFT JOIN information_schema.parameters p 
    ON r.specific_name = p.specific_name
WHERE r.routine_schema = 'public'
AND r.routine_name = 'create_verification_code'
ORDER BY p.ordinal_position;

-- Check permissions
SELECT 
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
AND routine_name IN (
    'create_verification_code',
    'verify_email_code',
    'generate_verification_code'
)
ORDER BY routine_name, grantee;

-- Force PostgREST reload (multiple times)
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

SELECT '✅ Functions verified and PostgREST notified!' as status;
