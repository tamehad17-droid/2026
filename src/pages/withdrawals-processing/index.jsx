import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { adminService } from '../../services/adminService';
import { Checkbox } from '../../components/ui/Checkbox';
import Breadcrumb from '../../components/ui/Breadcrumb';
import WithdrawalCard from './components/WithdrawalCard';
import FilterControls from './components/FilterControls';
import BulkActions from './components/BulkActions';
import StatsOverview from './components/StatsOverview';
import USDTRateMonitor from './components/USDTRateMonitor';

const WithdrawalsProcessing = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [selectedWithdrawals, setSelectedWithdrawals] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    network: '',
    search: '',
    minAmount: '',
    maxAmount: '',
    fromDate: '',
    toDate: '',
    riskLevel: '',
    sortBy: 'newest'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for withdrawals
  const mockWithdrawals = [
    {
      id: 'WD001',
      user: {
        id: 'U001',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        status: 'APPROVED',
        totalWithdrawals: 12,
        successRate: 95
      },
      amount: 250.00,
      usdtAmount: 249.50,
      walletAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
      network: 'TRC20',
      status: 'PENDING',
      conversionRate: 1.002,
      processingFee: 2.50,
      riskScore: 'LOW',
      createdAt: '2024-10-29T10:30:00Z',
      transactionHash: null,
      processedBy: null,
      processedAt: null
    },
    {
      id: 'WD002',
      user: {
        id: 'U002',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        status: 'APPROVED',
        totalWithdrawals: 8,
        successRate: 100
      },
      amount: 500.00,
      usdtAmount: 498.75,
      walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590b4165',
      network: 'ERC20',
      status: 'PENDING',
      conversionRate: 1.0025,
      processingFee: 5.00,
      riskScore: 'MEDIUM',
      createdAt: '2024-10-29T09:15:00Z',
      transactionHash: null,
      processedBy: null,
      processedAt: null
    },
    {
      id: 'WD003',
      user: {
        id: 'U003',
        name: 'Emma Rodriguez',
        email: 'emma.rodriguez@email.com',
        status: 'APPROVED',
        totalWithdrawals: 25,
        successRate: 92
      },
      amount: 1000.00,
      usdtAmount: 997.50,
      walletAddress: '0x8ba1f109551bD432803012645Hac136c22C501e',
      network: 'BEP20',
      status: 'PROCESSING',
      conversionRate: 1.0025,
      processingFee: 10.00,
      riskScore: 'HIGH',
      createdAt: '2024-10-29T08:45:00Z',
      transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
      processedBy: 'Admin User',
      processedAt: '2024-10-29T11:30:00Z'
    },
    {
      id: 'WD004',
      user: {
        id: 'U004',
        name: 'David Kim',
        email: 'david.kim@email.com',
        status: 'APPROVED',
        totalWithdrawals: 5,
        successRate: 80
      },
      amount: 150.00,
      usdtAmount: 149.63,
      walletAddress: 'TLa2f6VPqDgRE31sNy5eGYtu3Sf2pXgLNR',
      network: 'TRC20',
      status: 'APPROVED',
      conversionRate: 1.0025,
      processingFee: 1.50,
      riskScore: 'LOW',
      createdAt: '2024-10-29T07:20:00Z',
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12',
      processedBy: 'Admin User',
      processedAt: '2024-10-29T10:45:00Z'
    },
    {
      id: 'WD005',
      user: {
        id: 'U005',
        name: 'Lisa Thompson',
        email: 'lisa.thompson@email.com',
        status: 'PENDING',
        totalWithdrawals: 2,
        successRate: 50
      },
      amount: 75.00,
      usdtAmount: 74.81,
      walletAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
      network: 'TRC20',
      status: 'REJECTED',
      conversionRate: 1.0025,
      processingFee: 1.00,
      riskScore: 'HIGH',
      createdAt: '2024-10-28T16:30:00Z',
      transactionHash: null,
      processedBy: 'Admin User',
      processedAt: '2024-10-29T09:15:00Z',
      rejectionReason: 'Invalid wallet address format'
    }
  ];

  // Mock stats
  const mockStats = {
    pending: 15,
    pendingAmount: 12450.75,
    processedToday: 28,
    successRate: 94.2,
    highRisk: 3,
    avgProcessingTime: 2.5
  };

  useEffect(() => {
    const loadWithdrawals = async () => {
      try {
        setIsLoading(true);
        const data = await adminService.getPendingWithdrawals();
        // adminService returns array of transactions joined with user_profiles
        // Normalize into the shape used by this page
        const normalized = (data || []).map((t) => ({
          id: t.id,
          user: {
            id: t.user_profiles?.id || t.user_id,
            name: t.user_profiles?.full_name || t.user_profiles?.email || 'User',
            email: t.user_profiles?.email || '',
            status: t.user_profiles?.status || 'approved',
            totalWithdrawals: t.user_profiles?.total_withdrawals || 0,
            successRate: t.user_profiles?.success_rate || 100
          },
          amount: parseFloat(t.amount) || 0,
          usdtAmount: parseFloat(t.amount) || 0,
          walletAddress: t.withdrawal_address || t.meta?.withdrawal_address || '',
          network: t.network || (t.meta && t.meta.network) || 'TRC20',
          status: (t.status || 'pending').toUpperCase(),
          conversionRate: t.meta?.conversionRate || 1,
          processingFee: t.meta?.fee || 0,
          riskScore: t.meta?.risk || 'LOW',
          createdAt: t.created_at || t.createdAt,
          transactionHash: t.tx_hash || t.transaction_hash || null,
          processedBy: t.processed_by || null,
          processedAt: t.processed_at || null,
          rejectionReason: t.admin_notes || t.rejection_reason || null
        }));

        setWithdrawals(normalized);
      } catch (err) {
        console.error('Failed to load withdrawals', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWithdrawals();
  }, []);

  // Filter and sort withdrawals
  const filteredWithdrawals = useMemo(() => {
    let filtered = [...withdrawals];

    // Apply filters
    if (filters?.status) {
      filtered = filtered?.filter(w => w?.status === filters?.status);
    }
    if (filters?.network) {
      filtered = filtered?.filter(w => w?.network === filters?.network);
    }
    if (filters?.search) {
      const search = filters?.search?.toLowerCase();
      filtered = filtered?.filter(w => 
        w?.user?.name?.toLowerCase()?.includes(search) ||
        w?.user?.email?.toLowerCase()?.includes(search)
      );
    }
    if (filters?.minAmount) {
      filtered = filtered?.filter(w => w?.amount >= parseFloat(filters?.minAmount));
    }
    if (filters?.maxAmount) {
      filtered = filtered?.filter(w => w?.amount <= parseFloat(filters?.maxAmount));
    }
    if (filters?.fromDate) {
      filtered = filtered?.filter(w => new Date(w.createdAt) >= new Date(filters.fromDate));
    }
    if (filters?.toDate) {
      filtered = filtered?.filter(w => new Date(w.createdAt) <= new Date(filters.toDate));
    }
    if (filters?.riskLevel) {
      filtered = filtered?.filter(w => w?.riskScore === filters?.riskLevel);
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case 'oldest':
        filtered?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'amount_high':
        filtered?.sort((a, b) => b?.amount - a?.amount);
        break;
      case 'amount_low':
        filtered?.sort((a, b) => a?.amount - b?.amount);
        break;
      case 'user_name':
        filtered?.sort((a, b) => a?.user?.name?.localeCompare(b?.user?.name));
        break;
      default: // newest
        filtered?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  }, [withdrawals, filters]);

  const handleSelectWithdrawal = (withdrawal, isSelected) => {
    if (isSelected) {
      setSelectedWithdrawals(prev => [...prev, withdrawal]);
    } else {
      setSelectedWithdrawals(prev => prev?.filter(w => w?.id !== withdrawal?.id));
    }
  };

  const handleSelectAll = () => {
    setSelectedWithdrawals(filteredWithdrawals);
  };

  const handleDeselectAll = () => {
    setSelectedWithdrawals([]);
  };

  const handleApprove = async (withdrawalId, transactionHash) => {
    try {
      // Call admin service to process withdrawal
      const result = await adminService.processWithdrawal(withdrawalId, 'approve', transactionHash || '');
      // Update local UI
      setWithdrawals(prev => prev?.map(w => w?.id === withdrawalId ? { ...w, status: 'APPROVED', transactionHash: result?.transaction_hash || transactionHash, processedBy: result?.processed_by || 'Admin', processedAt: result?.processed_at || new Date()?.toISOString() } : w));
      setSelectedWithdrawals(prev => prev?.filter(w => w?.id !== withdrawalId));
    } catch (err) {
      console.error('Approve withdrawal failed', err);
    }
  };

  const handleReject = async (withdrawalId, rejectionReason) => {
    try {
      const result = await adminService.processWithdrawal(withdrawalId, 'reject', rejectionReason || '');
      setWithdrawals(prev => prev?.map(w => w?.id === withdrawalId ? { ...w, status: 'REJECTED', rejectionReason, processedBy: result?.processed_by || 'Admin', processedAt: result?.processed_at || new Date()?.toISOString() } : w));
      setSelectedWithdrawals(prev => prev?.filter(w => w?.id !== withdrawalId));
    } catch (err) {
      console.error('Reject withdrawal failed', err);
    }
  };

  const handleHold = async (withdrawalId) => {
    try {
      const result = await adminService.processWithdrawal(withdrawalId, 'hold', 'Placed on hold by admin');
      setWithdrawals(prev => prev?.map(w => w?.id === withdrawalId ? { ...w, status: 'PROCESSING', processedBy: result?.processed_by || 'Admin', processedAt: result?.processed_at || new Date()?.toISOString() } : w));
      setSelectedWithdrawals(prev => prev?.filter(w => w?.id !== withdrawalId));
    } catch (err) {
      console.error('Hold withdrawal failed', err);
    }
  };

  const handleBulkApprove = async (withdrawalIds, transactionHash) => {
    try {
      await Promise.all(withdrawalIds.map(id => adminService.processWithdrawal(id, 'approve', transactionHash || '')));
      setWithdrawals(prev => prev?.map(w => withdrawalIds?.includes(w?.id) ? { ...w, status: 'APPROVED', transactionHash: `${transactionHash || 'tx'}_${w?.id}`, processedBy: 'Admin', processedAt: new Date()?.toISOString() } : w));
      setSelectedWithdrawals([]);
    } catch (err) {
      console.error('Bulk approve failed', err);
    }
  };

  const handleBulkReject = async (withdrawalIds, rejectionReason) => {
    try {
      await Promise.all(withdrawalIds.map(id => adminService.processWithdrawal(id, 'reject', rejectionReason || '')));
      setWithdrawals(prev => prev?.map(w => withdrawalIds?.includes(w?.id) ? { ...w, status: 'REJECTED', rejectionReason, processedBy: 'Admin', processedAt: new Date()?.toISOString() } : w));
      setSelectedWithdrawals([]);
    } catch (err) {
      console.error('Bulk reject failed', err);
    }
  };

  const handleBulkHold = async (withdrawalIds) => {
    try {
      await Promise.all(withdrawalIds.map(id => adminService.processWithdrawal(id, 'hold', 'Placed on hold by admin')));
      setWithdrawals(prev => prev?.map(w => withdrawalIds?.includes(w?.id) ? { ...w, status: 'PROCESSING', processedBy: 'Admin', processedAt: new Date()?.toISOString() } : w));
      setSelectedWithdrawals([]);
    } catch (err) {
      console.error('Bulk hold failed', err);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      network: '',
      search: '',
      minAmount: '',
      maxAmount: '',
      fromDate: '',
      toDate: '',
      riskLevel: '',
      sortBy: 'newest'
    });
  };

  const isAllSelected = selectedWithdrawals?.length === filteredWithdrawals?.length && filteredWithdrawals?.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Withdrawals Processing - PromoHive Admin</title>
          <meta name="description" content="Process and manage user withdrawal requests" />
        </Helmet>
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading withdrawal requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Withdrawals Processing - PromoHive Admin</title>
        <meta name="description" content="Process and manage user withdrawal requests with comprehensive transaction management" />
      </Helmet>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Breadcrumb />
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
                <Icon name="CreditCard" size={32} />
                <span>Withdrawals Processing</span>
              </h1>
              <p className="text-text-secondary mt-2">
                Review, approve, and process user withdrawal requests with comprehensive transaction management
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                iconName="Download"
                onClick={() => {
                  // Export functionality
                  console.log('Exporting withdrawal data...');
                }}
              >
                Export Data
              </Button>
              <Button
                variant="default"
                iconName="RefreshCw"
                onClick={() => window.location?.reload()}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={mockStats} />

        {/* USDT Rate Monitor */}
        <USDTRateMonitor />

        {/* Filter Controls */}
        <FilterControls
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={handleClearFilters}
          totalWithdrawals={withdrawals?.length}
          filteredCount={filteredWithdrawals?.length}
        />

        {/* Bulk Actions */}
        <BulkActions
          selectedWithdrawals={selectedWithdrawals}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onBulkApprove={handleBulkApprove}
          onBulkReject={handleBulkReject}
          onBulkHold={handleBulkHold}
          totalWithdrawals={filteredWithdrawals?.length}
          isAllSelected={isAllSelected}
        />

        {/* Withdrawals List */}
        <div className="space-y-4">
          {filteredWithdrawals?.length === 0 ? (
            <div className="glass rounded-lg border border-border p-12 text-center">
              <Icon name="Search" size={48} className="text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Withdrawals Found</h3>
              <p className="text-text-secondary">
                {Object.values(filters)?.some(v => v) 
                  ? 'Try adjusting your filters to see more results.' :'No withdrawal requests match your current criteria.'
                }
              </p>
            </div>
          ) : (
            filteredWithdrawals?.map((withdrawal) => (
              <div key={withdrawal?.id} className="relative">
                <div className="absolute left-4 top-6 z-10">
                  <Checkbox
                    checked={selectedWithdrawals?.some(w => w?.id === withdrawal?.id)}
                    onChange={(e) => handleSelectWithdrawal(withdrawal, e?.target?.checked)}
                  />
                </div>
                <div className="ml-12">
                  <WithdrawalCard
                    withdrawal={withdrawal}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onHold={handleHold}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredWithdrawals?.length > 10 && (
          <div className="flex items-center justify-between mt-8 glass rounded-lg border border-border p-4">
            <div className="text-sm text-text-secondary">
              Showing {Math.min(10, filteredWithdrawals?.length)} of {filteredWithdrawals?.length} withdrawals
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <Icon name="ChevronLeft" size={16} />
              </Button>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded text-sm">1</span>
              <Button variant="outline" size="sm" disabled>
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalsProcessing;