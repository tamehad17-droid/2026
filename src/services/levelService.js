import { supabase } from '../lib/supabase';

class LevelService {
  // Get available level plans
  async getLevelPlans() {
    const { data, error } = await supabase?.from('level_plans')?.select('*')?.eq('is_active', true)?.order('level');

    if (error) throw error;
    return data;
  }

  // Get user's current level info
  async getUserLevel(userId) {
    const { data, error } = await supabase?.from('user_profiles')?.select('level, balance, pending_balance')?.eq('id', userId)?.single();

    if (error) throw error;
    return data;
  }

  // Request level upgrade
  async requestLevelUpgrade(targetLevel, paymentProof = null) {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    if (!currentUser?.user) {
      throw new Error('User not authenticated');
    }

    // Get level plan details
    const { data: levelPlan, error: planError } = await supabase?.from('level_plans')?.select('*')?.eq('level', targetLevel)?.single();

    if (planError) throw planError;

    // Create level upgrade transaction
    const { data, error } = await supabase?.from('transactions')?.insert({
        user_id: currentUser?.user?.id,
        type: 'level_upgrade',
        amount: levelPlan?.price,
        description: `Level upgrade to ${levelPlan?.name}`,
        status: 'pending',
        reference_type: 'level_plan',
        reference_id: levelPlan?.id
      })?.select()?.single();

    if (error) throw error;
    return data;
  }

  // Get USDT addresses for deposits
  async getDepositAddresses() {
    const { data, error } = await supabase?.from('usdt_addresses')?.select('*')?.eq('is_admin_managed', true)?.order('network');

    if (error) throw error;
    return data;
  }

  // Add user's USDT address
  async addUserUSDTAddress(addressData) {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const { data, error } = await supabase?.from('usdt_addresses')?.insert({
        ...addressData,
        user_id: currentUser?.user?.id,
        is_admin_managed: false
      })?.select()?.single();

    if (error) throw error;
    return data;
  }

  // Get user's USDT addresses
  async getUserUSDTAddresses() {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const { data, error } = await supabase?.from('usdt_addresses')?.select('*')?.eq('user_id', currentUser?.user?.id)?.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Delete user's USDT address
  async deleteUserUSDTAddress(addressId) {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const { data, error } = await supabase?.from('usdt_addresses')?.delete()?.eq('id', addressId)?.eq('user_id', currentUser?.user?.id)?.select()?.single();

    if (error) throw error;
    return data;
  }

  // Get level upgrade history
  async getLevelUpgradeHistory() {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const { data, error } = await supabase?.from('transactions')?.select(`
        *,
        level_plans:level_plans(*)
      `)?.eq('user_id', currentUser?.user?.id)?.eq('type', 'level_upgrade')?.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Check if user can upgrade to specific level
  async canUserUpgrade(targetLevel) {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const { data: userProfile, error: userError } = await supabase?.from('user_profiles')?.select('level')?.eq('id', currentUser?.user?.id)?.single();

    if (userError) throw userError;

    // User can only upgrade to next level
    return targetLevel === userProfile?.level + 1;
  }

  // Get level benefits
  async getLevelBenefits(level) {
    const { data, error } = await supabase?.from('level_plans')?.select('benefits, name')?.eq('level', level)?.single();

    if (error) throw error;
    return data;
  }
}

export const levelService = new LevelService();
export default levelService;