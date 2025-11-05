import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

serve(async (req) => {
  // ✅ CORS preflight
  if (req?.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*", // DO NOT CHANGE THIS
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*" // DO NOT CHANGE THIS
      }
    });
  }
  
  try {
    const { type, to, data, subject: customSubject, htmlContent: customHtml } = await req?.json();
    
    // Support direct HTML content mode
    if (customSubject && customHtml) {
      const SMTP_HOST = (globalThis as any)?.Deno?.env?.get('SMTP_HOST') || 'smtp.hostinger.com';
      const SMTP_PORT = parseInt((globalThis as any)?.Deno?.env?.get('SMTP_PORT') || '465');
      const SMTP_USER = (globalThis as any)?.Deno?.env?.get('SMTP_USER') || 'admin@globalpromonetwork.online';
      const SMTP_PASS = (globalThis as any)?.Deno?.env?.get('SMTP_PASS') || 'Ibrahem$811997';
      const SMTP_FROM = (globalThis as any)?.Deno?.env?.get('SMTP_FROM') || 'admin@globalpromonetwork.online';
      
      const client = new SMTPClient({
        connection: {
          hostname: SMTP_HOST,
          port: SMTP_PORT,
          tls: true,
          auth: {
            username: SMTP_USER,
            password: SMTP_PASS,
          },
        },
      });

      await client.send({
        from: SMTP_FROM,
        to: to,
        subject: customSubject,
        html: customHtml,
      });

      await client.close();

      return new Response(JSON.stringify({
        success: true,
        message: 'Email sent successfully via SMTP',
        provider: 'Hostinger SMTP'
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    
    // Get SMTP settings from environment
    const SMTP_HOST = (globalThis as any)?.Deno?.env?.get('SMTP_HOST') || 'smtp.hostinger.com';
    const SMTP_PORT = parseInt((globalThis as any)?.Deno?.env?.get('SMTP_PORT') || '465');
    const SMTP_USER = (globalThis as any)?.Deno?.env?.get('SMTP_USER') || 'admin@globalpromonetwork.online';
    const SMTP_PASS = (globalThis as any)?.Deno?.env?.get('SMTP_PASS') || 'your-smtp-password';
    const SMTP_FROM = (globalThis as any)?.Deno?.env?.get('SMTP_FROM') || 'admin@globalpromonetwork.online';
    
    if (!SMTP_PASS) {
      throw new Error('SMTP_PASS is not configured');
    }

    let subject = '';
    let htmlContent = '';
    
    // Generate email content based on type
    switch (type) {
      case 'welcome':
        subject = 'Welcome to PromoHive - Your Account is Now Active!';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">PromoHive</h1>
              <p style="color: #666; margin: 5px 0;">Trusted Promotional Task Platform</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-top: 0;">Welcome ${data?.fullName || 'Dear User'}!</h2>
              
              <p style="line-height: 1.6; color: #374151;">
                We are excited to have you join PromoHive! Your account has been approved and activated successfully.
              </p>
              
              <div style="background: #ecfdf5; border: 2px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #065f46; margin: 0 0 10px 0;">🎉 Welcome Bonus</h3>
                <p style="color: #065f46; margin: 0; font-weight: bold;">
                  Congratulations! You have received a $5 welcome bonus in your account
                </p>
              </div>
              
              <h3 style="color: #1e40af;">Important Information:</h3>
              <ul style="color: #374151; line-height: 1.8;">
                <li>Minimum withdrawal: $10</li>
                <li>Minimum deposit: $50</li>
                <li>Daily spin wheel available (max prize $0.30 daily)</li>
                <li>Profitable referral program available</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data?.loginUrl || 'https://promohive.com/login'}" 
                   style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Get Started
                </a>
              </div>
            </div>
            
            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin: 0 0 10px 0;">💬 Need Help?</h3>
              <p style="color: #92400e; margin: 0; line-height: 1.6;">
                Contact us via WhatsApp: 
                <a href="https://wa.me/17253348692" style="color: #92400e; font-weight: bold;">+1 725 334 8692</a><br>
                Or via email: 
                <a href="mailto:promohive@globalpromonetwork.store" style="color: #92400e;">promohive@globalpromonetwork.store</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2022 PromoHive. All rights reserved.<br>
                This email was sent automatically, please do not reply.
              </p>
            </div>
          </div>
        `;
        break;
        
      case 'level_upgrade':
        subject = `Congratulations! Your account has been upgraded to ${data?.levelName}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">PromoHive</h1>
            </div>
            
            <div style="background: #f0fdf4; padding: 25px; border-radius: 10px; border: 2px solid #22c55e;">
              <h2 style="color: #15803d;">🎉 Congratulations on Your Upgrade!</h2>
              <p style="color: #374151; line-height: 1.6;">
                Dear ${data?.fullName}, your account has been successfully upgraded to <strong>${data?.levelName}</strong>
              </p>
              <p style="color: #374151;">
                Amount Paid: <strong>${data?.paidAmount}$</strong><br>
                Upgrade Date: <strong>${new Date()?.toLocaleDateString('en-US')}</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #6b7280; font-size: 12px;">© 2022 PromoHive</p>
            </div>
          </div>
        `;
        break;
        
      case 'withdrawal_approved':
        subject = 'Withdrawal Request Approved';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #ecfdf5; padding: 25px; border-radius: 10px;">
              <h2 style="color: #065f46;">✅ Withdrawal Request Approved</h2>
              <p>Amount: <strong>${data?.amount}$</strong></p>
              <p>Address: <strong>${data?.address}</strong></p>
              <p>Transfer will be completed within 24 hours</p>
            </div>
          </div>
        `;
        break;
        
      case 'withdrawal_rejected':
        subject = 'Withdrawal Request Rejected';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #fef2f2; padding: 25px; border-radius: 10px;">
              <h2 style="color: #dc2626;">❌ Withdrawal Request Rejected</h2>
              <p>Amount: <strong>${data?.amount}$</strong></p>
              <p>Reason: <strong>${data?.reason}</strong></p>
              <p>Please contact support for more information</p>
            </div>
          </div>
        `;
        break;
        
      default:
        throw new Error('Invalid email type');
    }

    // Initialize SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: true,
        auth: {
          username: SMTP_USER,
          password: SMTP_PASS,
        },
      },
    });

    // Send email using SMTP
    await client.send({
      from: SMTP_FROM,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    await client.close();

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully via SMTP',
      provider: 'Hostinger SMTP'
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // DO NOT CHANGE THIS
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // DO NOT CHANGE THIS
      }
    });
  }
});
