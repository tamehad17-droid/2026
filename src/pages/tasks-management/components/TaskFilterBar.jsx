import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TaskFilterBar = ({ filters, setFilters, onCreateTask }) => {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 glass rounded-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring"
          />
          <Icon
            name="Search"
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
          />
        </div>

        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full md:w-auto px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring"
        >
          <option value="">All Categories</option>
          <option value="survey">Survey</option>
          <option value="social_media">Social Media</option>
          <option value="app_download">App Download</option>
          <option value="review">Review</option>
          <option value="referral">Referral</option>
          <option value="video_watch">Video Watch</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full md:w-auto px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <Button onClick={onCreateTask} className="w-full md:w-auto">
        <Icon name="Plus" className="mr-2" />
        Create Task
      </Button>
    </div>
  );
};

export default TaskFilterBar;