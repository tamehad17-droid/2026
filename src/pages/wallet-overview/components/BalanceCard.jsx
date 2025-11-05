import React from 'react';
import Icon from '../../../components/AppIcon';


const BalanceCard = ({ 
  title, 
  amount, 
  icon, 
  iconColor = 'text-primary', 
  bgGradient = false,
  description,
  actionButton = null,
  trend = null
}) => {
  return (
    <div className={`p-6 rounded-xl border border-border transition-all duration-300 hover:shadow-lg ${
      bgGradient 
        ? 'bg-gradient-to-br from-primary/10 to-secondary/10 glass' :'glass'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${bgGradient ? 'bg-white/10' : 'bg-muted/30'}`}>
            <Icon name={icon} size={24} className={iconColor} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
            {description && (
              <p className="text-xs text-text-secondary/70 mt-1">{description}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs ${
            trend?.isPositive ? 'text-success' : 'text-destructive'
          }`}>
            <Icon 
              name={trend?.isPositive ? 'TrendingUp' : 'TrendingDown'} 
              size={14} 
            />
            <span>{trend?.percentage}%</span>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-bold font-data ${
            bgGradient ? 'gradient-text' : 'text-foreground'
          }`}>
            ${amount?.toFixed(2)}
          </span>
          <span className="text-sm text-text-secondary">USD</span>
        </div>

        {actionButton && (
          <div className="pt-2">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceCard;