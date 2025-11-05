import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let TEST_USER_ID = '3c0f1e7a-044d-4fc1-a555-e09c61c40510'; // Replace with an actual user ID or leave as is to auto-pick
let TEST_ADMIN_ID = '2d8f3e9b-155d-4ec2-b666-f19d72c51621'; // Replace with an actual admin ID if needed
// Create Supabase client
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

// Create admin service instance with injected Supabase client
const adminService = {
    async updateUserLevel(userId, adminId, newLevel, note = '') {
        try {
            const { data, error } = await supabase.rpc('update_user_level', {
                target_user_id: userId,
                admin_id: adminId,
                new_level: newLevel,
                admin_note: note
            });

            if (error) throw error;
            return data;
        } catch (error) {
            return {
                success: false,
                error: error?.message || 'Failed to update user level'
            };
        }
    },

    async updateUserBalance(userId, balanceChange, type = 'admin_adjustment', note = '') {
        try {
            const p_type = balanceChange >= 0 ? 'add' : 'subtract';
            const amount = Math.abs(balanceChange);
            const { data, error } = await supabase.rpc('update_wallet_balance', {
                p_user_id: userId,
                p_amount: amount,
                p_type,
                p_category: type
            });

            if (error) throw error;
            return data;
        } catch (error) {
            return {
                success: false,
                error: error?.message || 'Failed to update balance'
            };
        }
    }
};

// Test function to validate our database changes
async function testDatabaseFunctions() {
    try {
        // If TEST_USER_ID is a placeholder, fetch any existing user
        if (!TEST_USER_ID || TEST_USER_ID.includes('3c0f1e7a')) {
            const { data: users } = await supabase.from('user_profiles').select('id').limit(1);
            if (users && users.length > 0) {
                TEST_USER_ID = users[0].id;
                console.log('Using existing user id:', TEST_USER_ID);
            } else {
                console.error('No users found in user_profiles. Create a user first.');
                return;
            }
        }

        // Test updating user level
        console.log("Testing updateUserLevel...");
        const levelResult = await adminService.updateUserLevel(
            TEST_USER_ID,
            TEST_ADMIN_ID,
            2,
            "Testing level upgrade"
        );
        console.log("Level update result:", levelResult);

        // Test updating user balance
        console.log("\nTesting updateUserBalance...");
        const balanceResult = await adminService.updateUserBalance(
            TEST_USER_ID,
            100,
            "admin_adjustment",
            "Testing balance update"
        );
        console.log("Balance update result:", balanceResult);

    } catch (error) {
        console.error("Test failed:", error);
    }
}

// Run tests
testDatabaseFunctions().catch(console.error);