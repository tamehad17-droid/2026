-- Fix spin wheel process_spin function
CREATE OR REPLACE FUNCTION public.process_spin(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    can_spin BOOLEAN;
    prize_amount NUMERIC;
    max_daily NUMERIC;
    total_today NUMERIC;
    result JSONB;
    current_status TEXT;
BEGIN
    -- Check if user exists and is approved
    SELECT status INTO current_status
    FROM public.user_profiles
    WHERE id = p_user_id;
    
    IF current_status IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    IF current_status != 'approved' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Account not approved'
        );
    END IF;

    -- Check if user can spin
    SELECT public.can_spin_today(p_user_id) INTO can_spin;
    
    IF NOT can_spin THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Already spun today'
        );
    END IF;
    
    -- Get max daily reward with explicit error handling
    BEGIN
        SELECT CAST(value AS NUMERIC) INTO STRICT max_daily
        FROM public.admin_settings
        WHERE key = 'max_daily_spin_reward';
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'System configuration error'
            );
    END;
    
    -- Calculate total already won today
    SELECT COALESCE(SUM(prize_amount), 0) INTO total_today
    FROM public.spin_prizes
    WHERE user_id = p_user_id
    AND spin_date = CURRENT_DATE;
    
    -- Don't allow spin if max daily reached
    IF total_today >= max_daily THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Daily limit reached'
        );
    END IF;
    
    -- Generate random prize (0.05 to 0.30)
    prize_amount := (FLOOR(RANDOM() * 6) + 1) * 0.05;
    
    -- Ensure doesn't exceed daily max
    IF (total_today + prize_amount) > max_daily THEN
        prize_amount := max_daily - total_today;
    END IF;
    
    -- Ensure minimum 0.05
    IF prize_amount < 0.05 THEN
        prize_amount := 0.05;
    END IF;
    
    -- Use transaction to ensure all or nothing
    BEGIN
        -- Record spin
        INSERT INTO public.spin_prizes (user_id, prize_amount, spin_date)
        VALUES (p_user_id, prize_amount, CURRENT_DATE);
        
        -- Add to wallet
        PERFORM public.update_wallet_balance(p_user_id, prize_amount, 'add', 'bonuses');
        
        -- Create transaction record
        INSERT INTO public.transactions (
            user_id,
            type,
            amount,
            description,
            status
        ) VALUES (
            p_user_id,
            'spin_reward',
            prize_amount,
            'Daily Spin Wheel Reward',
            'completed'
        );
    EXCEPTION
        WHEN OTHERS THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Failed to process spin reward'
            );
    END;
    
    RETURN jsonb_build_object(
        'success', true,
        'prize', prize_amount,
        'message', 'Congratulations! You won $' || prize_amount::TEXT,
        'remainingToday', max_daily - (total_today + prize_amount)
    );
END;
$$;