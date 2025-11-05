import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RelatedTasks = ({ currentTaskId }) => {
  const relatedTasks = [
    {
      id: 'task-002',
      title: 'Complete AdGem Survey Bundle',
      provider: 'ADGEM',
      reward: 3.50,
      difficulty: 'Easy',
      estimatedTime: 15,
      completedCount: 234,
      maxParticipants: 500,
      description: 'Complete a series of short surveys about consumer preferences and shopping habits.'
    },
    {
      id: 'task-003',
      title: 'Social Media Engagement Campaign',
      provider: 'MANUAL',
      reward: 2.25,
      difficulty: 'Easy',
      estimatedTime: 10,
      completedCount: 156,
      maxParticipants: 300,
      description: 'Follow, like, and share specific social media posts to increase engagement.'
    },
    {
      id: 'task-004',
      title: 'AdSterra Video Views',
      provider: 'ADSTERRA',
      reward: 1.75,
      difficulty: 'Easy',
      estimatedTime: 8,
      completedCount: 89,
      maxParticipants: 200,
      description: 'Watch promotional videos and complete simple interaction requirements.'
    },
    {
      id: 'task-005',
      title: 'CPALead App Installation',
      provider: 'CPALEAD',
      reward: 4.00,
      difficulty: 'Medium',
      estimatedTime: 20,
      completedCount: 67,
      maxParticipants: 150,
      description: 'Download and test mobile applications, providing feedback on user experience.'
    }
  ]?.filter(task => task?.id !== currentTaskId);

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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-success';
      case 'medium': return 'text-warning';
      case 'hard': return 'text-destructive';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="glass rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Grid3x3" size={20} className="text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Related Tasks</h2>
        </div>
        <Link to="/tasks-list">
          <Button variant="outline" size="sm" iconName="ArrowRight" iconPosition="right">
            View All
          </Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {relatedTasks?.slice(0, 4)?.map((task) => (
          <div key={task?.id} className="glass rounded-lg p-4 border border-border hover:border-primary/30 transition-all duration-200 group">
            {/* Task Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Icon name={getProviderIcon(task?.provider)} size={16} color="white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {task?.title}
                  </h3>
                  <span className={`text-xs font-medium ${getProviderColor(task?.provider)}`}>
                    {task?.provider}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-success">${task?.reward?.toFixed(2)}</div>
              </div>
            </div>

            {/* Task Description */}
            <p className="text-sm text-text-secondary mb-3 line-clamp-2">
              {task?.description}
            </p>

            {/* Task Stats */}
            <div className="flex items-center justify-between text-xs text-text-secondary mb-4">
              <div className="flex items-center space-x-3">
                <span className={getDifficultyColor(task?.difficulty)}>
                  {task?.difficulty}
                </span>
                <span>~{task?.estimatedTime}min</span>
              </div>
              <span>{task?.completedCount}/{task?.maxParticipants}</span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className="bg-gradient-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((task?.completedCount / task?.maxParticipants) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Action Button */}
            <Link to={`/task-details?id=${task?.id}`} className="block">
              <Button 
                variant="outline" 
                size="sm" 
                fullWidth
                iconName="ArrowRight" 
                iconPosition="right"
                className="group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:text-primary"
              >
                View Details
              </Button>
            </Link>
          </div>
        ))}
      </div>
      {/* Call to Action */}
      <div className="mt-6 text-center">
        <p className="text-sm text-text-secondary mb-3">
          Looking for more earning opportunities?
        </p>
        <Link to="/tasks-list">
          <Button variant="default" iconName="Search" iconPosition="left" className="bg-gradient-primary hover:opacity-90">
            Browse All Tasks
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default RelatedTasks;