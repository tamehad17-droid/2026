import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'paused':
        return 'text-yellow-500';
      case 'completed':
        return 'text-blue-500';
      default:
        return 'text-text-secondary';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'survey':
        return 'ClipboardCheck';
      case 'social_media':
        return 'Share2';
      case 'app_download':
        return 'Smartphone';
      case 'review':
        return 'MessageSquare';
      case 'referral':
        return 'Users';
      case 'video_watch':
        return 'Play';
      default:
        return 'Activity';
    }
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-muted ${getStatusColor(task.status)}`}>
              <Icon name={getCategoryIcon(task.category)} size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{task.title}</h3>
              <p className="text-sm text-text-secondary">{task.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="hover:text-foreground"
            >
              <Icon name="Edit2" size={18} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task)}
              className="hover:text-red-500"
            >
              <Icon name="Trash2" size={18} />
            </Button>
          </div>
        </div>

        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
          {task.description}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-secondary mb-1">Reward</p>
            <p className="text-sm font-medium text-foreground">
              ${task.reward_amount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary mb-1">Slots</p>
            <p className="text-sm font-medium text-foreground">
              {task.total_slots}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon
                name="Star"
                size={16}
                className="text-yellow-500"
              />
              <span className="text-sm text-text-secondary">
                Level {task.level_required}
              </span>
            </div>
            <span className={`text-sm font-medium capitalize ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;