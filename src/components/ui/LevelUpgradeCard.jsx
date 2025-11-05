import React, { useState } from 'react';
import { Crown, Star, TrendingUp, DollarSign, CheckCircle, Lock } from 'lucide-react';
import Button from './Button';
import { levelService } from '../../services/levelService';
import { useAuth } from '../../contexts/AuthContext';

const LevelUpgradeCard = ({ level, isCurrentLevel, canUpgrade, onUpgrade }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const levelConfig = {
    0: {
      name: 'Level 0 - مجاني',
      price: 0,
      maxBalance: 9.90,
      bonusPercentage: 0,
      color: 'from-gray-500 to-gray-600',
      icon: Lock,
      features: [
        'حد أقصى للرصيد: $9.90',
        'مهام أساسية',
        'سحب واحد شهرياً',
        'دعم أساسي'
      ]
    },
    1: {
      name: 'Level 1 - برونزي',
      price: 50,
      maxBalance: 100,
      bonusPercentage: 25,
      color: 'from-amber-600 to-amber-700',
      icon: Star,
      features: [
        'حد أقصى للرصيد: $100',
        '25% مكافآت إضافية',
        'مهام متقدمة',
        'سحوبات غير محدودة',
        'دعم أولوية'
      ]
    },
    2: {
      name: 'Level 2 - فضي',
      price: 100,
      maxBalance: 500,
      bonusPercentage: 40,
      color: 'from-gray-400 to-gray-500',
      icon: TrendingUp,
      features: [
        'حد أقصى للرصيد: $500',
        '40% مكافآت إضافية',
        'مهام VIP',
        'سحوبات فورية',
        'مدير حساب مخصص',
        'مكافآت إحالة مضاعفة'
      ]
    },
    3: {
      name: 'Level 3 - ذهبي',
      price: 150,
      maxBalance: 'غير محدود',
      bonusPercentage: 55,
      color: 'from-yellow-400 to-yellow-600',
      icon: Crown,
      features: [
        'رصيد غير محدود',
        '55% مكافآت إضافية',
        'مهام حصرية',
        'سحوبات فورية',
        'دعم VIP 24/7',
        'مكافآت إحالة مضاعفة 3x',
        'وصول مبكر للميزات الجديدة'
      ]
    }
  };

  const config = levelConfig[level];
  const IconComponent = config.icon;

  const handleUpgrade = async () => {
    if (!canUpgrade || loading) return;
    
    setLoading(true);
    try {
      await onUpgrade(level, config.price);
    } catch (error) {
      console.error('Upgrade error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border transition-all duration-300
      ${isCurrentLevel 
        ? 'border-primary/50 bg-primary/5 ring-2 ring-primary/20' 
        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
      }
      ${canUpgrade ? 'hover:scale-[1.02] hover:shadow-xl' : ''}
    `}>
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10`}></div>
      
      {/* Current Level Badge */}
      {isCurrentLevel && (
        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
          المستوى الحالي
        </div>
      )}

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${config.color}`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{config.name}</h3>
              <p className="text-sm text-gray-400">
                {config.bonusPercentage > 0 && `+${config.bonusPercentage}% مكافآت`}
              </p>
            </div>
          </div>
          
          {config.price > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-white">${config.price}</div>
              <div className="text-xs text-gray-400">رسوم الترقية</div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {config.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-sm text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-white/10">
          {isCurrentLevel ? (
            <div className="flex items-center justify-center py-3 text-primary font-medium">
              <CheckCircle className="w-5 h-5 mr-2" />
              مستواك الحالي
            </div>
          ) : canUpgrade ? (
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className={`w-full bg-gradient-to-r ${config.color} hover:opacity-90`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  جاري الترقية...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  ترقية إلى {config.name}
                </div>
              )}
            </Button>
          ) : (
            <div className="flex items-center justify-center py-3 text-gray-500">
              <Lock className="w-5 h-5 mr-2" />
              يتطلب ترقية المستوى السابق
            </div>
          )}
        </div>
      </div>

      {/* Glow Effect for Current Level */}
      {isCurrentLevel && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl -z-10"></div>
      )}
    </div>
  );
};

export default LevelUpgradeCard;
