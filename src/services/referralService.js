import { supabase } from '../lib/supabase';

export const referralService = {
  // Get user's referral code
  async getReferralCode(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('referral_code')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { code: data?.referral_code, error: null };
    } catch (error) {
      return { code: null, error };
    }
  },

  // Get referral link
  async getReferralLink(userId) {
    try {
      const { code, error } = await this.getReferralCode(userId);
      
      if (error) throw error;

      const link = `${window.location.origin}/register?ref=${code}`;

      return { link, code, error: null };
    } catch (error) {
      return { link: null, code: null, error };
    }
  },

  // Get user's referrals
  async getUserReferrals(userId) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_profile:user_profiles!referrals_referred_id_fkey(
            id,
            full_name,
            username,
            email,
            level,
            status,
            created_at
          )
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { referrals: data || [], error: null };
    } catch (error) {
      return { referrals: [], error };
    }
  },

  // Get referral stats with detailed level tracking
  async getReferralStats(userId) {
    try {
      // Get user's level first
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('level')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Get all referrals with referred user details
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_profile:user_profiles!referrals_referred_id_fkey(
            level,
            status
          )
        `)
        .eq('referrer_id', userId);

      if (error) throw error;

      // Get bonus rules for user's level
      const { data: rules, error: rulesError } = await supabase
        .from('referral_bonus_rules')
        .select('*')
        .eq('level', userData.level)
        .eq('is_active', true);

      if (rulesError) throw rulesError;

      // Calculate active referrals at user's level
      const activeReferralsAtLevel = data.filter(r => 
        r.referred_profile?.level >= userData.level &&
        r.referred_profile?.status === 'active'
      ).length;

      // Find next bonus milestone
      const nextBonus = rules?.find(r => r.required_referrals > activeReferralsAtLevel);

      const stats = {
        totalReferrals: data.length,
        qualifiedReferrals: data.filter(r => r.is_qualified).length,
        paidReferrals: data.filter(r => r.is_paid).length,
        totalEarned: data.reduce((sum, r) => sum + parseFloat(r.bonus || 0), 0),
        pendingRewards: data.filter(r => r.is_qualified && !r.is_paid).length,
        // New stats
        activeReferralsAtLevel,
        currentLevel: userData.level,
        nextBonusMilestone: nextBonus?.required_referrals || null,
        nextBonusAmount: nextBonus?.bonus_amount || null,
        referralsNeeded: nextBonus ? nextBonus.required_referrals - activeReferralsAtLevel : 0
      };

      return { stats, error: null };
    } catch (error) {
      return { stats: null, error };
    }
  },

  // Register referral
  async registerReferral(referralCode, referredUserId) {
    try {
      // Find referrer by code
      const { data: referrer, error: referrerError } = await supabase
        .from('user_profiles')
        .select('id, level')
        .eq('referral_code', referralCode)
        .single();

      if (referrerError) throw referrerError;

      // Create referral record
      const { data, error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referred_id: referredUserId,
          level: referrer.level
        })
        .select()
        .single();

      if (error) throw error;

      // Update user profile with referrer
      await supabase
        .from('user_profiles')
        .update({ referred_by: referrer.id })
        .eq('id', referredUserId);

      return { referral: data, error: null };
    } catch (error) {
      return { referral: null, error };
    }
  },

  // Check and process referral rewards (admin function)
  async checkReferralRewards(userId) {
    try {
      const { data, error } = await supabase
        .rpc('check_referral_rewards', { p_referrer_id: userId });

      if (error) throw error;

      return { result: data, error: null };
    } catch (error) {
      return { result: null, error };
    }
  },

  // Get referral earnings
  async getReferralEarnings(userId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('user_id', userId)
        .eq('type', 'referral_bonus')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const total = data.reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return { earnings: data || [], total, error: null };
    } catch (error) {
      return { earnings: [], total: 0, error };
    }
  }
};
