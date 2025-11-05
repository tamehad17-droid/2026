import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  DollarSign, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  CheckCircle, 
  BarChart3,
  Wallet,
  Users,
  Calendar,
  Download
} from 'lucide-react';
import { adRevenueService } from '../../../services/adRevenueService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const AdminAdRevenue = () => {
  const [revenueStats, setRevenueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    loadRevenueStats();
  }, [selectedPeriod]);

  const loadRevenueStats = async () => {
    setLoading(true);
    try {
      const { success, stats } = await adRevenueService.getAdminRevenueOverview(selectedPeriod);
      if (success) {
        setRevenueStats(stats);
      }
    } catch (error) {
      console.error('Error loading revenue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const periodOptions = [
    { value: '7d', label: '7 أيام' },
    { value: '30d', label: '30 يوم' },
    { value: '90d', label: '90 يوم' }
  ];

  const COLORS = ['#00d4ff', '#ff0080', '#00ff88', '#ffaa00'];

  const platformData = revenueStats ? [
    {
      name: 'AdSterra',
      adminRevenue: revenueStats.byPlatform.adsterra.baseRevenue - revenueStats.byPlatform.adsterra.userEarnings,
      userEarnings: revenueStats.byPlatform.adsterra.userEarnings,
      views: revenueStats.byPlatform.adsterra.views
    },
    {
      name: 'AdGem',
      adminRevenue: revenueStats.byPlatform.adgem.baseRevenue - revenueStats.byPlatform.adgem.userEarnings,
      userEarnings: revenueStats.byPlatform.adgem.userEarnings,
      completions: revenueStats.byPlatform.adgem.completions
    }
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>إدارة عوائد الإعلانات - Admin Panel</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">إدارة عوائد الإعلانات</h1>
                <p className="text-gray-400">مراقبة وإدارة أرباح AdSterra و AdGem</p>
              </div>
            </div>

            {/* Period Selector */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-1 border border-white/20">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedPeriod(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedPeriod === option.value
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Stats */}
          {revenueStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">إجمالي العوائد</p>
                    <p className="text-2xl font-bold text-white">${revenueStats.totalBaseRevenue.toFixed(2)}</p>
                    <p className="text-xs text-green-400">+{revenueStats.adminShare.toFixed(1)}% للإدارة</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">أرباح المستخدمين</p>
                    <p className="text-2xl font-bold text-white">${revenueStats.totalUserEarnings.toFixed(2)}</p>
                    <p className="text-xs text-blue-400">تم توزيعها</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">أرباح الإدارة</p>
                    <p className="text-2xl font-bold text-white">${revenueStats.adminRevenue.toFixed(2)}</p>
                    <p className="text-xs text-purple-400">صافي الربح</p>
                  </div>
                  <Wallet className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">إجمالي النشاط</p>
                    <p className="text-2xl font-bold text-white">
                      {revenueStats.totalViews + revenueStats.totalCompletions}
                    </p>
                    <p className="text-xs text-yellow-400">مشاهدات وإكمالات</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </div>
          )}

          {/* Platform Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AdSterra Stats */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AS</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AdSterra</h3>
                    <p className="text-sm text-gray-400">إعلانات البانر والفيديو</p>
                  </div>
                </div>
              </div>

              {revenueStats && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">إجمالي العوائد:</span>
                    <span className="text-white font-bold">${revenueStats.byPlatform.adsterra.baseRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">أرباح المستخدمين:</span>
                    <span className="text-blue-400 font-bold">${revenueStats.byPlatform.adsterra.userEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">أرباح الإدارة:</span>
                    <span className="text-green-400 font-bold">
                      ${(revenueStats.byPlatform.adsterra.baseRevenue - revenueStats.byPlatform.adsterra.userEarnings).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">المشاهدات:</span>
                    <span className="text-white font-bold">{revenueStats.byPlatform.adsterra.views}</span>
                  </div>
                </div>
              )}
            </div>

            {/* AdGem Stats */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AG</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AdGem</h3>
                    <p className="text-sm text-gray-400">العروض والألعاب</p>
                  </div>
                </div>
              </div>

              {revenueStats && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">إجمالي العوائد:</span>
                    <span className="text-white font-bold">${revenueStats.byPlatform.adgem.baseRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">أرباح المستخدمين:</span>
                    <span className="text-blue-400 font-bold">${revenueStats.byPlatform.adgem.userEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">أرباح الإدارة:</span>
                    <span className="text-green-400 font-bold">
                      ${(revenueStats.byPlatform.adgem.baseRevenue - revenueStats.byPlatform.adgem.userEarnings).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">العروض المكتملة:</span>
                    <span className="text-white font-bold">{revenueStats.byPlatform.adgem.completions}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Charts */}
          {revenueStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Revenue Chart */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6">العوائد اليومية</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueStats.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="baseRevenue" 
                      stroke="#00d4ff" 
                      strokeWidth={2}
                      name="إجمالي العوائد"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="userEarnings" 
                      stroke="#ff0080" 
                      strokeWidth={2}
                      name="أرباح المستخدمين"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* User Level Distribution */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6">توزيع الأرباح حسب المستوى</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueStats.userLevelStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="level" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="userEarnings" fill="#00d4ff" name="أرباح المستخدمين" />
                    <Bar dataKey="baseRevenue" fill="#ff0080" name="إجمالي العوائد" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Admin Wallets */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Wallet className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-white">محافظ الإدارة</h3>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors">
                <Download className="w-4 h-4 mr-2 inline" />
                تصدير التقرير
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AdSterra Wallet */}
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AS</span>
                    </div>
                    <span className="text-white font-semibold">محفظة AdSterra</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      ${revenueStats ? (revenueStats.byPlatform.adsterra.baseRevenue - revenueStats.byPlatform.adsterra.userEarnings).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-xs text-blue-300">أرباح الإدارة</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">إجمالي العوائد:</span>
                    <span className="text-white">${revenueStats ? revenueStats.byPlatform.adsterra.baseRevenue.toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">تم توزيعه:</span>
                    <span className="text-blue-300">${revenueStats ? revenueStats.byPlatform.adsterra.userEarnings.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* AdGem Wallet */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AG</span>
                    </div>
                    <span className="text-white font-semibold">محفظة AdGem</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      ${revenueStats ? (revenueStats.byPlatform.adgem.baseRevenue - revenueStats.byPlatform.adgem.userEarnings).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-xs text-purple-300">أرباح الإدارة</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">إجمالي العوائد:</span>
                    <span className="text-white">${revenueStats ? revenueStats.byPlatform.adgem.baseRevenue.toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">تم توزيعه:</span>
                    <span className="text-purple-300">${revenueStats ? revenueStats.byPlatform.adgem.userEarnings.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminAdRevenue;
