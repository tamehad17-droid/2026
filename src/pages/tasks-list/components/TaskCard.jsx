import React from 'react';
import { Clock, DollarSign, Users, ExternalLink, Star, TrendingUp, Award } from 'lucide-react';

const TaskCard = ({ task, onStart, onViewProof, userSubmission, userLevel = 0 }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'adgem': return '🎮';
      case 'survey': return '📋';
      case 'social_media': return '📱';
      case 'app_download': return '📲';
      case 'review': return '⭐';
      case 'referral': return '👥';
      case 'video_watch': return '🎥';
      default: return '📋';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'adgem': return 'bg-purple-100 text-purple-800';
      case 'survey': return 'bg-blue-100 text-blue-800';
      case 'social_media': return 'bg-pink-100 text-pink-800';
      case 'app_download': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'referral': return 'bg-indigo-100 text-indigo-800';
      case 'video_watch': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Check if this is an AdGem task with level-based rewards
  const isAdgemTask = task?.category === 'adgem';
  const levelPercentage = task?.level_percentage || (userLevel >= 5 ? 85 : [10, 25, 40, 55, 70]?.[userLevel] || 10);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getCategoryIcon(task?.category)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{task?.title}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(task?.category)}`}>
                {task?.category?.replace('_', ' ')?.toUpperCase()}
              </span>
            </div>
          </div>
          
          {/* AdGem Level Badge */}
          {isAdgemTask && (
            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-1 bg-purple-50 px-2 py-1 rounded-lg">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Level {userLevel}</span>
              </div>
              <span className="text-xs text-purple-600 mt-1">{levelPercentage}% Reward</span>
            </div>
          )}
        </div>

        {/* Description */}
        {task?.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {task?.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Reward Amount */}
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-lg font-bold text-green-600">
                ${task?.reward_amount?.toFixed(2)}
              </span>
              {/* AdGem Level Indicator */}
              {isAdgemTask && (
                <div className="flex items-center space-x-1 ml-2">
                  <TrendingUp className="h-3 w-3 text-purple-500" />
                  <span className="text-xs text-purple-600">Your Rate</span>
                </div>
              )}
            </div>

            {/* Participants */}
            {task?.total_slots && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  {task?.completed_slots || 0}/{task?.total_slots}
                </span>
              </div>
            )}
          </div>

          {/* Created Date */}
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">
              {formatDate(task?.created_at)}
            </span>
          </div>
        </div>

        {/* AdGem Level Info */}
        {isAdgemTask && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">
                  Level-Based Reward System
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Your current level earns {levelPercentage}% of task rewards
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-bold text-purple-700">
                    Level {userLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Badge for User Submissions */}
        {userSubmission && (
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(userSubmission?.status)}`}>
              {userSubmission?.status?.toUpperCase()}
            </span>
            {userSubmission?.status === 'rejected' && userSubmission?.admin_notes && (
              <p className="text-xs text-red-600 mt-1">
                Reason: {userSubmission?.admin_notes}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            {!userSubmission && (
              <button
                onClick={() => onStart?.(task)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Start Task
              </button>
            )}

            {userSubmission && userSubmission?.status === 'pending' && (
              <button
                onClick={() => onViewProof?.(task, userSubmission)}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
              >
                View Proof
              </button>
            )}

            {userSubmission && userSubmission?.status === 'approved' && (
              <button
                disabled
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-75 cursor-not-allowed"
              >
                Completed
              </button>
            )}

            {userSubmission && userSubmission?.status === 'rejected' && (
              <button
                onClick={() => onStart?.(task)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Retry Task
              </button>
            )}
          </div>

          {/* External Link for AdGem */}
          {task?.external_url && (
            <button
              onClick={() => window.open(task?.external_url, '_blank')}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="text-sm">Visit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;