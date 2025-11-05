const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jtxmijnxrgcwjvtdlgxy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0eG1pam54cmdjd2p2dGRsZ3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjEzMjMsImV4cCI6MjA3NzI5NzMyM30.1q7hNTKYtTl3WC5KDRox_CN5Rrj4cfPDq1LUM7J7Qj8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('Checking database tables...\n');
  
  // Check admin_settings
  const { data: settings, error: settingsError } = await supabase
    .from('admin_settings')
    .select('*')
    .in('key', ['min_withdrawal_amount', 'min_deposit_amount', 'welcome_bonus_amount']);
  
  if (settingsError) {
    console.log('Error fetching admin_settings:', settingsError.message);
  } else {
    console.log('Admin Settings:', JSON.stringify(settings, null, 2));
  }
  
  // Check if tables exist
  const tables = ['user_profiles', 'usdt_addresses', 'referrals', 'spin_prizes', 'level_upgrades', 'withdrawals', 'admin_actions'];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`\n❌ Table ${table}: ${error.message}`);
    } else {
      console.log(`\n✅ Table ${table}: EXISTS`);
    }
  }
}

checkDatabase();
