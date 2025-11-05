import React from 'react';
import Icon from '../../../components/AppIcon';

const UserStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers,
      icon: 'Users',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: stats?.userGrowth,
      changeType: stats?.userGrowth >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Pending Approval',
      value: stats?.pendingUsers,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: stats?.pendingChange,
      changeType: stats?.pendingChange >= 0 ? 'neutral' : 'positive'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: stats?.activeGrowth,
      changeType: stats?.activeGrowth >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Suspended',
      value: stats?.suspendedUsers,
      icon: 'XCircle',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      change: stats?.suspendedChange,
      changeType: stats?.suspendedChange <= 0 ? 'positive' : 'negative'
    }
  ];

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US')?.format(num);
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'positive':
        return 'TrendingUp';
      case 'negative':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-destructive';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards?.map((stat, index) => (
        <div key={index} className="glass rounded-lg border border-border p-6 hover:glass-hover transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg ${stat?.bgColor} flex items-center justify-center`}>
              <Icon name={stat?.icon} size={24} className={stat?.color} />
            </div>
            <div className={`flex items-center space-x-1 text-sm ${getChangeColor(stat?.changeType)}`}>
              <Icon name={getChangeIcon(stat?.changeType)} size={14} />
              <span>{Math.abs(stat?.change)}%</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {formatNumber(stat?.value)}
            </h3>
            <p className="text-sm text-text-secondary">{stat?.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserStats;