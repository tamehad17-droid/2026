import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const UserFilters = ({ filters, onFiltersChange, onExport, onBulkAction, selectedUsers }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const countryOptions = [
    { value: 'all', label: 'All Countries' },
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'IN', label: 'India' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'BR', label: 'Brazil' },
    { value: 'MX', label: 'Mexico' },
    { value: 'JP', label: 'Japan' }
  ];

  const bulkActionOptions = [
    { value: '', label: 'Bulk Actions' },
    { value: 'approve', label: 'Approve Selected' },
    { value: 'suspend', label: 'Suspend Selected' },
    { value: 'message', label: 'Send Message' },
    { value: 'export', label: 'Export Selected' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleBulkActionChange = (action) => {
    if (action && selectedUsers?.length > 0) {
      onBulkAction(action, selectedUsers);
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      country: 'all',
      dateFrom: '',
      dateTo: '',
      minBalance: '',
      maxBalance: ''
    });
  };

  return (
    <div className="glass rounded-lg border border-border p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">User Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedUsers?.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">
                {selectedUsers?.length} selected
              </span>
              <Select
                options={bulkActionOptions}
                value=""
                onChange={handleBulkActionChange}
                placeholder="Bulk Actions"
                className="w-40"
              />
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>
        </div>
      </div>
      {/* Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Input
          type="search"
          placeholder="Search users..."
          value={filters?.search}
          onChange={(e) => handleFilterChange('search', e?.target?.value)}
        />
        
        <Select
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
          placeholder="Filter by status"
        />
        
        <Select
          options={countryOptions}
          value={filters?.country}
          onChange={(value) => handleFilterChange('country', value)}
          placeholder="Filter by country"
        />
        
        <Button
          variant="ghost"
          onClick={clearFilters}
          iconName="X"
          iconPosition="left"
          className="justify-center"
        >
          Clear Filters
        </Button>
      </div>
      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-t border-border pt-4 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              type="date"
              label="Registration From"
              value={filters?.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
            />
            
            <Input
              type="date"
              label="Registration To"
              value={filters?.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
            />
            
            <Input
              type="number"
              label="Min Balance ($)"
              placeholder="0.00"
              value={filters?.minBalance}
              onChange={(e) => handleFilterChange('minBalance', e?.target?.value)}
            />
            
            <Input
              type="number"
              label="Max Balance ($)"
              placeholder="10000.00"
              value={filters?.maxBalance}
              onChange={(e) => handleFilterChange('maxBalance', e?.target?.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFilters;