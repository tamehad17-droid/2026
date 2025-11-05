import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  EyeOff,
  CreditCard,
  PiggyBank,
  DollarSign,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import { walletService } from '../../services/walletService';
import WalletCard from '../../components/ui/WalletCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

const WalletOverviewEnhanced = () => {
  const { user, profile } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [transactionFilter, setTransactionFilter] = useState('all');

  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const transactionTypes = [
    { value: 'all', label: 'All Transactions' },
    { value: 'deposit', label: 'Deposits' },
    { value: 'withdrawal', label: 'Withdrawals' },
    { value: 'reward', label: 'Task Rewards' },
    { value: 'referral', label: 'Referral Bonus' }
  ];

  useEffect(() => {
    loadWalletData();
  }, [user?.id, selectedPeriod]);

  const loadWalletData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [wallet, transactionHistory] = await Promise.all([
        walletService.getWalletBalance(user.id),
        walletService.getTransactionHistory(user.id, { period: selectedPeriod })
      ]);
      
      setWalletData(wallet);
      setTransactions(transactionHistory || []);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (transactionFilter === 'all') return true;
    return transaction.type === transactionFilter;
  });

  const calculateStats = () => {
    const totalDeposits = transactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawals = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalRewards = transactions
      .filter(t => t.type === 'reward' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingAmount = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalDeposits,
      totalWithdrawals,
      totalRewards,
      pendingAmount,
      netFlow: totalDeposits + totalRewards - totalWithdrawals
    };
  };

  const stats = calculateStats();

  const formatCurrency = (amount) => {
    if (!showBalance) return '****';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'reward':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'referral':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default:
        return <Wallet className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Wallet Overview - PromoHive</title>
        <meta name="description" content="Manage your wallet, view transactions and track earnings" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border-b border-border sticky top-0 z-40"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">💰</div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Wallet Overview</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your earnings and transactions
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Wallet Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <WalletCard
              title="Main Wallet"
              balance={walletData?.balance || 0}
              change={walletData?.changePercentage}
              changeType={walletData?.changeType}
              showBalance={showBalance}
              onToggleVisibility={() => setShowBalance(!showBalance)}
              onWithdraw={() => console.log('Withdraw')}
              onDeposit={() => console.log('Deposit')}
              transactions={transactions.slice(0, 3)}
              variant="premium"
            />
          </motion.div>

          {/* Statistics Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Deposits</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats.totalDeposits)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <ArrowDownLeft className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Withdrawals</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(stats.totalWithdrawals)}
                    </p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-full">
                    <ArrowUpRight className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Task Rewards</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(stats.totalRewards)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <DollarSign className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {formatCurrency(stats.pendingAmount)}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-full">
                    <Calendar className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex-col space-y-2">
                    <ArrowDownLeft className="h-6 w-6" />
                    <span>Deposit Funds</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <ArrowUpRight className="h-6 w-6" />
                    <span>Withdraw</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <CreditCard className="h-6 w-6" />
                    <span>Payment Methods</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Transaction History */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transaction History</CardTitle>
                  <div className="flex items-center space-x-3">
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      {periods.map(period => (
                        <option key={period.value} value={period.value}>
                          {period.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={transactionFilter}
                      onChange={(e) => setTransactionFilter(e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      {transactionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 animate-pulse">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                    <p className="text-muted-foreground">
                      {transactionFilter !== 'all' 
                        ? 'Try changing the filter to see more transactions.'
                        : 'Your transaction history will appear here.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {filteredTransactions.map((transaction, index) => (
                            <motion.tr
                              key={transaction.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-muted/50"
                            >
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-muted rounded-full">
                                    {getTransactionIcon(transaction.type)}
                                  </div>
                                  <span className="capitalize font-medium">
                                    {transaction.type}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{transaction.description}</p>
                                  {transaction.reference && (
                                    <p className="text-sm text-muted-foreground">
                                      Ref: {transaction.reference}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(transaction.created_at)}
                                </span>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(transaction.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`font-semibold ${
                                  transaction.type === 'withdrawal' 
                                    ? 'text-red-600' 
                                    : 'text-green-600'
                                }`}>
                                  {transaction.type === 'withdrawal' ? '-' : '+'}
                                  {formatCurrency(transaction.amount)}
                                </span>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default WalletOverviewEnhanced;
