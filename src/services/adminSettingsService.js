import { supabase } from '../lib/supabase';

export const adminSettingsService = {
  // Get all settings (admin only)
  async getAllSettings() {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (error) throw error;

      return { settings: data || [], error: null };
    } catch (error) {
      return { settings: [], error };
    }
  },

  // Get settings by category
  async getSettingsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('category', category)
        .order('key', { ascending: true });

      if (error) throw error;

      return { settings: data || [], error: null };
    } catch (error) {
      return { settings: [], error };
    }
  },

  // Get single setting
  async getSetting(key) {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error) throw error;

      return { setting: data, error: null };
    } catch (error) {
      return { setting: null, error };
    }
  },

  // Get public settings (for users)
  async getPublicSettings() {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value, description')
        .eq('is_public', true);

      if (error) throw error;

      // Convert to object for easy access
      const settings = {};
      data.forEach(s => {
        settings[s.key] = s.value;
      });

      return { settings, error: null };
    } catch (error) {
      return { settings: {}, error };
    }
  },

  // Update setting (admin only)
  async updateSetting(key, value) {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ 
          value,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;

      return { setting: data, error: null };
    } catch (error) {
      return { setting: null, error };
    }
  },

  // Bulk update settings (admin only)
  async updateMultipleSettings(updates) {
    try {
      const promises = updates.map(({ key, value }) =>
        this.updateSetting(key, value)
      );

      const results = await Promise.all(promises);
      const hasError = results.some(r => r.error);

      if (hasError) {
        throw new Error('Some settings failed to update');
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Create new setting (admin only)
  async createSetting({ key, value, description, category = 'general', data_type = 'string', is_public = false }) {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .insert({
          key,
          value,
          description,
          category,
          data_type,
          is_public
        })
        .select()
        .single();

      if (error) throw error;

      return { setting: data, error: null };
    } catch (error) {
      return { setting: null, error };
    }
  },

  // Delete setting (admin only)
  async deleteSetting(key) {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .delete()
        .eq('key', key);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get level prices
  async getLevelPrices() {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['level_1_price', 'level_2_price', 'level_3_price']);

      if (error) throw error;

      const prices = {};
      data.forEach(s => {
        const level = s.key.split('_')[1];
        prices[level] = parseFloat(s.value);
      });

      return { prices, error: null };
    } catch (error) {
      return { prices: {}, error };
    }
  },

  // Get referral settings
  async getReferralSettings() {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('category', 'referrals');

      if (error) throw error;

      return { settings: data || [], error: null };
    } catch (error) {
      return { settings: [], error };
    }
  },

  // Get financial settings
  async getFinancialSettings() {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('category', 'financial');

      if (error) throw error;

      return { settings: data || [], error: null };
    } catch (error) {
      return { settings: [], error };
    }
  }
};
