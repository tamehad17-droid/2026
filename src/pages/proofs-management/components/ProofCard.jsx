import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProofCard = ({ proof, onResubmit, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-success bg-success/10 border-success/20';
      case 'rejected':
        return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'pending':
        return 'text-warning bg-warning/10 border-warning/20';
      default:
        return 'text-text-secondary bg-muted/10 border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'CheckCircle';
      case 'rejected':
        return 'XCircle';
      case 'pending':
        return 'Clock';
      default:
        return 'HelpCircle';
    }
  };

  const getProofTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'image':
        return 'Image';
      case 'url':
        return 'Link';
      case 'text':
        return 'FileText';
      default:
        return 'File';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass rounded-lg border border-border p-4 hover:border-primary/20 transition-all duration-200">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate mb-1">
            {proof?.taskName}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <Icon name={getProofTypeIcon(proof?.proofType)} size={14} />
            <span className="capitalize">{proof?.proofType}</span>
            <span>•</span>
            <span>{formatDate(proof?.submittedAt)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(proof?.status)}`}>
            <Icon name={getStatusIcon(proof?.status)} size={12} className="mr-1" />
            {proof?.status}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            <Icon 
              name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
              size={16} 
            />
          </Button>
        </div>
      </div>
      {/* Reward Amount */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon name="DollarSign" size={16} className="text-success" />
          <span className="font-data text-success font-medium">
            ${proof?.rewardAmount?.toFixed(2)}
          </span>
        </div>
        
        {proof?.status === 'rejected' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResubmit(proof)}
            iconName="RefreshCw"
            iconPosition="left"
          >
            Resubmit
          </Button>
        )}
      </div>
      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border pt-4 space-y-4 animate-fade-in">
          {/* Proof Content */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Proof Content</h4>
            {proof?.proofType === 'image' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {proof?.content?.split(',')?.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={imageUrl?.trim()}
                      alt={`Proof image ${index + 1} showing task completion evidence`}
                      className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onViewDetails(proof, index)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                      <Icon name="Eye" size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            ) : proof?.proofType === 'url' ? (
              <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
                <Icon name="Link" size={16} className="text-primary flex-shrink-0" />
                <a
                  href={proof?.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors truncate text-sm"
                >
                  {proof?.content}
                </a>
              </div>
            ) : (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {proof?.content}
                </p>
              </div>
            )}
          </div>

          {/* Admin Feedback */}
          {proof?.adminFeedback && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Admin Feedback</h4>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-foreground">{proof?.adminFeedback}</p>
                {proof?.reviewedAt && (
                  <p className="text-xs text-text-secondary mt-2">
                    Reviewed on {formatDate(proof?.reviewedAt)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Task Details */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Task Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Icon name="Tag" size={14} className="text-text-secondary" />
                <span className="text-text-secondary">Category:</span>
                <span className="text-foreground capitalize">{proof?.taskCategory}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Calendar" size={14} className="text-text-secondary" />
                <span className="text-text-secondary">Due:</span>
                <span className="text-foreground">{formatDate(proof?.taskDeadline)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(proof)}
              iconName="Eye"
              iconPosition="left"
            >
              View Details
            </Button>
            {proof?.status === 'rejected' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onResubmit(proof)}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Resubmit Proof
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProofCard;