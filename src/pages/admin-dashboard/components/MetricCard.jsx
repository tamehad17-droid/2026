import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  iconColor = 'text-primary',
  description,
  trend = null 
}) => {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000)?.toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000)?.toFixed(1)}K`;
      }
      return val?.toLocaleString();
    }
    return val;
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-text-secondary';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  return (
    <motion.div 
      className="glass rounded-xl p-6 hover:bg-surface/80 transition-all duration-300"
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ${iconColor}`}>
          <Icon name={icon} size={24} />
        </div>
        {trend && (
          <div className="flex items-center space-x-1">
            <Icon name={getChangeIcon()} size={16} className={getChangeColor()} />
            <span className={`text-sm font-medium ${getChangeColor()}`}>
              {change}
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-foreground">
          {formatValue(value)}
        </h3>
        <p className="text-sm font-medium text-text-secondary">
          {title}
        </p>
        {description && (
          <p className="text-xs text-text-secondary opacity-80">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
