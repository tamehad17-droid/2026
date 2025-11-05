import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProofTable = ({ proofs, onResubmit, onViewDetails, onBulkAction, selectedProofs, onSelectProof, onSelectAll }) => {
  const [sortField, setSortField] = useState('submittedAt');
  const [sortDirection, setSortDirection] = useState('desc');

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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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

  const renderProofContent = (proof) => {
    if (proof?.proofType === 'image') {
      const images = proof?.content?.split(',');
      return (
        <div className="flex items-center space-x-2">
          <Image
            src={images?.[0]?.trim()}
            alt={`Proof image showing task completion evidence`}
            className="w-8 h-8 object-cover rounded"
          />
          {images?.length > 1 && (
            <span className="text-xs text-text-secondary">
              +{images?.length - 1} more
            </span>
          )}
        </div>
      );
    } else if (proof?.proofType === 'url') {
      return (
        <div className="flex items-center space-x-2">
          <Icon name="Link" size={14} className="text-primary" />
          <span className="text-sm text-primary truncate max-w-[200px]">
            {proof?.content}
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
          <Icon name="FileText" size={14} className="text-text-secondary" />
          <span className="text-sm text-foreground truncate max-w-[200px]">
            {proof?.content}
          </span>
        </div>
      );
    }
  };

  const allSelected = proofs?.length > 0 && selectedProofs?.length === proofs?.length;
  const someSelected = selectedProofs?.length > 0 && selectedProofs?.length < proofs?.length;

  return (
    <div className="glass rounded-lg border border-border overflow-hidden">
      {/* Table Header with Bulk Actions */}
      {selectedProofs?.length > 0 && (
        <div className="bg-primary/5 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {selectedProofs?.length} proof{selectedProofs?.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('resubmit')}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Resubmit Selected
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectAll(false)}
                iconName="X"
                iconPosition="left"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                  className="rounded border-border focus:ring-ring"
                />
              </th>
              
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('taskName')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Task</span>
                  <Icon 
                    name={sortField === 'taskName' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={14} 
                  />
                </button>
              </th>

              <th className="text-left px-4 py-3">
                <span className="text-sm font-medium text-foreground">Proof</span>
              </th>

              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Status</span>
                  <Icon 
                    name={sortField === 'status' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={14} 
                  />
                </button>
              </th>

              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('rewardAmount')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Reward</span>
                  <Icon 
                    name={sortField === 'rewardAmount' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={14} 
                  />
                </button>
              </th>

              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('submittedAt')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Submitted</span>
                  <Icon 
                    name={sortField === 'submittedAt' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                    size={14} 
                  />
                </button>
              </th>

              <th className="text-right px-4 py-3">
                <span className="text-sm font-medium text-foreground">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {proofs?.map((proof) => (
              <tr 
                key={proof?.id} 
                className={`hover:bg-muted/20 transition-colors ${
                  selectedProofs?.includes(proof?.id) ? 'bg-primary/5' : ''
                }`}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProofs?.includes(proof?.id)}
                    onChange={(e) => onSelectProof(proof?.id, e?.target?.checked)}
                    className="rounded border-border focus:ring-ring"
                  />
                </td>

                <td className="px-4 py-4">
                  <div>
                    <div className="font-medium text-foreground truncate max-w-[200px]">
                      {proof?.taskName}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Icon name={getProofTypeIcon(proof?.proofType)} size={12} className="text-text-secondary" />
                      <span className="text-xs text-text-secondary capitalize">
                        {proof?.proofType}
                      </span>
                      <span className="text-xs text-text-secondary">•</span>
                      <span className="text-xs text-text-secondary capitalize">
                        {proof?.taskCategory}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  {renderProofContent(proof)}
                </td>

                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(proof?.status)}`}>
                    <Icon name={getStatusIcon(proof?.status)} size={12} className="mr-1" />
                    {proof?.status}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center space-x-1">
                    <Icon name="DollarSign" size={14} className="text-success" />
                    <span className="font-data text-success font-medium">
                      {proof?.rewardAmount?.toFixed(2)}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="text-sm text-foreground">
                    {formatDate(proof?.submittedAt)}
                  </div>
                  {proof?.reviewedAt && (
                    <div className="text-xs text-text-secondary">
                      Reviewed {formatDate(proof?.reviewedAt)}
                    </div>
                  )}
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(proof)}
                      className="h-8 w-8"
                    >
                      <Icon name="Eye" size={16} />
                    </Button>
                    
                    {proof?.status === 'rejected' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onResubmit(proof)}
                        className="h-8 w-8 text-primary hover:text-primary/80"
                      >
                        <Icon name="RefreshCw" size={16} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Empty State */}
      {proofs?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="FileSearch" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No proofs found</h3>
          <p className="text-text-secondary">
            No proofs match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProofTable;