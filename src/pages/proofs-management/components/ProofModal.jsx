import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ProofModal = ({ proof, isOpen, onClose, onResubmit, mode = 'view' }) => {
  const [resubmissionData, setResubmissionData] = useState({
    proofType: proof?.proofType || 'text',
    content: '',
    notes: ''
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen || !proof) return null;

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

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleResubmit = () => {
    onResubmit(proof?.id, resubmissionData);
    onClose();
  };

  const renderProofContent = () => {
    if (proof?.proofType === 'image') {
      const images = proof?.content?.split(',')?.map(url => url?.trim());
      return (
        <div className="space-y-4">
          {/* Main Image Display */}
          <div className="relative">
            <Image
              src={images?.[selectedImageIndex]}
              alt={`Proof image ${selectedImageIndex + 1} showing task completion evidence`}
              className="w-full max-h-96 object-contain rounded-lg"
            />
            
            {images?.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {selectedImageIndex + 1} / {images?.length}
              </div>
            )}
          </div>
          {/* Image Thumbnails */}
          {images?.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {images?.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index 
                      ? 'border-primary' :'border-border hover:border-primary/50'
                  }`}
                >
                  <Image
                    src={imageUrl}
                    alt={`Proof thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      );
    } else if (proof?.proofType === 'url') {
      return (
        <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
          <Icon name="Link" size={20} className="text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <a
              href={proof?.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors break-all"
            >
              {proof?.content}
            </a>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigator.clipboard?.writeText(proof?.content)}
            className="flex-shrink-0"
          >
            <Icon name="Copy" size={16} />
          </Button>
        </div>
      );
    } else {
      return (
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {proof?.content}
          </p>
        </div>
      );
    }
  };

  const renderResubmissionForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Proof Type
          </label>
          <select
            value={resubmissionData?.proofType}
            onChange={(e) => setResubmissionData(prev => ({ ...prev, proofType: e?.target?.value }))}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="text">Text</option>
            <option value="url">URL</option>
            <option value="image">Image</option>
          </select>
        </div>
        <div>
          <Input
            label="New Proof Content"
            type={resubmissionData?.proofType === 'url' ? 'url' : 'text'}
            placeholder={
              resubmissionData?.proofType === 'url' ?'https://example.com/proof' 
                : resubmissionData?.proofType === 'image' ?'Image URLs (comma-separated)' :'Enter your proof text...'
            }
            value={resubmissionData?.content}
            onChange={(e) => setResubmissionData(prev => ({ ...prev, content: e?.target?.value }))}
            required
          />
        </div>
        <div>
          <Input
            label="Additional Notes (Optional)"
            type="text"
            placeholder="Any additional information about your resubmission..."
            value={resubmissionData?.notes}
            onChange={(e) => setResubmissionData(prev => ({ ...prev, notes: e?.target?.value }))}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {mode === 'resubmit' ? 'Resubmit Proof' : 'Proof Details'}
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                {proof?.taskName}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(proof?.status)}`}>
                <Icon name={getStatusIcon(proof?.status)} size={14} className="mr-2" />
                {proof?.status}
              </span>
              
              <Button variant="ghost" size="icon" onClick={onClose}>
                <Icon name="X" size={24} />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {mode === 'resubmit' ? (
                  <>
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-4">
                        Original Proof
                      </h3>
                      {renderProofContent()}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-4">
                        New Proof Submission
                      </h3>
                      {renderResubmissionForm()}
                    </div>
                  </>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-4">
                      Submitted Proof
                    </h3>
                    {renderProofContent()}
                  </div>
                )}

                {/* Admin Feedback */}
                {proof?.adminFeedback && (
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-4">
                      Admin Feedback
                    </h3>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-foreground leading-relaxed">
                        {proof?.adminFeedback}
                      </p>
                      {proof?.reviewedAt && (
                        <p className="text-sm text-text-secondary mt-3">
                          Reviewed on {formatDate(proof?.reviewedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Task Information */}
                <div className="glass rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-3">Task Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Category:</span>
                      <span className="text-foreground capitalize">{proof?.taskCategory}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Reward:</span>
                      <span className="text-success font-data font-medium">
                        ${proof?.rewardAmount?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Submitted:</span>
                      <span className="text-foreground">
                        {new Date(proof.submittedAt)?.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Deadline:</span>
                      <span className="text-foreground">
                        {new Date(proof.taskDeadline)?.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="glass rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-3">Status Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Proof Submitted</p>
                        <p className="text-xs text-text-secondary">
                          {formatDate(proof?.submittedAt)}
                        </p>
                      </div>
                    </div>
                    
                    {proof?.reviewedAt && (
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          proof?.status === 'approved' ? 'bg-success' : 'bg-destructive'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            Proof {proof?.status}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {formatDate(proof?.reviewedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            
            {mode === 'resubmit' ? (
              <Button 
                variant="default" 
                onClick={handleResubmit}
                disabled={!resubmissionData?.content?.trim()}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Submit Resubmission
              </Button>
            ) : proof?.status === 'rejected' && (
              <Button 
                variant="default" 
                onClick={() => {
                  setResubmissionData({
                    proofType: proof?.proofType,
                    content: '',
                    notes: ''
                  });
                }}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Resubmit Proof
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProofModal;