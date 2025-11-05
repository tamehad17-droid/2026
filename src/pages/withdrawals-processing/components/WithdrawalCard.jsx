import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const WithdrawalCard = ({ withdrawal, onApprove, onReject, onHold }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const statusColors = {
    PENDING: 'bg-warning/10 text-warning border-warning/20',
    APPROVED: 'bg-success/10 text-success border-success/20',
    REJECTED: 'bg-destructive/10 text-destructive border-destructive/20',
    PROCESSING: 'bg-accent/10 text-accent border-accent/20',
    COMPLETED: 'bg-primary/10 text-primary border-primary/20'
  };

  const networkColors = {
    TRC20: 'bg-green-500/10 text-green-400 border-green-500/20',
    ERC20: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    BEP20: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  };

  const handleApprove = async () => {
    if (!transactionHash?.trim()) {
      alert('Transaction hash is required for approval');
      return;
    }
    setIsProcessing(true);
    await onApprove(withdrawal?.id, transactionHash);
    setIsProcessing(false);
    setTransactionHash('');
  };

  const handleReject = async () => {
    if (!rejectionReason?.trim()) {
      alert('Rejection reason is required');
      return;
    }
    setIsProcessing(true);
    await onReject(withdrawal?.id, rejectionReason);
    setIsProcessing(false);
    setRejectionReason('');
  };

  const handleHold = async () => {
    setIsProcessing(true);
    await onHold(withdrawal?.id);
    setIsProcessing(false);
  };

  return (
    <div className="glass rounded-lg border border-border overflow-hidden">
      {/* Main Card Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-semibold">
                {withdrawal?.user?.name?.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{withdrawal?.user?.name}</h3>
              <p className="text-sm text-text-secondary">{withdrawal?.user?.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors?.[withdrawal?.status]}`}>
                  {withdrawal?.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${networkColors?.[withdrawal?.network]}`}>
                  {withdrawal?.network}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              ${withdrawal?.amount?.toFixed(2)}
            </div>
            <div className="text-sm text-text-secondary">
              {withdrawal?.usdtAmount?.toFixed(6)} USDT
            </div>
            <div className="text-xs text-text-secondary mt-1">
              Rate: ${withdrawal?.conversionRate}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-text-secondary">Wallet Address</label>
            <p className="text-sm font-data text-foreground break-all">
              {withdrawal?.walletAddress}
            </p>
          </div>
          <div>
            <label className="text-xs text-text-secondary">Submitted</label>
            <p className="text-sm text-foreground">
              {new Date(withdrawal.createdAt)?.toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="text-xs text-text-secondary">Processing Fee</label>
            <p className="text-sm text-foreground">
              ${withdrawal?.processingFee?.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
          >
            {isExpanded ? 'Hide Details' : 'View Details'}
          </Button>

          {withdrawal?.status === 'PENDING' && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleHold}
                disabled={isProcessing}
                iconName="Pause"
              >
                Hold
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsExpanded(true)}
                disabled={isProcessing}
                iconName="X"
              >
                Reject
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => setIsExpanded(true)}
                disabled={isProcessing}
                iconName="Check"
              >
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border p-6 bg-muted/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center space-x-2">
                <Icon name="User" size={16} />
                <span>User Information</span>
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">User ID:</span>
                  <span className="text-foreground font-data">#{withdrawal?.user?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Account Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    withdrawal?.user?.status === 'APPROVED' ?'bg-success/10 text-success' :'bg-warning/10 text-warning'
                  }`}>
                    {withdrawal?.user?.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Withdrawals:</span>
                  <span className="text-foreground">{withdrawal?.user?.totalWithdrawals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Success Rate:</span>
                  <span className="text-success">{withdrawal?.user?.successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Risk Score:</span>
                  <span className={`${
                    withdrawal?.riskScore === 'LOW' ? 'text-success' :
                    withdrawal?.riskScore === 'MEDIUM' ? 'text-warning' : 'text-destructive'
                  }`}>
                    {withdrawal?.riskScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center space-x-2">
                <Icon name="CreditCard" size={16} />
                <span>Transaction Details</span>
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Request ID:</span>
                  <span className="text-foreground font-data">#{withdrawal?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Requested Amount:</span>
                  <span className="text-foreground">${withdrawal?.amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">USDT Amount:</span>
                  <span className="text-foreground font-data">{withdrawal?.usdtAmount?.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Processing Fee:</span>
                  <span className="text-foreground">${withdrawal?.processingFee?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Final Amount:</span>
                  <span className="text-foreground font-semibold">
                    {(withdrawal?.usdtAmount - (withdrawal?.processingFee / withdrawal?.conversionRate))?.toFixed(6)} USDT
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Actions */}
          {withdrawal?.status === 'PENDING' && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Approve Section */}
                <div className="space-y-4">
                  <h5 className="font-medium text-success flex items-center space-x-2">
                    <Icon name="Check" size={16} />
                    <span>Approve Withdrawal</span>
                  </h5>
                  <Input
                    label="Transaction Hash"
                    placeholder="Enter blockchain transaction hash"
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e?.target?.value)}
                    description="Required for approval confirmation"
                  />
                  <Button
                    variant="success"
                    onClick={handleApprove}
                    disabled={!transactionHash?.trim() || isProcessing}
                    loading={isProcessing}
                    iconName="Check"
                    fullWidth
                  >
                    Approve & Complete
                  </Button>
                </div>

                {/* Reject Section */}
                <div className="space-y-4">
                  <h5 className="font-medium text-destructive flex items-center space-x-2">
                    <Icon name="X" size={16} />
                    <span>Reject Withdrawal</span>
                  </h5>
                  <Select
                    label="Rejection Reason"
                    placeholder="Select reason for rejection"
                    value={rejectionReason}
                    onChange={setRejectionReason}
                    options={[
                      { value: 'insufficient_balance', label: 'Insufficient Balance' },
                      { value: 'invalid_address', label: 'Invalid Wallet Address' },
                      { value: 'security_concern', label: 'Security Concern' },
                      { value: 'verification_required', label: 'Additional Verification Required' },
                      { value: 'policy_violation', label: 'Policy Violation' },
                      { value: 'technical_issue', label: 'Technical Issue' },
                      { value: 'other', label: 'Other Reason' }
                    ]}
                  />
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={!rejectionReason || isProcessing}
                    loading={isProcessing}
                    iconName="X"
                    fullWidth
                  >
                    Reject Request
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Transaction History */}
          {withdrawal?.transactionHash && (
            <div className="mt-6 pt-6 border-t border-border">
              <h5 className="font-medium text-foreground mb-3 flex items-center space-x-2">
                <Icon name="History" size={16} />
                <span>Transaction History</span>
              </h5>
              <div className="glass rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Transaction Hash:</span>
                  <span className="text-foreground font-data text-sm break-all">
                    {withdrawal?.transactionHash}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-text-secondary">Processed By:</span>
                  <span className="text-foreground">{withdrawal?.processedBy || 'System'}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-text-secondary">Processed At:</span>
                  <span className="text-foreground">
                    {withdrawal?.processedAt ? new Date(withdrawal.processedAt)?.toLocaleString() : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WithdrawalCard;