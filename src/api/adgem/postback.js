// AdGem Postback Handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      ad_type,
      all_goals_completed,
      allow_multiple_conversions,
      amount,
      app_id,
      app_version,
      c1, c2, c3, c4, c5,
      campaign_id,
      click_datetime,
      conversion_datetime,
      country,
      gaid,
      goal_name,
      goal_id,
      idfa,
      ip,
      offer_id,
      offer_name,
      os_version,
      payout,
      platform,
      player_id,
      state,
      store_id,
      tracking_type,
      transaction_id,
      useragent
    } = req.body;

    // Validate postback key
    const postbackKey = req.headers['x-postback-key'] || req.query.key;
    if (postbackKey !== process.env.ADGEM_POSTBACK_KEY) {
      return res.status(401).json({ error: 'Invalid postback key' });
    }

    // Log the conversion
    console.log('AdGem Conversion:', {
      player_id,
      offer_name,
      payout,
      transaction_id,
      conversion_datetime
    });

    // Process the conversion
    if (player_id && payout > 0) {
      // Update user balance in database
      await updateUserBalance(player_id, payout, {
        source: 'adgem',
        offer_id,
        offer_name,
        transaction_id,
        conversion_datetime
      });

      // Send success response
      res.status(200).json({ 
        status: 'success',
        message: 'Conversion processed successfully',
        player_id,
        payout
      });
    } else {
      res.status(400).json({ 
        status: 'error',
        message: 'Invalid conversion data'
      });
    }

  } catch (error) {
    console.error('AdGem postback error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error'
    });
  }
}

async function updateUserBalance(userId, amount, metadata) {
  try {
    // This would integrate with your database
    // For now, we'll just log it
    console.log(`Updating balance for user ${userId}: +$${amount}`, metadata);
    
    // In a real implementation, you would:
    // 1. Update user's wallet balance
    // 2. Create transaction record
    // 3. Send notification to user
    // 4. Update user statistics
    
    return true;
  } catch (error) {
    console.error('Error updating user balance:', error);
    throw error;
  }
}
