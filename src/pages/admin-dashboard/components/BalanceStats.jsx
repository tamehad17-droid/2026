import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { notificationService } from '../../../services/notificationService';
import { adminService } from '../../../services/adminService';
import Icon from '../../../components/AppIcon';

const BalanceStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBalance: 0,
    userBalances: [],
    recentTransactions: []
  });

  const loadStats = async () => {
    try {
      setLoading(true);
      const [totalBalance, userBalances, transactions] = await Promise.all([
        notificationService.getTotalSystemBalance(),
        notificationService.getUserBalancesReport(),
        adminService.getRecentTransactions()
      ]);

      setStats({
        totalBalance,
        userBalances,
        recentTransactions: transactions
      });
    } catch (error) {
      console.error('Error loading balance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Subscribe to balance changes
    notificationService.subscribeToBalanceChanges(() => {
      loadStats(); // Reload stats when balance changes
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Format data for charts
  const chartData = stats.userBalances.slice(0, 10).map(item => ({
    name: item.user.username,
    balance: parseFloat(item.balance)
  }));

  return (
    <div className="space-y-6">
      {/* Total Balance Card */}
      <div className="glass p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-foreground">Total System Balance</h2>
            <p className="text-3xl font-bold text-primary mt-2">
              ${stats.totalBalance.toFixed(2)}
            </p>
          </div>
          <div className="p-4 rounded-full bg-primary/10">
            <Icon name="DollarSign" size={24} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Balance Distribution Chart */}
      <div className="glass p-6 rounded-xl">
        <h2 className="text-lg font-medium text-foreground mb-4">Top User Balances</h2>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]">
            <BarChart
              width={600}
              height={300}
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="balance" fill="#3b82f6" name="Balance ($)" />
            </BarChart>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass p-6 rounded-xl">
        <h2 className="text-lg font-medium text-foreground mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTransactions.map((tx, index) => (
                <tr
                  key={tx.id}
                  className={index !== stats.recentTransactions.length - 1 ? 'border-b border-border' : ''}
                >
                  <td className="py-3 px-4">{tx.user.username}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tx.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tx.type === 'credit' ? 'Credit' : 'Debit'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}>
                      {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BalanceStats;