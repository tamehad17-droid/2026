import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const USDTRateMonitor = () => {
  const [currentRate, setCurrentRate] = useState(1.002);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [rateHistory, setRateHistory] = useState([
    { time: '14:30', rate: 1.001 },
    { time: '14:25', rate: 1.002 },
    { time: '14:20', rate: 1.003 },
    { time: '14:15', rate: 1.001 },
    { time: '14:10', rate: 1.000 }
  ]);

  const updateRate = async () => {
    setIsUpdating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newRate = 1.000 + (Math.random() * 0.01);
    setCurrentRate(newRate);
    setLastUpdated(new Date());
    
    // Update history
    const newHistory = [
      { 
        time: new Date()?.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }), 
        rate: newRate 
      },
      ...rateHistory?.slice(0, 4)
    ];
    setRateHistory(newHistory);
    setIsUpdating(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      updateRate();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [rateHistory]);

  const rateChange = rateHistory?.length > 1 ? currentRate - rateHistory?.[1]?.rate : 0;
  const isPositive = rateChange >= 0;

  return (
    <div className="glass rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="TrendingUp" size={20} />
          <span>USDT Exchange Rate Monitor</span>
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={updateRate}
          loading={isUpdating}
          iconName="RefreshCw"
        >
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Rate */}
        <div className="glass rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Current Rate</span>
            <div className={`flex items-center space-x-1 ${
              isPositive ? 'text-success' : 'text-destructive'
            }`}>
              <Icon 
                name={isPositive ? 'TrendingUp' : 'TrendingDown'} 
                size={14} 
              />
              <span className="text-xs">
                {isPositive ? '+' : ''}{(rateChange * 100)?.toFixed(3)}%
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            ${currentRate?.toFixed(6)}
          </div>
          <div className="text-xs text-text-secondary mt-1">
            1 USD = {currentRate?.toFixed(6)} USDT
          </div>
        </div>

        {/* Last Updated */}
        <div className="glass rounded-lg p-4 border border-border">
          <div className="text-sm text-text-secondary mb-2">Last Updated</div>
          <div className="text-lg font-semibold text-foreground">
            {lastUpdated?.toLocaleTimeString()}
          </div>
          <div className="text-xs text-text-secondary mt-1">
            {lastUpdated?.toLocaleDateString()}
          </div>
        </div>

        {/* 24h High/Low */}
        <div className="glass rounded-lg p-4 border border-border">
          <div className="text-sm text-text-secondary mb-2">24h Range</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-text-secondary">High:</span>
              <span className="text-sm font-medium text-success">$1.0045</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-text-secondary">Low:</span>
              <span className="text-sm font-medium text-destructive">$0.9998</span>
            </div>
          </div>
        </div>

        {/* Volume */}
        <div className="glass rounded-lg p-4 border border-border">
          <div className="text-sm text-text-secondary mb-2">Processing Volume</div>
          <div className="text-lg font-semibold text-foreground">
            $45,230
          </div>
          <div className="text-xs text-text-secondary mt-1">
            Today's withdrawals
          </div>
        </div>
      </div>
      {/* Rate History */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Recent Rate History</h4>
        <div className="grid grid-cols-5 gap-2">
          {rateHistory?.map((entry, index) => (
            <div key={index} className="text-center p-2 glass rounded border border-border">
              <div className="text-xs text-text-secondary">{entry?.time}</div>
              <div className="text-sm font-medium text-foreground">
                ${entry?.rate?.toFixed(6)}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Rate Alert */}
      <div className="mt-4 bg-accent/10 border border-accent/20 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-accent mt-0.5" />
          <div className="text-sm">
            <p className="text-accent font-medium">Rate Information</p>
            <p className="text-text-secondary mt-1">
              Exchange rates are updated automatically every minute. All withdrawal calculations use the rate at the time of processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default USDTRateMonitor;