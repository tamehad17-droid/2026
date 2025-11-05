import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onRefresh, refreshing }) => {
  const quickActionItems = [
    {
      label: 'View Proofs',
      description: 'Manage submitted proofs',
      icon: 'Upload',
      path: '/proofs-management',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      label: 'Wallet',
      description: 'Check your balance',
      icon: 'Wallet',
      path: '/wallet-overview',
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      label: 'Referrals',
      description: 'Invite friends',
      icon: 'Users',
      path: '/referrals-management',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    },
    {
      label: 'Daily Rewards',
      description: 'Spin the wheel',
      icon: 'Gift',
      path: '/daily-spin-wheel',
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10'
    }
  ];

  return (
    <div className="glass rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          <p className="text-text-secondary text-sm">Access frequently used features</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          loading={refreshing}
          iconName="RefreshCw"
          iconPosition="left"
        >
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActionItems?.map((item, index) => (
          <Link
            key={index}
            to={item?.path}
            className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/30 transition-colors group"
          >
            <div className={`w-12 h-12 rounded-lg ${item?.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon name={item?.icon} size={20} className={item?.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                {item?.label}
              </p>
              <p className="text-xs text-text-secondary truncate">
                {item?.description}
              </p>
            </div>
            <Icon name="ChevronRight" size={16} className="text-text-secondary group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;