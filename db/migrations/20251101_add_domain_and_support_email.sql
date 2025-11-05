-- Migration: add primary_domain and support_email to admin_settings
-- Run this in your database (psql / Supabase SQL editor) or apply via migrations.

INSERT INTO admin_settings (key, value, updated_by, updated_at)
VALUES
  ('primary_domain', 'globalpromonetwork.online', NULL, now())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO admin_settings (key, value, updated_by, updated_at)
VALUES
  ('support_email', 'promohive@globalpromonetwork.online', NULL, now())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
