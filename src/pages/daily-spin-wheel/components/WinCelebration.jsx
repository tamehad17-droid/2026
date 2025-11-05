import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WinCelebration = ({ prize, isVisible, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const getPrizeIcon = (type) => {
    const icons = {
      cash: 'DollarSign',
      bonus: 'Star',
      multiplier: 'Zap',
      special: 'Gift'
    };
    return icons?.[type] || 'DollarSign';
  };

  const getPrizeColor = (type) => {
    const colors = {
      cash: 'text-success',
      bonus: 'text-warning',
      multiplier: 'text-accent',
      special: 'text-secondary'
    };
    return colors?.[type] || 'text-success';
  };

  if (!isVisible || !prize) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)]?.map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-primary rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
      {/* Celebration Modal */}
      <div className="glass rounded-2xl p-8 border border-border max-w-md w-full mx-4 text-center animate-fade-in-up">
        {/* Prize Icon */}
        <div className="mb-6">
          <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-4 ${getPrizeColor(prize?.type)}`}>
            <Icon name={getPrizeIcon(prize?.type)} size={40} color="white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Congratulations! 🎉
          </h2>
          <p className="text-text-secondary">
            You won an amazing prize!
          </p>
        </div>

        {/* Prize Amount */}
        <div className="mb-6">
          <div className="text-4xl font-bold gradient-text mb-2">
            ${prize?.amount?.toFixed(2)}
          </div>
          <p className="text-sm text-text-secondary capitalize">
            {prize?.type} {prize?.type === 'multiplier' ? `${prize?.multiplier}x` : 'prize'}
          </p>
        </div>

        {/* Prize Description */}
        <div className="mb-6 p-4 rounded-lg bg-muted/30">
          <p className="text-sm text-foreground">
            {prize?.description || `You've won $${prize?.amount?.toFixed(2)} which has been added to your account balance!`}
          </p>
        </div>

        {/* Balance Update Info */}
        <div className="mb-6 flex items-center justify-center space-x-2 text-sm text-success">
          <Icon name="CheckCircle" size={16} />
          <span>Prize added to your balance</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="default"
            onClick={onClose}
            className="w-full bg-gradient-primary hover:scale-105 transition-transform"
          >
            Awesome! Continue
          </Button>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/wallet-overview'}
              className="flex-1"
            >
              <Icon name="Wallet" size={16} className="mr-2" />
              View Wallet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/user-dashboard'}
              className="flex-1"
            >
              <Icon name="Home" size={16} className="mr-2" />
              Dashboard
            </Button>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-4 text-xs text-text-secondary">
          Come back tomorrow for more chances to win! 🍀
        </div>
      </div>
    </div>
  );
};

export default WinCelebration;