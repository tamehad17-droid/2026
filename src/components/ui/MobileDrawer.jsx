import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const MobileDrawer = ({ isOpen = false, onClose, user = null }) => {
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      path: user?.role === 'admin' ? '/admin-dashboard' : '/user-dashboard',
      roles: ['user', 'admin']
    },
    {
      label: 'Browse Tasks',
      icon: 'Search',
      path: '/tasks-list',
      roles: ['user']
    },
    {
      label: 'Task Details',
      icon: 'FileText',
      path: '/task-details',
      roles: ['user']
    },
    {
      label: 'Proof Management',
      icon: 'Upload',
      path: '/proofs-management',
      roles: ['user']
    },
    {
      label: 'Wallet Overview',
      icon: 'Wallet',
      path: '/wallet-overview',
      roles: ['user']
    },
    {
      label: 'Withdraw Funds',
      icon: 'ArrowUpRight',
      path: '/withdrawal-request',
      roles: ['user']
    },
    {
      label: 'Referrals',
      icon: 'Users',
      path: '/referrals-management',
      roles: ['user']
    },
    {
      label: 'Daily Rewards',
      icon: 'Gift',
      path: '/daily-spin-wheel',
      roles: ['user']
    },
    {
      label: 'Profile Settings',
      icon: 'User',
      path: '/profile-settings',
      roles: ['user', 'admin']
    },
    // Admin items
    {
      label: 'Users Management',
      icon: 'Users',
      path: '/users-management',
      roles: ['admin']
    },
    {
      label: 'Proof Reviews',
      icon: 'Eye',
      path: '/proofs-review',
      roles: ['admin']
    },
    {
      label: 'Withdrawals',
      icon: 'CreditCard',
      path: '/withdrawals-processing',
      roles: ['admin']
    }
  ];

  const filteredNavigation = navigationItems?.filter(item => 
    item?.roles?.includes(user?.role || 'user')
  );

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = () => {
    // Handle logout logic
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className={`fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] glass border-r border-border z-50 transform transition-transform duration-300 ease-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Link to="/user-dashboard" className="flex items-center space-x-3" onClick={handleLinkClick}>
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Icon name="Zap" size={20} color="white" />
              </div>
              <span className="text-xl font-bold gradient-text">PromoHive</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={24} />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-6 border-b border-border">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-lg font-semibold text-white">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{user?.name}</p>
                  <p className="text-sm text-text-secondary truncate">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between glass rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Icon name="Wallet" size={16} className="text-success" />
                  <span className="text-sm font-data text-success">
                    ${user?.balance?.toFixed(2)}
                  </span>
                </div>
                <span className="text-xs text-text-secondary bg-muted/30 px-2 py-1 rounded-full">
                  {user?.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredNavigation?.map((item, index) => (
              <Link
                key={index}
                to={item?.path}
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location?.pathname === item?.path
                    ? 'bg-primary/10 text-primary' :'text-text-secondary hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon 
                  name={item?.icon} 
                  size={20} 
                  className={location?.pathname === item?.path ? 'text-primary' : 'text-text-secondary'}
                />
                <span>{item?.label}</span>
                {location?.pathname === item?.path && (
                  <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Footer Actions */}
          {user && (
            <div className="p-4 border-t border-border space-y-2">
              <Link
                to="/profile-settings"
                onClick={handleLinkClick}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <Icon name="Settings" size={20} />
                <span>Settings</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
              >
                <Icon name="LogOut" size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;