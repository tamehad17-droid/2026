/**
 * Netlify Function for AdGem Postback
 * Handles conversion callbacks from AdGem
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('AdGem Postback received:', {
      method: event.httpMethod,
      path: event.path,
      query: event.queryStringParameters,
      body: event.body
    });

    // Verify postback key in URL path
    const postbackKey = process.env.VITE_ADGEM_POSTBACK_KEY || 'bb6h7hh67id3809bi7blmekd';
    
    if (!event.path.includes(postbackKey) && !event.path.includes('adgem-postback')) {
      console.error('Invalid postback key in path:', event.path);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Extract parameters from query string or body
    let params = {};
    
    if (event.httpMethod === 'GET') {
      params = event.queryStringParameters || {};
    } else if (event.httpMethod === 'POST') {
      try {
        params = event.body ? JSON.parse(event.body) : {};
      } catch (e) {
        // If JSON parsing fails, try URL-encoded
        const urlParams = new URLSearchParams(event.body);
        params = Object.fromEntries(urlParams);
      }
    }

    console.log('Parsed parameters:', params);

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
    if (!player_id || !offer_id || (!amount && !payout)) {
      console.error('Missing required parameters:', { player_id, offer_id, amount, payout });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Find user by player_id (assuming player_id is user ID)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, level, email, username')
      .eq('id', player_id)
      .single();

    if (userError || !user) {
      console.error('User not found:', player_id, userError);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
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
    const userEarnings = Math.round(baseAmount * userPercentage * 100) / 100; // Round to 2 decimal places

    console.log('Earnings calculation:', {
      baseAmount,
      userLevel: user.level,
      userPercentage,
      userEarnings
    });

    // Record ad revenue
    const { error: revenueError } = await supabase
      .from('ad_revenues')
      .insert({
        user_id: user.id,
        platform: 'adgem',
        ad_type: ad_type || 'offer',
        placement: 'offerwall',
        offer_id: offer_id?.toString(),
        offer_name: offer_name,
        base_revenue: baseAmount,
        user_share: userPercentage,
        user_earnings: userEarnings,
        user_level: user.level,
        event_type: 'conversion',
        transaction_id: transaction_id?.toString(),
        campaign_id: campaign_id?.toString(),
        country: country,
        ip_address: ip,
        user_agent: useragent,
        platform_info: platform,
        conversion_datetime: conversion_datetime,
        click_datetime: click_datetime,
        goal_name: goal_name,
        goal_id: goal_id?.toString(),
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
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to record revenue' })
      };
    }

    // Update user wallet using the SQL function
    const { error: walletError } = await supabase.rpc('update_user_wallet', {
      p_user_id: user.id,
      p_amount: userEarnings,
      p_transaction_type: 'ADGEM_OFFER_COMPLETION'
    });

    if (walletError) {
      console.error('Error updating wallet:', walletError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to update wallet' })
      };
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'ADGEM_OFFER_COMPLETION',
        amount: userEarnings,
        description: `AdGem offer completion: ${offer_name || offer_id}`,
        reference_id: transaction_id?.toString(),
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

    console.log(`AdGem conversion processed successfully for user ${user.username} (${user.id}): $${userEarnings}`);

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Conversion processed successfully',
        user_id: user.id,
        username: user.username,
        earnings: userEarnings,
        transaction_id: transaction_id,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('AdGem postback error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
