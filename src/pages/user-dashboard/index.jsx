import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import BalanceCard from './components/BalanceCard';
import TaskProgressCard from './components/TaskProgressCard';
import RecentTransactions from './components/RecentTransactions';
import NotificationPanel from './components/NotificationPanel';
import QuickActions from './components/QuickActions';
import DailySpinWidget from './components/DailySpinWidget';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { walletService } from '../../services/walletService';
import { taskService } from '../../services/taskService';

const UserDashboard = () => {
  const { user, profile, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState({ current: 0, pending: 0, lifetime: 0 });
  const [taskStats, setTaskStats] = useState({ availableTasks: 0, completedTasks: 0, pendingProofs: 0 });
  const [transactions, setTransactions] = useState([]);
  const [tasksPreview, setTasksPreview] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        // Wallet (use wallets table to reflect real-time balance)
        const { wallet } = await walletService.getWallet(user.id);
        setBalances({
          current: wallet?.available_balance || 0,
          pending: wallet?.pending_balance || 0,
          lifetime: wallet?.total_earned || 0
        });

        // Transactions (last 10)
        const { data: tx } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
        setTransactions(tx || []);

        // Tasks
        const { tasks } = await taskService.getTasksForUser(user.id, {});
        setTasksPreview((tasks || []).slice(0, 4));
        // Submissions count
        const { submissions } = await taskService.getUserSubmissions(user.id);
        setTaskStats({
          availableTasks: tasks?.length || 0,
          completedTasks: (submissions || []).filter(s => s.status === 'approved').length,
          pendingProofs: (submissions || []).filter(s => s.status === 'pending').length
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const balanceChanges = { current: null, pending: null, lifetime: null };

  return (
    <>
      <Helmet>
        <title>Dashboard - PromoHive</title>
        <meta name="description" content="View your earnings, task progress, and account activity on PromoHive dashboard" />
      </Helmet>
      
      {/* Admin Quick Access Button - Floating */}
      {isAdmin() && (
        <Link
          to="/admin-dashboard"
          className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-full shadow-2xl hover:scale-105 transition-transform duration-200 animate-pulse"
          title="Go to Admin Dashboard"
        >
          <Icon name="Shield" size={20} />
          <span className="font-semibold">Admin Panel</span>
        </Link>
      )}
      
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Welcome Back to PromoHive
            </h1>
            <p className="text-text-secondary">
              Track your earnings, complete tasks, and grow your income
            </p>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BalanceCard
              title="Current Balance"
              amount={balances?.current}
              icon="Wallet"
              gradient={true}
              change={balanceChanges?.current}
              loading={loading}
            />
            <BalanceCard
              title="Pending Earnings"
              amount={balances?.pending}
              icon="Clock"
              change={balanceChanges?.pending}
              loading={loading}
            />
            <BalanceCard
              title="Lifetime Earnings"
              amount={balances?.lifetime}
              icon="TrendingUp"
              change={balanceChanges?.lifetime}
              loading={loading}
            />
          </div>

          {/* Task Progress and Daily Spin */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TaskProgressCard 
                stats={taskStats} 
                loading={loading} 
              />
            </div>
            <div>
              <DailySpinWidget 
                spinData={null} // No spin data in this version
                loading={loading} 
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recommended Tasks</h3>
              <Link to="/tasks-list" className="text-primary hover:underline flex items-center gap-1">
                Browse Tasks <Icon name="ArrowRight" size={16} />
              </Link>
            </div>
            {tasksPreview.length === 0 ? (
              <p className="text-text-secondary">No tasks available yet. Check back soon.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasksPreview.map(t => (
                  <li key={t.id} className="p-3 rounded-lg border border-border">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-sm text-text-secondary">${t.reward_amount}</div>
                    <Link to={`/task-details?id=${t.id}`} className="text-primary text-sm mt-1 inline-flex items-center gap-1">Start <Icon name="Play" size={14} /></Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTransactions 
              transactions={transactions} 
              loading={loading} 
            />
            <div className="glass rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold mb-2">Upgrade your account</h3>
              <p className="text-text-secondary mb-4">Unlock higher rewards by upgrading to Level 1.</p>
              <Link to="/level-upgrade" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white">
                <Icon name="TrendingUp" size={18} /> View Upgrade Options
              </Link>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="glass rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Account Summary</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {loading ? '...' : taskStats?.completedTasks}
                </p>
                <p className="text-sm text-text-secondary">Tasks Completed</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {loading ? '...' : `$${(balances?.lifetime || 0)?.toFixed(0)}`}
                </p>
                <p className="text-sm text-text-secondary">Total Earned</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">
                  {loading ? '...' : Math.floor(balances?.lifetime / 50)}
                </p>
                <p className="text-sm text-text-secondary">Referrals</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">
                  {loading ? '...' : Math.floor(balances?.lifetime / 100)}
                </p>
                <p className="text-sm text-text-secondary">Withdrawals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;