import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

import Button from '../../components/ui/Button';
import BalanceCard from './components/BalanceCard';
import TransactionTable from './components/TransactionTable';
import FilterControls from './components/FilterControls';
import EarningsChart from './components/EarningsChart';
import QuickActions from './components/QuickActions';

const WalletOverview = () => {
  const { user } = useAuth();
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [walletData, setWalletData] = useState({ availableBalance: 0, pendingBalance: 0, totalEarnings: 0, usdtRate: 1, withdrawalFee: 0 });
  const [loading, setLoading] = useState(true);

  const mockTransactions = [];

  // Mock earnings chart data
  const earningsData = [
    { date: 'Oct 22', earnings: 12.50 },
    { date: 'Oct 23', earnings: 18.75 },
    { date: 'Oct 24', earnings: 15.30 },
    { date: 'Oct 25', earnings: 22.40 },
    { date: 'Oct 26', earnings: 19.85 },
    { date: 'Oct 27', earnings: 25.60 },
    { date: 'Oct 28', earnings: 21.30 },
    { date: 'Oct 29', earnings: 16.75 }
  ];

  // Mock income source data
  const sourceData = [
    { name: 'Task Rewards', value: 2847.30 },
    { name: 'Referral Bonuses', value: 892.15 },
    { name: 'Daily Rewards', value: 143.00 },
    { name: 'Signup Bonus', value: 10.00 }
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!user?.id) return;
        const [{ data: wallet }, { data: txs }] = await Promise.all([
          supabase.from('wallets').select('available_balance, pending_balance, total_earned').eq('user_id', user.id).single(),
          supabase.from('transactions').select('id, created_at, type, description, amount, status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100)
        ]);
        setWalletData({
          availableBalance: parseFloat(wallet?.available_balance || 0),
          pendingBalance: parseFloat(wallet?.pending_balance || 0),
          totalEarnings: parseFloat(wallet?.total_earned || 0),
          usdtRate: 1,
          withdrawalFee: 0
        });
        setFilteredTransactions((txs || []).map(t => ({
          id: t.id,
          date: t.created_at,
          type: t.type,
          description: t.description,
          amount: parseFloat(t.amount),
          status: t.status,
          reference: t.id
        })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    
    let filtered = [...mockTransactions];

    // Apply date filters
    if (filters?.dateFrom) {
      filtered = filtered?.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    }
    if (filters?.dateTo) {
      filtered = filtered?.filter(t => new Date(t.date) <= new Date(filters.dateTo));
    }

    // Apply type filter
    if (filters?.type) {
      filtered = filtered?.filter(t => t?.type === filters?.type);
    }

    // Apply status filter
    if (filters?.status) {
      filtered = filtered?.filter(t => t?.status === filters?.status);
    }

    // Apply amount filters
    if (filters?.minAmount) {
      filtered = filtered?.filter(t => Math.abs(t?.amount) >= parseFloat(filters?.minAmount));
    }
    if (filters?.maxAmount) {
      filtered = filtered?.filter(t => Math.abs(t?.amount) <= parseFloat(filters?.maxAmount));
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterReset = () => {
    setFilteredTransactions(mockTransactions);
    setActiveFilters({});
  };

  const handleExportTransactions = () => {
    // Mock export functionality
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Status', 'Reference'],
      ...filteredTransactions?.map(t => [
        new Date(t.date)?.toLocaleDateString(),
        t?.type?.replace('_', ' '),
        t?.description,
        t?.amount,
        t?.status,
        t?.reference
      ])
    ]?.map(row => row?.join(','))?.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL?.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-transactions-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
    a?.click();
    window.URL?.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-text-secondary">Loading wallet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Wallet Overview</h1>
              <p className="text-text-secondary mt-2">
                Manage your earnings, track transactions, and process withdrawals
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                iconName="RefreshCw"
                iconPosition="left"
                onClick={() => window.location?.reload()}
              >
                Refresh
              </Button>
              <Link to="/withdrawal-request">
                <Button
                  variant="default"
                  iconName="ArrowUpRight"
                  iconPosition="left"
                >
                  Withdraw Funds
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BalanceCard
                title="Available Balance"
                amount={walletData?.availableBalance}
                icon="Wallet"
                iconColor="text-success"
                bgGradient={true}
                description="Ready for withdrawal"
                trend={{ isPositive: true, percentage: 12.5 }}
                actionButton={
                  <Link to="/withdrawal-request">
                    <Button variant="secondary" size="sm" fullWidth>
                      Withdraw
                    </Button>
                  </Link>
                }
              />
              
              <BalanceCard
                title="Pending Balance"
                amount={walletData?.pendingBalance}
                icon="Clock"
                iconColor="text-warning"
                description="Awaiting verification"
                trend={{ isPositive: false, percentage: 3.2 }}
              />
              
              <BalanceCard
                title="Total Earnings"
                amount={walletData?.totalEarnings}
                icon="TrendingUp"
                iconColor="text-primary"
                description="Lifetime earnings"
                trend={{ isPositive: true, percentage: 8.7 }}
              />
            </div>

            {/* Earnings Chart */}
            <EarningsChart 
              earningsData={earningsData}
              sourceData={sourceData}
            />

            {/* Filter Controls */}
            <FilterControls
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
            />

            {/* Transaction Table */}
            <TransactionTable
              transactions={filteredTransactions}
              onExport={handleExportTransactions}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <QuickActions
              usdtRate={walletData?.usdtRate}
              withdrawalFee={walletData?.withdrawalFee}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletOverview;