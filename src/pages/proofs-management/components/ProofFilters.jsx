import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ProofFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  onExport,
  totalProofs,
  filteredCount 
}) => {
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'image', label: 'Image' },
    { value: 'url', label: 'URL' },
    { value: 'text', label: 'Text' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'manual', label: 'Manual' },
    { value: 'adgem', label: 'AdGem' },
    { value: 'adsterra', label: 'AdSterra' },
    { value: 'cpalead', label: 'CPALead' }
  ];

  const hasActiveFilters = filters?.status || filters?.type || filters?.category || 
                          filters?.dateFrom || filters?.dateTo || filters?.search;

  return (
    <div className="glass rounded-lg border border-border p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Filter Proofs</h2>
          <p className="text-sm text-text-secondary">
            Showing {filteredCount} of {totalProofs} proofs
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              iconName="X"
              iconPosition="left"
            >
              Clear Filters
            </Button>
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
      {/* Search */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search by task name or proof content..."
          value={filters?.search}
          onChange={(e) => onFilterChange('search', e?.target?.value)}
          className="w-full"
        />
      </div>
      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Status
          </label>
          <select
            value={filters?.status}
            onChange={(e) => onFilterChange('status', e?.target?.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            {statusOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Proof Type
          </label>
          <select
            value={filters?.type}
            onChange={(e) => onFilterChange('type', e?.target?.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            {typeOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Category
          </label>
          <select
            value={filters?.category}
            onChange={(e) => onFilterChange('category', e?.target?.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            {categoryOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            From Date
          </label>
          <Input
            type="date"
            value={filters?.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e?.target?.value)}
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            To Date
          </label>
          <Input
            type="date"
            value={filters?.dateTo}
            onChange={(e) => onFilterChange('dateTo', e?.target?.value)}
          />
        </div>
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-text-secondary">Active filters:</span>
            
            {filters?.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                Status: {statusOptions?.find(opt => opt?.value === filters?.status)?.label}
                <button
                  onClick={() => onFilterChange('status', '')}
                  className="ml-1 hover:text-primary/80"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}

            {filters?.type && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary/10 text-secondary border border-secondary/20">
                Type: {typeOptions?.find(opt => opt?.value === filters?.type)?.label}
                <button
                  onClick={() => onFilterChange('type', '')}
                  className="ml-1 hover:text-secondary/80"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}

            {filters?.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/10 text-accent border border-accent/20">
                Category: {categoryOptions?.find(opt => opt?.value === filters?.category)?.label}
                <button
                  onClick={() => onFilterChange('category', '')}
                  className="ml-1 hover:text-accent/80"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}

            {(filters?.dateFrom || filters?.dateTo) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-warning/10 text-warning border border-warning/20">
                Date Range
                <button
                  onClick={() => {
                    onFilterChange('dateFrom', '');
                    onFilterChange('dateTo', '');
                  }}
                  className="ml-1 hover:text-warning/80"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProofFilters;