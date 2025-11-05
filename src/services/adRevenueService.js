import { supabase } from '../lib/supabase';

export const adRevenueService = {
  // Record ad view for AdSterra
  async recordAdView(data) {
    try {
      const { error } = await supabase
        .from('ad_revenues')
        .insert({
          user_id: data.userId,
          platform: data.platform,
          ad_type: data.adType,
          placement: data.placement,
          base_revenue: data.baseRevenue,
          user_share: data.userShare,
          user_earnings: data.userEarnings,
          user_level: data.userLevel,
          event_type: 'view',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update user wallet
      await this.updateUserWallet(data.userId, data.userEarnings);

      return { success: true };
    } catch (error) {
      console.error('Error recording ad view:', error);
      return { success: false, error: error.message };
    }
  },

  // Record offer completion for AdGem
  async recordOfferCompletion(data) {
    try {
      const { error } = await supabase
        .from('ad_revenues')
        .insert({
          user_id: data.userId,
          platform: data.platform,
          offer_id: data.offerId,
          offer_name: data.offerName,
          ad_type: data.adType,
          placement: data.placement,
          base_revenue: data.baseRevenue,
          user_share: data.userShare,
          user_earnings: data.userEarnings,
          user_level: data.userLevel,
          event_type: 'completion',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update user wallet
      await this.updateUserWallet(data.userId, data.userEarnings);

      return { success: true };
    } catch (error) {
      console.error('Error recording offer completion:', error);
      return { success: false, error: error.message };
    }
  },

  // Record offer click for AdGem
  async recordOfferClick(data) {
    try {
      const { error } = await supabase
        .from('ad_revenues')
        .insert({
          user_id: data.userId,
          platform: data.platform,
          offer_id: data.offerId,
          placement: data.placement,
          user_level: data.userLevel,
          event_type: 'click',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error recording offer click:', error);
      return { success: false, error: error.message };
    }
  },

  // Update user wallet with earnings
  async updateUserWallet(userId, earnings) {
    try {
      // Get current wallet
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (walletError && walletError.code !== 'PGRST116') {
        throw walletError;
      }

      if (wallet) {
        // Update existing wallet
        const { error: updateError } = await supabase
          .from('wallets')
          .update({
            balance: wallet.balance + earnings,
            total_earned: wallet.total_earned + earnings,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        // Create new wallet
        const { error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: userId,
            balance: earnings,
            total_earned: earnings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (createError) throw createError;
      }

      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'AD_REVENUE',
          amount: earnings,
          description: 'أرباح من الإعلانات',
          created_at: new Date().toISOString()
        });

      return { success: true };
    } catch (error) {
      console.error('Error updating user wallet:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user ad revenue stats
  async getUserAdStats(userId, period = '30d') {
    try {
      const startDate = new Date();
      if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (period === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }

      const { data, error } = await supabase
        .from('ad_revenues')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate stats
      const stats = {
        totalEarnings: data.reduce((sum, item) => sum + (item.user_earnings || 0), 0),
        totalViews: data.filter(item => item.event_type === 'view').length,
        totalClicks: data.filter(item => item.event_type === 'click').length,
        totalCompletions: data.filter(item => item.event_type === 'completion').length,
        byPlatform: {
          adsterra: {
            earnings: data.filter(item => item.platform === 'adsterra').reduce((sum, item) => sum + (item.user_earnings || 0), 0),
            views: data.filter(item => item.platform === 'adsterra' && item.event_type === 'view').length
          },
          adgem: {
            earnings: data.filter(item => item.platform === 'adgem').reduce((sum, item) => sum + (item.user_earnings || 0), 0),
            completions: data.filter(item => item.platform === 'adgem' && item.event_type === 'completion').length
          }
        },
        dailyStats: this.groupByDay(data)
      };

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting user ad stats:', error);
      return { success: false, error: error.message };
    }
  },

  // Get admin revenue overview
  async getAdminRevenueOverview(period = '30d') {
    try {
      const startDate = new Date();
      if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (period === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }

      const { data, error } = await supabase
        .from('ad_revenues')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate admin stats
      const totalBaseRevenue = data.reduce((sum, item) => sum + (item.base_revenue || 0), 0);
      const totalUserEarnings = data.reduce((sum, item) => sum + (item.user_earnings || 0), 0);
      const adminRevenue = totalBaseRevenue - totalUserEarnings;

      const stats = {
        totalBaseRevenue,
        totalUserEarnings,
        adminRevenue,
        adminShare: totalBaseRevenue > 0 ? (adminRevenue / totalBaseRevenue) * 100 : 0,
        totalViews: data.filter(item => item.event_type === 'view').length,
        totalClicks: data.filter(item => item.event_type === 'click').length,
        totalCompletions: data.filter(item => item.event_type === 'completion').length,
        byPlatform: {
          adsterra: {
            baseRevenue: data.filter(item => item.platform === 'adsterra').reduce((sum, item) => sum + (item.base_revenue || 0), 0),
            userEarnings: data.filter(item => item.platform === 'adsterra').reduce((sum, item) => sum + (item.user_earnings || 0), 0),
            views: data.filter(item => item.platform === 'adsterra' && item.event_type === 'view').length
          },
          adgem: {
            baseRevenue: data.filter(item => item.platform === 'adgem').reduce((sum, item) => sum + (item.base_revenue || 0), 0),
            userEarnings: data.filter(item => item.platform === 'adgem').reduce((sum, item) => sum + (item.user_earnings || 0), 0),
            completions: data.filter(item => item.platform === 'adgem' && item.event_type === 'completion').length
          }
        },
        dailyStats: this.groupByDay(data),
        userLevelStats: this.groupByUserLevel(data)
      };

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting admin revenue overview:', error);
      return { success: false, error: error.message };
    }
  },

  // Helper function to group data by day
  groupByDay(data) {
    const grouped = {};
    data.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = {
          date,
          baseRevenue: 0,
          userEarnings: 0,
          views: 0,
          clicks: 0,
          completions: 0
        };
      }
      grouped[date].baseRevenue += item.base_revenue || 0;
      grouped[date].userEarnings += item.user_earnings || 0;
      if (item.event_type === 'view') grouped[date].views++;
      if (item.event_type === 'click') grouped[date].clicks++;
      if (item.event_type === 'completion') grouped[date].completions++;
    });
    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  // Helper function to group data by user level
  groupByUserLevel(data) {
    const grouped = {};
    data.forEach(item => {
      const level = item.user_level || 0;
      if (!grouped[level]) {
        grouped[level] = {
          level,
          baseRevenue: 0,
          userEarnings: 0,
          count: 0
        };
      }
      grouped[level].baseRevenue += item.base_revenue || 0;
      grouped[level].userEarnings += item.user_earnings || 0;
      grouped[level].count++;
    });
    return Object.values(grouped).sort((a, b) => a.level - b.level);
  }
};

export default adRevenueService;
