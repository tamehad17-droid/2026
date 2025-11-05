import React from 'react';
import Icon from '../../../components/AppIcon';

const ProofStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Submissions',
      value: stats?.total,
      icon: 'FileText',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Pending Review',
      value: stats?.pending,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'Approved Today',
      value: stats?.approvedToday,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'Rejected Today',
      value: stats?.rejectedToday,
      icon: 'XCircle',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
    {
      title: 'Average Review Time',
      value: `${stats?.avgReviewTime}h`,
      icon: 'Timer',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'Total Rewards',
      value: `$${stats?.totalRewards?.toFixed(2)}`,
      icon: 'DollarSign',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards?.map((stat, index) => (
        <div key={index} className="glass rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg ${stat?.bgColor} flex items-center justify-center`}>
              <Icon name={stat?.icon} size={20} className={stat?.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-secondary truncate">{stat?.title}</p>
              <p className="text-lg font-semibold text-foreground">{stat?.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProofStats;