import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const BulkActions = ({ 
  selectedWithdrawals, 
  onSelectAll, 
  onDeselectAll, 
  onBulkApprove, 
  onBulkReject,
  onBulkHold,
  totalWithdrawals,
  isAllSelected 
}) => {
  const [showBulkApprove, setShowBulkApprove] = useState(false);
  const [showBulkReject, setShowBulkReject] = useState(false);
  const [bulkTransactionHash, setBulkTransactionHash] = useState('');
  const [bulkRejectionReason, setBulkRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedCount = selectedWithdrawals?.length;
  const totalAmount = selectedWithdrawals?.reduce((sum, w) => sum + w?.amount, 0);
  const totalUSDT = selectedWithdrawals?.reduce((sum, w) => sum + w?.usdtAmount, 0);

  const handleBulkApprove = async () => {
    if (!bulkTransactionHash?.trim()) {
      alert('Transaction hash is required for bulk approval');
      return;
    }
    setIsProcessing(true);
    await onBulkApprove(selectedWithdrawals?.map(w => w?.id), bulkTransactionHash);
    setIsProcessing(false);
    setBulkTransactionHash('');
    setShowBulkApprove(false);
  };

  const handleBulkReject = async () => {
    if (!bulkRejectionReason) {
      alert('Rejection reason is required for bulk rejection');
      return;
    }
    setIsProcessing(true);
    await onBulkReject(selectedWithdrawals?.map(w => w?.id), bulkRejectionReason);
    setIsProcessing(false);
    setBulkRejectionReason('');
    setShowBulkReject(false);
  };

  const handleBulkHold = async () => {
    setIsProcessing(true);
    await onBulkHold(selectedWithdrawals?.map(w => w?.id));
    setIsProcessing(false);
  };

  if (selectedCount === 0) {
    return (
      <div className="glass rounded-lg border border-border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={isAllSelected}
              onChange={isAllSelected ? onDeselectAll : onSelectAll}
              label={`Select all ${totalWithdrawals} withdrawals`}
            />
          </div>
          <div className="text-sm text-text-secondary">
            No withdrawals selected
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={selectedCount > 0}
            indeterminate={selectedCount > 0 && selectedCount < totalWithdrawals}
            onChange={selectedCount === totalWithdrawals ? onDeselectAll : onSelectAll}
            label={`${selectedCount} withdrawal${selectedCount !== 1 ? 's' : ''} selected`}
          />
          <div className="text-sm text-text-secondary">
            Total: ${totalAmount?.toFixed(2)} ({totalUSDT?.toFixed(6)} USDT)
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDeselectAll}
          iconName="X"
        >
          Clear Selection
        </Button>
      </div>
      {/* Bulk Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Button
          variant="success"
          size="sm"
          onClick={() => setShowBulkApprove(true)}
          iconName="Check"
          disabled={isProcessing}
        >
          Bulk Approve ({selectedCount})
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowBulkReject(true)}
          iconName="X"
          disabled={isProcessing}
        >
          Bulk Reject ({selectedCount})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBulkHold}
          iconName="Pause"
          disabled={isProcessing}
          loading={isProcessing && !showBulkApprove && !showBulkReject}
        >
          Bulk Hold ({selectedCount})
        </Button>
      </div>
      {/* Bulk Approve Form */}
      {showBulkApprove && (
        <div className="border-t border-border pt-4 mt-4">
          <h4 className="font-medium text-success mb-3 flex items-center space-x-2">
            <Icon name="Check" size={16} />
            <span>Bulk Approve Withdrawals</span>
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label="Master Transaction Hash"
              placeholder="Enter blockchain transaction hash for batch"
              value={bulkTransactionHash}
              onChange={(e) => setBulkTransactionHash(e?.target?.value)}
              description="This hash will be applied to all selected withdrawals"
            />
            <div className="flex items-end space-x-2">
              <Button
                variant="success"
                onClick={handleBulkApprove}
                disabled={!bulkTransactionHash?.trim() || isProcessing}
                loading={isProcessing && showBulkApprove}
                iconName="Check"
              >
                Approve All
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowBulkApprove(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Reject Form */}
      {showBulkReject && (
        <div className="border-t border-border pt-4 mt-4">
          <h4 className="font-medium text-destructive mb-3 flex items-center space-x-2">
            <Icon name="X" size={16} />
            <span>Bulk Reject Withdrawals</span>
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <select
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={bulkRejectionReason}
              onChange={(e) => setBulkRejectionReason(e?.target?.value)}
            >
              <option value="">Select rejection reason</option>
              <option value="insufficient_balance">Insufficient Balance</option>
              <option value="invalid_address">Invalid Wallet Address</option>
              <option value="security_concern">Security Concern</option>
              <option value="verification_required">Additional Verification Required</option>
              <option value="policy_violation">Policy Violation</option>
              <option value="technical_issue">Technical Issue</option>
              <option value="other">Other Reason</option>
            </select>
            <div className="flex items-end space-x-2">
              <Button
                variant="destructive"
                onClick={handleBulkReject}
                disabled={!bulkRejectionReason || isProcessing}
                loading={isProcessing && showBulkReject}
                iconName="X"
              >
                Reject All
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowBulkReject(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Warning Message */}
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mt-4">
        <div className="flex items-start space-x-2">
          <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
          <div className="text-sm">
            <p className="text-warning font-medium">Bulk Action Warning</p>
            <p className="text-text-secondary mt-1">
              This action will affect {selectedCount} withdrawal request{selectedCount !== 1 ? 's' : ''}. 
              Please ensure all selected items are correct before proceeding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;