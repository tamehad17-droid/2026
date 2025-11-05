-- Update user level (admin only)
CREATE OR REPLACE FUNCTION public.update_user_level(target_user_id UUID, admin_id UUID, new_level INT, admin_note TEXT DEFAULT '')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin BOOLEAN;
    old_level INT;
    updated_user RECORD;
BEGIN
    -- Check if admin has permission
    SELECT EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = admin_id 
        AND (au.raw_user_meta_data->>'role' = 'admin' 
             OR au.raw_user_meta_data->>'role' = 'super_admin')
    ) INTO is_admin;
    
    IF NOT is_admin THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No permission: Admin role required'
        );
    END IF;

    -- Get old level
    SELECT level INTO old_level
    FROM public.user_profiles
    WHERE id = target_user_id;

    -- Update user level
    UPDATE public.user_profiles 
    SET 
        level = new_level,
        level_updated_at = CURRENT_TIMESTAMP,
        level_updated_by = admin_id
    WHERE id = target_user_id
    RETURNING * INTO updated_user;

    -- Log level change in audit_logs
    INSERT INTO public.audit_logs (
        admin_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        notes
    ) VALUES (
        admin_id,
        'LEVEL_CHANGE',
        'user_profiles',
        target_user_id,
        jsonb_build_object('level', old_level),
        jsonb_build_object('level', new_level),
        COALESCE(admin_note, format('Level changed from %s to %s', old_level, new_level))
    );

    -- Create transaction record for upgrade fee if upgrading and update wallet
    IF new_level > old_level THEN
        -- Calculate fee ($10 per level)
        PERFORM public.update_wallet_balance(target_user_id, (new_level - old_level) * 10, 'subtract', 'level_upgrade');

        INSERT INTO public.transactions (
            user_id,
            type,
            amount,
            description,
            status,
            reference_type,
            reference_id
        ) VALUES (
            target_user_id,
            'level_upgrade',
            (new_level - old_level) * 10, -- $10 per level
            format('Level upgrade from %s to %s', old_level, new_level),
            'completed',
            'level_upgrade',
            updated_user.id
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', format('User level updated from %s to %s', old_level, new_level),
        'user', row_to_json(updated_user)
    );
END;
$$;