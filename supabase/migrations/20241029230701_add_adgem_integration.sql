-- Location: supabase/migrations/20241029230701_add_adgem_integration.sql
-- Schema Analysis: Tasks system with task_category enum, user_profiles with levels, level_plans exists
-- Integration Type: Extension - Adding AdGem integration with level-based rewards
-- Dependencies: tasks, user_profiles, level_plans tables

-- 1. Add 'adgem' to task_category enum if not present
ALTER TYPE public.task_category ADD VALUE IF NOT EXISTS 'adgem';

-- 2. Create table for AdGem offers (external offers from AdGem)
CREATE TABLE public.adgem_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    real_value NUMERIC(10,2) NOT NULL, -- Real payout value (hidden from users)
    currency TEXT DEFAULT 'USD',
    countries TEXT[], -- Supported countries
    device_types TEXT[], -- mobile, desktop, tablet
    category TEXT,
    external_url TEXT NOT NULL,
    requirements JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create level reward configuration table
CREATE TABLE public.level_reward_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level INTEGER NOT NULL UNIQUE,
    reward_percentage NUMERIC(5,2) NOT NULL, -- Percentage of real value user gets
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Add essential indexes
CREATE INDEX idx_adgem_offers_external_id ON public.adgem_offers(external_id);
CREATE INDEX idx_adgem_offers_is_active ON public.adgem_offers(is_active);
CREATE INDEX idx_level_reward_config_level ON public.level_reward_config(level);

-- 5. Create function to calculate user reward based on level
CREATE OR REPLACE FUNCTION public.calculate_user_reward(real_amount NUMERIC, user_level INTEGER)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    CASE 
        WHEN user_level = 0 THEN real_amount * 0.10  -- 10% for level 0
        WHEN user_level = 1 THEN real_amount * 0.25  -- 25% for level 1
        WHEN user_level = 2 THEN real_amount * 0.40  -- 40% for level 2
        WHEN user_level = 3 THEN real_amount * 0.55  -- 55% for level 3
        WHEN user_level = 4 THEN real_amount * 0.70  -- 70% for level 4
        WHEN user_level >= 5 THEN real_amount * 0.85 -- 85% for level 5+
        ELSE real_amount * 0.10 -- Default to 10% for unknown levels
    END;
$$;

-- 6. Create function to get user's display reward for AdGem offers
CREATE OR REPLACE FUNCTION public.get_user_display_reward(offer_real_value NUMERIC, user_uuid UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT public.calculate_user_reward(
    offer_real_value,
    COALESCE((SELECT level FROM public.user_profiles WHERE id = user_uuid), 0)
);
$$;

-- 7. Enable RLS on new tables
ALTER TABLE public.adgem_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_reward_config ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies

-- AdGem offers - public read, admin manage
CREATE POLICY "public_can_read_adgem_offers"
ON public.adgem_offers
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admin_manage_adgem_offers"
ON public.adgem_offers
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Level reward config - public read, admin manage
CREATE POLICY "public_can_read_level_reward_config"
ON public.level_reward_config
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_level_reward_config"
ON public.level_reward_config
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- 9. Insert default level reward configuration
INSERT INTO public.level_reward_config (level, reward_percentage) VALUES
    (0, 10.00),
    (1, 25.00),
    (2, 40.00),
    (3, 55.00),
    (4, 70.00),
    (5, 85.00)
ON CONFLICT (level) DO NOTHING;

-- 10. Create sample AdGem offers
DO $$
BEGIN
    INSERT INTO public.adgem_offers (external_id, title, description, real_value, currency, countries, device_types, category, external_url, requirements) VALUES
        ('adgem_001', 'Download Gaming App', 'Download and play this exciting mobile game for 5 minutes', 5.00, 'USD', ARRAY['US', 'CA', 'UK'], ARRAY['mobile'], 'gaming', 'https://adgem-example.com/offer/001', '{"min_play_time": 300, "level_required": 3}'),
        ('adgem_002', 'Survey: Shopping Habits', 'Complete a 10-minute survey about your shopping preferences', 3.50, 'USD', ARRAY['US', 'CA', 'UK', 'AU'], ARRAY['mobile', 'desktop'], 'survey', 'https://adgem-example.com/offer/002', '{"estimated_time": 600, "questions": 15}'),
        ('adgem_003', 'Install Finance App', 'Download and register for this financial tracking app', 8.00, 'USD', ARRAY['US', 'CA'], ARRAY['mobile'], 'finance', 'https://adgem-example.com/offer/003', '{"registration_required": true, "verification_needed": true}'),
        ('adgem_004', 'Watch Video Series', 'Watch 3 promotional videos and rate them', 2.25, 'USD', ARRAY['US', 'CA', 'UK', 'AU', 'DE'], ARRAY['mobile', 'desktop', 'tablet'], 'entertainment', 'https://adgem-example.com/offer/004', '{"videos_count": 3, "rating_required": true}'),
        ('adgem_005', 'Casino Game Trial', 'Try this new casino game and play for 10 minutes', 12.00, 'USD', ARRAY['US', 'CA', 'UK'], ARRAY['mobile', 'desktop'], 'casino', 'https://adgem-example.com/offer/005', '{"min_play_time": 600, "age_verification": "21+"}'::jsonb);
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Some AdGem offers already exist, skipping duplicates';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting AdGem offers: %', SQLERRM;
END $$;