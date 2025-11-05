-- Create approval history table
CREATE TABLE IF NOT EXISTS public.approval_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    action_type VARCHAR(50) NOT NULL, -- 'deposit', 'withdrawal', 'level_upgrade', 'new_account', etc.
    target_id UUID NOT NULL, -- ID of the target record (user_id, transaction_id, etc)
    action VARCHAR(20) NOT NULL, -- 'approve' or 'reject'
    reason TEXT, -- Reason for rejection if applicable
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB -- Additional data specific to the action type
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS approval_history_admin_id_idx ON public.approval_history(admin_id);
CREATE INDEX IF NOT EXISTS approval_history_action_type_idx ON public.approval_history(action_type);
CREATE INDEX IF NOT EXISTS approval_history_target_id_idx ON public.approval_history(target_id);
CREATE INDEX IF NOT EXISTS approval_history_created_at_idx ON public.approval_history(created_at);

-- Create a function to log approval actions
CREATE OR REPLACE FUNCTION public.log_approval_action(
    admin_id UUID,
    action_type VARCHAR,
    target_id UUID,
    action VARCHAR,
    reason TEXT DEFAULT NULL,
    metadata JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    approval_id UUID;
BEGIN
    -- Insert approval record
    INSERT INTO public.approval_history (
        admin_id,
        action_type,
        target_id,
        action,
        reason,
        metadata
    ) VALUES (
        admin_id,
        action_type,
        target_id,
        action,
        reason,
        metadata
    )
    RETURNING id INTO approval_id;

    RETURN approval_id;
END;
$$;