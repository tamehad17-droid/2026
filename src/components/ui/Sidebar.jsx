import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isCollapsed = false, onToggle, className = '' }) => {
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();

  const isAuthPage = location?.pathname === '/login' || location?.pathname === '/register';

  if (isAuthPage) {
    return null;
  }

  // Admin navigation items (shown first if user is admin)
  const adminNavItems = isAdmin() ? [
    {
      label: 'Admin Dashboard',
      icon: 'Shield',
      path: '/admin-dashboard',
      gradient: true
    },
    {
      label: 'Admin Settings',
      icon: 'Settings',
      path: '/admin-settings',
      gradient: true
    },
    {
      label: 'Users Management',
      icon: 'Users',
      path: '/users-management',
      gradient: true
    },
    {
      label: 'Proofs Review',
      icon: 'Eye',
      path: '/proofs-review',
      gradient: true
    }
  ] : [];

  const navigationItems = [
    ...adminNavItems,
    {
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      path: '/user-dashboard',
      roles: ['user', 'admin']
    },
    {
      label: 'Tasks',
      icon: 'CheckSquare',
      roles: ['user'],
      children: [
        { label: 'Browse Tasks', path: '/tasks-list', icon: 'Search' },
        { label: 'Task Details', path: '/task-details', icon: 'FileText' },
        { label: 'Proof Management', path: '/proofs-management', icon: 'Upload' }
      ]
    },
    {
      label: 'Earnings',
      icon: 'DollarSign',
      roles: ['user'],
      children: [
        { label: 'Wallet Overview', path: '/wallet-overview', icon: 'Wallet' },
        { label: 'Withdraw Funds', path: '/withdrawal-request', icon: 'ArrowUpRight' },
        { label: 'Referrals', path: '/referrals-management', icon: 'Users' }
      ]
    },
    {
      label: 'Rewards',
      icon: 'Gift',
      path: '/daily-spin-wheel',
      roles: ['user']
    },
    {
      label: 'Profile',
      icon: 'User',
      path: '/profile-settings',
      roles: ['user', 'admin']
    },
    {
      label: 'Administration',
      icon: 'Shield',
      roles: ['admin'],
      children: [
        { label: 'Users Management', path: '/users-management', icon: 'Users' },
        { label: 'Proof Reviews', path: '/proofs-review', icon: 'Eye' },
        { label: 'Withdrawals', path: '/withdrawals-processing', icon: 'CreditCard' },
        { label: 'Upgrade Requests', path: '/upgrade-requests', icon: 'TrendingUp' }
      ]
    }
  ];

  const filteredNavigation = navigationItems?.filter(item => 
    item?.roles?.includes(user?.role || 'user')
  );

  const isActiveRoute = (path, children = null) => {
    if (path) {
      return location?.pathname === path;
    }
    if (children) {
      return children?.some(child => location?.pathname === child?.path);
    }
    return false;
  };

  const NavItem = ({ item, isChild = false }) => {
    const [isExpanded, setIsExpanded] = useState(
      item?.children ? item?.children?.some(child => location?.pathname === child?.path) : false
    );
    const isActive = isActiveRoute(item?.path, item?.children);

    if (item?.children) {
      return (
        <div className="space-y-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
              isActive
                ? 'bg-primary/10 text-primary' :'text-text-secondary hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon 
                name={item?.icon} 
                size={18} 
                className={isActive ? 'text-primary' : 'text-text-secondary group-hover:text-foreground'}
              />
              {!isCollapsed && <span>{item?.label}</span>}
            </div>
            {!isCollapsed && (
              <Icon 
                name="ChevronDown" 
                size={16} 
                className={`transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                } ${isActive ? 'text-primary' : 'text-text-secondary group-hover:text-foreground'}`}
              />
            )}
          </button>
          {!isCollapsed && isExpanded && (
            <div className="ml-6 space-y-1 animate-fade-in">
              {item?.children?.map((child, index) => (
                <Link
                  key={index}
                  to={child?.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    location?.pathname === child?.path
                      ? 'bg-primary/10 text-primary font-medium' :'text-text-secondary hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <Icon 
                    name={child?.icon} 
                    size={16} 
                    className={location?.pathname === child?.path ? 'text-primary' : 'text-text-secondary'}
                  />
                  <span>{child?.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        to={item?.path}
        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
          isActive
            ? 'bg-primary/10 text-primary' :'text-text-secondary hover:text-foreground hover:bg-muted/50'
        }`}
        title={isCollapsed ? item?.label : undefined}
      >
        <Icon 
          name={item?.icon} 
          size={18} 
          className={isActive ? 'text-primary' : 'text-text-secondary group-hover:text-foreground'}
        />
        {!isCollapsed && <span>{item?.label}</span>}
      </Link>
    );
  };

  return (
    <aside 
      className={`fixed left-0 top-16 bottom-0 z-40 glass border-r border-border transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      } ${className}`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-semibold text-foreground">Navigation</h2>
                <p className="text-sm text-text-secondary">
                  {user?.role === 'admin' ? 'Admin Panel' : 'User Dashboard'}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="hidden lg:flex"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={20} />
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredNavigation?.map((item, index) => (
            <NavItem key={index} item={item} />
          ))}
        </nav>

        {/* Sidebar Footer */}
        {!isCollapsed && user && (
          <div className="p-4 border-t border-border">
            <div className="glass rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="Wallet" size={14} className="text-success" />
                  <span className="text-sm font-data text-success">
                    ${user?.balance?.toFixed(2)}
                  </span>
                </div>
                <Link to="/profile-settings">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Icon name="Settings" size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;