import { supabase } from '../lib/supabase';

export const levelUpgradeService = {
  // Get available upgrade levels
  async getAvailableUpgrades(currentLevel) {
    try {
      // Read from level_plans (public read policy exists), not admin_settings
      const { data, error } = await supabase
        .from('level_plans')
        .select('level, price, is_active')
        .eq('is_active', true)
        .order('level', { ascending: true });

      if (error) throw error;

      const upgrades = (data || [])
        .map(p => ({ level: p.level, price: parseFloat(p.price), available: p.level > currentLevel }))
        .filter(u => u.available);

      return { upgrades, error: null };
    } catch (error) {
      return { upgrades: [], error };
    }
  },

  // Request level upgrade
  async requestUpgrade(userId, toLevel, paymentProof = null, paymentAddress = null) {
    try {
      const { data, error } = await supabase
        .rpc('request_level_upgrade', {
          p_user_id: userId,
          p_to_level: toLevel,
          p_payment_proof: paymentProof,
          p_payment_address: paymentAddress
        });

      if (error) throw error;

      return { result: data, error: null };
    } catch (error) {
      return { result: null, error };
    }
  },

  // Get user's upgrade requests
  async getUserUpgradeRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('level_upgrades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { requests: data || [], error: null };
    } catch (error) {
      return { requests: [], error };
    }
  },

  // Get pending upgrade requests (admin)
  async getPendingUpgrades() {
    try {
      // Step 1: fetch pending upgrades
      const { data: upgrades, error: upgradesError } = await supabase
        .from('level_upgrades')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (upgradesError) throw upgradesError;

      if (!upgrades || upgrades.length === 0) {
        return { requests: [], error: null };
      }

      // Step 2: bulk fetch user profiles
      const userIds = [...new Set(upgrades.map(u => u.user_id).filter(Boolean))];
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, level')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const idToProfile = Object.fromEntries((profiles || []).map(p => [p.id, p]));

      // Merge
      const merged = upgrades.map(u => ({
        ...u,
        user_profile: idToProfile[u.user_id] || null
      }));

      return { requests: merged, error: null };
    } catch (error) {
      return { requests: [], error };
    }
  },

  // Approve upgrade request (admin)
  async approveUpgrade(upgradeId, adminId, txHash = null) {
    try {
      // Get upgrade details
      const { data: upgrade, error: upgradeError } = await supabase
        .from('level_upgrades')
        .select('*')
        .eq('id', upgradeId)
        .single();

      if (upgradeError) throw upgradeError;

      // Update upgrade status
      const { error: updateError } = await supabase
        .from('level_upgrades')
        .update({
          status: 'verified',
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          tx_hash: txHash
        })
        .eq('id', upgradeId);

      if (updateError) throw updateError;

      // Update user level
      const { error: levelError } = await supabase
        .from('user_profiles')
        .update({ level: upgrade.to_level })
        .eq('id', upgrade.user_id);

      if (levelError) throw levelError;

      // Create transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: upgrade.user_id,
          type: 'level_upgrade',
          amount: -upgrade.price,
          description: `Level upgrade from ${upgrade.from_level} to ${upgrade.to_level}`,
          status: 'completed'
        });

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: adminId,
          action_type: 'approve_level_upgrade',
          target_type: 'level_upgrade',
          target_id: upgradeId,
          details: { upgrade_id: upgradeId, to_level: upgrade.to_level, user_id: upgrade.user_id }
        });

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Reject upgrade request (admin)
  async rejectUpgrade(upgradeId, adminId, reason) {
    try {
      const { error } = await supabase
        .from('level_upgrades')
        .update({
          status: 'rejected',
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', upgradeId);

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: adminId,
          action_type: 'reject_level_upgrade',
          target_type: 'level_upgrade',
          target_id: upgradeId,
          details: { upgrade_id: upgradeId, reason }
        });

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }
};
