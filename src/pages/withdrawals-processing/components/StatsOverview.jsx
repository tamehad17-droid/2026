import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsOverview = ({ stats }) => {
  const statCards = [
    {
      title: 'Pending Withdrawals',
      value: stats?.pending,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20'
    },
    {
      title: 'Total Amount Pending',
      value: `$${stats?.pendingAmount?.toFixed(2)}`,
      icon: 'DollarSign',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20'
    },
    {
      title: 'Processed Today',
      value: stats?.processedToday,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20'
    },
    {
      title: 'Success Rate',
      value: `${stats?.successRate}%`,
      icon: 'TrendingUp',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      title: 'High Risk Requests',
      value: stats?.highRisk,
      icon: 'AlertTriangle',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20'
    },
    {
      title: 'Average Processing Time',
      value: `${stats?.avgProcessingTime}h`,
      icon: 'Timer',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {statCards?.map((stat, index) => (
        <div
          key={index}
          className={`glass rounded-lg border p-4 ${stat?.borderColor} hover:scale-105 transition-transform duration-200`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`w-10 h-10 rounded-lg ${stat?.bgColor} flex items-center justify-center`}>
              <Icon name={stat?.icon} size={20} className={stat?.color} />
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
            <p className="text-sm text-text-secondary">{stat?.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;