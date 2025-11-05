import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import MobileDrawer from '../../components/ui/MobileDrawer';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import ProfileTab from './components/ProfileTab';
import SecurityTab from './components/SecurityTab';
import SessionsTab from './components/SessionsTab';
import PreferencesTab from './components/PreferencesTab';
import AccountTab from './components/AccountTab';

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setUser({
        id: 'user_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@promohive.com',
        phone: '+1 (555) 123-4567',
        country: 'United States',
        timezone: 'America/New_York',
        bio: 'Passionate about digital marketing and earning through promotional tasks.',
        avatar: "https://images.unsplash.com/photo-1555077292-22a4489e5897",
        role: 'user',
        balance: 1250.75,
        memberSince: '2024-03-15',
        lastLogin: '2025-10-29T22:02:17.916Z'
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const tabs = [
  {
    id: 'profile',
    label: 'Profile',
    icon: 'User',
    description: 'Personal information and profile picture'
  },
  {
    id: 'security',
    label: 'Security',
    icon: 'Shield',
    description: 'Password and two-factor authentication'
  },
  {
    id: 'sessions',
    label: 'Sessions',
    icon: 'Monitor',
    description: 'Active login sessions and devices'
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: 'Settings',
    description: 'Notifications and display settings'
  },
  {
    id: 'account',
    label: 'Account',
    icon: 'AlertTriangle',
    description: 'Account management and data export'
  }];


  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMobileDrawerToggle = () => {
    setIsMobileDrawerOpen(!isMobileDrawerOpen);
  };

  const handleProfileUpdate = (updatedData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedData
    }));

    // Show success message (in real app, this would be a toast notification)
    console.log('Profile updated successfully');
  };

  const handlePasswordChange = (passwordData) => {
    // Handle password change
    console.log('Password changed successfully');
  };

  const handleTwoFactorToggle = (enabled) => {
    // Handle 2FA toggle
    console.log(`Two-factor authentication ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleLogoutSession = (sessionId) => {
    // Handle session logout
    console.log(`Session ${sessionId} logged out`);
  };

  const handleLogoutAll = () => {
    // Handle logout all sessions
    console.log('All sessions logged out');
  };

  const handlePreferencesUpdate = (preferences) => {
    // Handle preferences update
    console.log('Preferences updated successfully', preferences);
  };

  const handleAccountAction = (action) => {
    // Handle account actions (deactivate/delete)
    console.log(`Account ${action} requested`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileTab
            user={user}
            onUpdate={handleProfileUpdate} />);


      case 'security':
        return (
          <SecurityTab
            onPasswordChange={handlePasswordChange}
            onTwoFactorToggle={handleTwoFactorToggle} />);


      case 'sessions':
        return (
          <SessionsTab
            onLogoutSession={handleLogoutSession}
            onLogoutAll={handleLogoutAll} />);


      case 'preferences':
        return (
          <PreferencesTab
            onPreferencesUpdate={handlePreferencesUpdate} />);


      case 'account':
        return (
          <AccountTab
            user={user}
            onAccountAction={handleAccountAction} />);


      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading profile settings...</p>
        </div>
      </div>);

  }

  return (
    <>
      <Helmet>
        <title>Profile Settings - PromoHive</title>
        <meta name="description" content="Manage your PromoHive account settings, security preferences, and personal information." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header
          onMenuToggle={handleMobileDrawerToggle}
          isMenuOpen={isMobileDrawerOpen} />

        
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle} />

        
        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          user={user} />


        <main className={`pt-16 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'}`
        }>
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
              <Breadcrumb />
              
              <div className="mt-4">
                <h1 className="text-3xl font-bold gradient-text mb-2">
                  Profile Settings
                </h1>
                <p className="text-text-secondary">
                  Manage your account settings, security preferences, and personal information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Settings Navigation */}
              <div className="lg:col-span-1">
                <div className="glass rounded-xl p-4 sticky top-24">
                  <nav className="space-y-2">
                    {tabs?.map((tab) =>
                    <button
                      key={tab?.id}
                      onClick={() => handleTabChange(tab?.id)}
                      className={`w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab?.id ?
                      'bg-primary/10 text-primary border border-primary/20' : 'text-text-secondary hover:text-foreground hover:bg-muted/50'}`
                      }>

                        <Icon
                        name={tab?.icon}
                        size={20}
                        className={activeTab === tab?.id ? 'text-primary' : 'text-text-secondary'} />

                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${
                        activeTab === tab?.id ? 'text-primary' : 'text-foreground'}`
                        }>
                            {tab?.label}
                          </p>
                          <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                            {tab?.description}
                          </p>
                        </div>
                      </button>
                    )}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="lg:col-span-3">
                <div className="animate-fade-in-up">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>);

};

export default ProfileSettings;