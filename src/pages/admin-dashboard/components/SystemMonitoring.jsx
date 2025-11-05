import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemMonitoring = () => {
  const systemMetrics = [
    {
      name: "Server Status",
      status: "operational",
      value: "99.9%",
      description: "Uptime last 30 days",
      icon: "Server",
      color: "text-success"
    },
    {
      name: "API Response Time",
      status: "good",
      value: "245ms",
      description: "Average response time",
      icon: "Zap",
      color: "text-primary"
    },
    {
      name: "Database Performance",
      status: "warning",
      value: "78%",
      description: "Query performance index",
      icon: "Database",
      color: "text-warning"
    },
    {
      name: "Active Sessions",
      status: "operational",
      value: "1,247",
      description: "Current user sessions",
      icon: "Users",
      color: "text-success"
    }
  ];

  const systemAlerts = [
    {
      id: 1,
      type: "warning",
      title: "High Memory Usage",
      message: "Server memory usage at 85%. Consider scaling resources.",
      timestamp: new Date(Date.now() - 600000),
      severity: "medium"
    },
    {
      id: 2,
      type: "info",
      title: "Scheduled Maintenance",
      message: "Database maintenance scheduled for tonight at 2:00 AM UTC.",
      timestamp: new Date(Date.now() - 1800000),
      severity: "low"
    },
    {
      id: 3,
      type: "error",
      title: "Payment Gateway Timeout",
      message: "Increased timeout errors from payment processor. Monitoring closely.",
      timestamp: new Date(Date.now() - 3600000),
      severity: "high"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'text-success';
      case 'good': return 'text-primary';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'operational': return 'bg-success/10';
      case 'good': return 'bg-primary/10';
      case 'warning': return 'bg-warning/10';
      case 'error': return 'bg-error/10';
      default: return 'bg-muted/10';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return 'AlertCircle';
      case 'warning': return 'AlertTriangle';
      case 'info': return 'Info';
      default: return 'Bell';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-primary';
      default: return 'text-text-secondary';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      return `${hours}h ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Metrics */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">System Health</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm text-text-secondary">Live Monitoring</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemMetrics?.map((metric, index) => (
            <div key={index} className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg ${getStatusBg(metric?.status)} flex items-center justify-center`}>
                  <Icon name={metric?.icon} size={16} className={getStatusColor(metric?.status)} />
                </div>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(metric?.status)?.replace('text-', 'bg-')}`}></div>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">{metric?.value}</h3>
                <p className="text-sm font-medium text-text-secondary">{metric?.name}</p>
                <p className="text-xs text-text-secondary opacity-80">{metric?.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* System Alerts */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">System Alerts</h2>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            View All Alerts
          </button>
        </div>

        <div className="space-y-3">
          {systemAlerts?.map((alert) => (
            <div key={alert?.id} className="flex items-start space-x-3 p-4 rounded-lg hover:bg-muted/30 transition-colors">
              <div className={`w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 ${getAlertColor(alert?.severity)}`}>
                <Icon name={getAlertIcon(alert?.type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-foreground">{alert?.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert?.severity === 'high' ? 'bg-error/10 text-error' :
                      alert?.severity === 'medium'? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                    }`}>
                      {alert?.severity?.toUpperCase()}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {formatTimeAgo(alert?.timestamp)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">{alert?.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;