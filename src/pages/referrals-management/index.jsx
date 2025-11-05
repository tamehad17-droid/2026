import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ReferralLinkGenerator from './components/ReferralLinkGenerator';
import ReferralTree from './components/ReferralTree';
import ReferralSummaryCards from './components/ReferralSummaryCards';
import ReferralTable from './components/ReferralTable';
import ReferralPerformanceMetrics from './components/ReferralPerformanceMetrics';

const ReferralsManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'network', label: 'Network Tree', icon: 'GitBranch' },
    { id: 'details', label: 'Referral Details', icon: 'Users' },
    { id: 'analytics', label: 'Performance', icon: 'BarChart3' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass rounded-xl p-8 border border-border">
          <div className="flex items-center space-x-3">
            <div className="animate-spin">
              <Icon name="Loader2" size={24} className="text-primary" />
            </div>
            <span className="text-foreground font-medium">Loading referral data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Referrals Management - PromoHive</title>
        <meta name="description" content="Manage your referral network, track earnings, and grow your PromoHive community with comprehensive referral management tools." />
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Referrals Management</h1>
              <p className="text-text-secondary">
                Build your network, track performance, and maximize your referral earnings
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" iconName="Download" iconPosition="left">
                Export Report
              </Button>
              <Button variant="default" iconName="Share" iconPosition="left">
                Share Link
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats - Always Visible */}
        <div className="mb-8">
          <ReferralSummaryCards />
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="glass rounded-xl p-2 border border-border">
            <div className="flex flex-wrap gap-2">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab?.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-text-secondary hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span className="hidden sm:inline">{tab?.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <ReferralLinkGenerator />
              
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                  <ReferralTable />
                </div>
                <div>
                  <div className="glass rounded-xl p-6 border border-border">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <Icon name="Target" size={20} color="white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                        <p className="text-sm text-text-secondary">Boost your referral success</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button variant="outline" fullWidth iconName="MessageSquare" iconPosition="left">
                        Create Referral Post
                      </Button>
                      <Button variant="outline" fullWidth iconName="Mail" iconPosition="left">
                        Email Invitation
                      </Button>
                      <Button variant="outline" fullWidth iconName="Users" iconPosition="left">
                        View Network Tree
                      </Button>
                      <Button variant="outline" fullWidth iconName="BarChart3" iconPosition="left">
                        Performance Analytics
                      </Button>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon name="Lightbulb" size={16} className="text-primary" />
                        <span className="text-sm font-medium text-primary">Pro Tip</span>
                      </div>
                      <p className="text-sm text-text-secondary">
                        Share your referral link on social media during peak hours (7-9 PM) for 40% better conversion rates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="animate-fade-in">
              <ReferralTree />
            </div>
          )}

          {activeTab === 'details' && (
            <div className="animate-fade-in">
              <ReferralTable />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-fade-in">
              <ReferralPerformanceMetrics />
            </div>
          )}
        </div>

        {/* Mobile Floating Action Button */}
        <div className="fixed bottom-6 right-6 lg:hidden">
          <Button
            variant="default"
            size="lg"
            className="rounded-full shadow-lg"
            iconName="Share"
          >
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReferralsManagement;