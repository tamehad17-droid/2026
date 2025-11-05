import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';

const BalanceCard = ({ title, amount, icon, gradient = false, change = null, loading = false, onClick }) => {
  const formatAmount = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })?.format(value);
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 rounded-xl border border-border transition-all duration-300 cursor-pointer ${
        gradient 
          ? 'bg-gradient-to-br from-primary/20 to-secondary/20 glass shadow-lg' 
          : 'glass hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${
          gradient 
            ? 'bg-gradient-primary' :'bg-muted/50'
        }`}>
          <Icon 
            name={icon} 
            size={24} 
            color={gradient ? 'white' : 'var(--color-primary)'} 
          />
        </div>
        {change && (
          <div className={`flex items-center space-x-1 text-sm ${
            change?.type === 'increase' ? 'text-success' : 'text-error'
          }`}>
            <Icon 
              name={change?.type === 'increase' ? 'TrendingUp' : 'TrendingDown'} 
              size={16} 
            />
            <span>{change?.value}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-text-secondary mb-1">{title}</p>
        {loading ? (
          <div className="h-8 bg-muted/30 rounded animate-pulse" />
        ) : (
          <p className={`text-2xl font-bold ${
            gradient ? 'gradient-text' : 'text-foreground'
          }`}>
            {formatAmount(amount)}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default BalanceCard;
