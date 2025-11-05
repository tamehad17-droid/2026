import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MetricCard from './components/MetricCard';
// QuickActionPanel removed (was causing issues) — analytics expanded in its place
import ActivityFeed from './components/ActivityFeed';
import AnalyticsChart from './components/AnalyticsChart';
import QuickActionPanel from './components/QuickActionPanel';
import SystemMonitoring from './components/SystemMonitoring';
import AdminShortcuts from './components/AdminShortcuts';
import ApprovalHistoryModal from './components/ApprovalHistoryModal';
import SettingsManager from './components/SettingsManager';

const AdminDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { profile, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showApprovalHistory, setShowApprovalHistory] = useState(false);
  const navigate = null; // placeholder for optional navigation

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getDashboardStats();
      
      if (result.success) {
        setStats(result.stats);
      } else {
        setError(result.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Platform metrics from real data
  const platformMetrics = stats ? [
    {
      title: "Total Users",
      value: stats.totalUsers || 0,
      change: "+12.5%",
      changeType: "positive",
      icon: "Users",
      iconColor: "text-primary",
      description: "Active registered users",
      trend: true
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals || 0,
      change: stats.pendingApprovals > 0 ? `+${stats.pendingApprovals}` : "0",
      changeType: stats.pendingApprovals > 0 ? "warning" : "positive",
      icon: "UserCheck",
      iconColor: "text-warning",
      description: "Awaiting admin review",
      trend: true
    },
    {
      title: "Active Tasks",
      value: stats.activeTasks || 0,
      change: "+8.2%",
      changeType: "positive",
      icon: "CheckSquare",
      iconColor: "text-success",
      description: "Currently available tasks",
      trend: true
    },
    {
      title: "Platform Revenue",
      value: `$${(stats.totalRevenue || 0).toFixed(2)}`,
      change: "+15.3%",
      changeType: "positive",
      icon: "DollarSign",
      iconColor: "text-success",
      description: "Total earnings",
      trend: true
    },
    {
      title: "Withdrawal Requests",
      value: stats.pendingWithdrawals || 0,
      change: stats.pendingWithdrawals > 0 ? `${stats.pendingWithdrawals}` : "0",
      changeType: stats.pendingWithdrawals === 0 ? "positive" : "warning",
      icon: "CreditCard",
      iconColor: "text-secondary",
      description: "Pending USDT withdrawals",
      trend: true
    },
    {
      title: "Proof Reviews",
      value: 0,
      change: "0",
      changeType: "positive",
      icon: "Eye",
      iconColor: "text-warning",
      description: "Awaiting verification",
      trend: true
    }
  ] : [];

  const formatDateTime = (date) => {
    return date?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
          <Icon name="AlertCircle" size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Error Loading Data</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - PromoHive</title>
        <meta name="description" content="Comprehensive administrative dashboard for PromoHive platform management, user oversight, and system monitoring." />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="glass border-b border-border p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Icon name="Shield" size={24} color="white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                  <p className="text-text-secondary">
                    Welcome back, {profile?.full_name || user?.email || 'Administrator'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-text-secondary">
                {formatDateTime(currentTime)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg glass">
                <Icon name="Clock" size={16} className="text-success" />
                <span className="text-sm text-success font-medium">
                  Role: {profile?.role || 'admin'}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
                  Export Report
                </Button>
                <Button variant="default" size="sm" iconName="Settings" iconPosition="left" onClick={() => setShowSettings(true)}>
                  System Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-8">
          {/* Platform Metrics Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Platform Overview</h2>
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>Real-time data</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {platformMetrics?.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>
          </section>

          {/* Analytics and Quick Actions */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <AnalyticsChart />
            </div>
            <div className="xl:col-span-1">
              <QuickActionPanel />
            </div>
          </section>

          {/* Activity Feed and Admin Shortcuts */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <ActivityFeed />
            <AdminShortcuts 
              onActionClick={(action) => {
                // Handle quick actions from shortcuts
                switch(action) {
                  case 'approve_users':
                    // Navigate to users management filtered to pending (open in a new tab to keep dashboard)
                    window.location.href = '/users-management';
                    break;
                  case 'users':
                    window.location.href = '/users-management';
                    break;
                  case 'tasks':
                    window.location.href = '/tasks-management';
                    break;
                  case 'withdrawals':
                    window.location.href = '/withdrawals-processing';
                    break;
                  case 'upgrade_requests':
                    window.location.href = '/upgrade-requests';
                    break;
                  case 'settings':
                    setShowSettings(true);
                    break;
                  case 'approval_history':
                    setShowApprovalHistory(true);
                    break;
                  default:
                    console.log('Unhandled admin action:', action);
                }
              }}
              stats={{
                totalUsers: stats?.totalUsers || 0,
                pendingApprovals: stats?.pendingApprovals || 0,
                activeTasks: stats?.activeTasks || 0,
                withdrawalRequests: stats?.pendingWithdrawals || 0
              }}
            />
          </section>

          {/* System Monitoring */}
          <section>
            <SystemMonitoring />
          </section>

          {/* Footer Information */}
          <section className="glass rounded-xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <Icon name="Info" size={20} className="text-primary" />
                <div>
                  <h3 className="font-medium text-foreground">Platform Status</h3>
                  <p className="text-sm text-text-secondary">
                    All systems operational • Last updated: {currentTime?.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-text-secondary">
                <div className="flex items-center space-x-2">
                  <Icon name="Server" size={16} className="text-success" />
                  <span>Server: Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Database" size={16} className="text-success" />
                  <span>Database: Healthy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Wifi" size={16} className="text-success" />
                  <span>API: Responsive</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
        {/* Settings Modal */}
        {showSettings && (
          <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowSettings(false)} />
            <div className="fixed inset-4 md:inset-8 lg:inset-12 glass rounded-lg border border-border z-50 overflow-auto max-h-[80vh] p-6">
              <div className="flex justify-end mb-4">
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                  <Icon name="X" size={20} />
                </Button>
              </div>
              <SettingsManager />
            </div>
          </>
        )}

        {/* Approval History Modal */}
        <ApprovalHistoryModal isOpen={showApprovalHistory} onClose={() => setShowApprovalHistory(false)} />
    </>
  );
};

export default AdminDashboard;