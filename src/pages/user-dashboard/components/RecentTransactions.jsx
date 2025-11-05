import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentTransactions = ({ transactions = [], loading = false }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'signup_bonus':
        return 'Gift';
      case 'task_reward':
        return 'CheckCircle';
      case 'referral_bonus':
        return 'Users';
      case 'withdrawal':
        return 'ArrowUpRight';
      default:
        return 'DollarSign';
    }
  };

  const getTransactionColor = (type, status) => {
    if (status === 'pending') return 'text-warning';
    if (status === 'rejected' || status === 'failed') return 'text-error';
    
    switch (type) {
      case 'withdrawal':
        return 'text-error';
      default:
        return 'text-success';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-success/10 text-success', label: 'Completed' },
      pending: { color: 'bg-warning/10 text-warning', label: 'Pending' },
      rejected: { color: 'bg-error/10 text-error', label: 'Rejected' },
      failed: { color: 'bg-error/10 text-error', label: 'Failed' }
    };

    const config = statusConfig?.[status] || statusConfig?.completed;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const formatAmount = (amount, type) => {
    const value = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })?.format(Math.abs(amount));

    return type === 'withdrawal' ? `-${value}` : `+${value}`;
  };

  if (loading) {
    return (
      <div className="glass rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
          <div className="w-24 h-8 bg-muted/30 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(5)]?.map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 rounded-lg border border-border">
              <div className="w-10 h-10 bg-muted/30 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted/30 rounded animate-pulse" />
                <div className="h-3 bg-muted/30 rounded w-2/3 animate-pulse" />
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-muted/30 rounded w-16 animate-pulse" />
                <div className="h-3 bg-muted/30 rounded w-12 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        <Link to="/wallet-overview">
          <Button variant="outline" size="sm" iconName="ArrowRight" iconPosition="right">
            View All
          </Button>
        </Link>
      </div>
      {transactions?.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Receipt" size={24} className="text-text-secondary" />
          </div>
          <p className="text-text-secondary mb-4">No transactions yet</p>
          <Link to="/tasks-list">
            <Button variant="default" iconName="Search" iconPosition="left">
              Start Earning
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions?.slice(0, 5)?.map((transaction) => (
            <div key={transaction?.id} className="flex items-center space-x-4 p-4 rounded-lg border border-border hover:bg-muted/20 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction?.status === 'pending' ? 'bg-warning/10' : 
                transaction?.status === 'rejected'|| transaction?.status === 'failed' ? 'bg-error/10' : 'bg-success/10'
              }`}>
                <Icon 
                  name={getTransactionIcon(transaction?.type)} 
                  size={18} 
                  className={getTransactionColor(transaction?.type, transaction?.status)}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{transaction?.description}</p>
                <p className="text-sm text-text-secondary">
                  {new Date(transaction.createdAt)?.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${getTransactionColor(transaction?.type, transaction?.status)}`}>
                  {formatAmount(transaction?.amount, transaction?.type)}
                </p>
                {getStatusBadge(transaction?.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;