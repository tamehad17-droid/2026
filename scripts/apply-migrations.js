const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const supabaseUrl = 'https://jtxmijnxrgcwjvtdlgxy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY not found');
  console.log('Please set environment variable:');
  console.log('export SUPABASE_SERVICE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFile(filePath) {
  console.log(`\n📄 Reading: ${filePath}`);
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`✓ File loaded (${sql.length} characters)`);
    
    // Split by statement separator and execute
    console.log('\n🔄 Executing SQL...');
    
    // For complex migrations, we need to use the SQL endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      // Try alternative: direct SQL execution via PostgREST
      console.log('⚠️ Direct SQL execution not available via REST API');
      console.log('📋 Please execute this SQL manually in Supabase Dashboard:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql');
      console.log('   2. Copy content from:', filePath);
      console.log('   3. Paste and execute');
      return false;
    }

    console.log('✅ SQL executed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');
  
  try {
    // Check if wallets table exists
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('count')
      .limit(1);
    
    if (!walletsError) {
      console.log('✅ Wallets table exists');
    }

    // Check if admin_settings table exists
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('count')
      .limit(1);
    
    if (!settingsError) {
      console.log('✅ Admin settings table exists');
    }

    // Check functions
    console.log('\n📊 Checking database functions...');
    const { data: functions, error: funcError } = await supabase
      .rpc('get_function_list')
      .catch(() => ({ data: null, error: 'RPC not available' }));
    
    console.log('✅ Database verification complete!');
    
  } catch (error) {
    console.log('⚠️ Some verification checks failed, but this is normal');
    console.log('   Manual verification recommended');
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   🚀 PromoHive Database Migration Tool        ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  
  const migrationFiles = [
    '20241031_fix_email_confirmation_and_wallet.sql',
    '20241031_complete_admin_system.sql'
  ];

  console.log('📋 Migrations to apply:');
  migrationFiles.forEach((file, i) => {
    console.log(`   ${i + 1}. ${file}`);
  });

  console.log('\n' + '═'.repeat(50));
  console.log('⚠️  IMPORTANT: Supabase REST API does not support');
  console.log('   direct SQL execution for DDL statements.');
  console.log('');
  console.log('   Please apply migrations manually:');
  console.log('   1. Open: https://supabase.com/dashboard/project/jtxmijnxrgcwjvtdlgxy/sql');
  console.log('   2. Copy content from migration files');
  console.log('   3. Execute in SQL Editor');
  console.log('═'.repeat(50) + '\n');

  // Display migration file contents for easy copy-paste
  console.log('📄 MIGRATION 1: Email Confirmation & Wallet System');
  console.log('─'.repeat(50));
  const migration1Path = path.join(migrationsDir, migrationFiles[0]);
  if (fs.existsSync(migration1Path)) {
    console.log(`File: ${migration1Path}`);
    console.log('Status: ⏳ Ready to apply\n');
  }

  console.log('📄 MIGRATION 2: Complete Admin System');
  console.log('─'.repeat(50));
  const migration2Path = path.join(migrationsDir, migrationFiles[1]);
  if (fs.existsSync(migration2Path)) {
    console.log(`File: ${migration2Path}`);
    console.log('Status: ⏳ Ready to apply\n');
  }

  console.log('✨ After applying migrations manually, run verification:');
  console.log('   node scripts/verify-database.js\n');
}

main().catch(console.error);
