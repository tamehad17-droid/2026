import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { cn } from '../../utils/cn';

const WalletCard = ({ 
  title,
  balance,
  currency = 'USD',
  change,
  changeType,
  showBalance = true,
  onToggleVisibility,
  onWithdraw,
  onDeposit,
  transactions = [],
  className,
  variant = 'default'
}) => {
  const formatCurrency = (amount) => {
    if (!showBalance) return '****';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-500';
    if (changeType === 'negative') return 'text-red-500';
    return 'text-gray-500';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return TrendingUp;
    if (changeType === 'negative') return TrendingDown;
    return null;
  };

  const ChangeIcon = getChangeIcon();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn("h-full", className)}
    >
      <Card className={cn(
        "h-full bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20",
        variant === 'premium' && "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              {title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleVisibility}
              className="p-2"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Balance Display */}
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-foreground mb-2">
                {formatCurrency(balance)}
              </div>
              {change && ChangeIcon && (
                <div className={cn("flex items-center justify-center gap-1", getChangeColor())}>
                  <ChangeIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {changeType === 'positive' ? '+' : ''}{change}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={onDeposit}
                className="w-full"
                disabled={!showBalance}
              >
                Deposit
              </Button>
              <Button
                onClick={onWithdraw}
                className="w-full"
                disabled={!showBalance || balance <= 0}
              >
                Withdraw
              </Button>
            </div>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {transactions.slice(0, 3).map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          transaction.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'
                        )} />
                        <span className="text-sm capitalize">{transaction.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium",
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wallet Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {transactions.filter(t => t.type === 'deposit').length}
                </div>
                <div className="text-xs text-muted-foreground">Deposits</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {transactions.filter(t => t.type === 'withdrawal').length}
                </div>
                <div className="text-xs text-muted-foreground">Withdrawals</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WalletCard;
