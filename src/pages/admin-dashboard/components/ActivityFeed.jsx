import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = () => {
  const activities = [
    {
      id: 1,
      type: "user_registration",
      user: "Sarah Johnson",
      action: "New user registered",
      timestamp: new Date(Date.now() - 300000),
      icon: "UserPlus",
      color: "text-success"
    },
    {
      id: 2,
      type: "task_completion",
      user: "Mike Chen",
      action: "Completed AdGem task #1247",
      timestamp: new Date(Date.now() - 600000),
      icon: "CheckCircle",
      color: "text-primary"
    },
    {
      id: 3,
      type: "withdrawal_request",
      user: "Emma Davis",
      action: "Requested USDT withdrawal ($125.50)",
      timestamp: new Date(Date.now() - 900000),
      icon: "ArrowUpRight",
      color: "text-warning"
    },
    {
      id: 4,
      type: "proof_submission",
      user: "Alex Rodriguez",
      action: "Submitted proof for task #1251",
      timestamp: new Date(Date.now() - 1200000),
      icon: "Upload",
      color: "text-secondary"
    },
    {
      id: 5,
      type: "system_alert",
      user: "System",
      action: "High server load detected",
      timestamp: new Date(Date.now() - 1500000),
      icon: "AlertTriangle",
      color: "text-error"
    },
    {
      id: 6,
      type: "referral_bonus",
      user: "John Smith",
      action: "Earned referral bonus ($5.00)",
      timestamp: new Date(Date.now() - 1800000),
      icon: "Users",
      color: "text-success"
    }
  ];

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-sm text-text-secondary">Live</span>
        </div>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
            <div className={`w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 ${activity?.color}`}>
              <Icon name={activity?.icon} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{activity?.user}</span>
                  <span className="text-text-secondary ml-1">{activity?.action}</span>
                </p>
                <span className="text-xs text-text-secondary flex-shrink-0">
                  {formatTimeAgo(activity?.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <button className="w-full text-sm text-primary hover:text-primary/80 transition-colors">
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;