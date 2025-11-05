import { supabase } from '../lib/supabase';

export const emailNotificationService = {
  // Send task approval notification
  async sendTaskApprovedEmail(userEmail, userName, taskTitle, rewardAmount) {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: userEmail,
          subject: '✅ Task Approved - PromoHive',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                          <div style="font-size: 64px; margin-bottom: 10px;">✅</div>
                          <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Task Approved!</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <p style="font-size: 16px; color: #374151; margin: 0 0 20px;">Hi <strong>${userName}</strong>,</p>
                          <p style="font-size: 16px; color: #374151; margin: 0 0 30px; line-height: 1.6;">
                            Great news! Your task submission has been <strong style="color: #10b981;">approved</strong>.
                          </p>
                          
                          <!-- Task Details Box -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; margin: 0 0 30px; border: 1px solid #e5e7eb;">
                            <tr>
                              <td style="padding: 20px;">
                                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Task Name</p>
                                <p style="margin: 0 0 20px; color: #111827; font-size: 18px; font-weight: bold;">${taskTitle}</p>
                                
                                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Reward Amount</p>
                                <p style="margin: 0; color: #10b981; font-size: 32px; font-weight: bold;">$${parseFloat(rewardAmount).toFixed(2)}</p>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="font-size: 16px; color: #374151; margin: 0 0 30px; line-height: 1.6;">
                            The reward has been added to your account balance and is now available for withdrawal.
                          </p>
                          
                          <!-- CTA Button -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                <a href="https://globalpromonetwork.online/wallet-overview" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 0 0 30px;">
                                  View Your Wallet
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="font-size: 14px; color: #6b7280; margin: 0; line-height: 1.6;">
                            Keep completing tasks to earn more rewards!
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px;">
                            This is an automated message from PromoHive.
                          </p>
                          <p style="margin: 0; color: #6b7280; font-size: 12px;">
                            © 2025 PromoHive. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        }
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error sending task approved email:', error);
      return { success: false, error };
    }
  },

  // Send task rejection notification
  async sendTaskRejectedEmail(userEmail, userName, taskTitle, rejectionReason) {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: userEmail,
          subject: '❌ Task Submission Rejected - PromoHive',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
                          <div style="font-size: 64px; margin-bottom: 10px;">❌</div>
                          <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Task Submission Rejected</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <p style="font-size: 16px; color: #374151; margin: 0 0 20px;">Hi <strong>${userName}</strong>,</p>
                          <p style="font-size: 16px; color: #374151; margin: 0 0 30px; line-height: 1.6;">
                            Unfortunately, your task submission has been <strong style="color: #ef4444;">rejected</strong> by our review team.
                          </p>
                          
                          <!-- Task Details Box -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; margin: 0 0 30px; border: 1px solid #e5e7eb;">
                            <tr>
                              <td style="padding: 20px;">
                                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Task Name</p>
                                <p style="margin: 0 0 20px; color: #111827; font-size: 18px; font-weight: bold;">${taskTitle}</p>
                                
                                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Reason for Rejection</p>
                                <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6; background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
                                  ${rejectionReason || 'The submitted proof did not meet the task requirements.'}
                                </p>
                              </td>
                            </tr>
                          </table>
                          
                          <h2 style="font-size: 20px; color: #111827; margin: 0 0 15px;">What's Next?</h2>
                          <ul style="padding-left: 20px; margin: 0 0 30px;">
                            <li style="margin-bottom: 10px; color: #374151; line-height: 1.6;">
                              Review the rejection reason carefully
                            </li>
                            <li style="margin-bottom: 10px; color: #374151; line-height: 1.6;">
                              Make sure to follow all task requirements
                            </li>
                            <li style="margin-bottom: 10px; color: #374151; line-height: 1.6;">
                              Try other available tasks to continue earning
                            </li>
                          </ul>
                          
                          <!-- CTA Button -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                <a href="https://globalpromonetwork.online/tasks-list" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 0 0 30px;">
                                  Browse Available Tasks
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="font-size: 14px; color: #6b7280; margin: 0; line-height: 1.6;">
                            If you have any questions, please contact our support team.
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px;">
                            This is an automated message from PromoHive.
                          </p>
                          <p style="margin: 0; color: #6b7280; font-size: 12px;">
                            © 2025 PromoHive. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        }
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error sending task rejected email:', error);
      return { success: false, error };
    }
  },

  // Send welcome email after approval
  async sendWelcomeEmail(userEmail, userName, welcomeBonus = 5) {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: userEmail,
          subject: '🎉 Welcome to PromoHive - Account Approved!',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Welcome to PromoHive!</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <p style="font-size: 16px; color: #374151; margin: 0 0 20px;">Hi <strong>${userName}</strong>,</p>
                          <p style="font-size: 16px; color: #374151; margin: 0 0 30px; line-height: 1.6;">
                            Great news! Your account has been <strong style="color: #10b981;">approved</strong> and you're ready to start earning!
                          </p>
                          
                          <!-- Welcome Bonus Box -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; margin: 0 0 30px;">
                            <tr>
                              <td style="padding: 30px; text-align: center;">
                                <p style="color: #ffffff; margin: 0 0 10px; font-size: 20px; font-weight: bold;">🎁 Welcome Bonus</p>
                                <p style="color: #ffffff; margin: 0; font-size: 48px; font-weight: bold;">$${welcomeBonus}.00</p>
                                <p style="color: #d1fae5; margin: 10px 0 0; font-size: 14px;">has been added to your account!</p>
                              </td>
                            </tr>
                          </table>
                          
                          <h2 style="font-size: 20px; color: #111827; margin: 0 0 15px;">What's Next?</h2>
                          <ul style="padding-left: 20px; margin: 0 0 30px;">
                            <li style="margin-bottom: 10px; color: #374151; line-height: 1.6;">
                              <strong>Browse Tasks:</strong> Start earning by completing available tasks
                            </li>
                            <li style="margin-bottom: 10px; color: #374151; line-height: 1.6;">
                              <strong>Refer Friends:</strong> Earn bonus rewards for every referral
                            </li>
                            <li style="margin-bottom: 10px; color: #374151; line-height: 1.6;">
                              <strong>Daily Spin:</strong> Spin the wheel every day for extra prizes
                            </li>
                            <li style="margin-bottom: 10px; color: #374151; line-height: 1.6;">
                              <strong>Upgrade Account:</strong> Unlock better rewards with premium levels
                            </li>
                          </ul>
                          
                          <!-- CTA Button -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                <a href="https://globalpromonetwork.online/login" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; margin: 0 0 30px;">
                                  Login to Your Account
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <h2 style="font-size: 20px; color: #111827; margin: 0 0 15px;">Need Help?</h2>
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 0 0 20px;">
                            <tr>
                              <td>
                                <p style="margin: 0 0 10px; color: #374151; font-size: 14px;">
                                  📧 <strong>Email:</strong> admin@globalpromonetwork.online
                                </p>
                                <p style="margin: 0; color: #374151; font-size: 14px;">
                                  🌐 <strong>Website:</strong> globalpromonetwork.online
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 10px; color: #6b7280; font-size: 12px;">
                            This is an automated message from PromoHive.
                          </p>
                          <p style="margin: 0; color: #6b7280; font-size: 12px;">
                            © 2025 PromoHive. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        }
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }
  },

  // Send withdrawal processed notification
  async sendWithdrawalProcessedEmail(userEmail, userName, amount, txHash, network = 'TRC20') {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: userEmail,
          subject: '✅ Withdrawal Processed - PromoHive',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Withdrawal Processed!</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px 30px;">
                          <p style="font-size: 16px; color: #374151; margin: 0 0 20px;">Hi <strong>${userName}</strong>,</p>
                          <p style="font-size: 16px; color: #374151; margin: 0 0 30px;">
                            Your withdrawal request has been successfully processed.
                          </p>
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; margin: 0 0 30px;">
                            <tr>
                              <td style="padding: 20px;">
                                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Amount</p>
                                <p style="margin: 0 0 20px; color: #10b981; font-size: 32px; font-weight: bold;">$${parseFloat(amount).toFixed(2)}</p>
                                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Network</p>
                                <p style="margin: 0 0 20px; color: #111827; font-size: 16px;">${network}</p>
                                ${txHash ? `
                                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Transaction Hash</p>
                                <p style="margin: 0; color: #111827; font-size: 12px; word-break: break-all;">${txHash}</p>
                                ` : ''}
                              </td>
                            </tr>
                          </table>
                          <p style="font-size: 14px; color: #6b7280; margin: 0;">
                            The funds should arrive in your wallet within a few minutes.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center;">
                          <p style="margin: 0; color: #6b7280; font-size: 12px;">
                            © 2025 PromoHive. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        }
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }
};
