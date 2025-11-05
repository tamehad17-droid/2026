import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TaskFilters = ({ 
  filters, 
  onFiltersChange, 
  onSearch, 
  searchQuery, 
  isMobileFiltersOpen, 
  onToggleMobileFilters 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const providerOptions = [
    { value: 'all', label: 'All Providers' },
    { value: 'MANUAL', label: 'Manual Tasks' },
    { value: 'ADGEM', label: 'AdGem' },
    { value: 'ADSTERRA', label: 'AdSterra' },
    { value: 'CPALEAD', label: 'CPALead' }
  ];

  const difficultyOptions = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'Easy', label: 'Easy' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Hard', label: 'Hard' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'reward_high', label: 'Highest Reward' },
    { value: 'reward_low', label: 'Lowest Reward' },
    { value: 'difficulty', label: 'By Difficulty' },
    { value: 'participants', label: 'Most Popular' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'available', label: 'Available' },
    { value: 'completed', label: 'Completed' },
    { value: 'unavailable', label: 'Unavailable' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      provider: 'all',
      difficulty: 'all',
      status: 'all',
      sortBy: 'newest',
      minReward: 0,
      maxReward: 1000
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <Input
          type="search"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearch(e?.target?.value)}
          className="w-full"
        />
      </div>

      {/* Provider Filter */}
      <div>
        <Select
          label="Provider"
          options={providerOptions}
          value={localFilters?.provider}
          onChange={(value) => handleFilterChange('provider', value)}
        />
      </div>

      {/* Difficulty Filter */}
      <div>
        <Select
          label="Difficulty"
          options={difficultyOptions}
          value={localFilters?.difficulty}
          onChange={(value) => handleFilterChange('difficulty', value)}
        />
      </div>

      {/* Status Filter */}
      <div>
        <Select
          label="Status"
          options={statusOptions}
          value={localFilters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />
      </div>

      {/* Sort By */}
      <div>
        <Select
          label="Sort By"
          options={sortOptions}
          value={localFilters?.sortBy}
          onChange={(value) => handleFilterChange('sortBy', value)}
        />
      </div>

      {/* Reward Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Reward Range</label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min $"
            value={localFilters?.minReward}
            onChange={(e) => handleFilterChange('minReward', Number(e?.target?.value))}
            min="0"
          />
          <Input
            type="number"
            placeholder="Max $"
            value={localFilters?.maxReward}
            onChange={(e) => handleFilterChange('maxReward', Number(e?.target?.value))}
            min="0"
          />
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        onClick={handleResetFilters}
        fullWidth
        iconName="RotateCcw"
        iconPosition="left"
      >
        Reset Filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block w-80 glass rounded-xl p-6 h-fit sticky top-24">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          <Icon name="Filter" size={20} className="text-primary" />
        </div>
        <FilterContent />
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={onToggleMobileFilters}
          iconName="Filter"
          iconPosition="left"
          className="mb-4"
        >
          Filters
        </Button>

        {/* Mobile Filter Drawer */}
        {isMobileFiltersOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={onToggleMobileFilters}
            />
            <div className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] glass border-l border-border z-50 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Filters</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleMobileFilters}
                  >
                    <Icon name="X" size={20} />
                  </Button>
                </div>
                <FilterContent />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default TaskFilters;