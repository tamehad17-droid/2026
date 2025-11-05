import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterControls = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  totalWithdrawals,
  filteredCount 
}) => {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'COMPLETED', label: 'Completed' }
  ];

  const networkOptions = [
    { value: '', label: 'All Networks' },
    { value: 'TRC20', label: 'TRC20 (Tron)' },
    { value: 'ERC20', label: 'ERC20 (Ethereum)' },
    { value: 'BEP20', label: 'BEP20 (BSC)' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'amount_high', label: 'Amount: High to Low' },
    { value: 'amount_low', label: 'Amount: Low to High' },
    { value: 'user_name', label: 'User Name A-Z' }
  ];

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters)?.some(value => 
    value !== '' && value !== null && value !== undefined
  );

  return (
    <div className="glass rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Icon name="Filter" size={20} />
            <span>Filter Withdrawals</span>
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Showing {filteredCount} of {totalWithdrawals} withdrawal requests
          </p>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            iconName="X"
            iconPosition="left"
          >
            Clear Filters
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Status Filter */}
        <Select
          label="Status"
          placeholder="Filter by status"
          value={filters?.status || ''}
          onChange={(value) => handleFilterChange('status', value)}
          options={statusOptions}
        />

        {/* Network Filter */}
        <Select
          label="Network"
          placeholder="Filter by network"
          value={filters?.network || ''}
          onChange={(value) => handleFilterChange('network', value)}
          options={networkOptions}
        />

        {/* Sort Order */}
        <Select
          label="Sort By"
          placeholder="Sort withdrawals"
          value={filters?.sortBy || 'newest'}
          onChange={(value) => handleFilterChange('sortBy', value)}
          options={sortOptions}
        />

        {/* Search */}
        <Input
          label="Search"
          type="search"
          placeholder="Search by user name or email"
          value={filters?.search || ''}
          onChange={(e) => handleFilterChange('search', e?.target?.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Amount Range */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Min Amount ($)"
            type="number"
            placeholder="0"
            value={filters?.minAmount || ''}
            onChange={(e) => handleFilterChange('minAmount', e?.target?.value)}
          />
          <Input
            label="Max Amount ($)"
            type="number"
            placeholder="10000"
            value={filters?.maxAmount || ''}
            onChange={(e) => handleFilterChange('maxAmount', e?.target?.value)}
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="From Date"
            type="date"
            value={filters?.fromDate || ''}
            onChange={(e) => handleFilterChange('fromDate', e?.target?.value)}
          />
          <Input
            label="To Date"
            type="date"
            value={filters?.toDate || ''}
            onChange={(e) => handleFilterChange('toDate', e?.target?.value)}
          />
        </div>

        {/* Risk Level Filter */}
        <Select
          label="Risk Level"
          placeholder="Filter by risk level"
          value={filters?.riskLevel || ''}
          onChange={(value) => handleFilterChange('riskLevel', value)}
          options={[
            { value: '', label: 'All Risk Levels' },
            { value: 'LOW', label: 'Low Risk' },
            { value: 'MEDIUM', label: 'Medium Risk' },
            { value: 'HIGH', label: 'High Risk' }
          ]}
        />
      </div>
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant={filters?.status === 'PENDING' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('status', filters?.status === 'PENDING' ? '' : 'PENDING')}
          iconName="Clock"
        >
          Pending Only
        </Button>
        <Button
          variant={filters?.riskLevel === 'HIGH' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('riskLevel', filters?.riskLevel === 'HIGH' ? '' : 'HIGH')}
          iconName="AlertTriangle"
        >
          High Risk
        </Button>
        <Button
          variant={filters?.sortBy === 'amount_high' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('sortBy', filters?.sortBy === 'amount_high' ? 'newest' : 'amount_high')}
          iconName="TrendingUp"
        >
          Large Amounts
        </Button>
      </div>
    </div>
  );
};

export default FilterControls;