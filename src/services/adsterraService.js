import { supabase } from '../lib/supabase';

export const adsterraService = {
  // Get available Adsterra offers
  async getAdsterraOffers(userId) {
    try {
      // Get offers from database first
      const { data: offers, error } = await supabase?.from('adsterra_offers')?.select('*')?.eq('is_active', true)?.order('created_at', { ascending: false });

      if (error) {
        console.error('Database error when fetching Adsterra offers:', error);
        // Fall back to static offers
        return { offers: this.getFallbackAdsterraOffers(userId), error: null };
      }

      // If no offers in DB, use fallback
      if (!offers || offers.length === 0) {
        return { offers: this.getFallbackAdsterraOffers(userId), error: null };
      }

      // Process each offer to include user-specific data
      const processedOffers = offers.map(offer => ({
        ...offer,
        isAdsterraOffer: true,
        external_url: this.getAdsterraOfferUrl(offer.campaign_id, userId)
      }));

      return { offers: processedOffers, error: null };
    } catch (error) {
      console.warn('Adsterra service error, using fallback offers:', error);
      return { offers: this.getFallbackAdsterraOffers(userId), error: null };
    }
  },

  // Generate Adsterra offer URL with proper tracking
  getAdsterraOfferUrl(campaignId, userId) {
    const baseUrl = process.env.VITE_ADSTERRA_DIRECT_URL;
    const publisherId = process.env.VITE_ADSTERRA_PUBLISHER_ID;
    return `${baseUrl}?campaign=${campaignId}&publisher=${publisherId}&user=${userId || 'guest'}`;
  },

  // Fallback offers when database is unavailable
  getFallbackAdsterraOffers(userId) {
    const baseOffers = [
      {
        id: 'adsterra_fallback_1',
        title: 'Play Mobile Game',
        description: 'Download and play an exciting new mobile game to level 10',
        reward_amount: 1.50,
        campaign_id: 'game_123',
        category: 'Gaming',
        requirements: {
          level: 10,
          time_limit: '48 hours'
        },
        is_active: true
      },
      {
        id: 'adsterra_fallback_2',
        title: 'Complete Survey',
        description: 'Share your opinion in a quick 5-minute survey',
        reward_amount: 0.75,
        campaign_id: 'survey_456',
        category: 'Surveys',
        requirements: {
          time_estimate: '5 minutes'
        },
        is_active: true
      }
    ];

    // Add Adsterra-specific properties to each offer
    return baseOffers.map(offer => ({
      ...offer,
      isAdsterraOffer: true,
      external_url: this.getAdsterraOfferUrl(offer.campaign_id, userId)
    }));
  },

  // Admin: Create new Adsterra offer
  async createAdsterraOffer(offerData) {
    try {
      const { data, error } = await supabase?.from('adsterra_offers')?.insert({
        title: offerData.title,
        description: offerData.description,
        reward_amount: parseFloat(offerData.reward_amount),
        campaign_id: offerData.campaign_id,
        category: offerData.category,
        requirements: offerData.requirements || {},
        is_active: true
      })?.select()?.single();

      if (error) throw error;
      return { offer: data, error: null };
    } catch (error) {
      return { offer: null, error };
    }
  },

  // Process Adsterra postback
  async processAdsterraPostback(postbackData) {
    try {
      const {
        campaign_id,
        user_id,
        payout,
        status,
        transaction_id
      } = postbackData;

      if (status !== 'completed') {
        console.log('Ignoring incomplete Adsterra postback:', postbackData);
        return { success: true }; // Don't process incomplete conversions
      }

      // Create transaction record
      const { error: transactionError } = await supabase?.from('transactions')?.insert({
        user_id,
        type: 'adsterra_offer',
        amount: parseFloat(payout),
        status: 'completed',
        description: `Adsterra offer completion`,
        reference_type: 'adsterra_postback',
        reference_id: transaction_id
      });

      if (transactionError) throw transactionError;

      // Update user balance
      const { error: balanceError } = await supabase?.rpc('update_wallet_balance', {
        p_user_id: user_id,
        p_amount: parseFloat(payout),
        p_type: 'add',
        p_category: 'adsterra'
      });

      if (balanceError) throw balanceError;

      return { success: true };
    } catch (error) {
      console.error('Error processing Adsterra postback:', error);
      return { success: false, error };
    }
  },

  // Admin: Get Adsterra statistics
  async getAdsterraStats(dateRange) {
    try {
      const { data, error } = await supabase?.from('transactions')
        ?.select('*')
        ?.eq('type', 'adsterra_offer')
        ?.gte('created_at', dateRange?.start)
        ?.lte('created_at', dateRange?.end);

      if (error) throw error;

      const stats = {
        total_conversions: data?.length || 0,
        total_payout: data?.reduce((sum, tx) => sum + (tx.amount || 0), 0),
        by_campaign: {} // Group by campaign if needed
      };

      return { stats, error: null };
    } catch (error) {
      return { stats: null, error };
    }
  }
};

export default adsterraService;