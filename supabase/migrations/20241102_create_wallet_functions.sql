-- Create wallet update function
CREATE OR REPLACE FUNCTION update_user_wallet(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_transaction_type TEXT DEFAULT 'ADGEM_OFFER_COMPLETION'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  wallet_exists BOOLEAN;
BEGIN
  -- Check if wallet exists
  SELECT EXISTS(
    SELECT 1 FROM wallets WHERE user_id = p_user_id
  ) INTO wallet_exists;
  
  -- Create wallet if it doesn't exist
  IF NOT wallet_exists THEN
    INSERT INTO wallets (user_id, balance, pending_balance, total_earned, total_withdrawn)
    VALUES (p_user_id, 0, 0, 0, 0);
  END IF;
  
  -- Update wallet balance and total earned
  UPDATE wallets 
  SET 
    balance = balance + p_amount,
    total_earned = total_earned + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to update wallet: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Create function to get user ad statistics
CREATE OR REPLACE FUNCTION get_user_ad_stats(
  p_user_id UUID,
  p_period TEXT DEFAULT '30d'
)
RETURNS TABLE(
  total_earnings DECIMAL(10,2),
  total_conversions BIGINT,
  adsterra_earnings DECIMAL(10,2),
  adgem_earnings DECIMAL(10,2),
  avg_daily_earnings DECIMAL(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  days_back INTEGER;
BEGIN
  -- Determine days based on period
  CASE p_period
    WHEN '7d' THEN days_back := 7;
    WHEN '30d' THEN days_back := 30;
    WHEN '90d' THEN days_back := 90;
    ELSE days_back := 30;
  END CASE;
  
  RETURN QUERY
  SELECT 
    COALESCE(SUM(user_earnings), 0) as total_earnings,
    COUNT(*) as total_conversions,
    COALESCE(SUM(CASE WHEN platform = 'adsterra' THEN user_earnings ELSE 0 END), 0) as adsterra_earnings,
    COALESCE(SUM(CASE WHEN platform = 'adgem' THEN user_earnings ELSE 0 END), 0) as adgem_earnings,
    COALESCE(SUM(user_earnings) / days_back, 0) as avg_daily_earnings
  FROM ad_revenues 
  WHERE user_id = p_user_id 
    AND created_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$$;

-- Create function to get admin revenue overview
CREATE OR REPLACE FUNCTION get_admin_revenue_overview(
  p_period TEXT DEFAULT '30d'
)
RETURNS TABLE(
  total_revenue DECIMAL(10,2),
  total_user_earnings DECIMAL(10,2),
  total_conversions BIGINT,
  adsterra_revenue DECIMAL(10,2),
  adgem_revenue DECIMAL(10,2),
  profit_margin DECIMAL(10,2),
  avg_daily_revenue DECIMAL(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  days_back INTEGER;
BEGIN
  -- Determine days based on period
  CASE p_period
    WHEN '7d' THEN days_back := 7;
    WHEN '30d' THEN days_back := 30;
    WHEN '90d' THEN days_back := 90;
    ELSE days_back := 30;
  END CASE;
  
  RETURN QUERY
  SELECT 
    COALESCE(SUM(base_revenue), 0) as total_revenue,
    COALESCE(SUM(user_earnings), 0) as total_user_earnings,
    COUNT(*) as total_conversions,
    COALESCE(SUM(CASE WHEN platform = 'adsterra' THEN base_revenue ELSE 0 END), 0) as adsterra_revenue,
    COALESCE(SUM(CASE WHEN platform = 'adgem' THEN base_revenue ELSE 0 END), 0) as adgem_revenue,
    COALESCE((SUM(base_revenue) - SUM(user_earnings)) / NULLIF(SUM(base_revenue), 0) * 100, 0) as profit_margin,
    COALESCE(SUM(base_revenue) / days_back, 0) as avg_daily_revenue
  FROM ad_revenues 
  WHERE created_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$$;

-- Create function to get daily revenue chart data
CREATE OR REPLACE FUNCTION get_daily_revenue_chart(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  date DATE,
  total_revenue DECIMAL(10,2),
  user_earnings DECIMAL(10,2),
  adsterra_revenue DECIMAL(10,2),
  adgem_revenue DECIMAL(10,2),
  conversions BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '1 day' * (p_days - 1),
      CURRENT_DATE,
      INTERVAL '1 day'
    )::DATE as date
  )
  SELECT 
    ds.date,
    COALESCE(SUM(ar.base_revenue), 0) as total_revenue,
    COALESCE(SUM(ar.user_earnings), 0) as user_earnings,
    COALESCE(SUM(CASE WHEN ar.platform = 'adsterra' THEN ar.base_revenue ELSE 0 END), 0) as adsterra_revenue,
    COALESCE(SUM(CASE WHEN ar.platform = 'adgem' THEN ar.base_revenue ELSE 0 END), 0) as adgem_revenue,
    COALESCE(COUNT(ar.id), 0) as conversions
  FROM date_series ds
  LEFT JOIN ad_revenues ar ON DATE(ar.created_at) = ds.date
  GROUP BY ds.date
  ORDER BY ds.date;
END;
$$;

-- Create function to get user level distribution
CREATE OR REPLACE FUNCTION get_user_level_distribution()
RETURNS TABLE(
  user_level INTEGER,
  user_count BIGINT,
  total_earnings DECIMAL(10,2),
  avg_earnings_per_user DECIMAL(10,2),
  percentage DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_users BIGINT;
BEGIN
  -- Get total user count
  SELECT COUNT(*) INTO total_users FROM users;
  
  RETURN QUERY
  WITH level_stats AS (
    SELECT 
      u.level,
      COUNT(u.id) as user_count,
      COALESCE(SUM(ar.user_earnings), 0) as total_earnings
    FROM users u
    LEFT JOIN ad_revenues ar ON u.id = ar.user_id
    GROUP BY u.level
  )
  SELECT 
    ls.level as user_level,
    ls.user_count,
    ls.total_earnings,
    CASE 
      WHEN ls.user_count > 0 THEN ls.total_earnings / ls.user_count 
      ELSE 0 
    END as avg_earnings_per_user,
    CASE 
      WHEN total_users > 0 THEN (ls.user_count::DECIMAL / total_users * 100)
      ELSE 0 
    END as percentage
  FROM level_stats ls
  ORDER BY ls.level;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_user_wallet(UUID, DECIMAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_ad_stats(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_revenue_overview(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_revenue_chart(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_level_distribution() TO authenticated;
