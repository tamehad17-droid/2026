import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = ({ items = null, className = '' }) => {
  const location = useLocation();

  // Auto-generate breadcrumbs if items not provided
  const generateBreadcrumbs = () => {
    const pathSegments = location?.pathname?.split('/')?.filter(Boolean);
    const breadcrumbs = [{ label: 'Dashboard', path: '/user-dashboard' }];

    const routeMap = {
      'tasks-list': 'Browse Tasks',
      'task-details': 'Task Details',
      'proofs-management': 'Proof Management',
      'referrals-management': 'Referrals',
      'wallet-overview': 'Wallet Overview',
      'withdrawal-request': 'Withdraw Funds',
      'daily-spin-wheel': 'Daily Rewards',
      'profile-settings': 'Profile Settings',
      'admin-dashboard': 'Admin Dashboard',
      'users-management': 'Users Management',
      'proofs-review': 'Proof Reviews',
      'withdrawals-processing': 'Withdrawals Processing'
    };

    pathSegments?.forEach((segment, index) => {
      const path = '/' + pathSegments?.slice(0, index + 1)?.join('/');
      const label = routeMap?.[segment] || segment?.replace(/-/g, ' ')?.replace(/\b\w/g, l => l?.toUpperCase());
      
      if (segment !== 'user-dashboard' && segment !== 'admin-dashboard') {
        breadcrumbs?.push({ label, path });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Don't show breadcrumbs on auth pages or if only one item
  const isAuthPage = location?.pathname === '/login' || location?.pathname === '/register';
  if (isAuthPage || breadcrumbItems?.length <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems?.map((item, index) => {
          const isLast = index === breadcrumbItems?.length - 1;
          const isActive = location?.pathname === item?.path;

          return (
            <li key={index} className="flex items-center space-x-2">
              {index > 0 && (
                <Icon 
                  name="ChevronRight" 
                  size={14} 
                  className="text-text-secondary flex-shrink-0" 
                />
              )}
              {isLast || isActive ? (
                <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
                  {item?.label}
                </span>
              ) : (
                <Link
                  to={item?.path}
                  className="text-text-secondary hover:text-primary transition-colors truncate max-w-[150px] sm:max-w-none"
                >
                  {item?.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;