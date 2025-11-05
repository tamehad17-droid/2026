import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActions = ({ userStats = {} }) => {
  const actions = [
    {
      label: 'Browse Tasks',
      description: 'Find new earning opportunities',
      icon: 'Search',
      path: '/tasks-list',
      variant: 'default',
      gradient: true
    },
    {
      label: 'Submit Proof',
      description: 'Upload task completion proof',
      icon: 'Upload',
      path: '/proofs-management',
      variant: 'outline',
      disabled: !userStats?.hasPendingTasks
    },
    {
      label: 'Request Withdrawal',
      description: 'Withdraw your earnings',
      icon: 'ArrowUpRight',
      path: '/withdrawal-request',
      variant: 'secondary',
      disabled: (userStats?.currentBalance || 0) < 10
    },
    {
      label: 'Generate Referral',
      description: 'Invite friends and earn',
      icon: 'Users',
      path: '/referrals-management',
      variant: 'outline'
    }
  ];

  return (
    <div className="glass rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions?.map((action, index) => (
          <Link 
            key={index} 
            to={action?.path}
            className={`block ${action?.disabled ? 'pointer-events-none' : ''}`}
          >
            <div className={`p-4 rounded-lg border border-border transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              action?.gradient 
                ? 'bg-gradient-to-br from-primary/20 to-secondary/20' :'bg-muted/20'
            } ${action?.disabled ? 'opacity-50' : 'hover:bg-muted/30'}`}>
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  action?.gradient 
                    ? 'bg-gradient-primary' 
                    : action?.disabled 
                      ? 'bg-muted/50' :'bg-primary/10'
                }`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    iconName={action?.icon}
                    className={`w-6 h-6 ${
                      action?.gradient 
                        ? 'text-white' 
                        : action?.disabled 
                          ? 'text-text-secondary' :'text-primary'
                    }`}
                    disabled={action?.disabled}
                  />
                </div>
                
                <h4 className={`font-medium mb-1 ${
                  action?.disabled ? 'text-text-secondary' : 'text-foreground'
                }`}>
                  {action?.label}
                </h4>
                
                <p className={`text-xs ${
                  action?.disabled ? 'text-text-secondary/70' : 'text-text-secondary'
                }`}>
                  {action?.description}
                </p>
                
                {action?.disabled && (
                  <p className="text-xs text-warning mt-2">
                    {action?.label === 'Submit Proof' ?'No pending tasks' :'Minimum $10 required'
                    }
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;