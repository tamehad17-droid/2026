import { supabase } from '../lib/supabase';

export const transactionService = {
  // Get user transactions
  async getUserTransactions(userId, filters = {}) {
    try {
      let query = supabase?.from('transactions')?.select('*')?.eq('user_id', userId);

      // Apply filters
      if (filters?.type) {
        query = query?.eq('type', filters?.type);
      }

      if (filters?.status) {
        query = query?.eq('status', filters?.status);
      }

      if (filters?.startDate) {
        query = query?.gte('created_at', filters?.startDate);
      }

      if (filters?.endDate) {
        query = query?.lte('created_at', filters?.endDate);
      }

      // Order by created_at desc
      query = query?.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      return { transactions: data || [], error: null };
    } catch (error) {
      return { transactions: [], error };
    }
  },

  // Create withdrawal request
  async createWithdrawalRequest(userId, amount, method, address) {
    try {
      const { data, error } = await supabase?.from('transactions')?.insert({
          user_id: userId,
          type: 'withdrawal',
          amount: amount,
          status: 'pending',
          withdrawal_method: method,
          withdrawal_address: address,
          description: `Withdrawal request via ${method}`
        })?.select()?.single();

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      return { transaction: data, error: null };
    } catch (error) {
      return { transaction: null, error };
    }
  },

  // Get transaction by ID
  async getTransactionById(transactionId) {
    try {
      const { data, error } = await supabase?.from('transactions')?.select(`
          *,
          user:user_profiles!transactions_user_id_fkey(full_name, email),
          processed_by_user:user_profiles!transactions_processed_by_fkey(full_name, email)
        `)?.eq('id', transactionId)?.single();

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      return { transaction: data, error: null };
    } catch (error) {
      return { transaction: null, error };
    }
  },

  // Get user balance summary
  async getUserBalanceSummary(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('balance, total_earnings')?.eq('id', userId)?.single();

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      return { 
        balance: data?.balance || 0,
        totalEarnings: data?.total_earnings || 0,
        error: null 
      };
    } catch (error) {
      return { balance: 0, totalEarnings: 0, error };
    }
  },

  // Get recent transactions for dashboard
  async getRecentTransactions(userId, limit = 5) {
    try {
      const { data, error } = await supabase?.from('transactions')?.select('*')?.eq('user_id', userId)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      return { transactions: data || [], error: null };
    } catch (error) {
      return { transactions: [], error };
    }
  }
};