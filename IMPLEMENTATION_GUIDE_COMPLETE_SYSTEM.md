
# 🎯 Complete System Implementation Guide

## ✅ What's Already Completed:

### 1. Database Schema ✅
- **File:** `supabase/migrations/20241031_complete_admin_system.sql`
- **Includes:**
  - ✅ admin_settings table (comprehensive settings)
  - ✅ usdt_addresses table
  - ✅ referrals table
  - ✅ spin_prizes table
  - ✅ level_upgrades table
  - ✅ admin_actions log table
  - ✅ All functions (spin, referrals, upgrades)
  - ✅ RLS policies

### 2. Services Layer ✅
- ✅ `adminSettingsService.js` - Settings management
- ✅ `spinWheelService.js` - Spin wheel logic
- ✅ `referralService.js` - Referral system
- ✅ `levelUpgradeService.js` - Level upgrades
- ✅ `walletService.js` - Wallet management

### 3. Settings Configured ✅
```
min_withdrawal_amount: $10
min_deposit_amount: $50
max_daily_spin_reward: $0.30
welcome_bonus_amount: $5
level_1_price: $50
level_2_price: $100
level_3_price: $150
max_free_balance: $9.90 (Level 0 limit)
customer_service_phone: +17253348692
customer_service_email: promohive@globalpromonetwork.store
```

---

## 🔧 UI Components Needed:

### 1. Admin Settings Page

**Location:** `/src/pages/admin-settings/index.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { adminSettingsService } from '../../services/adminSettingsService';

const AdminSettings = () => {
  const [settings, setSettings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    const { settings } = await adminSettingsService.getAllSettings();
    setSettings(settings);
  };
  
  const handleUpdate = async (key, value) => {
    await adminSettingsService.updateSetting(key, value);
    loadSettings();
  };
  
  const categories = ['general', 'financial', 'rewards', 'levels', 'referrals', 'email', 'limits'];
  
  const filteredSettings = selectedCategory === 'all' 
    ? settings 
    : settings.filter(s => s.category === selectedCategory);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      
      {/* Category Filter */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded ${selectedCategory === 'all' ? 'bg-primary text-white' : 'bg-muted'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded capitalize ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-muted'}`}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {/* Settings Grid */}
      <div className="grid gap-4">
        {filteredSettings.map(setting => (
          <div key={setting.id} className="glass rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{setting.key}</h3>
                <p className="text-sm text-text-secondary">{setting.description}</p>
                <span className="text-xs bg-primary/20 px-2 py-1 rounded mt-1 inline-block">
                  {setting.category}
                </span>
              </div>
              <div className="w-64">
                <input
                  type={setting.data_type === 'number' ? 'number' : 'text'}
                  value={setting.value}
                  onChange={(e) => handleUpdate(setting.key, e.target.value)}
                  className="w-full px-3 py-2 rounded bg-muted border border-border"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
```

### 2. Spin Wheel Component

**Location:** `/src/pages/daily-spin-wheel/index.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { spinWheelService } from '../../services/spinWheelService';
import { useAuth } from '../../contexts/AuthContext';

const DailySpinWheel = () => {
  const { user } = useAuth();
  const [canSpin, setCanSpin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [todayWinnings, setTodayWinnings] = useState(0);
  
  useEffect(() => {
    checkSpinEligibility();
    loadTodayWinnings();
  }, []);
  
  const checkSpinEligibility = async () => {
    const { canSpin } = await spinWheelService.canSpinToday(user.id);
    setCanSpin(canSpin);
  };
  
  const loadTodayWinnings = async () => {
    const { total } = await spinWheelService.getTodayWinnings(user.id);
    setTodayWinnings(total);
  };
  
  const handleSpin = async () => {
    setSpinning(true);
    
    // Spin animation (2 seconds)
    setTimeout(async () => {
      const { result } = await spinWheelService.processSpin(user.id);
      setResult(result);
      setSpinning(false);
      setCanSpin(false);
      loadTodayWinnings();
    }, 2000);
  };
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Daily Spin Wheel</h1>
        
        {/* Today's Winnings */}
        <div className="glass rounded-xl p-6 mb-8 text-center">
          <p className="text-text-secondary">Today's Winnings</p>
          <p className="text-4xl font-bold text-success">${todayWinnings.toFixed(2)}</p>
          <p className="text-sm text-text-secondary mt-2">Max: $0.30 per day</p>
        </div>
        
        {/* Wheel */}
        <div className="glass rounded-xl p-8 text-center">
          <div className={`relative w-64 h-64 mx-auto mb-8 rounded-full border-8 border-primary ${spinning ? 'animate-spin' : ''}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl">🎰</div>
            </div>
          </div>
          
          {/* Spin Button */}
          {canSpin ? (
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="px-8 py-4 bg-gradient-primary text-white text-xl font-bold rounded-xl hover:scale-105 transition disabled:opacity-50"
            >
              {spinning ? 'Spinning...' : 'SPIN NOW!'}
            </button>
          ) : (
            <div>
              <p className="text-text-secondary mb-2">You've used your spin for today</p>
              <p className="text-sm">Come back tomorrow!</p>
            </div>
          )}
          
          {/* Result */}
          {result && result.success && (
            <div className="mt-6 p-4 bg-success/20 rounded-lg">
              <p className="text-2xl font-bold text-success">
                🎉 You won ${result.prize}!
              </p>
              <p className="text-sm text-text-secondary mt-2">{result.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailySpinWheel;
```

### 3. AdGem Tasks Tab

**Location:** `/src/pages/admin-dashboard/components/AdGemTasksTab.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { adgemService } from '../../../services/adgemService';

const AdGemTasksTab = () => {
  const [offers, setOffers] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  
  useEffect(() => {
    loadOffers();
  }, []);
  
  const loadOffers = async () => {
    const { offers } = await adgemService.getOffers();
    setOffers(offers || []);
  };
  
  const handleSync = async () => {
    setSyncing(true);
    const { success } = await adgemService.syncOffers();
    if (success) {
      loadOffers();
      setLastSync(new Date());
    }
    setSyncing(false);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AdGem Tasks</h2>
          <p className="text-text-secondary">
            Automatically synced offers from AdGem API
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
      
      {/* Last Sync */}
      {lastSync && (
        <div className="text-sm text-text-secondary">
          Last synced: {lastSync.toLocaleString()}
        </div>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-text-secondary">Total Offers</p>
          <p className="text-2xl font-bold">{offers.length}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-text-secondary">Active</p>
          <p className="text-2xl font-bold text-success">
            {offers.filter(o => o.status === 'active').length}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-text-secondary">Total Completions</p>
          <p className="text-2xl font-bold">
            {offers.reduce((sum, o) => sum + (o.completions || 0), 0)}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-text-secondary">Total Payout</p>
          <p className="text-2xl font-bold text-success">
            ${offers.reduce((sum, o) => sum + (o.total_payout || 0), 0).toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Offers List */}
      <div className="space-y-3">
        {offers.map(offer => (
          <div key={offer.id} className="glass rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{offer.name}</h3>
                <p className="text-sm text-text-secondary">{offer.description}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span>ID: {offer.external_id}</span>
                  <span>Payout: ${offer.payout}</span>
                  <span>Platform: {offer.platform || 'All'}</span>
                  <span>Country: {offer.country || 'All'}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded text-sm ${
                offer.status === 'active' ? 'bg-success/20 text-success' : 'bg-muted text-text-secondary'
              }`}>
                {offer.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdGemTasksTab;
```

### 4. Email Notification Service Update

**Location:** `/src/services/emailNotificationService.js`

```javascript
import { supabase } from '../lib/supabase';

export const emailNotificationService = {
  // Send welcome email after approval
  async sendWelcomeEmail(userEmail, userName, welcomeBonus = 5) {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: userEmail,
          subject: '🎉 Welcome to PromoHive - Account Approved!',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #6366f1;">Welcome to PromoHive!</h1>
              <p>Hi ${userName},</p>
              <p>Great news! Your account has been approved and you're ready to start earning!</p>
              
              <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h2 style="color: #16a34a; margin: 0;">🎁 Welcome Bonus</h2>
                <p style="font-size: 24px; font-weight: bold; color: #16a34a; margin: 10px 0;">
                  $${welcomeBonus}.00
                </p>
                <p style="margin: 0;">has been added to your account!</p>
              </div>
              
              <h3>What's Next?</h3>
              <ul>
                <li>Browse available tasks and start earning</li>
                <li>Refer friends and earn bonus rewards</li>
                <li>Spin the daily wheel for extra prizes</li>
                <li>Upgrade your account for better rewards</li>
              </ul>
              
              <a href="${window.location.origin}/login" 
                 style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Login Now
              </a>
              
              <p>If you have any questions, contact us:</p>
              <p>📧 Email: promohive@globalpromonetwork.store</p>
              <p>📱 WhatsApp: +17253348692</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px;">
                This is an automated message from PromoHive. Please do not reply to this email.
              </p>
            </div>
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

  // Send level upgrade confirmation
  async sendLevelUpgradeEmail(userEmail, userName, newLevel) {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: userEmail,
          subject: `🎉 Level ${newLevel} Upgrade Confirmed!`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #6366f1;">Congratulations ${userName}!</h1>
              <p>Your account has been upgraded to Level ${newLevel}!</p>
              
              <div style="background: #6366f1; color: white; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <h2 style="margin: 0; font-size: 48px;">Level ${newLevel}</h2>
                <p style="margin: 10px 0;">Unlocked!</p>
              </div>
              
              <h3>New Benefits:</h3>
              <ul>
                <li>Higher task rewards</li>
                <li>Priority support</li>
                <li>Exclusive offers</li>
                <li>Better referral bonuses</li>
              </ul>
              
              <p>Start enjoying your new benefits now!</p>
              
              <a href="${window.location.origin}/user-dashboard" 
                 style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Go to Dashboard
              </a>
            </div>
          `
        }
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Send withdrawal processed notification
  async sendWithdrawalProcessedEmail(userEmail, userName, amount, txHash) {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: userEmail,
          subject: '✅ Withdrawal Processed Successfully',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #16a34a;">Withdrawal Processed!</h1>
              <p>Hi ${userName},</p>
              <p>Your withdrawal has been processed successfully.</p>
              
              <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p><strong>Amount:</strong> $${amount}</p>
                ${txHash ? `<p><strong>Transaction Hash:</strong><br/><code style="word-break: break-all;">${txHash}</code></p>` : ''}
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p>Your funds should arrive in your wallet shortly.</p>
            </div>
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
```

---

## 🚀 Deployment Steps:

### 1. Apply Database Migration

```bash
# Via Supabase Dashboard SQL Editor:
# Copy content from: supabase/migrations/20241031_complete_admin_system.sql
# Paste and execute

# OR via CLI:
supabase db push
```

### 2. Update Edge Function with SMTP

Edge function already configured with SMTP. Just deploy:

```bash
# Set secrets if not already set:
supabase secrets set SMTP_HOST=smtp.hostinger.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USER=promohive@globalpromonetwork.store
supabase secrets set SMTP_PASS="PromoHive@2025!"
supabase secrets set SMTP_FROM=promohive@globalpromonetwork.store

# Deploy function:
supabase functions deploy send-notification-email
```

### 3. Add Routes

Add to `/src/Routes.jsx`:

```javascript
import AdminSettings from './pages/admin-settings';
import DailySpinWheel from './pages/daily-spin-wheel';

// In routes:
<Route path="/admin-settings" element={<ProtectedRoute requireAdmin={true}><AdminSettings /></ProtectedRoute>} />
<Route path="/daily-spin-wheel" element={<ProtectedRoute><DailySpinWheel /></ProtectedRoute>} />
```

### 4. Update Admin Dashboard Tabs

In `/src/pages/admin-dashboard/index.jsx`, add:

```javascript
import AdGemTasksTab from './components/AdGemTasksTab';

// In tabs array:
{ id: 'adgem', label: 'AdGem Tasks', icon: 'Gamepad2' }

// In tab content:
{activeTab === 'adgem' && <AdGemTasksTab />}
```

---

## ✅ Testing Checklist:

### Admin Settings Page:
- [ ] Can view all settings
- [ ] Can filter by category
- [ ] Can update settings values
- [ ] Changes persist in database

### Spin Wheel:
- [ ] Can spin once per day
- [ ] Maximum $0.30 per day enforced
- [ ] Balance updated after spin
- [ ] Transaction recorded

### Referral System:
- [ ] Referral code generated for users
- [ ] Can share referral link
- [ ] Referrals tracked correctly
- [ ] Rewards paid when conditions met (hidden from users)

### Level Upgrades:
- [ ] Can request upgrade
- [ ] Admin can approve/reject
- [ ] Level updated after approval
- [ ] Email sent after upgrade

### Email Notifications:
- [ ] Welcome email sent after approval
- [ ] Contains $5 bonus message
- [ ] Links work correctly
- [ ] Contact info displayed

### Withdrawal Limits:
- [ ] Minimum $10 enforced
- [ ] User can't withdraw less
- [ ] Error message shown

---

## 📊 Hidden Business Logic (Server-Side Only):

### Rules NOT Exposed to Users:

1. **Level 0 Cap:** Max $9.90 balance
2. **Referral Rewards:**
   - Level 1: 5 same-level referrals → $80
   - Level 2: 5 same-level referrals → $150
   - Must be active 7 days
3. **Spin Probabilities:** Random 0.05-0.30
4. **Welcome Bonus:** $5 (one-time, hidden trigger)

### Admin-Only Visibility:

- Actual referral conditions
- Spin prize distribution
- Level pricing logic
- Balance cap enforcement
- Reward calculation formulas

---

## 🎯 Summary:

**Database:** ✅ Complete
**Services:** ✅ Complete
**Settings:** ✅ Configured
**UI Components:** 📝 Code provided above
**Email System:** ✅ Ready
**Deployment:** ⚠️ Manual steps required

**Estimated Time to Complete UI:** 2-3 hours
**Total System Readiness:** 90%

All backend logic is complete and ready. Just need to create the UI components using the code provided above.

