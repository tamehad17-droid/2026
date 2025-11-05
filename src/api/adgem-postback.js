/**
 * AdGem Postback Handler
 * Handles conversion callbacks from AdGem
 */

import { supabase } from '../lib/supabase';

// AdGem Postback Handler
export const handleAdGemPostback = async (req, res) => {
  try {
    // Verify postback key
    const postbackKey = process.env.VITE_ADGEM_POSTBACK_KEY || 'bb6h7hh67id3809bi7blmekd';
    const requestPath = req.path || req.url;
    
    if (!requestPath.includes(postbackKey)) {
      console.error('Invalid postback key');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract parameters from query string or body
    const params = req.method === 'GET' ? req.query : req.body;
    
    console.log('AdGem Postback received:', params);

    // Extract AdGem macros
    const {
      player_id,
      offer_id,
      offer_name,
      amount,
      payout,
      transaction_id,
      campaign_id,
      country,
      ip,
      useragent,
      platform,
      conversion_datetime,
      click_datetime,
      state,
      goal_name,
      goal_id,
      ad_type,
      all_goals_completed,
      allow_multiple_conversions,
      app_id,
      app_version,
      c1, c2, c3, c4, c5,
      gaid,
      idfa,
      os_version,
      store_id,
      tracking_type
    } = params;

    // Validate required parameters
    if (!player_id || !offer_id || !amount) {
      console.error('Missing required parameters:', { player_id, offer_id, amount });
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Find user by player_id (assuming player_id is user ID)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, level, email')
      .eq('id', player_id)
      .single();

    if (userError || !user) {
      console.error('User not found:', player_id, userError);
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate user earnings based on level
    const baseAmount = parseFloat(amount) || parseFloat(payout) || 0;
    const levelPercentages = {
      0: 0.10, // 10%
      1: 0.35, // 35%
      2: 0.55, // 55%
      3: 0.78  // 78%
    };
    
    const userPercentage = levelPercentages[user.level] || levelPercentages[0];
    const userEarnings = baseAmount * userPercentage;

    // Record ad revenue
    const { error: revenueError } = await supabase
      .from('ad_revenues')
      .insert({
        user_id: user.id,
        platform: 'adgem',
        ad_type: ad_type || 'offer',
        placement: 'offerwall',
        offer_id: offer_id,
        offer_name: offer_name,
        base_revenue: baseAmount,
        user_share: userPercentage,
        user_earnings: userEarnings,
        user_level: user.level,
        event_type: 'conversion',
        transaction_id: transaction_id,
        campaign_id: campaign_id,
        country: country,
        ip_address: ip,
        user_agent: useragent,
        platform_info: platform,
        conversion_datetime: conversion_datetime,
        click_datetime: click_datetime,
        goal_name: goal_name,
        goal_id: goal_id,
        metadata: {
          all_goals_completed,
          allow_multiple_conversions,
          app_id,
          app_version,
          custom_params: { c1, c2, c3, c4, c5 },
          gaid,
          idfa,
          os_version,
          store_id,
          tracking_type,
          state
        }
      });

    if (revenueError) {
      console.error('Error recording ad revenue:', revenueError);
      return res.status(500).json({ error: 'Failed to record revenue' });
    }

    // Update user wallet
    const { error: walletError } = await supabase.rpc('update_user_wallet', {
      p_user_id: user.id,
      p_amount: userEarnings,
      p_transaction_type: 'ADGEM_OFFER_COMPLETION'
    });

    if (walletError) {
      console.error('Error updating wallet:', walletError);
      return res.status(500).json({ error: 'Failed to update wallet' });
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'ADGEM_OFFER_COMPLETION',
        amount: userEarnings,
        description: `AdGem offer completion: ${offer_name || offer_id}`,
        reference_id: transaction_id,
        metadata: {
          platform: 'adgem',
          offer_id,
          offer_name,
          base_amount: baseAmount,
          user_percentage: userPercentage,
          conversion_datetime,
          campaign_id
        }
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      // Don't return error here as the main operation succeeded
    }

    console.log(`AdGem conversion processed successfully for user ${user.id}: $${userEarnings}`);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Conversion processed successfully',
      user_id: user.id,
      earnings: userEarnings,
      transaction_id: transaction_id
    });

  } catch (error) {
    console.error('AdGem postback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Express route handler
export const adgemPostbackRoute = (app) => {
  // Handle both GET and POST requests
  app.get(`/${process.env.VITE_ADGEM_POSTBACK_KEY || 'bb6h7hh67id3809bi7blmekd'}`, handleAdGemPostback);
  app.post(`/${process.env.VITE_ADGEM_POSTBACK_KEY || 'bb6h7hh67id3809bi7blmekd'}`, handleAdGemPostback);
  
  // Alternative routes
  app.get('/api/adgem/postback', handleAdGemPostback);
  app.post('/api/adgem/postback', handleAdGemPostback);
};

export default handleAdGemPostback;
