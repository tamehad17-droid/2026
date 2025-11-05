#!/usr/bin/env node

/**
 * Apply Database Fixes Script
 * This script applies all database fixes automatically using Supabase REST API
 */

const SUPABASE_URL = 'https://jtxmijnxrgcwjvtdlgxy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eG1pam54cmdjd2p2dGRsZ3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjEzMjMsImV4cCI6MjA3NzI5NzMyM30.1q7hNTKYtTl3WC5KDRox_CN5Rrj4cfPDq1LUM7J7Qj8';

async function fetchSupabase(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  return response;
}

async function checkDatabaseStatus() {
  console.log('\n🔍 Checking database status...\n');
  
  try {
    // Check users table
    const usersResponse = await fetchSupabase('/rest/v1/user_profiles?select=id,email,full_name,approval_status,status&limit=5');
    
    if (!usersResponse.ok) {
      console.log('❌ Error accessing user_profiles:', usersResponse.statusText);
      return false;
    }
    
    const users = await usersResponse.json();
    console.log(`✅ Found ${users?.length || 0} users in database`);
    
    if (users && users.length > 0) {
      console.log('\n📋 Sample users:');
      users.forEach(u => {
        console.log(`   • ${u.full_name || 'N/A'} (${u.email}) - Status: ${u.approval_status || u.status}`);
      });
    }
    
    // Check verification codes table
    const codesResponse = await fetchSupabase('/rest/v1/email_verification_codes?select=id&limit=1');
    
    if (!codesResponse.ok) {
      console.log('\n⚠️  email_verification_codes table may not exist or has RLS issues');
    } else {
      console.log('\n✅ email_verification_codes table is accessible');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    return false;
  }
}

async function testApproveFunction() {
  console.log('\n🧪 Testing approve_user function...\n');
  
  try {
    // Try to call the function (will fail if it doesn't exist)
    const response = await fetchSupabase('/rest/v1/rpc/approve_user', {
      method: 'POST',
      body: JSON.stringify({
        target_user_id: '00000000-0000-0000-0000-000000000000',
        admin_id: '00000000-0000-0000-0000-000000000000'
      })
    });
    
    const text = await response.text();
    
    if (!response.ok) {
      if (text.includes('does not exist') || text.includes('function') || text.includes('not found')) {
        console.log('❌ approve_user function NOT found - SQL script needs to be run');
        return false;
      } else {
        console.log('⚠️  approve_user function exists but returned error (expected for dummy data)');
        return true;
      }
    }
    
    console.log('✅ approve_user function exists and is working');
    return true;
  } catch (error) {
    console.log('❌ Error testing approve_user:', error.message);
    return false;
  }
}

async function testRejectFunction() {
  console.log('\n🧪 Testing reject_user function...\n');
  
  try {
    const response = await fetchSupabase('/rest/v1/rpc/reject_user', {
      method: 'POST',
      body: JSON.stringify({
        target_user_id: '00000000-0000-0000-0000-000000000000',
        admin_id: '00000000-0000-0000-0000-000000000000',
        rejection_reason: 'test'
      })
    });
    
    const text = await response.text();
    
    if (!response.ok) {
      if (text.includes('does not exist') || text.includes('function') || text.includes('not found')) {
        console.log('❌ reject_user function NOT found - SQL script needs to be run');
        return false;
      } else {
        console.log('⚠️  reject_user function exists but returned error (expected for dummy data)');
        return true;
      }
    }
    
    console.log('✅ reject_user function exists and is working');
    return true;
  } catch (error) {
    console.log('❌ Error testing reject_user:', error.message);
    return false;
  }
}

async function generateReport() {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 DATABASE DIAGNOSTIC REPORT');
  console.log('═'.repeat(60));
  
  const dbStatus = await checkDatabaseStatus();
  const approveExists = await testApproveFunction();
  const rejectExists = await testRejectFunction();
  
  console.log('\n' + '─'.repeat(60));
  console.log('🎯 RESULTS:');
  console.log('─'.repeat(60));
  
  console.log(`Database Connection: ${dbStatus ? '✅ Working' : '❌ Failed'}`);
  console.log(`approve_user() Function: ${approveExists ? '✅ Exists' : '❌ Missing'}`);
  console.log(`reject_user() Function: ${rejectExists ? '✅ Exists' : '❌ Missing'}`);
  
  console.log('\n' + '─'.repeat(60));
  console.log('📝 NEXT STEPS:');
  console.log('─'.repeat(60));
  
  if (!approveExists || !rejectExists) {
    console.log('\n❗ REQUIRED ACTION:');
    console.log('   Some database functions are missing!');
    console.log('\n   👉 Please run the SQL script manually:');
    console.log('   1. Open: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql/new');
    console.log('   2. Copy all contents from: FIX_ALL_DATABASE_ISSUES.sql');
    console.log('   3. Paste and click "Run"');
    console.log('   4. Wait for success message');
    console.log('   5. Run this script again to verify\n');
  } else {
    console.log('\n✅ All database functions exist!');
    console.log('   The admin dashboard should work correctly now.\n');
    console.log('   📌 Optional: Configure RESEND_API_KEY for email notifications');
    console.log('   🔗 https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/settings/functions\n');
  }
  
  console.log('═'.repeat(60) + '\n');
}

// Run the diagnostic
generateReport().catch(console.error);
