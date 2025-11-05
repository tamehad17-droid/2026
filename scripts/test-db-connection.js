#!/usr/bin/env node

/**
 * Test Supabase Database Connection
 * This script tests the connection and checks database status
 */

const SUPABASE_URL = 'https://jtxmijnxrgcwjvtdlgxy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eG1pam54cmdjd2p2dGRsZ3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjEzMjMsImV4cCI6MjA3NzI5NzMyM30.1q7hNTKYtTl3WC5KDRox_CN5Rrj4cfPDq1LUM7J7Qj8';

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...\n');
    
    // Test 1: Check if we can reach Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase connection successful!\n');
    } else {
      console.log('❌ Supabase connection failed:', response.statusText);
      return;
    }
    
    // Test 2: Try to fetch user_profiles count
    console.log('📊 Checking database tables...\n');
    
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'count=exact'
      }
    });
    
    const usersCount = usersResponse.headers.get('content-range');
    console.log('👥 Users in database:', usersCount || 'Unknown');
    
    // Test 3: Check for verification codes table
    const codesResponse = await fetch(`${SUPABASE_URL}/rest/v1/email_verification_codes?select=count&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (codesResponse.ok) {
      console.log('✅ email_verification_codes table exists');
    } else {
      console.log('❌ email_verification_codes table NOT found - needs to be created');
    }
    
    console.log('\n📝 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Connection: ✅ Working');
    console.log('Database: ✅ Accessible');
    console.log('\n⚠️  NOTE: To run SQL scripts, you need to:');
    console.log('1. Open Supabase Dashboard SQL Editor');
    console.log('2. Copy and run FIX_ALL_DATABASE_ISSUES.sql');
    console.log('\n🔗 SQL Editor: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql/new');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();
