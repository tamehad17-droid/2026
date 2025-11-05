import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SessionsTab = ({ onLogoutSession, onLogoutAll }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(null);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const sessions = [
    {
      id: 'current',
      device: 'Chrome on Windows',
      location: 'New York, United States',
      ip: '192.168.1.100',
      lastActive: '2025-10-29T22:02:17.916Z',
      isCurrent: true,
      browser: 'Chrome',
      os: 'Windows 10'
    },
    {
      id: 'mobile-1',
      device: 'Safari on iPhone',
      location: 'New York, United States',
      ip: '192.168.1.101',
      lastActive: '2025-10-29T20:15:30.000Z',
      isCurrent: false,
      browser: 'Safari',
      os: 'iOS 17'
    },
    {
      id: 'tablet-1',
      device: 'Chrome on Android',
      location: 'New York, United States',
      ip: '192.168.1.102',
      lastActive: '2025-10-29T18:45:22.000Z',
      isCurrent: false,
      browser: 'Chrome',
      os: 'Android 14'
    },
    {
      id: 'work-1',
      device: 'Firefox on macOS',
      location: 'San Francisco, United States',
      ip: '10.0.0.50',
      lastActive: '2025-10-28T16:30:15.000Z',
      isCurrent: false,
      browser: 'Firefox',
      os: 'macOS Sonoma'
    }
  ];

  const getDeviceIcon = (device) => {
    if (device?.includes('iPhone') || device?.includes('iOS')) return 'Smartphone';
    if (device?.includes('Android') || device?.includes('tablet')) return 'Tablet';
    if (device?.includes('macOS') || device?.includes('Mac')) return 'Laptop';
    return 'Monitor';
  };

  const getBrowserIcon = (browser) => {
    switch (browser?.toLowerCase()) {
      case 'chrome': return 'Chrome';
      case 'firefox': return 'Firefox';
      case 'safari': return 'Safari';
      default: return 'Globe';
    }
  };

  const formatLastActive = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Active now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const handleLogoutSession = async (sessionId) => {
    setIsLoggingOut(sessionId);
    
    // Simulate API call
    setTimeout(() => {
      onLogoutSession(sessionId);
      setIsLoggingOut(null);
    }, 1000);
  };

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    
    // Simulate API call
    setTimeout(() => {
      onLogoutAll();
      setIsLoggingOutAll(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Active Sessions Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Active Sessions</h3>
          <p className="text-sm text-text-secondary mt-1">
            Manage your active login sessions across all devices
          </p>
        </div>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={handleLogoutAll}
          loading={isLoggingOutAll}
          iconName="LogOut"
          iconPosition="left"
        >
          Logout All
        </Button>
      </div>
      {/* Sessions List */}
      <div className="space-y-4">
        {sessions?.map((session) => (
          <div key={session?.id} className="glass rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {/* Device Icon */}
                <div className="w-12 h-12 bg-muted/30 rounded-lg flex items-center justify-center">
                  <Icon name={getDeviceIcon(session?.device)} size={24} className="text-primary" />
                </div>
                
                {/* Session Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-foreground">{session?.device}</h4>
                    {session?.isCurrent && (
                      <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-text-secondary">
                      <Icon name="MapPin" size={14} />
                      <span>{session?.location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-text-secondary">
                      <Icon name="Globe" size={14} />
                      <span>{session?.ip}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-text-secondary">
                      <Icon name="Clock" size={14} />
                      <span>{formatLastActive(session?.lastActive)}</span>
                    </div>
                  </div>
                  
                  {/* Browser and OS Info */}
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-1">
                      <Icon name={getBrowserIcon(session?.browser)} size={14} className="text-text-secondary" />
                      <span className="text-xs text-text-secondary">{session?.browser}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Monitor" size={14} className="text-text-secondary" />
                      <span className="text-xs text-text-secondary">{session?.os}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="ml-4">
                {!session?.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLogoutSession(session?.id)}
                    loading={isLoggingOut === session?.id}
                    iconName="LogOut"
                    iconPosition="left"
                  >
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Security Information */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Session Security</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <Icon name="Info" size={20} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-primary">Session Management</p>
              <p className="text-xs text-primary/80 mt-1">
                You can logout from specific devices or all devices at once. Your current session will remain active unless you choose "Logout All".
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Icon name="Shield" size={16} className="text-success mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Secure Sessions</p>
                <p className="text-xs text-text-secondary">All sessions use encrypted connections</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Icon name="Clock" size={16} className="text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Auto Logout</p>
                <p className="text-xs text-text-secondary">Sessions expire after 30 days of inactivity</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Icon name="MapPin" size={16} className="text-accent mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Location Tracking</p>
                <p className="text-xs text-text-secondary">We monitor login locations for security</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Icon name="Bell" size={16} className="text-secondary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Login Alerts</p>
                <p className="text-xs text-text-secondary">Get notified of new device logins</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Security Activity</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
            <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
              <Icon name="CheckCircle" size={16} className="text-success" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Successful login</p>
              <p className="text-xs text-text-secondary">Chrome on Windows • 2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Smartphone" size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">New device login</p>
              <p className="text-xs text-text-secondary">Safari on iPhone • 1 day ago</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
            <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
              <Icon name="LogOut" size={16} className="text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Session ended</p>
              <p className="text-xs text-text-secondary">Firefox on macOS • 2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsTab;