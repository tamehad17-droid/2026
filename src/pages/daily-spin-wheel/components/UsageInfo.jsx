import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const UsageInfo = ({ remainingSpins, maxSpins, nextResetTime }) => {
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const reset = new Date(nextResetTime);
      const diff = reset - now;

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeUntilReset(`${hours?.toString()?.padStart(2, '0')}:${minutes?.toString()?.padStart(2, '0')}:${seconds?.toString()?.padStart(2, '0')}`);
      } else {
        setTimeUntilReset('00:00:00');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextResetTime]);

  const progressPercentage = (remainingSpins / maxSpins) * 100;

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="glass rounded-xl p-6 border border-border">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">Daily Spins</h3>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Icon name="RotateCcw" size={20} className="text-primary" />
            <span className="text-2xl font-bold text-primary">
              {remainingSpins}
            </span>
            <span className="text-text-secondary">/ {maxSpins}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-text-secondary mb-2">
            <span>Spins Remaining</span>
            <span>{remainingSpins} left</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Reset Timer */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Icon name="Clock" size={16} className="text-text-secondary" />
            <span className="text-sm text-text-secondary">Next reset in:</span>
          </div>
          <div className="font-data text-lg font-semibold text-foreground">
            {timeUntilReset}
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-4 p-3 rounded-lg bg-muted/30 text-center">
          {remainingSpins > 0 ? (
            <div className="flex items-center justify-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="text-sm text-success font-medium">
                You have {remainingSpins} spin{remainingSpins !== 1 ? 's' : ''} available!
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Icon name="XCircle" size={16} className="text-warning" />
              <span className="text-sm text-warning font-medium">
                No spins remaining. Come back tomorrow!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsageInfo;