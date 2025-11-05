import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const AccountTab = ({ user, onAccountAction }) => {
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const accountStats = {
    memberSince: '2024-03-15',
    totalEarnings: 1250.75,
    tasksCompleted: 156,
    referrals: 23,
    lastLogin: '2025-10-29T22:02:17.916Z'
  };

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true);
    
    // Simulate API call
    setTimeout(() => {
      onAccountAction('deactivate');
      setIsDeactivating(false);
    }, 2000);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE' || !agreedToTerms) return;
    
    setIsDeleting(true);
    
    // Simulate API call
    setTimeout(() => {
      onAccountAction('delete');
      setIsDeleting(false);
    }, 3000);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    
    // Simulate data export
    setTimeout(() => {
      // Create mock data export
      const exportData = {
        profile: user,
        stats: accountStats,
        exportDate: new Date()?.toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'promohive-account-data.json';
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);
      
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString)?.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Account Overview */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Account Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <Icon name="Calendar" size={24} className="text-primary mx-auto mb-2" />
            <div className="text-sm text-text-secondary mb-1">Member Since</div>
            <div className="font-semibold text-foreground">{formatDate(accountStats?.memberSince)}</div>
          </div>
          
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <Icon name="DollarSign" size={24} className="text-success mx-auto mb-2" />
            <div className="text-sm text-text-secondary mb-1">Total Earnings</div>
            <div className="font-semibold text-success">${accountStats?.totalEarnings?.toFixed(2)}</div>
          </div>
          
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <Icon name="CheckSquare" size={24} className="text-accent mx-auto mb-2" />
            <div className="text-sm text-text-secondary mb-1">Tasks Completed</div>
            <div className="font-semibold text-foreground">{accountStats?.tasksCompleted}</div>
          </div>
          
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <Icon name="Users" size={24} className="text-secondary mx-auto mb-2" />
            <div className="text-sm text-text-secondary mb-1">Referrals</div>
            <div className="font-semibold text-foreground">{accountStats?.referrals}</div>
          </div>
          
          <div className="text-center p-4 bg-muted/20 rounded-lg md:col-span-2 lg:col-span-2">
            <Icon name="Clock" size={24} className="text-warning mx-auto mb-2" />
            <div className="text-sm text-text-secondary mb-1">Last Login</div>
            <div className="font-semibold text-foreground">{formatDateTime(accountStats?.lastLogin)}</div>
          </div>
        </div>
      </div>
      {/* Data Export */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Data Export</h3>
        <p className="text-sm text-text-secondary mb-6">
          Download a copy of your account data including profile information, earnings history, and task records.
        </p>
        
        <div className="flex items-center space-x-4 p-4 bg-primary/10 border border-primary/20 rounded-lg mb-6">
          <Icon name="Download" size={20} className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">Export Your Data</p>
            <p className="text-xs text-primary/80">
              Includes profile, earnings, tasks, and referral data in JSON format
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={handleExportData}
          loading={isExporting}
          iconName="Download"
          iconPosition="left"
        >
          Export Account Data
        </Button>
      </div>
      {/* Account Deactivation */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Account Deactivation</h3>
        <p className="text-sm text-text-secondary mb-6">
          Temporarily deactivate your account. You can reactivate it anytime by logging in.
        </p>
        
        <div className="flex items-start space-x-4 p-4 bg-warning/10 border border-warning/20 rounded-lg mb-6">
          <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning mb-2">What happens when you deactivate:</p>
            <ul className="text-xs text-warning/80 space-y-1">
              <li>• Your profile will be hidden from other users</li>
              <li>• You won't receive new task notifications</li>
              <li>• Your earnings and data remain safe</li>
              <li>• You can reactivate anytime by logging in</li>
            </ul>
          </div>
        </div>
        
        <Button
          variant="warning"
          onClick={handleDeactivateAccount}
          loading={isDeactivating}
          iconName="Pause"
          iconPosition="left"
        >
          Deactivate Account
        </Button>
      </div>
      {/* Account Deletion */}
      <div className="glass rounded-xl p-6 border-destructive/20">
        <h3 className="text-lg font-semibold text-destructive mb-4">Delete Account</h3>
        <p className="text-sm text-text-secondary mb-6">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        
        <div className="flex items-start space-x-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-6">
          <Icon name="AlertTriangle" size={20} className="text-destructive mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive mb-2">This will permanently:</p>
            <ul className="text-xs text-destructive/80 space-y-1">
              <li>• Delete your profile and account data</li>
              <li>• Remove all task history and earnings records</li>
              <li>• Cancel any pending withdrawals</li>
              <li>• Disable your referral links</li>
              <li>• This action cannot be reversed</li>
            </ul>
          </div>
        </div>
        
        {!showDeleteConfirm ? (
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            iconName="Trash2"
            iconPosition="left"
          >
            Delete Account
          </Button>
        ) : (
          <div className="space-y-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <p className="text-sm font-medium text-destructive">
              Are you absolutely sure? This action cannot be undone.
            </p>
            
            <Input
              label="Type 'DELETE' to confirm"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e?.target?.value)}
              placeholder="DELETE"
              error={deleteConfirmation && deleteConfirmation !== 'DELETE' ? 'Please type DELETE exactly' : ''}
            />
            
            <Checkbox
              label="I understand that this action is permanent and cannot be undone"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e?.target?.checked)}
            />
            
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmation('');
                  setAgreedToTerms(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                loading={isDeleting}
                disabled={deleteConfirmation !== 'DELETE' || !agreedToTerms}
                iconName="Trash2"
                iconPosition="left"
              >
                Permanently Delete Account
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Support Information */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Need Help?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-4 bg-muted/20 rounded-lg">
            <Icon name="MessageCircle" size={20} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Contact Support</p>
              <p className="text-xs text-text-secondary">Get help with account issues</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-muted/20 rounded-lg">
            <Icon name="FileText" size={20} className="text-accent mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Privacy Policy</p>
              <p className="text-xs text-text-secondary">Learn about data handling</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-muted/20 rounded-lg">
            <Icon name="Shield" size={20} className="text-success mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Terms of Service</p>
              <p className="text-xs text-text-secondary">Review platform terms</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-muted/20 rounded-lg">
            <Icon name="HelpCircle" size={20} className="text-secondary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">FAQ</p>
              <p className="text-xs text-text-secondary">Common questions answered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTab;