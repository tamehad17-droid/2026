import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ReferralSummaryCards = () => {
  const [animatedValues, setAnimatedValues] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    lifetimeBonus: 0,
    monthlyEarnings: 0
  });

  const targetValues = {
    totalReferrals: 47,
    activeReferrals: 35,
    lifetimeBonus: 892.50,
    monthlyEarnings: 234.75
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedValues({
        totalReferrals: Math.floor(targetValues?.totalReferrals * easeOutQuart),
        activeReferrals: Math.floor(targetValues?.activeReferrals * easeOutQuart),
        lifetimeBonus: targetValues?.lifetimeBonus * easeOutQuart,
        monthlyEarnings: targetValues?.monthlyEarnings * easeOutQuart
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues(targetValues);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const summaryCards = [
    {
      id: 'total-referrals',
      title: 'Total Referrals',
      value: animatedValues?.totalReferrals,
      format: 'number',
      icon: 'Users',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+12',
      changeType: 'positive',
      description: 'All-time referrals'
    },
    {
      id: 'active-referrals',
      title: 'Active Referrals',
      value: animatedValues?.activeReferrals,
      format: 'number',
      icon: 'UserCheck',
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: '+8',
      changeType: 'positive',
      description: 'Currently active users'
    },
    {
      id: 'lifetime-bonus',
      title: 'Lifetime Bonus',
      value: animatedValues?.lifetimeBonus,
      format: 'currency',
      icon: 'DollarSign',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: '+$127.50',
      changeType: 'positive',
      description: 'Total referral earnings'
    },
    {
      id: 'monthly-earnings',
      title: 'This Month',
      value: animatedValues?.monthlyEarnings,
      format: 'currency',
      icon: 'TrendingUp',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      change: '+$89.25',
      changeType: 'positive',
      description: 'October 2024 earnings'
    }
  ];

  const formatValue = (value, format) => {
    switch (format) {
      case 'currency':
        return `$${value?.toFixed(2)}`;
      case 'number':
        return value?.toString();
      default:
        return value;
    }
  };

  const getChangeColor = (type) => {
    switch (type) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryCards?.map((card) => (
        <div key={card?.id} className="glass rounded-xl p-6 border border-border hover:border-primary/30 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg ${card?.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <Icon name={card?.icon} size={24} className={card?.color} />
            </div>
            <div className={`text-sm font-medium ${getChangeColor(card?.changeType)} flex items-center space-x-1`}>
              <Icon 
                name={card?.changeType === 'positive' ? 'ArrowUp' : 'ArrowDown'} 
                size={14} 
              />
              <span>{card?.change}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-text-secondary">{card?.title}</h3>
            <div className="text-3xl font-bold text-foreground font-data">
              {formatValue(card?.value, card?.format)}
            </div>
            <p className="text-xs text-text-secondary">{card?.description}</p>
          </div>

          {/* Progress indicator for animated effect */}
          <div className="mt-4 w-full bg-muted/30 rounded-full h-1">
            <div 
              className={`h-1 rounded-full ${card?.color?.replace('text-', 'bg-')} transition-all duration-2000 ease-out`}
              style={{ 
                width: `${(card?.value / targetValues?.[card?.id?.replace('-', '_')?.replace('-', '_')]) * 100}%` 
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReferralSummaryCards;