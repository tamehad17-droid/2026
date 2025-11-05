#!/usr/bin/env node

/**
 * Test Email Sending Script
 * Tests if email notification works with RESEND API
 */

const SUPABASE_URL = 'https://jtxmijnxrgcwjvtdlgxy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eG1pam54cmdjd2p2dGRsZ3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjEzMjMsImV4cCI6MjA3NzI5NzMyM30.1q7hNTKYtTl3WC5KDRox_CN5Rrj4cfPDq1LUM7J7Qj8';

async function testEmail(testEmailAddress) {
  console.log('\n📧 Testing Email Notification System...\n');
  console.log('━'.repeat(60));
  
  if (!testEmailAddress) {
    console.log('⚠️  Usage: node scripts/test-email.js your-email@example.com');
    console.log('\nExample:');
    console.log('  node scripts/test-email.js test@gmail.com\n');
    return;
  }
  
  try {
    console.log(`📨 Sending test email to: ${testEmailAddress}`);
    console.log('⏳ Please wait...\n');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-notification-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'welcome',
        to: testEmailAddress,
        data: {
          fullName: 'Test User',
          loginUrl: 'https://promohive.com/login'
        }
      })
    });
    
    const text = await response.text();
    
    console.log('Response Status:', response.status, response.statusText);
    console.log('Response Body:', text);
    console.log('\n' + '━'.repeat(60));
    
    if (response.ok) {
      const result = JSON.parse(text);
      console.log('✅ SUCCESS! Email sent successfully!\n');
      console.log('📊 Details:');
      console.log('  • Email ID:', result.emailId || 'N/A');
      console.log('  • Recipient:', testEmailAddress);
      console.log('  • Type: Welcome Email');
      console.log('\n📬 Check your inbox (and spam folder)!\n');
    } else {
      console.log('❌ FAILED! Email could not be sent.\n');
      
      if (text.includes('RESEND_API_KEY')) {
        console.log('⚠️  RESEND_API_KEY is not configured!');
        console.log('\n📝 Steps to fix:');
        console.log('  1. Open: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions');
        console.log('  2. Go to "Secrets" section');
        console.log('  3. Add new secret:');
        console.log('     Name: RESEND_API_KEY');
        console.log('     Value: re_UVE8ovYa_E23kRNsVtYoVV6TW28ETpUAy');
        console.log('  4. Save and try again\n');
      } else if (text.includes('not found') || text.includes('404')) {
        console.log('⚠️  Edge Function "send-notification-email" not found!');
        console.log('\n📝 Steps to fix:');
        console.log('  1. Deploy the Edge Function:');
        console.log('     supabase functions deploy send-notification-email');
        console.log('  2. Or check: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/functions\n');
      } else {
        console.log('⚠️  Error details:', text);
        console.log('\n📋 Check Supabase Logs:');
        console.log('  https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/logs/explorer\n');
      }
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('\n📋 Possible issues:');
    console.log('  • Network connection problem');
    console.log('  • Supabase service unavailable');
    console.log('  • Edge Function not deployed\n');
  }
  
  console.log('━'.repeat(60) + '\n');
}

// Get email from command line argument
const testEmail = process.argv[2];
testEmail(testEmail);
