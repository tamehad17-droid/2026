import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Settings, Phone, Mail, DollarSign, Calendar, Gift } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import Icon from '../../../components/AppIcon';


const SettingsManager = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const settingsConfig = [
    {
      key: 'site_year',
      label: 'Website Year',
      type: 'text',
      icon: Calendar,
      description: 'Year the website was established',
      defaultValue: '2022'
    },
    {
      key: 'min_withdrawal',
      label: 'Minimum Withdrawal ($)',
      type: 'number',
      icon: DollarSign,
      description: 'Minimum amount users can withdraw',
      defaultValue: '10.00'
    },
    {
      key: 'min_deposit',
      label: 'Minimum Deposit ($)',
      type: 'number',
      icon: DollarSign,
      description: 'Minimum amount users need to deposit for upgrades',
      defaultValue: '50.00'
    },
    {
      key: 'welcome_bonus_amount',
      label: 'Welcome Bonus ($)',
      type: 'number',
      icon: Gift,
      description: 'Welcome bonus amount for new users',
      defaultValue: '5.00'
    },
    {
      key: 'max_level_0_balance',
      label: 'Max Level 0 Balance ($)',
      type: 'number',
      icon: DollarSign,
      description: 'Maximum balance for level 0 users',
      defaultValue: '9.90'
    },
    {
      key: 'daily_spin_max_reward',
      label: 'Daily Spin Max Reward ($)',
      type: 'number',
      icon: Gift,
      description: 'Maximum daily reward from spin wheel per user',
      defaultValue: '0.30'
    },
    {
      key: 'customer_service_phone',
      label: 'Customer Service Phone',
      type: 'text',
      icon: Phone,
      description: 'WhatsApp number for customer service',
      defaultValue: '+17253348692'
    },
    {
      key: 'customer_service_email',
      label: 'Customer Service Email',
      type: 'email',
      icon: Mail,
      description: 'Email for customer service',
      defaultValue: 'promohive@globalpromonetwork.store'
    }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSettings();
      
      // Convert settings array to object
      const settingsObj = {};
      data?.forEach(setting => {
        try {
          settingsObj[setting.key] = JSON.parse(setting.value);
        } catch {
          settingsObj[setting.key] = setting.value;
        }
      });

      // Set defaults for missing settings
      settingsConfig.forEach(config => {
        if (!(config.key in settingsObj)) {
          settingsObj[config.key] = config.defaultValue;
        }
      });

      setSettings(settingsObj);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSetting = async (key, value) => {
    try {
      setSaving(true);
      await adminService.updateSetting(key, value);
      setMessage(`${key} updated successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save setting:', error);
      setMessage('Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const saveAllSettings = async () => {
    try {
      setSaving(true);
      
      const promises = Object.entries(settings).map(([key, value]) =>
        adminService.updateSetting(key, value)
      );
      
      await Promise.all(promises);
      setMessage('All settings saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('Failed to save some settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-text-primary">System Settings</h2>
        </div>
        <button
          onClick={saveAllSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save All
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-3 rounded-lg ${
          message.includes('Failed') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {message}
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {settingsConfig.map((config) => {
          const Icon = config.icon;
          const value = settings[config.key] || config.defaultValue;

          return (
            <div key={config.key} className="bg-surface rounded-xl p-6 border border-border">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-medium text-text-primary">{config.label}</h3>
                    <p className="text-sm text-text-secondary">{config.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type={config.type}
                      value={value}
                      onChange={(e) => handleSettingChange(config.key, e.target.value)}
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      step={config.type === 'number' ? '0.01' : undefined}
                    />
                    <button
                      onClick={() => saveSetting(config.key, value)}
                      disabled={saving}
                      className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 disabled:opacity-50 transition-colors"
                      title="Save this setting"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SMTP Settings Section */}
      <div className="bg-surface rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          SMTP Email Configuration
        </h3>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> SMTP settings are configured in environment variables. 
            Current configuration sends emails via: promohive@globalpromonetwork.store
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Host</label>
            <input
              type="text"
              value="smtp.hostinger.com"
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-border rounded-lg text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Port</label>
            <input
              type="text"
              value="465"
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-border rounded-lg text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">From Email</label>
            <input
              type="email"
              value="promohive@globalpromonetwork.store"
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-border rounded-lg text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Secure</label>
            <input
              type="text"
              value="SSL/TLS"
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-border rounded-lg text-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;