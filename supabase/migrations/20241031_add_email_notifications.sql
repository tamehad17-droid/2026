-- ============================================================================
-- PromoHive - Email Notifications System Migration
-- Version: 2.0 (Fixed and Enhanced)
-- Date: 2024-10-31
-- Description: Complete email notification system with SMTP and templates
-- ============================================================================

-- ============================================================================
-- 1. CREATE EMAIL TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_email_templates_key ON public.email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.email_templates(is_active);

-- ============================================================================
-- 2. CREATE EMAIL LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    template_key TEXT,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_email_status CHECK (status IN ('pending', 'sent', 'failed'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_key ON public.email_logs(template_key);

-- ============================================================================
-- 3. RLS POLICIES
-- ============================================================================

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email templates
DROP POLICY IF EXISTS "admins_manage_email_templates" ON public.email_templates;
CREATE POLICY "admins_manage_email_templates"
ON public.email_templates FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
);

-- Users can view their own email logs
DROP POLICY IF EXISTS "users_view_own_email_logs" ON public.email_logs;
CREATE POLICY "users_view_own_email_logs"
ON public.email_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all email logs
DROP POLICY IF EXISTS "admins_view_all_email_logs" ON public.email_logs;
CREATE POLICY "admins_view_all_email_logs"
ON public.email_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
);

-- ============================================================================
-- 4. INSERT EMAIL TEMPLATES (ENGLISH)
-- ============================================================================

INSERT INTO public.email_templates (template_key, subject, body_html, body_text, variables) VALUES
(
    'welcome_approved',
    'Welcome to PromoHive - Your Account is Activated!',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #4F46E5; text-align: center;">Welcome to PromoHive! 🎉</h1>
            <p style="font-size: 16px; color: #333;">Dear <strong>{{username}}</strong>,</p>
            <p style="font-size: 16px; color: #333;">We are excited to have you join PromoHive platform!</p>
            <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px; color: #059669;">✅ <strong>Your account has been activated successfully!</strong></p>
            </div>
            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px; color: #D97706;">🎁 <strong>Welcome Bonus: $5.00</strong></p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #92400E;">A welcome bonus has been added to your wallet!</p>
            </div>
            <p style="font-size: 16px; color: #333;">You can now login and start earning money by completing available tasks.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{login_url}}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">Login Now</a>
            </div>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
            <p style="font-size: 14px; color: #6B7280; text-align: center;">If you have any questions, feel free to contact us</p>
            <p style="font-size: 14px; color: #6B7280; text-align: center;">
                📧 <a href="mailto:{{support_email}}" style="color: #4F46E5;">{{support_email}}</a><br>
                📱 <a href="https://wa.me/{{support_phone}}" style="color: #4F46E5;">{{support_phone}}</a>
            </p>
        </div>
    </div>',
    'Welcome to PromoHive!\n\nDear {{username}},\n\nWe are excited to have you join PromoHive!\n\n✅ Your account has been activated successfully!\n🎁 Welcome Bonus: $5.00\n\nYou can now login and start earning money.\n\nLogin URL: {{login_url}}\n\nSupport:\nEmail: {{support_email}}\nPhone: {{support_phone}}',
    '["username", "login_url", "support_email", "support_phone"]'::jsonb
),
(
    'task_approved',
    'Task Approved - Balance Credited',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #10B981; text-align: center;">Task Approved! ✅</h1>
            <p style="font-size: 16px; color: #333;">Dear <strong>{{username}}</strong>,</p>
            <p style="font-size: 16px; color: #333;">Your submitted task has been reviewed and approved:</p>
            <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px;"><strong>Task:</strong> {{task_title}}</p>
                <p style="margin: 10px 0 0 0; font-size: 18px; color: #059669;"><strong>Reward:</strong> ${{amount}}</p>
            </div>
            <p style="font-size: 16px; color: #333;">The amount has been added to your wallet and you can withdraw it anytime.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{wallet_url}}" style="display: inline-block; background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">View Wallet</a>
            </div>
        </div>
    </div>',
    'Task Approved!\n\nDear {{username}},\n\nYour task has been approved: {{task_title}}\nReward: ${{amount}}\n\nThe amount has been added to your wallet.\n\nWallet URL: {{wallet_url}}',
    '["username", "task_title", "amount", "wallet_url"]'::jsonb
),
(
    'task_rejected',
    'Task Rejected',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #EF4444; text-align: center;">Task Rejected ❌</h1>
            <p style="font-size: 16px; color: #333;">Dear <strong>{{username}}</strong>,</p>
            <p style="font-size: 16px; color: #333;">Unfortunately, your submitted task has been rejected:</p>
            <div style="background-color: #FEE2E2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px;"><strong>Task:</strong> {{task_title}}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #991B1B;"><strong>Reason:</strong> {{rejection_reason}}</p>
            </div>
            <p style="font-size: 16px; color: #333;">You can try again or contact support for more information.</p>
        </div>
    </div>',
    'Task Rejected\n\nDear {{username}},\n\nYour task has been rejected: {{task_title}}\nReason: {{rejection_reason}}\n\nYou can try again or contact support.',
    '["username", "task_title", "rejection_reason"]'::jsonb
),
(
    'withdrawal_approved',
    'Withdrawal Approved',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #10B981; text-align: center;">Withdrawal Approved! ✅</h1>
            <p style="font-size: 16px; color: #333;">Dear <strong>{{username}}</strong>,</p>
            <p style="font-size: 16px; color: #333;">Your withdrawal request has been processed successfully:</p>
            <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 18px;"><strong>Amount:</strong> ${{amount}}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>Network:</strong> {{network}}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>Address:</strong> {{usdt_address}}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>TX Hash:</strong> {{tx_hash}}</p>
            </div>
            <p style="font-size: 16px; color: #333;">The amount has been sent to your USDT address.</p>
        </div>
    </div>',
    'Withdrawal Approved!\n\nDear {{username}},\n\nAmount: ${{amount}}\nNetwork: {{network}}\nAddress: {{usdt_address}}\nTX Hash: {{tx_hash}}\n\nThe amount has been sent successfully.',
    '["username", "amount", "network", "usdt_address", "tx_hash"]'::jsonb
),
(
    'withdrawal_rejected',
    'Withdrawal Rejected',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #EF4444; text-align: center;">Withdrawal Rejected ❌</h1>
            <p style="font-size: 16px; color: #333;">Dear <strong>{{username}}</strong>,</p>
            <p style="font-size: 16px; color: #333;">Unfortunately, your withdrawal request has been rejected:</p>
            <div style="background-color: #FEE2E2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 18px;"><strong>Amount:</strong> ${{amount}}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #991B1B;"><strong>Reason:</strong> {{rejection_reason}}</p>
            </div>
            <p style="font-size: 16px; color: #333;">The amount has been returned to your wallet. You can contact support for more information.</p>
        </div>
    </div>',
    'Withdrawal Rejected\n\nDear {{username}},\n\nAmount: ${{amount}}\nReason: {{rejection_reason}}\n\nThe amount has been returned to your wallet.',
    '["username", "amount", "rejection_reason"]'::jsonb
),
(
    'deposit_verified',
    'Deposit Confirmed',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #10B981; text-align: center;">Deposit Confirmed! ✅</h1>
            <p style="font-size: 16px; color: #333;">Dear <strong>{{username}}</strong>,</p>
            <p style="font-size: 16px; color: #333;">Your deposit has been confirmed successfully:</p>
            <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 18px;"><strong>Amount:</strong> ${{amount}}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px;"><strong>Network:</strong> {{network}}</p>
            </div>
            <p style="font-size: 16px; color: #333;">The amount has been added to your wallet and you can use it now.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{wallet_url}}" style="display: inline-block; background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">View Wallet</a>
            </div>
        </div>
    </div>',
    'Deposit Confirmed!\n\nDear {{username}},\n\nAmount: ${{amount}}\nNetwork: {{network}}\n\nThe amount has been added to your wallet.\n\nWallet URL: {{wallet_url}}',
    '["username", "amount", "network", "wallet_url"]'::jsonb
)
ON CONFLICT (template_key) DO UPDATE SET
    subject = EXCLUDED.subject,
    body_html = EXCLUDED.body_html,
    body_text = EXCLUDED.body_text,
    variables = EXCLUDED.variables,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 5. UPDATE ADMIN SETTINGS WITH SMTP
-- ============================================================================

-- Add or update SMTP settings
INSERT INTO public.admin_settings (key, value, description, category, data_type, is_public) VALUES
    ('smtp_host', 'smtp.hostinger.com', 'SMTP server host', 'email', 'string', false),
    ('smtp_port', '465', 'SMTP server port', 'email', 'number', false),
    ('smtp_secure', 'true', 'Use SSL/TLS for SMTP', 'email', 'boolean', false),
    ('smtp_user', 'promohive@globalpromonetwork.store', 'SMTP username/email', 'email', 'string', false),
    ('smtp_password', 'PromoHive@2025!', 'SMTP password', 'email', 'string', false),
    ('smtp_from', 'promohive@globalpromonetwork.store', 'Email from address', 'email', 'string', false),
    ('smtp_from_name', 'PromoHive', 'Email from name', 'email', 'string', false),
    ('customer_service_phone', '+17253348692', 'Customer service WhatsApp number', 'support', 'string', true),
    ('customer_service_email', 'promohive@globalpromonetwork.store', 'Customer service email', 'support', 'string', true)
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 6. COMMENTS
-- ============================================================================

COMMENT ON TABLE public.email_templates IS 'Email templates for automated notifications';
COMMENT ON TABLE public.email_logs IS 'Log of all sent emails';
COMMENT ON COLUMN public.email_templates.variables IS 'JSON array of available template variables';
COMMENT ON COLUMN public.email_logs.status IS 'Email status: pending, sent, failed';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
