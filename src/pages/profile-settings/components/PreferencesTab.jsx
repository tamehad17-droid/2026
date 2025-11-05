import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const PreferencesTab = ({ onPreferencesUpdate }) => {
  const [preferences, setPreferences] = useState({
    // Notification preferences
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    taskUpdates: true,
    paymentAlerts: true,
    referralUpdates: true,
    marketingEmails: false,
    securityAlerts: true,
    
    // Display preferences
    darkMode: true,
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    
    // Privacy preferences
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowDirectMessages: true,
    dataCollection: true,
    
    // Task preferences
    autoAcceptTasks: false,
    taskDifficulty: 'all',
    preferredCategories: ['social_media', 'surveys'],
    minimumPayout: '5.00'
  });

  const [isLoading, setIsLoading] = useState(false);

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'ru', label: 'Русский' },
    { value: 'zh', label: '中文' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' }
  ];

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' }
  ];

  const dateFormatOptions = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (DE)' }
  ];

  const profileVisibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'friends', label: 'Friends Only' },
    { value: 'private', label: 'Private' }
  ];

  const taskDifficultyOptions = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy Only' },
    { value: 'medium', label: 'Medium & Easy' },
    { value: 'hard', label: 'All Including Hard' }
  ];

  const categoryOptions = [
    { value: 'social_media', label: 'Social Media' },
    { value: 'surveys', label: 'Surveys' },
    { value: 'app_testing', label: 'App Testing' },
    { value: 'content_creation', label: 'Content Creation' },
    { value: 'data_entry', label: 'Data Entry' },
    { value: 'reviews', label: 'Reviews & Ratings' }
  ];

  const handleCheckboxChange = (name, checked) => {
    setPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSelectChange = (name, value) => {
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (name, values) => {
    setPreferences(prev => ({
      ...prev,
      [name]: values
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onPreferencesUpdate(preferences);
      setIsLoading(false);
    }, 1500);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !preferences?.darkMode;
    setPreferences(prev => ({
      ...prev,
      darkMode: newDarkMode
    }));
    
    // Apply theme change immediately
    if (newDarkMode) {
      document.documentElement?.classList?.add('dark');
    } else {
      document.documentElement?.classList?.remove('dark');
    }
  };

  return (
    <div className="space-y-8">
      {/* Notification Preferences */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox
              label="Email Notifications"
              description="Receive notifications via email"
              checked={preferences?.emailNotifications}
              onChange={(e) => handleCheckboxChange('emailNotifications', e?.target?.checked)}
            />
            
            <Checkbox
              label="Push Notifications"
              description="Browser and mobile push notifications"
              checked={preferences?.pushNotifications}
              onChange={(e) => handleCheckboxChange('pushNotifications', e?.target?.checked)}
            />
            
            <Checkbox
              label="SMS Notifications"
              description="Text message notifications"
              checked={preferences?.smsNotifications}
              onChange={(e) => handleCheckboxChange('smsNotifications', e?.target?.checked)}
            />
            
            <Checkbox
              label="Security Alerts"
              description="Important security notifications"
              checked={preferences?.securityAlerts}
              onChange={(e) => handleCheckboxChange('securityAlerts', e?.target?.checked)}
            />
          </div>
          
          <div className="border-t border-border pt-4 mt-6">
            <h4 className="font-medium text-foreground mb-4">Notification Types</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Checkbox
                label="Task Updates"
                description="New tasks and status changes"
                checked={preferences?.taskUpdates}
                onChange={(e) => handleCheckboxChange('taskUpdates', e?.target?.checked)}
              />
              
              <Checkbox
                label="Payment Alerts"
                description="Earnings and withdrawal updates"
                checked={preferences?.paymentAlerts}
                onChange={(e) => handleCheckboxChange('paymentAlerts', e?.target?.checked)}
              />
              
              <Checkbox
                label="Referral Updates"
                description="Referral bonuses and activities"
                checked={preferences?.referralUpdates}
                onChange={(e) => handleCheckboxChange('referralUpdates', e?.target?.checked)}
              />
              
              <Checkbox
                label="Marketing Emails"
                description="Promotional offers and news"
                checked={preferences?.marketingEmails}
                onChange={(e) => handleCheckboxChange('marketingEmails', e?.target?.checked)}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Display Preferences */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Display Preferences</h3>
        
        <div className="space-y-6">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Moon" size={20} className="text-primary" />
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-text-secondary">Toggle dark theme appearance</p>
              </div>
            </div>
            
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                preferences?.darkMode ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                preferences?.darkMode ? 'translate-x-6' : 'translate-x-0.5'
              } mt-0.5`} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Language"
              options={languageOptions}
              value={preferences?.language}
              onChange={(value) => handleSelectChange('language', value)}
            />
            
            <Select
              label="Timezone"
              options={timezoneOptions}
              value={preferences?.timezone}
              onChange={(value) => handleSelectChange('timezone', value)}
            />
            
            <Select
              label="Currency"
              options={currencyOptions}
              value={preferences?.currency}
              onChange={(value) => handleSelectChange('currency', value)}
            />
            
            <Select
              label="Date Format"
              options={dateFormatOptions}
              value={preferences?.dateFormat}
              onChange={(value) => handleSelectChange('dateFormat', value)}
            />
          </div>
        </div>
      </div>
      {/* Privacy Preferences */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Privacy Preferences</h3>
        
        <div className="space-y-6">
          <Select
            label="Profile Visibility"
            description="Control who can see your profile information"
            options={profileVisibilityOptions}
            value={preferences?.profileVisibility}
            onChange={(value) => handleSelectChange('profileVisibility', value)}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox
              label="Show Online Status"
              description="Let others see when you're online"
              checked={preferences?.showOnlineStatus}
              onChange={(e) => handleCheckboxChange('showOnlineStatus', e?.target?.checked)}
            />
            
            <Checkbox
              label="Allow Direct Messages"
              description="Receive messages from other users"
              checked={preferences?.allowDirectMessages}
              onChange={(e) => handleCheckboxChange('allowDirectMessages', e?.target?.checked)}
            />
            
            <Checkbox
              label="Data Collection"
              description="Allow analytics for better experience"
              checked={preferences?.dataCollection}
              onChange={(e) => handleCheckboxChange('dataCollection', e?.target?.checked)}
            />
          </div>
        </div>
      </div>
      {/* Task Preferences */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Task Preferences</h3>
        
        <div className="space-y-6">
          <Checkbox
            label="Auto-Accept Tasks"
            description="Automatically accept tasks that match your criteria"
            checked={preferences?.autoAcceptTasks}
            onChange={(e) => handleCheckboxChange('autoAcceptTasks', e?.target?.checked)}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Task Difficulty"
              description="Filter tasks by difficulty level"
              options={taskDifficultyOptions}
              value={preferences?.taskDifficulty}
              onChange={(value) => handleSelectChange('taskDifficulty', value)}
            />
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Minimum Payout
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={preferences?.minimumPayout}
                  onChange={(e) => handleSelectChange('minimumPayout', e?.target?.value)}
                  className="w-full pl-8 pr-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="5.00"
                />
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Only show tasks with minimum payout amount
              </p>
            </div>
          </div>
          
          <Select
            label="Preferred Categories"
            description="Select task categories you're interested in"
            options={categoryOptions}
            value={preferences?.preferredCategories}
            onChange={(values) => handleMultiSelectChange('preferredCategories', values)}
            multiple
            searchable
          />
        </div>
      </div>
      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="default"
          onClick={handleSave}
          loading={isLoading}
          iconName="Save"
          iconPosition="left"
          className="w-full sm:w-auto"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default PreferencesTab;