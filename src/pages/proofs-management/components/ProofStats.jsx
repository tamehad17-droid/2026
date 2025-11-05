import React from 'react';
import Icon from '../../../components/AppIcon';

const ProofStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Proofs',
      value: stats?.total,
      icon: 'FileText',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      title: 'Pending Review',
      value: stats?.pending,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20'
    },
    {
      title: 'Approved',
      value: stats?.approved,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20'
    },
    {
      title: 'Rejected',
      value: stats?.rejected,
      icon: 'XCircle',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20'
    },
    {
      title: 'Total Earnings',
      value: `$${stats?.totalEarnings?.toFixed(2)}`,
      icon: 'DollarSign',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      isAmount: true
    },
    {
      title: 'Pending Earnings',
      value: `$${stats?.pendingEarnings?.toFixed(2)}`,
      icon: 'Wallet',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      isAmount: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {statCards?.map((stat, index) => (
        <div
          key={index}
          className={`glass rounded-lg border p-4 hover:scale-105 transition-all duration-200 ${stat?.borderColor}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat?.bgColor}`}>
              <Icon name={stat?.icon} size={20} className={stat?.color} />
            </div>
            
            {stat?.title === 'Pending Review' && stats?.pending > 0 && (
              <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
            )}
          </div>
          
          <div>
            <p className="text-sm text-text-secondary mb-1">{stat?.title}</p>
            <p className={`text-2xl font-bold ${stat?.isAmount ? 'font-data' : ''} ${
              stat?.isAmount ? stat?.color : 'text-foreground'
            }`}>
              {stat?.value}
            </p>
          </div>

          {/* Progress indicator for percentages */}
          {stats?.total > 0 && !stat?.isAmount && stat?.title !== 'Total Proofs' && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                <span>Percentage</span>
                <span>{((stat?.value / stats?.total) * 100)?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    stat?.title === 'Approved' ? 'bg-success' :
                    stat?.title === 'Pending Review'? 'bg-warning' : 'bg-destructive'
                  }`}
                  style={{ width: `${(stat?.value / stats?.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProofStats;