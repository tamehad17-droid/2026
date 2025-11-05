    try {
      // First update the user profile
      const { data: profile, error: updateError } = await supabase
        ?.from('user_profiles')
        ?.update({
          approval_status: 'approved',
          approved_by: adminId,
          approved_at: new Date().toISOString(),
          status: 'active'
        })
        ?.eq('id', userId)
        ?.select()
        ?.single();

      if (updateError) throw updateError;

      // Add welcome bonus transaction
      const { error: transactionError } = await supabase
        ?.from('transactions')
        ?.insert({
          user_id: userId,
          type: 'bonus',
          amount: 5.00,
          description: 'Welcome bonus after approval',
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      // Update user balance
      const { error: balanceError } = await supabase?.rpc('update_wallet_balance', {
        p_user_id: userId,
        p_amount: 5.00,
        p_type: 'add',
        p_category: 'bonus'
      });

      if (balanceError) throw balanceError;

      // Log admin action
      await this.logAdminAction('approve_user', 'user_profiles', userId, {
        approved_by: adminId,
        welcome_bonus: 5.00
      });

      // Send welcome email notification
      try {
        await this.sendNotificationEmail('welcome', profile?.email, {
          fullName: profile?.full_name,
          loginUrl: `${window.location.origin}/login`
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the approval if email fails
      }

      return {
        success: true,
        message: 'User approved successfully'
      };
    } catch (error) {