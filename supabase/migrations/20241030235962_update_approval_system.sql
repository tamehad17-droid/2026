-- Update existing tables and functions for approval system
CREATE TABLE IF NOT EXISTS public.approval_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'new_account', 'deposit', 'withdrawal', 'task', 'level_upgrade'
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_id UUID REFERENCES auth.users(id),
    admin_notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,
    CONSTRAINT valid_action_type CHECK (action_type IN ('new_account', 'deposit', 'withdrawal', 'task', 'level_upgrade')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_approval_actions_target_id ON public.approval_actions(target_id);
CREATE INDEX IF NOT EXISTS idx_approval_actions_admin_id ON public.approval_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_approval_actions_status ON public.approval_actions(status);
CREATE INDEX IF NOT EXISTS idx_approval_actions_action_type ON public.approval_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_approval_actions_created_at ON public.approval_actions(created_at);

-- Function to create a new approval request
CREATE OR REPLACE FUNCTION public.create_approval_request(
    p_target_id UUID,
    p_action_type VARCHAR,
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_approval_id UUID;
BEGIN
    INSERT INTO public.approval_actions (
        target_id,
        action_type,
        metadata
    ) VALUES (
        p_target_id,
        p_action_type,
        p_metadata
    ) RETURNING id INTO v_approval_id;

    RETURN v_approval_id;
END;
$$;

-- Function to process an approval request
CREATE OR REPLACE FUNCTION public.process_approval_request(
    p_approval_id UUID,
    p_admin_id UUID,
    p_status VARCHAR,
    p_notes TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_action_record public.approval_actions;
    v_is_admin BOOLEAN;
BEGIN
    -- Check admin permissions
    SELECT EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = p_admin_id 
        AND (raw_user_meta_data->>'role' = 'admin' 
             OR raw_user_meta_data->>'role' = 'super_admin')
    ) INTO v_is_admin;

    IF NOT v_is_admin THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No permission: Admin role required'
        );
    END IF;

    -- Get and update the approval record
    UPDATE public.approval_actions
    SET status = p_status,
        admin_id = p_admin_id,
        admin_notes = p_notes,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_approval_id
    RETURNING * INTO v_action_record;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Approval request not found'
        );
    END IF;

    -- Handle specific action types
    CASE v_action_record.action_type
        WHEN 'new_account' THEN
            UPDATE public.user_profiles
            SET approval_status = p_status,
                approved_by = p_admin_id,
                approved_at = CURRENT_TIMESTAMP
            WHERE id = v_action_record.target_id;

        WHEN 'deposit' THEN
            UPDATE public.transactions
            SET status = CASE WHEN p_status = 'approved' THEN 'completed' ELSE 'failed' END,
                processed_by = p_admin_id,
                processed_at = CURRENT_TIMESTAMP,
                admin_notes = p_notes
            WHERE id = v_action_record.target_id;

        WHEN 'withdrawal' THEN
            UPDATE public.transactions
            SET status = CASE WHEN p_status = 'approved' THEN 'completed' ELSE 'failed' END,
                processed_by = p_admin_id,
                processed_at = CURRENT_TIMESTAMP,
                admin_notes = p_notes
            WHERE id = v_action_record.target_id;

        WHEN 'task' THEN
            UPDATE public.task_submissions
            SET status = CASE WHEN p_status = 'approved' THEN 'completed' ELSE 'rejected' END,
                reviewed_by = p_admin_id,
                reviewed_at = CURRENT_TIMESTAMP,
                admin_notes = p_notes
            WHERE id = v_action_record.target_id;

        WHEN 'level_upgrade' THEN
            IF p_status = 'approved' THEN
                UPDATE public.user_profiles
                SET level = (v_action_record.metadata->>'new_level')::int,
                    level_updated_at = CURRENT_TIMESTAMP,
                    level_updated_by = p_admin_id
                WHERE id = v_action_record.target_id;
            END IF;
    END CASE;

    RETURN jsonb_build_object(
        'success', true,
        'message', format('Request %s successfully', p_status),
        'record', row_to_json(v_action_record)
    );
END;
$$;

-- Function to get approval history with filters
CREATE OR REPLACE FUNCTION public.get_approval_history(
    p_action_type VARCHAR DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_admin_id UUID DEFAULT NULL,
    p_from_date TIMESTAMPTZ DEFAULT NULL,
    p_to_date TIMESTAMPTZ DEFAULT NULL,
    p_limit INT DEFAULT 100
) RETURNS SETOF public.approval_actions LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.approval_actions
    WHERE (p_action_type IS NULL OR action_type = p_action_type)
    AND (p_status IS NULL OR status = p_status)
    AND (p_admin_id IS NULL OR admin_id = p_admin_id)
    AND (p_from_date IS NULL OR created_at >= p_from_date)
    AND (p_to_date IS NULL OR created_at <= p_to_date)
    ORDER BY created_at DESC
    LIMIT p_limit;
END;
$$;