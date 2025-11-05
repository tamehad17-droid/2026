import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WithdrawalHistory = () => {
  const [filter, setFilter] = useState('all');

  const withdrawalHistory = [
    {
      id: "WD001",
      amount: 150.00,
      usdtAmount: 149.00,
      network: "TRC20",
      walletAddress: "TQn9Y2khEsLJW1ChVWFMSMeRDow5oNDMnt",
      status: "completed",
      transactionHash: "0x742d35cc6c6c0532e51fcd896b5b3d5c8d5c5e5c5e5c5e5c5e5c5e5c5e5c5e5c",
      createdAt: new Date(Date.now() - 86400000 * 2),
      completedAt: new Date(Date.now() - 86400000 * 1),
      networkFee: 1.00
    },
    {
      id: "WD002",
      amount: 75.50,
      usdtAmount: 60.50,
      network: "ERC20",
      walletAddress: "0x742d35Cc6c6c0532e51fcd896b5b3d5c8d5c5e5c",
      status: "processing",
      transactionHash: null,
      createdAt: new Date(Date.now() - 86400000 * 1),
      completedAt: null,
      networkFee: 15.00
    },
    {
      id: "WD003",
      amount: 200.00,
      usdtAmount: 199.50,
      network: "BEP20",
      walletAddress: "0x8ba1f109551bD432803012645Hac136c22C501e5",
      status: "pending",
      transactionHash: null,
      createdAt: new Date(Date.now() - 3600000 * 6),
      completedAt: null,
      networkFee: 0.50
    },
    {
      id: "WD004",
      amount: 50.00,
      usdtAmount: 0,
      network: "TRC20",
      walletAddress: "TQn9Y2khEsLJW1ChVWFMSMeRDow5oNDMnt",
      status: "rejected",
      transactionHash: null,
      createdAt: new Date(Date.now() - 86400000 * 5),
      completedAt: null,
      networkFee: 1.00,
      rejectionReason: "Invalid wallet address format"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return { name: 'CheckCircle', color: 'text-success' };
      case 'processing':
        return { name: 'Clock', color: 'text-warning' };
      case 'pending':
        return { name: 'AlertCircle', color: 'text-primary' };
      case 'rejected':
        return { name: 'XCircle', color: 'text-destructive' };
      default:
        return { name: 'Circle', color: 'text-text-secondary' };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const filteredHistory = withdrawalHistory?.filter(withdrawal => {
    if (filter === 'all') return true;
    return withdrawal?.status === filter;
  });

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address?.slice(0, 6)}...${address?.slice(-6)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    // In a real app, show toast notification
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Withdrawal History</h3>
          <p className="text-sm text-text-secondary">Track your withdrawal requests and transactions</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'processing', label: 'Processing' },
            { key: 'completed', label: 'Completed' },
            { key: 'rejected', label: 'Rejected' }
          ]?.map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      {/* Withdrawal Cards */}
      <div className="space-y-4">
        {filteredHistory?.length === 0 ? (
          <div className="glass rounded-lg p-8 text-center border border-border">
            <Icon name="FileX" size={48} className="text-text-secondary mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No Withdrawals Found</h4>
            <p className="text-text-secondary">
              {filter === 'all' ?'You haven\'t made any withdrawal requests yet.' 
                : `No ${filter} withdrawals found.`}
            </p>
          </div>
        ) : (
          filteredHistory?.map((withdrawal) => {
            const statusIcon = getStatusIcon(withdrawal?.status);
            
            return (
              <div key={withdrawal?.id} className="glass rounded-lg p-6 border border-border">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left Section */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Icon 
                        name={statusIcon?.name} 
                        size={20} 
                        className={statusIcon?.color} 
                      />
                      <div>
                        <span className="font-medium text-foreground">#{withdrawal?.id}</span>
                        <span className={`ml-2 text-sm ${statusIcon?.color}`}>
                          {getStatusText(withdrawal?.status)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-text-secondary">Amount:</span>
                        <span className="ml-2 font-data text-foreground">
                          ${withdrawal?.amount?.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Network:</span>
                        <span className="ml-2 font-medium text-primary">
                          {withdrawal?.network}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-secondary">USDT Amount:</span>
                        <span className="ml-2 font-data text-success">
                          {withdrawal?.status === 'rejected' ? 'N/A' : `${withdrawal?.usdtAmount?.toFixed(2)} USDT`}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Network Fee:</span>
                        <span className="ml-2 font-data text-warning">
                          ${withdrawal?.networkFee?.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-text-secondary">Wallet:</span>
                      <span className="font-data text-foreground">
                        {formatAddress(withdrawal?.walletAddress)}
                      </span>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => copyToClipboard(withdrawal?.walletAddress)}
                        iconName="Copy"
                      />
                    </div>

                    {withdrawal?.rejectionReason && (
                      <div className="flex items-start space-x-2 p-3 bg-destructive/10 rounded-lg">
                        <Icon name="AlertTriangle" size={16} className="text-destructive mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-destructive">Rejection Reason:</span>
                          <p className="text-sm text-destructive mt-1">{withdrawal?.rejectionReason}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col items-start lg:items-end space-y-2 text-sm">
                    <div className="text-text-secondary">
                      Created: {withdrawal?.createdAt?.toLocaleDateString()}
                    </div>
                    {withdrawal?.completedAt && (
                      <div className="text-success">
                        Completed: {withdrawal?.completedAt?.toLocaleDateString()}
                      </div>
                    )}
                    
                    {withdrawal?.transactionHash && (
                      <div className="flex items-center space-x-2">
                        <span className="text-text-secondary">TX Hash:</span>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => copyToClipboard(withdrawal?.transactionHash)}
                          iconName="ExternalLink"
                        >
                          View
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-lg p-4 border border-border text-center">
          <div className="text-2xl font-data text-success mb-1">
            ${withdrawalHistory?.filter(w => w?.status === 'completed')?.reduce((sum, w) => sum + w?.amount, 0)?.toFixed(2)}
          </div>
          <div className="text-sm text-text-secondary">Total Withdrawn</div>
        </div>
        
        <div className="glass rounded-lg p-4 border border-border text-center">
          <div className="text-2xl font-data text-warning mb-1">
            ${withdrawalHistory?.filter(w => w?.status === 'processing' || w?.status === 'pending')?.reduce((sum, w) => sum + w?.amount, 0)?.toFixed(2)}
          </div>
          <div className="text-sm text-text-secondary">Pending Amount</div>
        </div>
        
        <div className="glass rounded-lg p-4 border border-border text-center">
          <div className="text-2xl font-data text-foreground mb-1">
            {withdrawalHistory?.length}
          </div>
          <div className="text-sm text-text-secondary">Total Requests</div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalHistory;