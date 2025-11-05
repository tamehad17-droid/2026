import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProofCard = ({ proof, onApprove, onReject, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-warning bg-warning/10';
      case 'APPROVED':
        return 'text-success bg-success/10';
      case 'REJECTED':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-text-secondary bg-muted/30';
    }
  };

  const getTaskTypeColor = (type) => {
    switch (type) {
      case 'MANUAL':
        return 'text-primary bg-primary/10';
      case 'ADGEM':
        return 'text-accent bg-accent/10';
      case 'ADSTERRA':
        return 'text-secondary bg-secondary/10';
      case 'CPALEAD':
        return 'text-success bg-success/10';
      default:
        return 'text-text-secondary bg-muted/30';
    }
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass rounded-lg border border-border overflow-hidden">
      {/* Card Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {proof?.taskTitle}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proof?.status)}`}>
                {proof?.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(proof?.taskType)}`}>
                {proof?.taskType}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <div className="flex items-center space-x-2">
                <Icon name="User" size={14} />
                <span>{proof?.userName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Calendar" size={14} />
                <span>{formatDate(proof?.submittedAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="DollarSign" size={14} />
                <span>${proof?.reward?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(proof)}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Proof Content */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Proof Submission</h4>
            
            {proof?.proofType === 'URL' && (
              <div className="space-y-2">
                <p className="text-sm text-text-secondary">Submitted URL:</p>
                <a
                  href={proof?.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 text-sm break-all"
                >
                  {proof?.proofUrl}
                </a>
              </div>
            )}

            {proof?.proofType === 'TEXT' && (
              <div className="space-y-2">
                <p className="text-sm text-text-secondary">Submitted Text:</p>
                <div className="glass rounded-lg p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {proof?.proofText}
                  </p>
                </div>
              </div>
            )}

            {proof?.proofType === 'IMAGE' && proof?.proofImages && (
              <div className="space-y-2">
                <p className="text-sm text-text-secondary">Submitted Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {proof?.proofImages?.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image?.url}
                        alt={image?.alt}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onViewDetails(proof)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                        <Icon name="ZoomIn" size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Task Details */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Task Information</h4>
            <div className="glass rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Task ID:</span>
                <span className="text-foreground font-data">{proof?.taskId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">User ID:</span>
                <span className="text-foreground font-data">{proof?.userId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Submission ID:</span>
                <span className="text-foreground font-data">{proof?.id}</span>
              </div>
            </div>
          </div>

          {/* Review Actions */}
          {proof?.status === 'PENDING' && (
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onReject(proof)}
                iconName="X"
                iconPosition="left"
              >
                Reject
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => onApprove(proof)}
                iconName="Check"
                iconPosition="left"
              >
                Approve
              </Button>
            </div>
          )}

          {/* Rejection Reason */}
          {proof?.status === 'REJECTED' && proof?.rejectionReason && (
            <div className="glass rounded-lg p-4 border-l-4 border-destructive">
              <h4 className="text-sm font-medium text-destructive mb-2">Rejection Reason</h4>
              <p className="text-sm text-foreground">{proof?.rejectionReason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProofCard;