import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TransactionTable = ({ transactions, onExport }) => {
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'text-success bg-success/10';
      case 'pending':
        return 'text-warning bg-warning/10';
      case 'failed': case'rejected':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-text-secondary bg-muted/30';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'signup_bonus':
        return 'Gift';
      case 'task_reward':
        return 'CheckSquare';
      case 'referral_bonus':
        return 'Users';
      case 'withdrawal':
        return 'ArrowUpRight';
      default:
        return 'DollarSign';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'signup_bonus':
        return 'text-accent';
      case 'task_reward':
        return 'text-success';
      case 'referral_bonus':
        return 'text-secondary';
      case 'withdrawal':
        return 'text-warning';
      default:
        return 'text-primary';
    }
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedTransactions = [...transactions]?.sort((a, b) => {
    let aValue = a?.[sortBy];
    let bValue = b?.[sortBy];

    if (sortBy === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="glass rounded-xl border border-border overflow-hidden">
      {/* Table Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
            <p className="text-sm text-text-secondary mt-1">
              Complete record of all financial activities
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={onExport}
          >
            Export
          </Button>
        </div>
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/20">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-text-secondary">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>Date</span>
                  <Icon 
                    name={sortBy === 'date' && sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                    size={14} 
                  />
                </button>
              </th>
              <th className="text-left p-4 text-sm font-medium text-text-secondary">Type</th>
              <th className="text-left p-4 text-sm font-medium text-text-secondary">Description</th>
              <th className="text-left p-4 text-sm font-medium text-text-secondary">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>Amount</span>
                  <Icon 
                    name={sortBy === 'amount' && sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                    size={14} 
                  />
                </button>
              </th>
              <th className="text-left p-4 text-sm font-medium text-text-secondary">Status</th>
              <th className="text-left p-4 text-sm font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions?.map((transaction) => (
              <tr key={transaction?.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                <td className="p-4">
                  <span className="text-sm text-foreground font-data">
                    {formatDate(transaction?.date)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={getTypeIcon(transaction?.type)} 
                      size={16} 
                      className={getTypeColor(transaction?.type)}
                    />
                    <span className="text-sm text-foreground capitalize">
                      {transaction?.type?.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-foreground">{transaction?.description}</span>
                  {transaction?.reference && (
                    <div className="text-xs text-text-secondary mt-1 font-data">
                      Ref: {transaction?.reference}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <span className={`text-sm font-data font-medium ${
                    transaction?.amount >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {transaction?.amount >= 0 ? '+' : ''}${Math.abs(transaction?.amount)?.toFixed(2)}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(transaction?.status)
                  }`}>
                    {transaction?.status}
                  </span>
                </td>
                <td className="p-4">
                  <Button variant="ghost" size="sm" iconName="ExternalLink">
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 p-4">
        {sortedTransactions?.map((transaction) => (
          <div key={transaction?.id} className="glass rounded-lg p-4 border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Icon 
                  name={getTypeIcon(transaction?.type)} 
                  size={16} 
                  className={getTypeColor(transaction?.type)}
                />
                <span className="text-sm font-medium text-foreground capitalize">
                  {transaction?.type?.replace('_', ' ')}
                </span>
              </div>
              <span className={`text-sm font-data font-medium ${
                transaction?.amount >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {transaction?.amount >= 0 ? '+' : ''}${Math.abs(transaction?.amount)?.toFixed(2)}
              </span>
            </div>
            
            <p className="text-sm text-foreground mb-2">{transaction?.description}</p>
            
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span className="font-data">{formatDate(transaction?.date)}</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${
                getStatusColor(transaction?.status)
              }`}>
                {transaction?.status}
              </span>
            </div>
            
            {transaction?.reference && (
              <div className="text-xs text-text-secondary mt-2 font-data">
                Ref: {transaction?.reference}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Empty State */}
      {transactions?.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="Receipt" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Transactions Yet</h3>
          <p className="text-text-secondary">
            Your transaction history will appear here once you start earning.
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;