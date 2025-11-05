-- Create ad_revenues table for tracking advertising revenue
CREATE TABLE IF NOT EXISTS ad_revenues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'adsterra' or 'adgem'
    ad_type VARCHAR(50), -- 'banner', 'native', 'video', 'offerwall', 'survey', 'game'
    placement VARCHAR(100), -- 'header', 'sidebar', 'content', 'footer', etc.
    offer_id VARCHAR(255), -- For AdGem offers
    offer_name TEXT, -- For AdGem offers
    base_revenue DECIMAL(10, 6) DEFAULT 0, -- Actual revenue from platform
    user_share DECIMAL(5, 4) DEFAULT 0, -- User's share percentage (0.10 = 10%)
    user_earnings DECIMAL(10, 6) DEFAULT 0, -- Amount user earned
    user_level INTEGER DEFAULT 0, -- User level at time of earning
    event_type VARCHAR(20) NOT NULL, -- 'view', 'click', 'completion'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ad_revenues_user_id ON ad_revenues(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_revenues_platform ON ad_revenues(platform);
CREATE INDEX IF NOT EXISTS idx_ad_revenues_created_at ON ad_revenues(created_at);
CREATE INDEX IF NOT EXISTS idx_ad_revenues_event_type ON ad_revenues(event_type);
CREATE INDEX IF NOT EXISTS idx_ad_revenues_user_level ON ad_revenues(user_level);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ad_revenues_user_platform ON ad_revenues(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_ad_revenues_platform_date ON ad_revenues(platform, created_at);

-- Enable Row Level Security
ALTER TABLE ad_revenues ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own ad revenue records
CREATE POLICY "Users can view own ad revenues" ON ad_revenues
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own ad revenue records (for tracking)
CREATE POLICY "Users can insert own ad revenues" ON ad_revenues
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all ad revenue records
CREATE POLICY "Admins can view all ad revenues" ON ad_revenues
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- Admins can insert ad revenue records for any user
CREATE POLICY "Admins can insert ad revenues" ON ad_revenues
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- Admins can update ad revenue records
CREATE POLICY "Admins can update ad revenues" ON ad_revenues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ad_revenues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_ad_revenues_updated_at_trigger
    BEFORE UPDATE ON ad_revenues
    FOR EACH ROW
    EXECUTE FUNCTION update_ad_revenues_updated_at();

-- Create view for admin revenue summary
CREATE OR REPLACE VIEW admin_revenue_summary AS
SELECT 
    platform,
    DATE(created_at) as date,
    COUNT(*) as total_events,
    COUNT(CASE WHEN event_type = 'view' THEN 1 END) as total_views,
    COUNT(CASE WHEN event_type = 'click' THEN 1 END) as total_clicks,
    COUNT(CASE WHEN event_type = 'completion' THEN 1 END) as total_completions,
    SUM(base_revenue) as total_base_revenue,
    SUM(user_earnings) as total_user_earnings,
    SUM(base_revenue) - SUM(user_earnings) as admin_revenue,
    AVG(user_share) as avg_user_share
FROM ad_revenues
GROUP BY platform, DATE(created_at)
ORDER BY date DESC, platform;

-- Grant access to the view for admins
GRANT SELECT ON admin_revenue_summary TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Admins can view revenue summary" ON admin_revenue_summary
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- Create function to get user ad stats
CREATE OR REPLACE FUNCTION get_user_ad_stats(
    target_user_id UUID,
    days_back INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'totalEarnings', COALESCE(SUM(user_earnings), 0),
        'totalViews', COUNT(CASE WHEN event_type = 'view' THEN 1 END),
        'totalClicks', COUNT(CASE WHEN event_type = 'click' THEN 1 END),
        'totalCompletions', COUNT(CASE WHEN event_type = 'completion' THEN 1 END),
        'byPlatform', json_build_object(
            'adsterra', json_build_object(
                'earnings', COALESCE(SUM(CASE WHEN platform = 'adsterra' THEN user_earnings ELSE 0 END), 0),
                'views', COUNT(CASE WHEN platform = 'adsterra' AND event_type = 'view' THEN 1 END)
            ),
            'adgem', json_build_object(
                'earnings', COALESCE(SUM(CASE WHEN platform = 'adgem' THEN user_earnings ELSE 0 END), 0),
                'completions', COUNT(CASE WHEN platform = 'adgem' AND event_type = 'completion' THEN 1 END)
            )
        )
    ) INTO result
    FROM ad_revenues
    WHERE user_id = target_user_id
    AND created_at >= NOW() - INTERVAL '1 day' * days_back;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_ad_stats(UUID, INTEGER) TO authenticated;

-- Create function to get admin revenue overview
CREATE OR REPLACE FUNCTION get_admin_revenue_overview(
    days_back INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    SELECT json_build_object(
        'totalBaseRevenue', COALESCE(SUM(base_revenue), 0),
        'totalUserEarnings', COALESCE(SUM(user_earnings), 0),
        'adminRevenue', COALESCE(SUM(base_revenue) - SUM(user_earnings), 0),
        'totalViews', COUNT(CASE WHEN event_type = 'view' THEN 1 END),
        'totalClicks', COUNT(CASE WHEN event_type = 'click' THEN 1 END),
        'totalCompletions', COUNT(CASE WHEN event_type = 'completion' THEN 1 END),
        'byPlatform', json_build_object(
            'adsterra', json_build_object(
                'baseRevenue', COALESCE(SUM(CASE WHEN platform = 'adsterra' THEN base_revenue ELSE 0 END), 0),
                'userEarnings', COALESCE(SUM(CASE WHEN platform = 'adsterra' THEN user_earnings ELSE 0 END), 0),
                'views', COUNT(CASE WHEN platform = 'adsterra' AND event_type = 'view' THEN 1 END)
            ),
            'adgem', json_build_object(
                'baseRevenue', COALESCE(SUM(CASE WHEN platform = 'adgem' THEN base_revenue ELSE 0 END), 0),
                'userEarnings', COALESCE(SUM(CASE WHEN platform = 'adgem' THEN user_earnings ELSE 0 END), 0),
                'completions', COUNT(CASE WHEN platform = 'adgem' AND event_type = 'completion' THEN 1 END)
            )
        )
    ) INTO result
    FROM ad_revenues
    WHERE created_at >= NOW() - INTERVAL '1 day' * days_back;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (function handles admin check internally)
GRANT EXECUTE ON FUNCTION get_admin_revenue_overview(INTEGER) TO authenticated;
