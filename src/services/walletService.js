import { supabase } from '../lib/supabase';

export const walletService = {
  // Get user wallet
  async getWallet(userId) {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If wallet doesn't exist, create it
        if (error.code === 'PGRST116') {
          return await this.createWallet(userId);
        }
        
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      return { wallet: data, error: null };
    } catch (error) {
      return { wallet: null, error };
    }
  },

  // Create wallet for user
  async createWallet(userId) {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .insert({
          user_id: userId,
          available_balance: 0,
          pending_balance: 0,
          total_earned: 0,
          total_withdrawn: 0,
          earnings_from_tasks: 0,
          earnings_from_referrals: 0,
          earnings_from_bonuses: 0
        })
        .select()
        .single();

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      return { wallet: data, error: null };
    } catch (error) {
      return { wallet: null, error };
    }
  },

  // Get wallet stats for dashboard
  async getWalletStats(userId) {
    try {
      const { wallet, error } = await this.getWallet(userId);
      
      if (error) throw error;

      return {
        stats: {
          availableBalance: wallet?.available_balance || 0,
          pendingBalance: wallet?.pending_balance || 0,
          totalEarned: wallet?.total_earned || 0,
          totalWithdrawn: wallet?.total_withdrawn || 0,
          earningsFromTasks: wallet?.earnings_from_tasks || 0,
          earningsFromReferrals: wallet?.earnings_from_referrals || 0,
          earningsFromBonuses: wallet?.earnings_from_bonuses || 0
        },
        error: null
      };
    } catch (error) {
      return { stats: null, error };
    }
  },

  // Add balance to wallet
  async addBalance(userId, amount, category = 'tasks', description = '') {
    try {
      // Call database function
      const { data, error } = await supabase.rpc('update_wallet_balance', {
        p_user_id: userId,
        p_amount: amount,
        p_type: 'add',
        p_category: category
      });

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      // Create transaction record
      await supabase.from('transactions').insert({
        user_id: userId,
        type: category,
        amount: amount,
        description: description || `Added ${amount} to wallet from ${category}`,
        status: 'completed'
      });

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Subtract balance from wallet
  async subtractBalance(userId, amount, description = '') {
    try {
      // Call database function
      const { data, error } = await supabase.rpc('update_wallet_balance', {
        p_user_id: userId,
        p_amount: amount,
        p_type: 'subtract',
        p_category: 'withdrawal'
      });

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        
        if (error?.message?.includes('Insufficient balance')) {
          throw new Error('Insufficient balance for this withdrawal');
        }
        
        throw error;
      }

      // Create transaction record
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'withdrawal',
        amount: -amount,
        description: description || `Withdrawal of ${amount}`,
        status: 'completed'
      });

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }
};
