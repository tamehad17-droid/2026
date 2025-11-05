-- COMPLETE SETUP: domain, email, oauth credentials
-- Run this in Supabase SQL Editor

-- Add domain and support email
INSERT INTO admin_settings (key, value, updated_by, updated_at)
VALUES
  ('primary_domain', 'globalpromonetwork.online', NULL, now()),
  ('support_email', 'promohive@globalpromonetwork.online', NULL, now())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Add Google OAuth credentials (optional - better to set in Supabase Auth Provider UI)
INSERT INTO admin_settings (key, value, updated_by, updated_at)
VALUES
  ('google_client_id', '644208766267-j4r6pvau4l6kv1m75q1ebv5absdlidvi.apps.googleusercontent.com', NULL, now())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Add system settings
INSERT INTO admin_settings (key, value, updated_by, updated_at)
VALUES
  ('smtp_host', 'smtp.hostinger.com', NULL, now()),
  ('smtp_port', '465', NULL, now()),
  ('smtp_secure', 'true', NULL, now())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Verify settings are applied
SELECT key, value, updated_at 
FROM admin_settings 
WHERE key IN (
  'primary_domain',
  'support_email',
  'google_client_id',
  'smtp_host',
  'smtp_port',
  'smtp_secure'
)
ORDER BY key;