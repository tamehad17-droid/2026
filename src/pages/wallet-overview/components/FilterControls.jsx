import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const FilterControls = ({ onFilterChange, onReset }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: '',
    status: '',
    minAmount: '',
    maxAmount: ''
  });

  const transactionTypes = [
    { value: '', label: 'All Types' },
    { value: 'signup_bonus', label: 'Signup Bonus' },
    { value: 'task_reward', label: 'Task Reward' },
    { value: 'referral_bonus', label: 'Referral Bonus' },
    { value: 'withdrawal', label: 'Withdrawal' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      dateFrom: '',
      dateTo: '',
      type: '',
      status: '',
      minAmount: '',
      maxAmount: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
    onReset();
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="glass rounded-xl border border-border overflow-hidden">
      {/* Filter Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={20} className="text-primary" />
            <h3 className="font-medium text-foreground">Filter Transactions</h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                iconName="X"
                iconPosition="left"
              >
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </div>
      {/* Filter Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Date Range */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Date Range</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="From Date"
                value={filters?.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
              />
              <Input
                type="date"
                label="To Date"
                value={filters?.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
              />
            </div>
          </div>

          {/* Type and Status */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Category</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Transaction Type
                </label>
                <select
                  value={filters?.type}
                  onChange={(e) => handleFilterChange('type', e?.target?.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {transactionTypes?.map((type) => (
                    <option key={type?.value} value={type?.value}>
                      {type?.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={filters?.status}
                  onChange={(e) => handleFilterChange('status', e?.target?.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {statusOptions?.map((status) => (
                    <option key={status?.value} value={status?.value}>
                      {status?.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Amount Range (USD)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Minimum Amount"
                placeholder="0.00"
                value={filters?.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e?.target?.value)}
              />
              <Input
                type="number"
                label="Maximum Amount"
                placeholder="1000.00"
                value={filters?.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e?.target?.value)}
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Quick Filters</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  handleFilterChange('dateFrom', lastWeek?.toISOString()?.split('T')?.[0]);
                  handleFilterChange('dateTo', today?.toISOString()?.split('T')?.[0]);
                }}
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                  handleFilterChange('dateFrom', lastMonth?.toISOString()?.split('T')?.[0]);
                  handleFilterChange('dateTo', today?.toISOString()?.split('T')?.[0]);
                }}
              >
                Last 30 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('type', 'task_reward')}
              >
                Task Rewards Only
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('status', 'pending')}
              >
                Pending Only
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;