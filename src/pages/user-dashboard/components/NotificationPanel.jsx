import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationPanel = ({ notifications = [], loading = false }) => {
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded?.has(id)) {
      newExpanded?.delete(id);
    } else {
      newExpanded?.add(id);
    }
    setExpandedNotifications(newExpanded);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'error':
        return 'XCircle';
      case 'info':
        return 'Info';
      case 'approval':
        return 'UserCheck';
      case 'task':
        return 'Briefcase';
      case 'withdrawal':
        return 'CreditCard';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': case'approval':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      case 'info': case'task': case'withdrawal':
        return 'text-primary';
      default:
        return 'text-text-secondary';
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case 'success': case'approval':
        return 'bg-success/10';
      case 'warning':
        return 'bg-warning/10';
      case 'error':
        return 'bg-error/10';
      case 'info': case'task': case'withdrawal':
        return 'bg-primary/10';
      default:
        return 'bg-muted/30';
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          <div className="w-20 h-6 bg-muted/30 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(3)]?.map((_, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border border-border">
              <div className="w-8 h-8 bg-muted/30 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted/30 rounded animate-pulse" />
                <div className="h-3 bg-muted/30 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-muted/30 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
        <span className="text-sm text-text-secondary">
          {notifications?.filter(n => !n?.read)?.length} unread
        </span>
      </div>
      {notifications?.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Bell" size={24} className="text-text-secondary" />
          </div>
          <p className="text-text-secondary">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications?.slice(0, 5)?.map((notification) => {
            const isExpanded = expandedNotifications?.has(notification?.id);
            const shouldTruncate = notification?.message?.length > 100;
            
            return (
              <div 
                key={notification?.id} 
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  notification?.read 
                    ? 'border-border bg-muted/10' :'border-primary/30 bg-primary/5'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationBg(notification?.type)}`}>
                    <Icon 
                      name={getNotificationIcon(notification?.type)} 
                      size={16} 
                      className={getNotificationColor(notification?.type)}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-foreground text-sm">
                        {notification?.title}
                      </h4>
                      {!notification?.read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2 mt-1" />
                      )}
                    </div>
                    
                    <p className="text-sm text-text-secondary mt-1">
                      {shouldTruncate && !isExpanded 
                        ? `${notification?.message?.substring(0, 100)}...`
                        : notification?.message
                      }
                    </p>
                    
                    {shouldTruncate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(notification?.id)}
                        className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </Button>
                    )}
                    
                    <p className="text-xs text-text-secondary mt-2">
                      {new Date(notification.createdAt)?.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;