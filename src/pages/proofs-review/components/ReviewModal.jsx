import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ReviewModal = ({ proof, isOpen, onClose, onApprove, onReject }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !proof) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(proof?.id);
      onClose();
    } catch (error) {
      console.error('Error approving proof:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason?.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onReject(proof?.id, rejectionReason);
      onClose();
    } catch (error) {
      console.error('Error rejecting proof:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Review Proof Submission</h2>
              <p className="text-sm text-text-secondary mt-1">
                Submitted by {proof?.userName} on {formatDate(proof?.submittedAt)}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={24} />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Task & User Info */}
              <div className="space-y-6">
                {/* Task Information */}
                <div className="glass rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Task Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-text-secondary">Task Title</p>
                      <p className="text-foreground font-medium">{proof?.taskTitle}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-text-secondary">Task Type</p>
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {proof?.taskType}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Reward</p>
                        <p className="text-foreground font-data">${proof?.reward?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Task ID</p>
                      <p className="text-foreground font-data">{proof?.taskId}</p>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div className="glass rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">User Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {proof?.userName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{proof?.userName}</p>
                        <p className="text-sm text-text-secondary">{proof?.userEmail}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-text-secondary">User ID</p>
                        <p className="text-foreground font-data">{proof?.userId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Join Date</p>
                        <p className="text-foreground">{new Date(proof.userJoinDate)?.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submission Status */}
                <div className="glass rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Submission Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">Current Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proof?.status)}`}>
                        {proof?.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Submission ID</p>
                      <p className="text-foreground font-data">{proof?.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Submitted At</p>
                      <p className="text-foreground">{formatDate(proof?.submittedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Proof Content */}
              <div className="space-y-6">
                <div className="glass rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Proof Submission</h3>
                  
                  {/* URL Proof */}
                  {proof?.proofType === 'URL' && (
                    <div className="space-y-3">
                      <p className="text-sm text-text-secondary">Submitted URL:</p>
                      <div className="glass rounded-lg p-3">
                        <a
                          href={proof?.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 break-all"
                        >
                          {proof?.proofUrl}
                        </a>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(proof?.proofUrl, '_blank')}
                        iconName="ExternalLink"
                        iconPosition="left"
                      >
                        Open URL
                      </Button>
                    </div>
                  )}

                  {/* Text Proof */}
                  {proof?.proofType === 'TEXT' && (
                    <div className="space-y-3">
                      <p className="text-sm text-text-secondary">Submitted Text:</p>
                      <div className="glass rounded-lg p-4 max-h-64 overflow-y-auto">
                        <p className="text-foreground whitespace-pre-wrap">
                          {proof?.proofText}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Image Proof */}
                  {proof?.proofType === 'IMAGE' && proof?.proofImages && (
                    <div className="space-y-4">
                      <p className="text-sm text-text-secondary">
                        Submitted Images ({proof?.proofImages?.length}):
                      </p>
                      
                      {/* Main Image Display */}
                      <div className="relative">
                        <Image
                          src={proof?.proofImages?.[selectedImageIndex]?.url}
                          alt={proof?.proofImages?.[selectedImageIndex]?.alt}
                          className="w-full h-64 object-contain bg-muted/20 rounded-lg"
                        />
                        
                        {/* Image Navigation */}
                        {proof?.proofImages?.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
                              onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                              disabled={selectedImageIndex === 0}
                            >
                              <Icon name="ChevronLeft" size={20} color="white" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
                              onClick={() => setSelectedImageIndex(Math.min(proof?.proofImages?.length - 1, selectedImageIndex + 1))}
                              disabled={selectedImageIndex === proof?.proofImages?.length - 1}
                            >
                              <Icon name="ChevronRight" size={20} color="white" />
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Image Thumbnails */}
                      {proof?.proofImages?.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto">
                          {proof?.proofImages?.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                                selectedImageIndex === index
                                  ? 'border-primary' :'border-border hover:border-primary/50'
                              }`}
                            >
                              <Image
                                src={image?.url}
                                alt={image?.alt}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Rejection Reason Input (if rejecting) */}
                {proof?.status === 'PENDING' && (
                  <div className="glass rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Review Actions</h3>
                    <div className="space-y-4">
                      <Input
                        label="Rejection Reason (if rejecting)"
                        type="text"
                        placeholder="Provide a clear reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e?.target?.value)}
                        description="This will be shown to the user if you reject the proof"
                      />
                    </div>
                  </div>
                )}

                {/* Previous Rejection Reason */}
                {proof?.status === 'REJECTED' && proof?.rejectionReason && (
                  <div className="glass rounded-lg p-4 border-l-4 border-destructive">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Rejection Reason</h3>
                    <p className="text-foreground">{proof?.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          {proof?.status === 'PENDING' && (
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                loading={isSubmitting}
                iconName="X"
                iconPosition="left"
              >
                Reject Proof
              </Button>
              <Button
                variant="success"
                onClick={handleApprove}
                loading={isSubmitting}
                iconName="Check"
                iconPosition="left"
              >
                Approve Proof
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewModal;