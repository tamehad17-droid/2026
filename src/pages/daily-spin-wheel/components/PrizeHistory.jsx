import React from 'react';
import Icon from '../../../components/AppIcon';

const PrizeHistory = ({ history }) => {
  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (!history || history?.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="glass rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Icon name="History" size={20} />
            <span>Recent Wins</span>
          </h3>
          
          <div className="text-center py-8">
            <Icon name="Gift" size={48} className="text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">No wins yet today</p>
            <p className="text-sm text-text-secondary mt-2">
              Spin the wheel to start winning prizes!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass rounded-xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="History" size={20} />
          <span>Recent Wins</span>
          <span className="text-sm text-text-secondary font-normal">
            ({history?.length} win{history?.length !== 1 ? 's' : ''} today)
          </span>
        </h3>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {history?.map((win, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${getPrizeColor(win?.type)}`}>
                  <Icon name={getPrizeIcon(win?.type)} size={20} />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    ${win?.amount?.toFixed(2)}
                  </p>
                  <p className="text-sm text-text-secondary capitalize">
                    {win?.type} {win?.type === 'multiplier' ? `${win?.multiplier}x` : 'prize'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-text-secondary">
                  {formatDate(win?.timestamp)}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <Icon name="Plus" size={12} className="text-success" />
                  <span className="text-xs text-success font-medium">
                    Added to balance
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Winnings Summary */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Total won today:</span>
            <span className="font-semibold text-success">
              ${history?.reduce((sum, win) => sum + win?.amount, 0)?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrizeHistory;