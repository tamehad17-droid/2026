import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ usdtRate, withdrawalFee }) => {
  const quickActionItems = [
    {
      title: 'Request Withdrawal',
      description: 'Convert your earnings to USDT',
      icon: 'ArrowUpRight',
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10',
      path: '/withdrawal-request',
      primary: true
    },
    {
      title: 'View Referrals',
      description: 'Check your referral earnings',
      icon: 'Users',
      iconColor: 'text-secondary',
      bgColor: 'bg-secondary/10',
      path: '/referrals-management'
    },
    {
      title: 'Browse Tasks',
      description: 'Find new earning opportunities',
      icon: 'Search',
      iconColor: 'text-success',
      bgColor: 'bg-success/10',
      path: '/tasks-list'
    },
    {
      title: 'Daily Rewards',
      description: 'Spin the wheel for bonus rewards',
      icon: 'Gift',
      iconColor: 'text-accent',
      bgColor: 'bg-accent/10',
      path: '/daily-spin-wheel'
    }
  ];

  return (
    <div className="space-y-6">
      {/* USDT Conversion Info */}
      <div className="glass rounded-xl border border-border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon name="DollarSign" size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">USDT Conversion</h3>
            <p className="text-sm text-text-secondary">Current exchange rates and fees</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
            <div className="flex items-center space-x-2">
              <Icon name="TrendingUp" size={16} className="text-success" />
              <span className="text-sm font-medium text-foreground">USD to USDT Rate</span>
            </div>
            <span className="text-sm font-data text-success">{usdtRate?.toFixed(4)}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
            <div className="flex items-center space-x-2">
              <Icon name="Percent" size={16} className="text-warning" />
              <span className="text-sm font-medium text-foreground">Withdrawal Fee</span>
            </div>
            <span className="text-sm font-data text-warning">{withdrawalFee}%</span>
          </div>

          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-primary mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-medium mb-1">Withdrawal Information</p>
                <p className="text-text-secondary">
                  Minimum withdrawal: $10.00 USD. Processing time: 24-48 hours. 
                  Network fees may apply based on blockchain congestion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Actions Grid */}
      <div className="glass rounded-xl border border-border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-accent/10">
            <Icon name="Zap" size={24} className="text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
            <p className="text-sm text-text-secondary">Fast access to common tasks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActionItems?.map((action, index) => (
            <Link
              key={index}
              to={action?.path}
              className="group block"
            >
              <div className={`p-4 rounded-lg border border-border transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                action?.primary ? 'glass bg-gradient-to-br from-primary/10 to-secondary/10' : 'glass'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${action?.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon name={action?.icon} size={20} className={action?.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium mb-1 ${
                      action?.primary ? 'gradient-text' : 'text-foreground'
                    }`}>
                      {action?.title}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {action?.description}
                    </p>
                  </div>
                  <Icon 
                    name="ChevronRight" 
                    size={16} 
                    className="text-text-secondary group-hover:text-primary transition-colors" 
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* Support Section */}
      <div className="glass rounded-xl border border-border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-success/10">
            <Icon name="HelpCircle" size={24} className="text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Need Help?</h3>
            <p className="text-sm text-text-secondary">Get support with your wallet</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            fullWidth
            iconName="MessageCircle"
            iconPosition="left"
          >
            Contact Support
          </Button>
          
          <Button
            variant="ghost"
            fullWidth
            iconName="FileText"
            iconPosition="left"
          >
            View FAQ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;