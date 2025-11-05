import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { adminService } from '../../../services/adminService';
import { walletService } from '../../../services/walletService';
import { Checkbox } from '../../../components/ui/Checkbox';

const UserDetailModal = ({ user, isOpen, onClose, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [overrideEnabled, setOverrideEnabled] = useState(!!user?.admin_withdrawal_override);
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [overrideLoading, setOverrideLoading] = useState(false);

  useEffect(() => {
    setOverrideEnabled(!!user?.admin_withdrawal_override);
  }, [user?.admin_withdrawal_override, user?.id]);

  useEffect(() => {
    const loadWallet = async () => {
      if (!user?.id) return;
      setWalletLoading(true);
      const { wallet: w } = await walletService.getWallet(user?.id);
      setWallet(w || null);
      setWalletLoading(false);
    };
    loadWallet();
  }, [user?.id, isOpen]);

  if (!isOpen || !user) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'upgrade', label: 'Upgrade & Balance', icon: 'TrendingUp' },
    { id: 'referrals', label: 'Referrals', icon: 'Users' },
    { id: 'transactions', label: 'Transactions', icon: 'CreditCard' },
    { id: 'proofs', label: 'Proofs', icon: 'FileText' },
    { id: 'notes', label: 'Admin Notes', icon: 'StickyNote' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-warning/10 text-warning border-warning/20', icon: 'Clock' },
      approved: { color: 'bg-success/10 text-success border-success/20', icon: 'CheckCircle' },
      suspended: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: 'XCircle' }
    };

    const config = statusConfig?.[status] || statusConfig?.pending;
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })?.format(amount);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: user?.name,
      email: user?.email,
      status: user?.status,
      balance: user?.balance
    });
  };

  const handleSave = () => {
    onUserUpdate(user?.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="glass rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground">Basic Information</h4>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleEdit} iconName="Edit">
              Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {isEditing ? (
              <Input
                label="Full Name"
                value={editData?.name}
                onChange={(e) => setEditData({...editData, name: e?.target?.value})}
              />
            ) : (
              <div>
                <label className="text-sm font-medium text-text-secondary">Full Name</label>
                <div className="text-foreground">{user?.name}</div>
              </div>
            )}
            
            {isEditing ? (
              <Input
                label="Email Address"
                type="email"
                value={editData?.email}
                onChange={(e) => setEditData({...editData, email: e?.target?.value})}
              />
            ) : (
              <div>
                <label className="text-sm font-medium text-text-secondary">Email Address</label>
                <div className="text-foreground">{user?.email}</div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-text-secondary">Referral Code</label>
              <div className="text-foreground font-data">{user?.referralCode}</div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-secondary">Registration Date</label>
              <div className="text-foreground">{formatDate(user?.registrationDate)}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary">Status</label>
              <div className="mt-1">
                {getStatusBadge(user?.status)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-secondary">Country</label>
              <p className="text-foreground flex items-center space-x-2">
                <Icon name="MapPin" size={16} />
                <span>{user?.country}</span>
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-secondary">Last Activity</label>
              <p className="text-foreground">{formatDate(user?.lastActivity)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-secondary">Online Status</label>
              <p className="text-foreground flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${user?.isOnline ? 'bg-success' : 'bg-text-secondary'}`}></div>
                <span>{user?.isOnline ? 'Online' : 'Offline'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="glass rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Financial Overview</h4>
        {/* Admin-only withdrawal override */}
        <div className="mb-6 p-4 rounded-lg border border-border bg-muted/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Checkbox
                checked={overrideEnabled}
                onChange={async (e) => {
                  const next = e?.target?.checked;
                  setOverrideEnabled(next);
                  setOverrideLoading(true);
                  try {
                    const result = await adminService.setWithdrawalOverride(user?.id, next);
                    if (!result?.success) {
                      throw new Error(result?.error || 'Failed to update override');
                    }
                    onUserUpdate && onUserUpdate(user?.id, { admin_withdrawal_override: next });
                  } catch (err) {
                    setOverrideEnabled(!next);
                    alert('❌ Failed to update Withdrawal Override: ' + (err?.message || 'Unknown error'));
                  } finally {
                    setOverrideLoading(false);
                  }
                }}
                label="Withdrawal Override (admin)"
                description="Bypass Level 0 withdrawal limitations for this user"
                disabled={overrideLoading}
              />
              <p className="text-xs text-text-secondary mt-2">
                When enabled, the user can withdraw without inviting a Level 1 referral or upgrading.
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 glass rounded-lg">
            <Icon name="Wallet" size={24} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-text-secondary">Current Balance</p>
            <p className="text-xl font-bold text-foreground font-data">{formatCurrency(user?.balance)}</p>
          </div>
          
          <div className="text-center p-4 glass rounded-lg">
            <Icon name="TrendingUp" size={24} className="text-success mx-auto mb-2" />
            <p className="text-sm text-text-secondary">Total Earnings</p>
            <p className="text-xl font-bold text-foreground font-data">{formatCurrency(user?.totalEarnings)}</p>
          </div>
          
          <div className="text-center p-4 glass rounded-lg">
            <Icon name="Users" size={24} className="text-secondary mx-auto mb-2" />
            <p className="text-sm text-text-secondary">Referral Earnings</p>
            <p className="text-xl font-bold text-foreground font-data">{formatCurrency(user?.referralEarnings)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReferralsTab = () => (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Referral Network</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-text-secondary mb-2">Total Referrals</p>
            <p className="text-2xl font-bold text-foreground">{user?.referrals}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-2">Active Referrals</p>
            <p className="text-2xl font-bold text-success">{user?.activeReferrals}</p>
          </div>
        </div>
      </div>
      
      <div className="glass rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Recent Referrals</h4>
        <div className="space-y-3">
          {user?.recentReferrals?.map((referral, index) => (
            <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {referral?.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{referral?.name}</p>
                  <p className="text-xs text-text-secondary">{formatDate(referral?.joinDate)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-data text-success">{formatCurrency(referral?.earnings)}</p>
                <p className="text-xs text-text-secondary">Earned</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUpgradeTab = () => (
    <div className="space-y-6">
      {/* Current Level & Balance */}
      <div className="glass rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Current Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 glass rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Current Level</p>
                <p className="text-2xl font-bold text-foreground">{user?.level || 1}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const level = prompt('Enter new level (number):\nNote: Upgrade will cost user $10 per level', user?.level?.toString() || '1');
                  if (!level) return;
                  const lvl = parseInt(level, 10);
                  if (Number.isNaN(lvl) || lvl < 1) { alert('Invalid level'); return; }
                  
                  if (lvl < user?.level) {
                    if (!confirm('Are you sure you want to downgrade this user?')) return;
                  }

                  try {
                    const note = prompt('Enter a note about level change (optional):', '');
                    const result = await adminService.updateUserLevel(user?.id, user?.id, lvl, note || undefined);
                    if (result.success) {
                      alert('✅ ' + result.message);
                      onUserUpdate(user?.id, { level: lvl });
                    } else {
                      throw new Error(result.error);
                    }
                  } catch (err) {
                    alert('❌ Failed to update level: ' + err.message);
                  }
                }}
              >
                <Icon name="ArrowUp" size={16} className="mr-1" />
                Change Level
              </Button>
            </div>
            <div className="mt-2 text-xs text-text-secondary">
              Level benefits and permissions will be updated automatically
            </div>
          </div>

          <div className="p-4 glass rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Current Balance</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(wallet?.available_balance || 0)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const amount = prompt('Enter amount (use - for deduction):', '10');
                  if (!amount) return;
                  const amt = parseFloat(amount);
                  if (Number.isNaN(amt)) { alert('Invalid amount'); return; }
                  try {
                    const res = await adminService.updateUserBalance(user?.id, amt, 'admin_adjustment');
                    if (!res?.success) throw new Error(res?.error || 'Failed to update balance');
                    // refresh wallet state from DB to ensure accuracy
                    const { wallet: w } = await walletService.getWallet(user?.id);
                    setWallet(w || null);
                    alert('✅ Balance updated successfully');
                    // reflect in parent only as derived display field if needed
                    onUserUpdate && onUserUpdate(user?.id, { balance: w?.available_balance });
                  } catch (err) {
                    alert('❌ Failed to update balance: ' + err.message);
                  }
                }}
              >
                <Icon name="CreditCard" size={16} className="mr-1" />
                Adjust Balance
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={async () => {
                  const target = prompt('Set exact balance (absolute value):', (wallet?.available_balance || 0)?.toString());
                  if (target === null || target === undefined) return;
                  const desired = parseFloat(target);
                  if (Number.isNaN(desired) || desired < 0) { alert('Invalid balance amount'); return; }
                  try {
                    // compute diff and apply via updateUserBalance
                    const current = parseFloat(wallet?.available_balance || 0);
                    const diff = desired - current;
                    if (Math.abs(diff) < 0.000001) { alert('No change needed'); return; }
                    const res = await adminService.updateUserBalance(user?.id, diff, 'admin_set_balance');
                    if (!res?.success) throw new Error(res?.error || 'Failed to set balance');
                    const { wallet: w } = await walletService.getWallet(user?.id);
                    setWallet(w || null);
                    alert('✅ Balance set successfully');
                    onUserUpdate && onUserUpdate(user?.id, { balance: w?.available_balance });
                  } catch (err) {
                    alert('❌ Failed to set balance: ' + (err?.message || 'Unknown error'));
                  }
                }}
                className="ml-2"
              >
                <Icon name="CheckCircle" size={16} className="mr-1" />
                Set Balance
              </Button>
            </div>
            <div className="mt-2 text-xs text-text-secondary">
              Manual balance adjustments will be logged in transactions
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade History */}
      <div className="glass rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Upgrade History</h4>
        <div className="space-y-3">
          {user?.upgradeHistory?.map((upgrade, index) => (
            <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Icon name="ArrowUp" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Level {upgrade?.fromLevel} → Level {upgrade?.toLevel}
                  </p>
                  <p className="text-xs text-text-secondary">{formatDate(upgrade?.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-text-secondary">
                  By: {upgrade?.adminName || 'System'}
                </p>
                {upgrade?.note && (
                  <p className="text-xs text-text-secondary">{upgrade?.note}</p>
                )}
              </div>
            </div>
          ))}
          {(!user?.upgradeHistory || user?.upgradeHistory?.length === 0) && (
            <div className="text-center py-6 text-text-secondary">
              No upgrade history available
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTransactionsTab = () => (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h4>
        <div className="space-y-3">
          {user?.recentTransactions?.map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  transaction?.type === 'credit' ? 'bg-success/20' : 'bg-destructive/20'
                }`}>
                  <Icon 
                    name={transaction?.type === 'credit' ? 'Plus' : 'Minus'} 
                    size={16} 
                    className={transaction?.type === 'credit' ? 'text-success' : 'text-destructive'}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{transaction?.description}</p>
                  <p className="text-xs text-text-secondary">{formatDate(transaction?.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-data ${
                  transaction?.type === 'credit' ? 'text-success' : 'text-destructive'
                }`}>
                  {transaction?.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction?.amount))}
                </p>
                <p className="text-xs text-text-secondary capitalize">{transaction?.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 glass rounded-lg border border-border z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
              <Image
                src={user?.avatar}
                alt={user?.avatarAlt}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-text-secondary">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={24} />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab?.id
                  ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-foreground'
              }`}
            >
              <Icon name={tab?.icon} size={16} />
              <span>{tab?.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'upgrade' && renderUpgradeTab()}
          {activeTab === 'referrals' && renderReferralsTab()}
          {activeTab === 'transactions' && renderTransactionsTab()}
          {activeTab === 'proofs' && (
            <div className="text-center py-12">
              <Icon name="FileText" size={48} className="text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">Proof submissions will be displayed here.</p>
            </div>
          )}
          {activeTab === 'notes' && (
            <div className="text-center py-12">
              <Icon name="StickyNote" size={48} className="text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">Admin notes will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDetailModal;