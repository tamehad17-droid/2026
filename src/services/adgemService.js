import { supabase } from '../lib/supabase';

export const adgemService = {
  // Get available AdGem offers with user-level-based rewards
  async getAdgemOffers(userId) {
    try {
      // First try to get from database
      const { data: offers, error } = await supabase?.from('adgem_offers')?.select('*')?.eq('is_active', true)?.order('created_at', { ascending: false });

      // If there is an error or no result, fall back to static offers
        if (error) {
          console.error('Database error when fetching offers:', error);
          throw new Error('database_error');
        }
      
        if (!offers) {
          console.warn('No offers returned from database');
        return { offers: this.getFallbackAdGemOffers(userId), error: null };
      }

      // If DB returned an empty list, return empty offers (don't use fallback)
      if (Array.isArray(offers) && offers.length === 0) {
        return { offers: [], error: null };
      }

      // Get user level to calculate display rewards (defensive - allow null userId)
      let userLevel = 0;
      if (userId) {
        try {
          const { data: userProfile } = await supabase?.from('user_profiles')?.select('level')?.eq('id', userId)?.single();
          userLevel = userProfile?.level || 0;
        } catch (err) {
          console.warn('Failed to load user profile for AdGem offers, defaulting to level 0', err);
          userLevel = 0;
        }
      }

      // Calculate display rewards based on user level (hide real values)
      const offersWithUserRewards = offers?.map(offer => ({
        ...offer,
        real_value: undefined, // Hide real value from user
        display_reward: this.calculateDisplayReward(offer?.real_value || 0, userLevel),
        user_level: userLevel
      }));

      return { offers: offersWithUserRewards || [], error: null };
    } catch (error) {
      console.warn('AdGem service error, using fallback offers:', error);
      return { offers: this.getFallbackAdGemOffers(userId), error: null };
    }
  },

  // Fallback AdGem offers when database is not available
  getFallbackAdGemOffers(userId) {
    const baseOffers = [
      {
        id: 'adgem_fallback_1',
        external_id: 'adgem_mobile_game_1',
        title: 'Download and Try Mobile Game',
        description: 'Download a popular mobile game and reach level 5 to earn rewards',
        real_value: 2.50,
        currency: 'USD',
        countries: ['US', 'CA', 'GB', 'AU'],
        device_types: ['mobile'],
        category: 'Gaming',
        external_url: `https://api.adgem.com/v1/wall?appid=${process.env.VITE_ADGEM_APP_ID}&playerid=${userId || 'guest'}&all_offers=1`,
        requirements: {
          min_level: 5,
          time_limit: '24 hours',
          device: 'Mobile device required'
        },
        is_active: true
      },
      {
        id: 'adgem_fallback_2',
        external_id: 'adgem_survey_shopping',
        title: 'Complete Shopping Survey',
        description: 'Share your opinions about online shopping habits and preferences',
        real_value: 1.25,
        currency: 'USD',
        countries: ['US', 'CA', 'GB', 'AU'],
        device_types: ['desktop', 'mobile'],
        category: 'Surveys',
        external_url: `https://wall.adgem.com/g/31409?user_id=${userId || 'guest'}`,
        requirements: {
          age_min: 18,
          time_estimate: '10-15 minutes',
          valid_email: true
        },
        is_active: true
      },
      {
        id: 'adgem_fallback_3',
        external_id: 'adgem_streaming_signup',
        title: 'Sign Up for Streaming Service',
        description: 'Create account and start free trial for popular streaming platform',
        real_value: 4.00,
        currency: 'USD',
        countries: ['US', 'CA', 'GB'],
        device_types: ['desktop', 'mobile'],
        category: 'Sign-ups',
        external_url: `https://wall.adgem.com/g/31409?user_id=${userId || 'guest'}`,
        requirements: {
          credit_card: 'Required for verification',
          time_estimate: '5-10 minutes',
          cancel_anytime: true
        },
        is_active: true
      },
      {
        id: 'adgem_fallback_4',
        external_id: 'adgem_app_install_rate',
        title: 'Install and Rate App',
        description: 'Download app, use for 3 days, and leave honest review',
        real_value: 3.25,
        currency: 'USD',
        countries: ['US', 'CA', 'GB', 'AU'],
        device_types: ['mobile'],
        category: 'App Testing',
        external_url: `https://wall.adgem.com/g/31409?user_id=${userId || 'guest'}`,
        requirements: {
          usage_days: 3,
          review_required: true,
          app_store_account: true
        },
        is_active: true
      },
      {
        id: 'adgem_fallback_5',
        external_id: 'adgem_finance_survey',
        title: 'Complete Financial Survey',
        description: 'Answer detailed questions about your financial goals and planning',
        real_value: 5.50,
        currency: 'USD',
        countries: ['US', 'CA'],
        device_types: ['desktop'],
        category: 'Surveys',
        external_url: `https://wall.adgem.com/g/31409?user_id=${userId || 'guest'}`,
        requirements: {
          age_min: 21,
          employment_status: 'Required',
          time_estimate: '20-30 minutes'
        },
        is_active: true
      },
      {
        id: 'adgem_fallback_6',
        external_id: 'adgem_casino_signup',
        title: 'Casino Game Registration',
        description: 'Register and make first deposit at online casino platform',
        real_value: 8.00,
        currency: 'USD',
        countries: ['US', 'CA', 'GB'],
        device_types: ['desktop', 'mobile'],
        category: 'Gaming',
        external_url: `https://wall.adgem.com/g/31409?user_id=${userId || 'guest'}`,
        requirements: {
          age_min: 21,
          deposit_min: '$10',
          verification_required: true
        },
        is_active: true
      }
    ];

    // Get user level for reward calculation
    let userLevel = 0;
    // Since this is fallback, we'll assume level 0 if no user data available

    return baseOffers.map(offer => ({
      ...offer,
      real_value: undefined, // Hide real value
      display_reward: this.calculateDisplayReward(offer.real_value, userLevel),
      user_level: userLevel
    }));
  },

  // Calculate display reward based on user level (NOT real value)
  calculateDisplayReward(realValue, userLevel) {
    const percentages = {
      0: 0.10, // 10% for level 0
      1: 0.25, // 25% for level 1
      2: 0.40, // 40% for level 2
      3: 0.55, // 55% for level 3
      4: 0.70, // 70% for level 4
    };

    // Level 5+ gets 85%
    const percentage = userLevel >= 5 ? 0.85 : (percentages?.[userLevel] || 0.10);
    return parseFloat((realValue * percentage)?.toFixed(2));
  },

  // Create AdGem task from offer
  async createAdgemTask(offerId, userId) {
    try {
      const { data: offer, error: offerError } = await supabase?.from('adgem_offers')?.select('*')?.eq('id', offerId)?.single();

      if (offerError) throw offerError;

      // Get user level to calculate their reward
      const { data: userProfile } = await supabase?.from('user_profiles')?.select('level')?.eq('id', userId)?.single();
      const userLevel = userProfile?.level || 0;
      const userReward = this.calculateDisplayReward(offer?.real_value, userLevel);

      // Create task with user-specific reward (not real value)
      const { data: task, error } = await supabase?.from('tasks')?.insert({
          title: offer?.title,
          description: offer?.description,
          category: 'adgem',
          reward_amount: userReward, // Use calculated user reward, not real value
          external_url: offer?.external_url,
          requirements: {
            ...offer?.requirements,
            adgem_offer_id: offerId,
            real_value: offer?.real_value, // Store real value for admin processing
            user_level_at_creation: userLevel
          },
          created_by: userId,
          total_slots: 1 // AdGem offers are typically individual
        })?.select()?.single();

      if (error) throw error;
      return { task, error: null };
    } catch (error) {
      return { task: null, error };
    }
  },

  // Get AdGem offers for admin (shows real values)
  async getAdgemOffersForAdmin() {
    try {
      const { data, error } = await supabase?.from('adgem_offers')?.select('*')?.order('created_at', { ascending: false });

      if (error) throw error;
      return { offers: data || [], error: null };
    } catch (error) {
      return { offers: [], error };
    }
  },

  // Create new AdGem offer (admin only)
  async createAdgemOffer(offerData) {
    try {
      const { data, error } = await supabase?.from('adgem_offers')?.insert({
          external_id: offerData?.external_id,
          title: offerData?.title,
          description: offerData?.description,
          real_value: parseFloat(offerData?.real_value),
          currency: offerData?.currency || 'USD',
          countries: offerData?.countries || [],
          device_types: offerData?.device_types || ['mobile', 'desktop'],
          category: offerData?.category,
          external_url: offerData?.external_url,
          requirements: offerData?.requirements || {},
          is_active: offerData?.is_active !== false
        })?.select()?.single();

      if (error) throw error;
      return { offer: data, error: null };
    } catch (error) {
      return { offer: null, error };
    }
  },

  // Update AdGem offer (admin only)
  async updateAdgemOffer(offerId, updates) {
    try {
      const { data, error } = await supabase?.from('adgem_offers')?.update(updates)?.eq('id', offerId)?.select()?.single();

      if (error) throw error;
      return { offer: data, error: null };
    } catch (error) {
      return { offer: null, error };
    }
  },

  // Delete AdGem offer (admin only)
  async deleteAdgemOffer(offerId) {
    try {
      const { data, error } = await supabase?.from('adgem_offers')?.delete()?.eq('id', offerId)?.select()?.single();

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get level reward configuration (admin)
  async getLevelRewardConfig() {
    try {
      const { data, error } = await supabase?.from('level_reward_config')?.select('*')?.order('level');

      if (error) throw error;
      return { config: data || [], error: null };
    } catch (error) {
      return { config: [], error };
    }
  },

  // Update level reward percentage (admin only)
  async updateLevelRewardConfig(level, percentage) {
    try {
      const { data, error } = await supabase?.from('level_reward_config')?.upsert({
          level: parseInt(level),
          reward_percentage: parseFloat(percentage)
        })?.select()?.single();

      if (error) throw error;
      return { config: data, error: null };
    } catch (error) {
      return { config: null, error };
    }
  },

  // Process AdGem task submission (admin)
  async processAdgemSubmission(submissionId, action, adminNotes = '') {
    try {
      // Get submission details
      const { data: submission, error: submissionError } = await supabase?.from('task_submissions')?.select(`
          *,
          tasks(*),
          user_profiles(*)
        `)?.eq('id', submissionId)?.single();

      if (submissionError) throw submissionError;

      const status = action === 'approve' ? 'approved' : 'rejected';
      const { data: currentUser } = await supabase?.auth?.getUser();

      // Update submission status
      const { data: updatedSubmission, error } = await supabase?.from('task_submissions')?.update({
          status,
          reviewed_by: currentUser?.user?.id,
          reviewed_at: new Date()?.toISOString(),
          admin_notes: adminNotes
        })?.eq('id', submissionId)?.select()?.single();

      if (error) throw error;

      // If approved, process payment with real value (not display value)
      if (action === 'approve') {
        const realValue = submission?.tasks?.requirements?.real_value || submission?.tasks?.reward_amount;
        
        // Create transaction with real value
        await supabase?.from('transactions')?.insert({
          user_id: submission?.user_id,
          type: 'earning',
          amount: realValue, // Use real value for actual payment
          description: `AdGem task completion: ${submission?.tasks?.title}`,
          status: 'completed',
          reference_type: 'adgem_submission',
          reference_id: submissionId
        });

        // Update user balance with real value
        await supabase?.rpc('increment_user_balance', {
          user_uuid: submission?.user_id,
          amount: realValue
        });
      }

      return { submission: updatedSubmission, error: null };
    } catch (error) {
      return { submission: null, error };
    }
  },

  // Admin: list offers from database (shows real values)
  async getOffers() {
    try {
      const { data, error } = await supabase?.from('adgem_offers')?.select('*')?.order('created_at', { ascending: false });
      if (error) throw error;
      return { offers: data || [], error: null };
    } catch (error) {
      return { offers: [], error };
    }
  },

  // Admin: trigger sync from AdGem API into database via Edge Function
  async syncOffers() {
    try {
      const { data, error } = await supabase?.functions?.invoke('sync-adgem-offers', {
        method: 'POST',
        body: {}
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  }
};

export default adgemService;
