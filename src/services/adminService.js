import { supabase } from '../lib/supabase';
import { emailNotificationService } from './emailNotificationService';

export const adminService = {
  // User Management
  // Improved getUsers with optional pagination and server-side filtering.
  // Accepts an options object: { page, perPage, filters }
  // Returns an object: { users: [...], total: <number> }
  async getUsers(options = {}) {
    const { page = 1, perPage = 50, filters = {} } = options || {};

    // Build base query with filters applied.
    let base = supabase?.from('user_profiles')?.select('*');

    if (filters?.role) base = base?.eq('role', filters?.role);

    if (filters?.status && filters?.status !== 'all') {
      if (filters?.status === 'pending') {
        base = base?.or('approval_status.eq.pending,approval_status.is.null');
      } else if (filters?.status === 'approved') {
        base = base?.eq('approval_status', 'approved')?.eq('status', 'active');
      } else {
        base = base?.eq('status', filters?.status);
      }
    }

    if (filters?.level !== undefined) base = base?.eq('level', filters?.level);

    // Apply ordering
    base = base?.order('created_at', { ascending: false });

    try {
      // Get total count using a lightweight head query with same filters
      let countQuery = supabase?.from('user_profiles')?.select('id', { count: 'exact', head: true });
      if (filters?.role) countQuery = countQuery?.eq('role', filters?.role);
      if (filters?.status && filters?.status !== 'all') {
        if (filters?.status === 'pending') {
          countQuery = countQuery?.or('approval_status.eq.pending,approval_status.is.null');
        } else if (filters?.status === 'approved') {
          countQuery = countQuery?.eq('approval_status', 'approved')?.eq('status', 'active');
        } else {
          countQuery = countQuery?.eq('status', filters?.status);
        }
      }
      if (filters?.level !== undefined) countQuery = countQuery?.eq('level', filters?.level);

      const { count, error: countErr } = (await countQuery) || {};
      if (countErr) {
        console.warn('Failed to get users total count:', countErr);
      }

      const start = (Math.max(1, page) - 1) * perPage;
      const end = start + perPage - 1;

      // Perform paged query
      const { data, error } = await base?.range(start, end);
      if (error) throw error;

      // Merge wallets info only for returned users (prevents fetching all wallets)
      const userIds = (data || []).map(u => u?.id).filter(Boolean);
      if (userIds.length > 0) {
        const { data: wallets, error: wErr } = await supabase
          ?.from('wallets')
          ?.select('user_id, available_balance, total_earned, earnings_from_referrals')
          ?.in('user_id', userIds);

        if (wErr) throw wErr;

        const userIdToWallet = Object.fromEntries((wallets || []).map(w => [w.user_id, w]));
        const merged = (data || []).map(u => {
          const w = userIdToWallet[u.id] || {};
          return {
            ...u,
            balance: parseFloat(w?.available_balance) || 0,
            total_earned: parseFloat(w?.total_earned) || 0,
            referral_earnings: parseFloat(w?.earnings_from_referrals) || 0
          };
        });

        return { users: merged, total: typeof count === 'number' ? count : null };
      }

      return { users: data || [], total: typeof count === 'number' ? count : null };
    } catch (err) {
      throw err;
    }
  },

  // Per-user withdrawal override (admin only)
  async setWithdrawalOverride(userId, enabled) {
    try {
      const { error } = await supabase?.rpc('set_withdrawal_override', {
        p_user_id: userId,
        p_enabled: !!enabled
      });
      if (error) throw error;
      await this.logAdminAction('SET_WITHDRAWAL_OVERRIDE', 'user_profiles', userId, { enabled: !!enabled });
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to set withdrawal override' };
    }
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', userId)?.select()?.single();

    if (error) throw error;
    
    // Log admin action
    await this.logAdminAction('UPDATE', 'user_profiles', userId, updates);
    return data;
  },

  async updateUserBalance(userId, balanceChange, type = 'admin_adjustment', note = '') {
    try {
      const p_type = balanceChange >= 0 ? 'add' : 'subtract';
      const amount = Math.abs(balanceChange);

      const { data, error } = await supabase?.rpc('update_wallet_balance', {
        p_user_id: userId,
        p_amount: amount,
        p_type,
        p_category: type
      });

      if (error) throw error;

      // Create a transaction record for visibility in wallet history (use allowed types)
      try {
        if (p_type === 'add') {
          await supabase?.from('transactions')?.insert({
            user_id: userId,
            type: 'bonus',
            amount: amount,
            description: note || 'Admin balance adjustment (+)',
            status: 'completed'
          });
        } else {
          // For deductions, rely on wallet update; avoid unsupported transaction types
        }
      } catch (txErr) {
        console.warn('Failed to insert admin adjustment transaction:', txErr);
      }

      // Fetch updated wallet to report new balance
      const { data: walletData } = await supabase?.from('wallets')?.select('available_balance')?.eq('user_id', userId)?.single();

      // Log the action in admin_actions table
      await this.logAdminAction('balance_adjustment', 'wallets', userId, {
        amount: balanceChange,
        type,
        note
      });

      return {
        success: true,
        message: `Balance ${balanceChange > 0 ? 'increased' : 'decreased'} by $${amount}`,
        newBalance: walletData?.available_balance
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to update balance'
      };
    }
  },

  // Task Management
  async createTask(taskData) {
    const { data: currentUser } = await supabase?.auth?.getUser();

    // Sanitize and normalize payload to avoid 400 errors from invalid types
    const toNumberOrNull = (val) => {
      if (val === undefined || val === null || val === '') return null;
      const n = Number(val);
      return Number.isFinite(n) ? n : null;
    };

    const payload = {
      title: (taskData?.title || '').trim(),
      description: (taskData?.description || '').trim(),
      category: taskData?.category || 'survey',
      reward_amount: toNumberOrNull(taskData?.reward_amount) ?? 0,
      total_slots: Math.max(1, parseInt(taskData?.total_slots || 1, 10)),
      level_required: toNumberOrNull(taskData?.level_required) ?? 0,
      proof_type: taskData?.proof_type || 'text',
      proof_instructions: (taskData?.proof_instructions || '').trim(),
      external_url: taskData?.external_url ? String(taskData?.external_url).trim() : null,
      status: taskData?.status || 'active',
      created_by: currentUser?.user?.id
    };

    const { data, error } = await supabase?.from('tasks')
      ?.insert(payload)
      ?.select()?.single();

    if (error) throw new Error(error?.message || 'Failed to create task');
    return data;
  },

  // Admin-level: get tasks (used by admin pages)
  async getTasks(filters = {}) {
    try {
      let query = supabase?.from('tasks')?.select('*');

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.category) query = query.eq('category', filters.category);

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw error;
    }
  },

  // Delete a task by ID (admin only)
  async deleteTask(taskId) {
    try {
      const { data, error } = await supabase?.from('tasks')?.delete()?.eq('id', taskId)?.select()?.single();
      if (error) throw error;
      await this.logAdminAction('DELETE', 'tasks', taskId, {});
      return data;
    } catch (error) {
      throw error;
    }
  },

  async updateTask(taskId, updates) {
    // Sanitize updates similarly to create
    const toNumberOrNull = (val) => {
      if (val === undefined || val === null || val === '') return null;
      const n = Number(val);
      return Number.isFinite(n) ? n : null;
    };

    const sanitized = {
      ...(updates?.title !== undefined ? { title: String(updates.title).trim() } : {}),
      ...(updates?.description !== undefined ? { description: String(updates.description).trim() } : {}),
      ...(updates?.category !== undefined ? { category: updates.category || 'survey' } : {}),
      ...(updates?.reward_amount !== undefined ? { reward_amount: toNumberOrNull(updates.reward_amount) ?? 0 } : {}),
      ...(updates?.total_slots !== undefined ? { total_slots: Math.max(1, parseInt(updates.total_slots || 1, 10)) } : {}),
      ...(updates?.level_required !== undefined ? { level_required: toNumberOrNull(updates.level_required) ?? 0 } : {}),
      ...(updates?.proof_type !== undefined ? { proof_type: updates.proof_type || 'text' } : {}),
      ...(updates?.proof_instructions !== undefined ? { proof_instructions: String(updates.proof_instructions || '').trim() } : {}),
      ...(updates?.external_url !== undefined ? { external_url: updates.external_url ? String(updates.external_url).trim() : null } : {}),
      ...(updates?.status !== undefined ? { status: updates.status || 'active' } : {})
    };

    const { data, error } = await supabase?.from('tasks')
      ?.update(sanitized)
      ?.eq('id', taskId)
      ?.select()?.single();

    if (error) throw new Error(error?.message || 'Failed to update task');
    await this.logAdminAction('UPDATE', 'tasks', taskId, updates);
    return data;
  },

  // Proof Review
  async getPendingProofs() {
    const { data, error } = await supabase?.from('task_submissions')?.select(`
        *,
        tasks:tasks(*),
        user_profiles:user_profiles(*)
      `)?.eq('status', 'pending')?.order('submitted_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async reviewProof(proofId, action, reason = '') {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    const { data, error } = await supabase?.from('task_submissions')?.update({
        status,
        reviewed_by: currentUser?.user?.id,
        reviewed_at: new Date()?.toISOString(),
        admin_notes: reason
      })?.eq('id', proofId)?.select(`
        *,
        tasks:tasks(*),
        user_profiles:user_profiles(*)
      `)?.single();

    if (error) throw error;

      // If approved, create earning transaction
      if (action === 'approve') {
        await supabase?.from('transactions')?.insert({
          user_id: data?.user_id,
          type: 'earning',
          amount: data?.tasks?.reward_amount,
          description: `Task completion: ${data?.tasks?.title}`,
          status: 'completed',
          reference_type: 'task_submission',
          reference_id: proofId
        });

        // Update user wallet balance
        await supabase?.rpc('update_wallet_balance', {
          p_user_id: data?.user_id,
          p_amount: data?.tasks?.reward_amount,
          p_type: 'add',
          p_category: 'tasks'
        });

        // Send approval email notification
        try {
          await emailNotificationService.sendTaskApprovedEmail(
            data?.user_profiles?.email,
            data?.user_profiles?.full_name,
            data?.tasks?.title,
            data?.tasks?.reward_amount
          );
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
        }
      } else {
        // Send rejection email notification
        try {
          await emailNotificationService.sendTaskRejectedEmail(
            data?.user_profiles?.email,
            data?.user_profiles?.full_name,
            data?.tasks?.title,
            reason
          );
        } catch (emailError) {
          console.error('Failed to send rejection email:', emailError);
        }
      }

    return data;
  },

  // USDT Address Management
  async getUSDTAddresses() {
    const { data, error } = await supabase?.from('usdt_addresses')?.select(`
        *,
        user_profiles:user_profiles(email, full_name)
      `)?.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createUSDTAddress(addressData) {
    // Normalize user identifier: accept either a UUID or an email address.
    const payload = { ...addressData, is_admin_managed: true };

    // Simple UUID v4 regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (payload.user_id) {
      const maybe = String(payload.user_id).trim();
      if (uuidRegex.test(maybe)) {
        // valid UUID, keep as-is
        payload.user_id = maybe;
      } else if (maybe.includes('@')) {
        // treat as email: try to resolve to user UUID
        const { data: users, error: lookupErr } = await supabase?.from('user_profiles')?.select('id')?.ilike('email', maybe)?.limit(1);
        if (lookupErr) throw lookupErr;
        if (users && users.length > 0) {
          payload.user_id = users[0].id;
        } else {
          throw new Error('Could not find a user with that email. Provide a valid user UUID or a registered email.');
        }
      } else {
        // Invalid format (e.g., numeric id). Reject with helpful message to avoid DB error.
        throw new Error('Invalid user identifier. Please provide the user UUID (e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6) or the user email.');
      }
    } else {
      // No user specified — create an admin-managed address without linking to a user
      delete payload.user_id;
    }

    // Normalize network values (accept synonyms like 'BNB')
    if (payload.network) {
      const net = String(payload.network).toUpperCase();
      if (net.includes('BNB')) payload.network = 'BEP20';
      else if (net.includes('TRC')) payload.network = 'TRC20';
      else if (net.includes('ERC')) payload.network = 'ERC20';
      else payload.network = net;
    }

    const { data, error } = await supabase?.from('usdt_addresses')?.insert(payload)?.select()?.single();

    if (error) throw error;
    return data;
  },

  async deleteUSDTAddress(addressId) {
    const { data, error } = await supabase?.from('usdt_addresses')?.delete()?.eq('id', addressId)?.select()?.single();

    if (error) throw error;
    await this.logAdminAction('DELETE', 'usdt_addresses', addressId);
    return data;
  },

  async exportUSDTAddressesCSV() {
    const addresses = await this.getUSDTAddresses();
    
    const csvContent = [
      ['User Email', 'Full Name', 'Label', 'Address', 'Network', 'Created At']?.join(','),
      ...addresses?.map(addr => [
        addr?.user_profiles?.email || '',
        addr?.user_profiles?.full_name || '',
        addr?.label || '',
        addr?.address,
        addr?.network,
        new Date(addr.created_at)?.toLocaleDateString()
      ]?.join(','))
    ]?.join('\n');

    return csvContent;
  },

  // Withdrawal Processing
  async getPendingWithdrawals() {
    const { data, error } = await supabase?.from('transactions')?.select(`
        *,
        user_profiles:user_profiles(*)
      `)?.eq('type', 'withdrawal')?.eq('status', 'pending')?.order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async processWithdrawal(withdrawalId, action, notes = '') {
    const { data: currentUser } = await supabase?.auth?.getUser();
    const status = action === 'approve' ? 'completed' : 'failed';
    
    const { data, error } = await supabase?.from('transactions')?.update({
        status,
        processed_by: currentUser?.user?.id,
        processed_at: new Date()?.toISOString(),
        admin_notes: notes
      })?.eq('id', withdrawalId)?.select(`
        *,
        user_profiles:user_profiles(*)
      `)?.single();

    if (error) throw error;

    // Send notification email
    try {
      await this.sendNotificationEmail(
        action === 'approve' ? 'withdrawal_approved' : 'withdrawal_rejected',
        data?.user_profiles?.email,
        {
          fullName: data?.user_profiles?.full_name,
          amount: data?.amount,
          address: data?.withdrawal_address,
          reason: action === 'reject' ? notes : undefined
        }
      );
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    return data;
  },

  // Deposit processing (admin)
  async getPendingDeposits() {
    const { data, error } = await supabase?.from('transactions')?.select(`
        *,
        user_profiles:user_profiles(*)
      `)?.eq('type', 'deposit')?.eq('status', 'pending')?.order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async processDeposit(depositId, action, notes = '') {
    const { data: currentUser } = await supabase?.auth?.getUser();
    const status = action === 'approve' ? 'completed' : 'failed';

    try {
      const { data, error } = await supabase?.from('transactions')?.update({
          status,
          processed_by: currentUser?.user?.id,
          processed_at: new Date()?.toISOString(),
          admin_notes: notes
        })?.eq('id', depositId)?.select(`
          *,
          user_profiles:user_profiles(*)
        `)?.single();

      if (error) throw error;

      // If approved, credit user wallet
      if (action === 'approve') {
        try {
          await supabase?.rpc('update_wallet_balance', {
            p_user_id: data?.user_id,
            p_amount: data?.amount,
            p_type: 'add',
            p_category: 'deposit'
          });
        } catch (rpcErr) {
          console.error('RPC update_wallet_balance failed:', rpcErr);
        }
      }

      // Send notification email
      try {
        await this.sendNotificationEmail(
          action === 'approve' ? 'deposit_approved' : 'deposit_rejected',
          data?.user_profiles?.email,
          {
            fullName: data?.user_profiles?.full_name,
            amount: data?.amount,
            reason: action === 'reject' ? notes : undefined
          }
        );
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }

      // Log admin action
      await this.logAdminAction(action === 'approve' ? 'APPROVE' : 'REJECT', 'transactions', depositId, { notes });

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Settings Management
  async getSettings() {
    const { data, error } = await supabase?.from('admin_settings')?.select('*')?.order('key');

    if (error) throw error;
    return data;
  },

  async updateSetting(key, value) {
    const { data: currentUser } = await supabase?.auth?.getUser();
    // Use upsert with explicit onConflict target to avoid duplicate key insertion errors
    // Supabase requires passing an array when upserting multiple rows; wrap single object in array
    const payload = {
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
      updated_by: currentUser?.user?.id,
      updated_at: new Date()?.toISOString()
    };

    const { data, error } = await supabase
      ?.from('admin_settings')
      ?.upsert([payload], { onConflict: 'key' })
      ?.select();

    // When using upsert with select on arrays, Supabase returns an array of rows; pick the first
    const resultRow = Array.isArray(data) ? data[0] : data;

    if (error) throw error;
    return resultRow;
  },

  // Referral Management
  async getReferralStats() {
    const { data, error } = await supabase?.from('referrals')?.select(`
        *,
        referrer:referrer_id(email, full_name, level),
        referred:referred_id(email, full_name, level)
      `)?.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async processReferralBonuses() {
    // This calls the hidden referral bonus processing function
    const { data, error } = await supabase?.rpc('process_all_referral_bonuses');
    if (error) throw error;
    return data;
  },

  // Spin Wheel Management
  async getSpinHistory(date = null) {
    let query = supabase?.from('daily_spin_rewards')?.select(`
        *,
        user_profiles:user_profiles(email, full_name)
      `)?.order('created_at', { ascending: false });

    if (date) {
      query = query?.eq('spin_date', date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Email Notifications
  async sendNotificationEmail(type, to, data) {
    const { data: result, error } = await supabase?.functions?.invoke('send-notification-email', {
      body: { type, to, data }
    });

    if (error) throw error;
    return result;
  },

  // Audit Logging
  async logAdminAction(action, tableName, recordId, data = {}) {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    await supabase?.from('audit_logs')?.insert({
      admin_id: currentUser?.user?.id,
      action,
      table_name: tableName,
      record_id: recordId,
      new_values: data
    });
  },

  async getAuditLogs(limit = 100) {
    const { data, error } = await supabase?.from('audit_logs')?.select(`
        *,
        user_profiles:user_profiles(email, full_name)
      `)?.order('created_at', { ascending: false })?.limit(limit);

    if (error) throw error;
    return data;
  },

  // Analytics
  async getDashboardStats() {
    try {
      // Get basic stats
      const [usersResult, tasksResult, withdrawalsResult, transactionsResult] = await Promise.all([
        supabase?.from('user_profiles')?.select('id, status, approval_status, created_at'),
        supabase?.from('tasks')?.select('id, status, created_at'),
        supabase?.from('transactions')?.select('id, type, amount, status, created_at')?.eq('type', 'withdrawal'),
        supabase?.from('transactions')?.select('id, amount, status, created_at')?.eq('status', 'completed')
      ]);

      const users = usersResult?.data || [];
      const tasks = tasksResult?.data || [];
      const withdrawals = withdrawalsResult?.data || [];
      const transactions = transactionsResult?.data || [];

      // Calculate stats
      const totalUsers = users?.length;
      const pendingApprovals = users?.filter(u => u?.approval_status === 'pending')?.length;
      const activeTasks = tasks?.filter(t => t?.status === 'pending' || t?.status === 'in_progress')?.length;
      const pendingWithdrawals = withdrawals?.filter(w => w?.status === 'pending')?.length;
      const totalRevenue = transactions?.reduce((sum, t) => sum + (parseFloat(t?.amount) || 0), 0);

      // Recent activity (last 10 activities)
      const recentActivity = [
        ...users?.slice(-5)?.map(u => ({
          type: 'user_registration',
          description: `New user registration: ${u?.id}`,
          timestamp: u?.created_at
        })),
        ...tasks?.slice(-3)?.map(t => ({
          type: 'task_created',
          description: `New task: ${t?.id}`,
          timestamp: t?.created_at
        })),
        ...withdrawals?.slice(-2)?.map(w => ({
          type: 'withdrawal_request',
          description: `Withdrawal request: ${w?.amount}`,
          timestamp: w?.created_at
        }))
      ]?.sort((a, b) => new Date(b?.timestamp) - new Date(a?.timestamp))?.slice(0, 10);

      return {
        success: true,
        stats: {
          totalUsers,
          pendingApprovals,
          activeTasks,
          pendingWithdrawals,
          totalRevenue,
          recentActivity
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch dashboard statistics'
      };
    }
  },

  // Get pending user approvals
  async getPendingUserApprovals() {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select(`
          id,
          full_name,
          email,
          created_at,
          approval_status,
          email_verified,
          status
        `)?.eq('approval_status', 'pending')?.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        users: data || [],
        count: data?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch pending users'
      };
    }
  },

  // Create approval request
  async createApprovalRequest(targetId, actionType, metadata = null) {
    try {
      const { data, error } = await supabase?.rpc('create_approval_request', {
        p_target_id: targetId,
        p_action_type: actionType,
        p_metadata: metadata
      });

      if (error) throw error;

      return {
        success: true,
        approvalId: data
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to create approval request'
      };
    }
  },

  // Process approval request (approve/reject)
  async processApprovalRequest(approvalId, adminId, status, notes = '') {
    try {
      const { data, error } = await supabase?.rpc('process_approval_request', {
        p_approval_id: approvalId,
        p_admin_id: adminId,
        p_status: status,
        p_notes: notes
      });

      if (error) throw error;

      return {
        success: true,
        message: data.message,
        record: data.record
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to process approval request'
      };
    }
  },

  // Reject user
  async rejectUser(userId, adminId, reason = '') {
    try {
      const { data, error } = await supabase?.rpc('reject_user', {
        target_user_id: userId,
        admin_id: adminId,
        rejection_reason: reason
      });

      if (error) {
        throw error;
      }

      if (data) {
        return {
          success: true,
          message: 'User rejected successfully'
        };
      } else {
        return {
          success: false,
          error: 'Failed to reject user. Check permissions.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to reject user'
      };
    }
  },

  // Approve user
  async approveUser(userId, adminId) {
    try {
      // First update the user profile
      const { data: profile, error: updateError } = await supabase
        ?.from('user_profiles')
        ?.update({
          approval_status: 'approved',
          approved_by: adminId,
          approved_at: new Date().toISOString(),
          status: 'active'
        })
        ?.eq('id', userId)
        ?.select()
        ?.single();

      if (updateError) throw updateError;

      // Add welcome bonus transaction
      const { error: transactionError } = await supabase
        ?.from('transactions')
        ?.insert({
          user_id: userId,
          type: 'bonus',
          amount: 5.00,
          description: 'Welcome bonus after approval',
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      // Update user balance
      const { error: balanceError } = await supabase?.rpc('update_wallet_balance', {
        p_user_id: userId,
        p_amount: 5.00,
        p_type: 'add',
        p_category: 'bonus'
      });

      if (balanceError) throw balanceError;

      // Log admin action
      await this.logAdminAction('approve_user', 'user_profiles', userId, {
        approved_by: adminId,
        welcome_bonus: 5.00
      });

      // Send welcome email notification
      try {
        await this.sendNotificationEmail('welcome', profile?.email, {
          fullName: profile?.full_name,
          loginUrl: `${window.location.origin}/login`
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the approval if email fails
      }

      return {
        success: true,
        message: 'User approved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to approve user'
      };
    }
  },

  // Get approval history with filters
  async getApprovalHistory(filters = {}) {
    try {
      const { data, error } = await supabase?.rpc('get_approval_history', {
        p_action_type: filters.actionType,
        p_status: filters.status,
        p_admin_id: filters.adminId,
        p_from_date: filters.fromDate,
        p_to_date: filters.toDate,
        p_limit: filters.limit || 100
      });

      if (error) throw error;

      // Fetch related user and admin details
      const userIds = [...new Set(data.map(item => item.target_id))];
      const adminIds = [...new Set(data.map(item => item.admin_id).filter(Boolean))];
      
      const [usersResult, adminsResult] = await Promise.all([
        supabase?.from('user_profiles')?.select('id, full_name, email')?.in('id', userIds),
        supabase?.from('user_profiles')?.select('id, full_name, email')?.in('id', adminIds)
      ]);

      const users = Object.fromEntries((usersResult?.data || []).map(u => [u.id, u]));
      const admins = Object.fromEntries((adminsResult?.data || []).map(a => [a.id, a]));

      const enrichedData = data.map(item => ({
        ...item,
        target_user: users[item.target_id],
        admin: admins[item.admin_id]
      }));

      return {
        success: true,
        history: enrichedData
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch approval history'
      };
    }
  },

  // Get user verification status
  async getUserVerificationStatus(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select(`
          id,
          email_verified,
          approval_status,
          status,
          created_at,
          approved_at
        `)?.eq('id', userId)?.single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        verification: data
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch verification status'
      };
    }
  },

  // Create test user for admin testing
  async createTestUser(userData) {
    try {
      const { data, error } = await supabase?.auth?.admin?.createUser({
        email: userData?.email,
        password: userData?.password,
        user_metadata: {
          full_name: userData?.fullName || 'Test User',
          role: userData?.role || 'user'
        },
        email_confirm: false // Require email verification
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Test user created successfully',
        user: data?.user
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to create test user'
      };
    }
  }

  ,

  // Promote existing user to admin role (updates user_profiles.role and logs action)
  async promoteUserToAdmin(userId) {
    try {
      const updated = await this.updateUser(userId, { role: 'admin' });
      await this.logAdminAction('PROMOTE', 'user_profiles', userId, { role: 'admin' });
      return { success: true, user: updated };
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to promote user' };
    }
  },

  // Reset user's password using supabase admin API (requires service role privileges)
  async resetUserPassword(userId, newPassword) {
    try {
      // supabase.auth.admin.updateUserById is used in some supabase-js versions; try common patterns
      if (supabase?.auth?.admin?.updateUserById) {
        const { data, error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
        if (error) throw error;
        await this.logAdminAction('RESET_PASSWORD', 'auth.users', userId);
        return { success: true, data };
      } else if (supabase?.auth?.admin?.updateUser) {
        const { data, error } = await supabase.auth.admin.updateUser(userId, { password: newPassword });
        if (error) throw error;
        await this.logAdminAction('RESET_PASSWORD', 'auth.users', userId);
        return { success: true, data };
      } else {
        throw new Error('Admin update user API not available in this supabase client. Use service role or server-side function.');
      }
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to reset password' };
    }
  },

  // Log approval actions in approval_history table
  async logApprovalAction(actionType, targetId, action, reason = null, metadata = null) {
    try {
      const { data: currentUser } = await supabase?.auth?.getUser();
      const { data, error } = await supabase?.rpc('log_approval_action', {
        admin_id: currentUser?.user?.id,
        action_type: actionType,
        target_id: targetId,
        action: action,
        reason: reason,
        metadata: metadata
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to log approval action:', error);
      // Don't throw, just log the error
    }
  },



  // Update user level and handle level upgrade fees
  async updateUserLevel(userId, adminId, newLevel, note = '') {
    try {
      const { data, error } = await supabase?.rpc('update_user_level', {
        target_user_id: userId,
        admin_id: adminId,
        new_level: newLevel,
        admin_note: note
      });

      if (error) throw error;

      return {
        success: true,
        message: data.message,
        user: data.user
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to update user level'
      };
    }
  }
};

export default adminService;