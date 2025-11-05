import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ProofFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  totalProofs, 
  filteredCount 
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'PENDING', label: 'Pending Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  const taskTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'MANUAL', label: 'Manual Tasks' },
    { value: 'ADGEM', label: 'AdGem Tasks' },
    { value: 'ADSTERRA', label: 'AdSterra Tasks' },
    { value: 'CPALEAD', label: 'CPALead Tasks' }
  ];

  const proofTypeOptions = [
    { value: '', label: 'All Proof Types' },
    { value: 'URL', label: 'URL Proof' },
    { value: 'TEXT', label: 'Text Proof' },
    { value: 'IMAGE', label: 'Image Proof' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'reward_high', label: 'Highest Reward' },
    { value: 'reward_low', label: 'Lowest Reward' },
    { value: 'user_name', label: 'User Name A-Z' }
  ];

  const hasActiveFilters = Object.values(filters)?.some(value => 
    value !== '' && value !== 'newest'
  );

  return (
    <div className="glass rounded-lg border border-border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Filter Proofs</h2>
          <p className="text-sm text-text-secondary">
            Showing {filteredCount} of {totalProofs} proof submissions
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
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Status
          </label>
          <select
            value={filters?.status}
            onChange={(e) => handleFilterChange('status', e?.target?.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {statusOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Task Type Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Task Type
          </label>
          <select
            value={filters?.taskType}
            onChange={(e) => handleFilterChange('taskType', e?.target?.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {taskTypeOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Proof Type Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Proof Type
          </label>
          <select
            value={filters?.proofType}
            onChange={(e) => handleFilterChange('proofType', e?.target?.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {proofTypeOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Sort By
          </label>
          <select
            value={filters?.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e?.target?.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {sortOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Search and Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <Input
            type="search"
            label="Search"
            placeholder="Search by user name, task title..."
            value={filters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
          />
        </div>

        {/* Date From */}
        <div>
          <Input
            type="date"
            label="From Date"
            value={filters?.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
          />
        </div>

        {/* Date To */}
        <div>
          <Input
            type="date"
            label="To Date"
            value={filters?.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
          />
        </div>
      </div>
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters?.status === 'PENDING' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('status', filters?.status === 'PENDING' ? '' : 'PENDING')}
        >
          <Icon name="Clock" size={14} className="mr-2" />
          Pending Only
        </Button>
        
        <Button
          variant={filters?.taskType === 'MANUAL' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('taskType', filters?.taskType === 'MANUAL' ? '' : 'MANUAL')}
        >
          <Icon name="Hand" size={14} className="mr-2" />
          Manual Tasks
        </Button>
        
        <Button
          variant={filters?.proofType === 'IMAGE' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('proofType', filters?.proofType === 'IMAGE' ? '' : 'IMAGE')}
        >
          <Icon name="Image" size={14} className="mr-2" />
          Image Proofs
        </Button>
      </div>
    </div>
  );
};

export default ProofFilters;