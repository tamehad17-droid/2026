import React from 'react';
import TaskCard from './TaskCard';
import Icon from '../../../components/AppIcon';

const TaskGrid = ({ tasks, loading, onStartTask, onLoadMore, hasMore }) => {
  if (loading && tasks?.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)]?.map((_, index) => (
          <div key={index} className="glass rounded-xl p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-muted/30 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-muted/30 rounded mb-2" />
                <div className="h-3 bg-muted/30 rounded w-2/3" />
              </div>
            </div>
            <div className="h-32 bg-muted/30 rounded-lg mb-4" />
            <div className="h-3 bg-muted/30 rounded mb-2" />
            <div className="h-3 bg-muted/30 rounded w-3/4 mb-4" />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-12 bg-muted/30 rounded" />
              <div className="h-12 bg-muted/30 rounded" />
            </div>
            <div className="h-2 bg-muted/30 rounded mb-4" />
            <div className="h-10 bg-muted/30 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center mb-6">
          <Icon name="Search" size={32} className="text-text-secondary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No Tasks Found</h3>
        <p className="text-text-secondary max-w-md">
          We couldn't find any tasks matching your current filters. Try adjusting your search criteria or check back later for new opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks?.map((task) => (
          <TaskCard
            key={task?.id}
            task={task}
            onStart={onStartTask}
            onViewProof={() => {}}
            userSubmission={null}
          />
        ))}
      </div>
      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 glass rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-text-secondary">Loading...</span>
              </>
            ) : (
              <>
                <Icon name="ChevronDown" size={16} className="text-primary" />
                <span className="text-foreground">Load More Tasks</span>
              </>
            )}
          </button>
        </div>
      )}
      {/* Loading Indicator for Additional Tasks */}
      {loading && tasks?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(3)]?.map((_, index) => (
            <div key={index} className="glass rounded-xl p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-muted/30 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-muted/30 rounded mb-2" />
                  <div className="h-3 bg-muted/30 rounded w-2/3" />
                </div>
              </div>
              <div className="h-32 bg-muted/30 rounded-lg mb-4" />
              <div className="h-3 bg-muted/30 rounded mb-2" />
              <div className="h-3 bg-muted/30 rounded w-3/4 mb-4" />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-12 bg-muted/30 rounded" />
                <div className="h-12 bg-muted/30 rounded" />
              </div>
              <div className="h-2 bg-muted/30 rounded mb-4" />
              <div className="h-10 bg-muted/30 rounded" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskGrid;