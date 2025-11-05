import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DailySpinWidget = ({ spinData = null, loading = false }) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleQuickSpin = () => {
    if (spinData?.canSpin) {
      setIsSpinning(true);
      // Simulate spin animation
      setTimeout(() => {
        setIsSpinning(false);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-xl border border-border p-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-muted/30 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-muted/30 rounded mb-2 animate-pulse" />
          <div className="h-4 bg-muted/30 rounded w-2/3 mx-auto mb-4 animate-pulse" />
          <div className="h-10 bg-muted/30 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!spinData) {
    return null;
  }

  return (
    <div className="glass rounded-xl border border-border p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="text-center">
        <div className={`w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 transition-transform duration-500 ${
          isSpinning ? 'animate-spin' : ''
        }`}>
          <Icon name="Zap" size={32} color="white" />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">Daily Spin Wheel</h3>
        
        {spinData?.canSpin ? (
          <>
            <p className="text-sm text-text-secondary mb-4">
              Spin now to win up to ${spinData?.maxPrize}!
            </p>
            
            <div className="space-y-3">
              <Button
                variant="default"
                fullWidth
                iconName="RotateCcw"
                iconPosition="left"
                onClick={handleQuickSpin}
                loading={isSpinning}
                disabled={isSpinning}
              >
                {isSpinning ? 'Spinning...' : 'Quick Spin'}
              </Button>
              
              <Link to="/daily-spin-wheel">
                <Button variant="outline" fullWidth>
                  View Full Wheel
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-text-secondary mb-2">
              Next spin available in:
            </p>
            <p className="text-lg font-bold text-primary mb-4">
              {spinData?.nextSpinIn}
            </p>
            
            <Link to="/daily-spin-wheel">
              <Button variant="outline" fullWidth iconName="Clock" iconPosition="left">
                View Spin History
              </Button>
            </Link>
          </>
        )}
        
        {spinData?.todaySpins > 0 && (
          <div className="mt-4 p-3 bg-muted/20 rounded-lg">
            <p className="text-xs text-text-secondary">
              Today's spins: {spinData?.todaySpins}/{spinData?.maxSpins}
            </p>
            <p className="text-xs text-success">
              Today's winnings: ${spinData?.todayWinnings?.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailySpinWidget;