import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { adminService } from '../../../services/adminService';

const BulkActionModal = ({ isOpen, onClose, action, selectedUsers, onConfirm }) => {
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [level, setLevel] = useState('');

  if (!isOpen) return null;

  const getActionConfig = () => {
    switch (action) {
      case 'approve':
        return {
          title: 'Approve Users',
          description: `Are you sure you want to approve ${selectedUsers?.length} selected users?`,
          icon: 'CheckCircle',
          iconColor: 'text-success',
          confirmText: 'Approve Users',
          confirmVariant: 'default'
        };
      case 'suspend':
        return {
          title: 'Suspend Users',
          description: `Are you sure you want to suspend ${selectedUsers?.length} selected users?`,
          icon: 'XCircle',
          iconColor: 'text-destructive',
          confirmText: 'Suspend Users',
          confirmVariant: 'destructive',
          requiresReason: true
        };
      case 'upgrade_level':
        return {
          title: 'Upgrade User Level',
          description: `Upgrade level for ${selectedUsers?.length} selected users`,
          icon: 'ArrowUp',
          iconColor: 'text-success',
          confirmText: 'Upgrade Level',
          confirmVariant: 'default',
          requiresReason: false
        };
      case 'add_balance':
        return {
          title: 'Add Balance',
          description: `Add balance for ${selectedUsers?.length} selected users`,
          icon: 'Plus',
          iconColor: 'text-success',
          confirmText: 'Add Balance',
          confirmVariant: 'default',
          requireAmount: true
        };
      case 'message':
        return {
          title: 'Send Message',
          description: `Send a message to ${selectedUsers?.length} selected users`,
          icon: 'MessageSquare',
          iconColor: 'text-primary',
          confirmText: 'Send Message',
          confirmVariant: 'default',
          requiresMessage: true
        };
      case 'export':
        return {
          title: 'Export Users',
          description: `Export data for ${selectedUsers?.length} selected users`,
          icon: 'Download',
          iconColor: 'text-primary',
          confirmText: 'Export Data',
          confirmVariant: 'default'
        };
      default:
        return {
          title: 'Bulk Action',
          description: 'Perform action on selected users',
          icon: 'Users',
          iconColor: 'text-primary',
          confirmText: 'Confirm',
          confirmVariant: 'default'
        };
    }
  };

  const config = getActionConfig();

  const handleConfirm = () => {
    if (!isValid()) return;
    if (action === 'add_balance') {
      onConfirm(action, reason, amount);
    } else if (action === 'upgrade_level') {
      onConfirm(action, reason, null, level);
    } else {
      onConfirm(action, reason);
    }
  };

  const isValid = () => {
    if (config?.requiresMessage && !message?.trim()) return false;
    if (config?.requiresReason && !reason?.trim()) return false;
    return true;
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="glass rounded-lg border border-border w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center`}>
                <Icon name={config?.icon} size={20} className={config?.iconColor} />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{config?.title}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-text-secondary">{config?.description}</p>

            {/* Selected Users Summary */}
            <div className="glass rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Users" size={16} className="text-text-secondary" />
                <span className="text-sm font-medium text-foreground">Selected Users</span>
              </div>
              <p className="text-sm text-text-secondary">
                {selectedUsers?.length} user{selectedUsers?.length !== 1 ? 's' : ''} selected for this action
              </p>
            </div>

            {/* Message Input */}
            {config?.requiresMessage && (
              <div>
                <Input
                  label="Message"
                  type="text"
                  placeholder="Enter your message..."
                  value={message}
                  onChange={(e) => setMessage(e?.target?.value)}
                  description="This message will be sent to all selected users"
                  required
                />
              </div>
            )}

            {/* Reason Input */}
            {config?.requiresReason && (
              <div>
                <Input
                  label="Reason for Suspension"
                  type="text"
                  placeholder="Enter reason for suspension..."
                  value={reason}
                  onChange={(e) => setReason(e?.target?.value)}
                  description="This reason will be recorded in the user's account"
                  required
                />
              </div>
            )}

            {/* Warning for destructive actions */}
            {action === 'suspend' && (
              <div className="flex items-start space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Warning</p>
                  <p className="text-sm text-destructive/80">
                    Suspended users will lose access to their accounts and cannot perform any actions until restored.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant={config?.confirmVariant}
              onClick={handleConfirm}
              disabled={!isValid()}
              iconName={config?.icon}
              iconPosition="left"
            >
              {config?.confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BulkActionModal;