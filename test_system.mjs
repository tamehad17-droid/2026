import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jtxmijnxrgcwjvtdlgxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eG1pam54cmdjd2p2dGRsZ3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjEzMjMsImV4cCI6MjA3NzI5NzMyM30.1q7hNTKYtTl3WC5KDRox_CN5Rrj4cfPDq1LUM7J7Qj8';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 PromoHive System Test\n');
console.log('=' .repeat(60));

async function testSystem() {
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Admin Settings
  console.log('\n📋 Test 1: Admin Settings');
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .in('key', [
        'min_withdrawal_amount',
        'min_deposit_amount',
        'welcome_bonus_amount',
        'customer_service_phone',
        'customer_service_email',
        'smtp_host'
      ]);
    
    if (error) throw error;
    
    console.log('✅ Admin settings loaded successfully');
    data.forEach(s => {
      console.log(`   - ${s.key}: ${s.value}`);
    });
    passedTests++;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    failedTests++;
  }
  
  // Test 2: Tables Existence
  console.log('\n📊 Test 2: Database Tables');
  const tables = [
    'user_profiles',
    'usdt_addresses',
    'referrals',
    'spin_prizes',
    'level_upgrades',
    'withdrawals',
    'deposits',
    'admin_deposit_addresses',
    'email_templates',
    'email_logs',
    'admin_actions',
    'tasks',
    'transactions',
    'wallets'
  ];
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
        failedTests++;
      } else {
        console.log(`   ✅ ${table}: EXISTS`);
        passedTests++;
      }
    } catch (error) {
      console.log(`   ❌ ${table}: ${error.message}`);
      failedTests++;
    }
  }
  
  // Test 3: Email Templates
  console.log('\n📧 Test 3: Email Templates');
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('template_key, subject, is_active');
    
    if (error) throw error;
    
    console.log(`✅ Found ${data.length} email templates:`);
    data.forEach(t => {
      console.log(`   - ${t.template_key}: ${t.subject} (${t.is_active ? 'Active' : 'Inactive'})`);
    });
    passedTests++;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    failedTests++;
  }
  
  // Test 4: Admin Deposit Addresses
  console.log('\n💰 Test 4: Admin Deposit Addresses');
  try {
    const { data, error } = await supabase
      .from('admin_deposit_addresses')
      .select('*');
    
    if (error) throw error;
    
    console.log(`✅ Found ${data.length} deposit addresses:`);
    data.forEach(a => {
      console.log(`   - ${a.label} (${a.network}): ${a.address.substring(0, 20)}... [${a.is_active ? 'Active' : 'Inactive'}]`);
    });
    passedTests++;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    failedTests++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! System is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }
}

testSystem().catch(console.error);
