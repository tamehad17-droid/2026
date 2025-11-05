import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActions = ({ 
  selectedProofs, 
  onBulkApprove, 
  onBulkReject, 
  onClearSelection,
  totalProofs 
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkAction = (type) => {
    setActionType(type);
    setIsConfirmOpen(true);
  };

  const confirmBulkAction = async () => {
    setIsProcessing(true);
    try {
      if (actionType === 'approve') {
        await onBulkApprove(selectedProofs);
      } else if (actionType === 'reject') {
        await onBulkReject(selectedProofs);
      }
      setIsConfirmOpen(false);
      onClearSelection();
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedProofs?.length === 0) {
    return null;
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="glass rounded-lg border border-border p-4 shadow-glass-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="CheckSquare" size={20} className="text-primary" />
              <span className="text-sm font-medium text-foreground">
                {selectedProofs?.length} of {totalProofs} selected
              </span>
            </div>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearSelection}
                iconName="X"
                iconPosition="left"
              >
                Clear
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('reject')}
                iconName="X"
                iconPosition="left"
              >
                Reject ({selectedProofs?.length})
              </Button>

              <Button
                variant="success"
                size="sm"
                onClick={() => handleBulkAction('approve')}
                iconName="Check"
                iconPosition="left"
              >
                Approve ({selectedProofs?.length})
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="glass rounded-lg border border-border w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    actionType === 'approve' ?'bg-success/10 text-success' :'bg-destructive/10 text-destructive'
                  }`}>
                    <Icon 
                      name={actionType === 'approve' ? 'Check' : 'X'} 
                      size={24} 
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Confirm Bulk {actionType === 'approve' ? 'Approval' : 'Rejection'}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="glass rounded-lg p-4 mb-6">
                  <p className="text-sm text-foreground">
                    You are about to <strong>{actionType}</strong> {selectedProofs?.length} proof submission{selectedProofs?.length > 1 ? 's' : ''}.
                  </p>
                  
                  {actionType === 'reject' && (
                    <div className="mt-3 p-3 bg-warning/10 rounded-lg">
                      <p className="text-sm text-warning">
                        <Icon name="AlertTriangle" size={16} className="inline mr-2" />
                        Rejected proofs will require individual rejection reasons to be added later.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirmOpen(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={actionType === 'approve' ? 'success' : 'destructive'}
                    onClick={confirmBulkAction}
                    loading={isProcessing}
                    iconName={actionType === 'approve' ? 'Check' : 'X'}
                    iconPosition="left"
                  >
                    {actionType === 'approve' ? 'Approve All' : 'Reject All'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BulkActions;