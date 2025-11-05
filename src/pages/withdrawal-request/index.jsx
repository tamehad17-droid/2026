import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import WithdrawalForm from './components/WithdrawalForm';
import WithdrawalHistory from './components/WithdrawalHistory';
import WithdrawalLimits from './components/WithdrawalLimits';

const WithdrawalRequest = () => {
  const [activeTab, setActiveTab] = useState('request');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate user data fetch
    const userData = {
      id: 'user_123',
      name: 'John Doe',
      email: 'john@promohive.com',
      balance: 1250.75,
      level: 2,
      totalWithdrawn: 2500.00,
      isVerified: true
    };
    setUser(userData);
  }, []);

  const handleWithdrawalSubmit = async (withdrawalData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful submission
      console.log('Withdrawal submitted:', withdrawalData);
      
      // Switch to history tab to show the new request
      setActiveTab('history');
      
      // In a real app, show success toast and redirect
      alert('Withdrawal request submitted successfully! You will receive an email confirmation shortly.');
      
    } catch (error) {
      console.error('Withdrawal submission failed:', error);
      alert('Failed to submit withdrawal request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/user-dashboard' },
    { label: 'Wallet', path: '/wallet-overview' },
    { label: 'Withdraw Funds', path: '/withdrawal-request' }
  ];

  const tabs = [
    { id: 'request', label: 'New Request', icon: 'Plus' },
    { id: 'history', label: 'History', icon: 'History' },
    { id: 'limits', label: 'Limits', icon: 'Shield' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-text-secondary">Loading withdrawal page...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Breadcrumb items={breadcrumbItems} className="mb-4" />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Withdraw Funds</h1>
              <p className="text-text-secondary mt-2">
                Convert your earnings to USDT cryptocurrency
              </p>
            </div>
            
            <Link to="/wallet-overview">
              <Button variant="outline" iconName="ArrowLeft" iconPosition="left">
                Back to Wallet
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-lg p-4 border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Wallet" size={20} className="text-success" />
              <div>
                <div className="text-sm text-text-secondary">Available Balance</div>
                <div className="text-xl font-data text-success">
                  ${user?.balance?.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-lg p-4 border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="TrendingDown" size={20} className="text-primary" />
              <div>
                <div className="text-sm text-text-secondary">Total Withdrawn</div>
                <div className="text-xl font-data text-foreground">
                  ${user?.totalWithdrawn?.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-lg p-4 border border-border">
            <div className="flex items-center space-x-3">
              <Icon name="Shield" size={20} className="text-warning" />
              <div>
                <div className="text-sm text-text-secondary">Account Level</div>
                <div className="text-xl font-data text-foreground">
                  Level {user?.level}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        {!user?.isVerified && (
          <div className="glass rounded-lg p-4 border border-warning/20 bg-warning/5 mb-8">
            <div className="flex items-start space-x-3">
              <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Account Verification Required</h4>
                <p className="text-sm text-text-secondary">
                  To process withdrawals, please complete your account verification. This includes identity verification and email confirmation.
                </p>
                <Link to="/profile-settings">
                  <Button variant="outline" size="sm" iconName="User">
                    Complete Verification
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all duration-200 ${
                activeTab === tab?.id
                  ? 'bg-primary/10 text-primary border-b-2 border-primary' :'text-text-secondary hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon name={tab?.icon} size={18} />
              <span>{tab?.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'request' && (
            <div className="glass rounded-lg p-6 border border-border">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Create Withdrawal Request
                </h2>
                <p className="text-text-secondary">
                  Fill out the form below to request a withdrawal to your USDT wallet
                </p>
              </div>
              
              <WithdrawalForm
                userBalance={user?.balance}
                onSubmit={handleWithdrawalSubmit}
                isLoading={isLoading}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <WithdrawalHistory />
          )}

          {activeTab === 'limits' && (
            <WithdrawalLimits
              userLevel={user?.level}
              totalWithdrawn={user?.totalWithdrawn}
            />
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 glass rounded-lg p-6 border border-border">
          <div className="flex items-start space-x-3">
            <Icon name="HelpCircle" size={24} className="text-primary mt-1" />
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Need Help with Withdrawals?
                </h3>
                <p className="text-text-secondary">
                  If you're experiencing issues with your withdrawal or have questions about the process, our support team is here to help.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Common Issues:</h4>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• Invalid wallet address format</li>
                    <li>• Insufficient balance for fees</li>
                    <li>• Account verification pending</li>
                    <li>• Daily/monthly limits exceeded</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Processing Times:</h4>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• Review: 2-6 hours</li>
                    <li>• Processing: 12-24 hours</li>
                    <li>• Network confirmation: 10-30 minutes</li>
                    <li>• Total time: 24-48 hours</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" iconName="MessageCircle">
                  Contact Support
                </Button>
                <Button variant="outline" size="sm" iconName="FileText">
                  View FAQ
                </Button>
                <Button variant="outline" size="sm" iconName="ExternalLink">
                  Withdrawal Guide
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalRequest;