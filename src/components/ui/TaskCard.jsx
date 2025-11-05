import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, Users, Star } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card, CardContent, CardFooter, CardHeader } from './Card';
import { cn } from '../../utils/cn';

const TaskCard = ({ 
  task, 
  onStart, 
  onView, 
  showActions = true, 
  className,
  variant = 'default' 
}) => {
  const {
    id,
    title,
    description,
    reward_amount,
    time_estimate,
    difficulty_level,
    category,
    status,
    participants_count,
    max_participants,
    created_at,
    expires_at
  } = task || {};

  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'expired': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatTimeEstimate = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const isExpiringSoon = expires_at && new Date(expires_at) - new Date() < 24 * 60 * 60 * 1000;
  const isExpired = expires_at && new Date(expires_at) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn("h-full", className)}
    >
      <Card className={cn(
        "h-full transition-all duration-300 hover:shadow-lg",
        isExpired && "opacity-60",
        isExpiringSoon && "ring-2 ring-warning/50"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Badge variant={getStatusColor(status)} className="text-xs">
                {status}
              </Badge>
              {category && (
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-3">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-green-600">
                {formatCurrency(reward_amount)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">
                {formatTimeEstimate(time_estimate)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <Badge variant={getDifficultyColor(difficulty_level)} size="sm">
                {difficulty_level}
              </Badge>
            </div>
            {max_participants && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{participants_count || 0}/{max_participants}</span>
              </div>
            )}
          </div>

          {isExpiringSoon && !isExpired && (
            <div className="flex items-center gap-2 p-2 bg-warning/10 rounded-lg">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-sm text-warning font-medium">
                Expires soon!
              </span>
            </div>
          )}

          {isExpired && (
            <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
              <Clock className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive font-medium">
                Expired
              </span>
            </div>
          )}
        </CardContent>

        {showActions && (
          <CardFooter className="pt-3">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView?.(task)}
                className="flex-1"
              >
                View Details
              </Button>
              {!isExpired && status === 'active' && (
                <Button
                  size="sm"
                  onClick={() => onStart?.(task)}
                  className="flex-1"
                  disabled={max_participants && participants_count >= max_participants}
                >
                  {max_participants && participants_count >= max_participants ? 'Full' : 'Start Task'}
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default TaskCard;
