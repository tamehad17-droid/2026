import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TaskHeader = ({ task, onStartTask, onSubmitProof, isCompleted, isSubmitted }) => {
  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'ADGEM': return 'Gem';
      case 'ADSTERRA': return 'Star';
      case 'CPALEAD': return 'TrendingUp';
      default: return 'CheckSquare';
    }
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'ADGEM': return 'text-purple-400';
      case 'ADSTERRA': return 'text-orange-400';
      case 'CPALEAD': return 'text-green-400';
      default: return 'text-primary';
    }
  };

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
          <Icon name="CheckCircle" size={16} className="text-success" />
          <span className="text-sm font-medium text-success">Completed</span>
        </div>
      );
    }
    if (isSubmitted) {
      return (
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20">
          <Icon name="Clock" size={16} className="text-warning" />
          <span className="text-sm font-medium text-warning">Under Review</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
        <Icon name="Play" size={16} className="text-primary" />
        <span className="text-sm font-medium text-primary">Available</span>
      </div>
    );
  };

  return (
    <div className="glass rounded-xl p-6 border border-border">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-text-secondary mb-4">
        <Link to="/tasks-list" className="hover:text-primary transition-colors">
          Tasks
        </Link>
        <Icon name="ChevronRight" size={14} />
        <span className="text-foreground">{task?.title}</span>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
        {/* Left Section - Task Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center`}>
              <Icon name={getProviderIcon(task?.provider)} size={20} color="white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{task?.title}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`text-sm font-medium ${getProviderColor(task?.provider)}`}>
                  {task?.provider}
                </span>
                <span className="text-sm text-text-secondary">•</span>
                <span className="text-sm text-text-secondary">
                  {task?.difficulty} Difficulty
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <Icon name="DollarSign" size={16} className="text-success" />
              <span className="text-lg font-bold text-success">
                ${task?.reward?.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">
                ~{task?.estimatedTime} minutes
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">
                {task?.completedCount}/{task?.maxParticipants} completed
              </span>
            </div>
          </div>

          {getStatusBadge()}
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Link to="/tasks-list">
            <Button variant="outline" iconName="ArrowLeft" iconPosition="left">
              Back to Tasks
            </Button>
          </Link>
          
          {!isCompleted && !isSubmitted && (
            <Button 
              variant="default" 
              onClick={onStartTask}
              iconName="Play" 
              iconPosition="left"
              className="bg-gradient-primary hover:opacity-90"
            >
              Start Task
            </Button>
          )}
          
          {!isCompleted && !isSubmitted && task?.provider === 'MANUAL' && (
            <Button 
              variant="secondary" 
              onClick={onSubmitProof}
              iconName="Upload" 
              iconPosition="left"
            >
              Submit Proof
            </Button>
          )}

          {isSubmitted && (
            <Link to="/proofs-management">
              <Button variant="outline" iconName="Eye" iconPosition="left">
                View Status
              </Button>
            </Link>
          )}
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
          <span>Task Progress</span>
          <span>{Math.round((task?.completedCount / task?.maxParticipants) * 100)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((task?.completedCount / task?.maxParticipants) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;