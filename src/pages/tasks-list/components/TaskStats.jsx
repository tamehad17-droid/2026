import React from 'react';
import Icon from '../../../components/AppIcon';

const TaskStats = ({ stats }) => {
  const statItems = [
    {
      label: 'Available Tasks',
      value: stats?.available,
      icon: 'CheckSquare',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Completed Tasks',
      value: stats?.completed,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Total Earnings',
      value: `$${stats?.totalEarnings?.toFixed(2)}`,
      icon: 'DollarSign',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      label: 'Active Participants',
      value: stats?.activeParticipants?.toLocaleString(),
      icon: 'Users',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems?.map((stat, index) => (
        <div key={index} className="glass rounded-xl p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm mb-1">{stat?.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat?.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${stat?.bgColor} flex items-center justify-center`}>
              <Icon name={stat?.icon} size={24} className={stat?.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskStats;