import React from 'react';
import Icon from '../../../components/AppIcon';

const WithdrawalLimits = ({ userLevel = 0, totalWithdrawn = 0 }) => {
  const levelLimits = {
    0: { daily: 50, monthly: 500, annual: 5000, minWithdrawal: 5.00 }, // Level 0 can now withdraw from $5
    1: { daily: 100, monthly: 1000, annual: 10000, minWithdrawal: 10.00 },
    2: { daily: 500, monthly: 5000, annual: 50000, minWithdrawal: 10.00 },
    3: { daily: 1000, monthly: 10000, annual: 100000, minWithdrawal: 10.00 },
    4: { daily: 2500, monthly: 25000, annual: 250000, minWithdrawal: 10.00 },
    5: { daily: 5000, monthly: 50000, annual: 500000, minWithdrawal: 10.00 }
  };

  const currentLimits = levelLimits?.[userLevel] || levelLimits?.[0];
  
  // Mock usage data
  const currentUsage = {
    daily: 0,
    monthly: totalWithdrawn * 0.1, // Mock 10% of total as monthly
    annual: totalWithdrawn
  };

  const getUsagePercentage = (used, limit) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  const limitItems = [
    {
      label: 'Daily Limit',
      icon: 'Calendar',
      used: currentUsage?.daily,
      limit: currentLimits?.daily,
      resetTime: 'Resets at midnight UTC'
    },
    {
      label: 'Monthly Limit',
      icon: 'CalendarDays',
      used: currentUsage?.monthly,
      limit: currentLimits?.monthly,
      resetTime: 'Resets on 1st of each month'
    },
    {
      label: 'Annual Limit',
      icon: 'CalendarRange',
      used: currentUsage?.annual,
      limit: currentLimits?.annual,
      resetTime: 'Resets on January 1st'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Icon name="Shield" size={24} className="text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Withdrawal Limits</h3>
          <p className="text-sm text-text-secondary">Level {userLevel} account limits</p>
        </div>
      </div>
      {/* Limit Cards */}
      <div className="space-y-4">
        {limitItems?.map((item, index) => {
          const percentage = getUsagePercentage(item?.used, item?.limit);
          const remaining = item?.limit - item?.used;
          
          return (
            <div key={index} className="glass rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon name={item?.icon} size={18} className="text-primary" />
                  <span className="font-medium text-foreground">{item?.label}</span>
                </div>
                <span className="text-sm text-text-secondary">{item?.resetTime}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    Used: ${item?.used?.toFixed(2)}
                  </span>
                  <span className="text-text-secondary">
                    Limit: ${item?.limit?.toFixed(2)}
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-data text-success">
                    ${remaining?.toFixed(2)} remaining
                  </span>
                  <span className="text-xs text-text-secondary">
                    {percentage?.toFixed(1)}% used
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Minimum Withdrawal Info */}
      <div className="glass rounded-lg p-4 border border-info/20 bg-info/5">
        <div className="flex items-start space-x-3">
          <Icon name="DollarSign" size={20} className="text-info mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Minimum Withdrawal</h4>
            <p className="text-sm text-text-secondary">
              Your current level allows withdrawals starting from:
            </p>
            <div className="text-lg font-bold text-success">
              ${currentLimits?.minWithdrawal?.toFixed(2)}
            </div>
            {userLevel === 0 && (
              <p className="text-xs text-warning">
                ⚡ Special offer for Level 0: Lower minimum withdrawal of $5.00!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Level Upgrade Info */}
      {userLevel < 5 && (
        <div className="glass rounded-lg p-4 border border-primary/20 bg-primary/5">
          <div className="flex items-start space-x-3">
            <Icon name="TrendingUp" size={20} className="text-primary mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Increase Your Limits</h4>
              <p className="text-sm text-text-secondary">
                Upgrade to Level {userLevel + 1} to unlock higher withdrawal limits:
              </p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Daily:</span>
                  <span className="text-success font-data">
                    ${levelLimits?.[userLevel + 1]?.daily?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Monthly:</span>
                  <span className="text-success font-data">
                    ${levelLimits?.[userLevel + 1]?.monthly?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Annual:</span>
                  <span className="text-success font-data">
                    ${levelLimits?.[userLevel + 1]?.annual?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Network Comparison */}
      <div className="glass rounded-lg p-4 border border-border">
        <h4 className="font-medium text-foreground mb-3 flex items-center space-x-2">
          <Icon name="Network" size={18} className="text-primary" />
          <span>Network Fees Comparison</span>
        </h4>
        
        <div className="space-y-3">
          {[
            { network: 'BEP20 (BSC)', fee: 0.50, speed: 'Fast', security: 'High' },
            { network: 'TRC20 (Tron)', fee: 1.00, speed: 'Fastest', security: 'High' },
            { network: 'ERC20 (Ethereum)', fee: 15.00, speed: 'Medium', security: 'Highest' }
          ]?.map((network, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium text-foreground">{network?.network}</div>
                <div className="text-xs text-text-secondary">
                  Speed: {network?.speed} • Security: {network?.security}
                </div>
              </div>
              <div className="text-right">
                <div className="font-data text-warning">${network?.fee?.toFixed(2)}</div>
                <div className="text-xs text-text-secondary">Fee</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalLimits;
