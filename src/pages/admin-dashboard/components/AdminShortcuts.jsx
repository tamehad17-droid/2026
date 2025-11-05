import React from 'react';
import { Users, ClipboardCheck, DollarSign, Settings, UserCheck, Clock, TrendingUp } from 'lucide-react';

const AdminShortcuts = ({ onActionClick, stats }) => {
  const shortcuts = [
    {
      title: 'Approve Users',
      description: `${stats?.pendingApprovals || 0} users pending`,
      icon: UserCheck,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      action: 'approve_users',
      badge: stats?.pendingApprovals > 0 ? stats?.pendingApprovals : null
    },
    {
      title: 'Upgrade Requests',
      description: 'Review level upgrades',
      icon: TrendingUp,
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
      action: 'upgrade_requests'
    },
    {
      title: 'Manage Users',
      description: `${stats?.totalUsers || 0} registered users`,
      icon: Users,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      action: 'users'
    },
    {
      title: 'Manage Tasks',
      description: `${stats?.activeTasks || 0} active tasks`,
      icon: ClipboardCheck,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      action: 'tasks'
    },
    {
      title: 'Review Withdrawals',
      description: `${stats?.pendingWithdrawals || 0} requests pending`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      action: 'withdrawals',
      badge: stats?.pendingWithdrawals > 0 ? stats?.pendingWithdrawals : null
    },
    {
      title: 'Platform Settings',
      description: 'System configuration',
      icon: Settings,
      color: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-600',
      action: 'settings'
    },
    {
      title: 'Approvals Log',
      description: 'User approval history',
      icon: Clock,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      action: 'approval_history'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {shortcuts?.map((shortcut, index) => {
          const IconComponent = shortcut?.icon;
          return (
            <button
              key={index}
              onClick={() => onActionClick?.(shortcut?.action)}
              className={`
                relative p-4 rounded-lg text-white transition-all duration-200 
                ${shortcut?.color} ${shortcut?.hoverColor}
                hover:scale-105 hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
                group
              `}
            >
              {/* Badge */}
              {shortcut?.badge && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                  {shortcut?.badge > 99 ? '99+' : shortcut?.badge}
                </span>
              )}
              <div className="flex flex-col items-center text-center">
                <IconComponent className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium mb-1">{shortcut?.title}</span>
                <span className="text-xs opacity-90">{shortcut?.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminShortcuts;