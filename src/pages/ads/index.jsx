import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { TrendingUp, Eye, MousePointer, CheckCircle, DollarSign, BarChart3 } from 'lucide-react';
import AdSterraWidget from '../../components/ads/AdSterraWidget';
import AdGemWidget from '../../components/ads/AdGemWidget';
import { useAuth } from '../../contexts/AuthContext';
import { adRevenueService } from '../../services/adRevenueService';

const AdsPage = () => {
  const { user, profile } = useAuth();
  const [adStats, setAdStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    if (user) {
      loadAdStats();
    }
  }, [user, selectedPeriod]);

  const loadAdStats = async () => {
    setLoading(true);
    try {
      const { success, stats } = await adRevenueService.getUserAdStats(user.id, selectedPeriod);
      if (success) {
        setAdStats(stats);
      }
    } catch (error) {
      console.error('Error loading ad stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRevenueShare = (level) => {
    const shares = {
      0: 10, // 10%
      1: 35, // 35%
      2: 55, // 55%
      3: 78  // 78%
    };
    return shares[level] || 10;
  };

  const periodOptions = [
    { value: '7d', label: '7 أيام' },
    { value: '30d', label: '30 يوم' },
    { value: '90d', label: '90 يوم' }
  ];

  return (
    <>
      <Helmet>
        <title>الإعلانات والعروض - PromoHive</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="w-12 h-12 text-primary mr-4" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                الإعلانات والعروض
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              شاهد الإعلانات وأكمل العروض لتربح المال
            </p>
            <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
              <div className="flex items-center text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                مستواك الحالي: Level {profile?.level || 0}
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <DollarSign className="w-4 h-4 mr-2 text-yellow-400" />
                نسبة الربح: {getRevenueShare(profile?.level || 0)}%
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          {!loading && adStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">إجمالي الأرباح</p>
                    <p className="text-2xl font-bold text-white">${adStats.totalEarnings.toFixed(4)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">مشاهدات الإعلانات</p>
                    <p className="text-2xl font-bold text-white">{adStats.totalViews}</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">النقرات</p>
                    <p className="text-2xl font-bold text-white">{adStats.totalClicks}</p>
                  </div>
                  <MousePointer className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">العروض المكتملة</p>
                    <p className="text-2xl font-bold text-white">{adStats.totalCompletions}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </div>
          )}

          {/* Period Selector */}
          <div className="flex justify-center mb-8">
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

          {/* Ad Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AdSterra Section */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">AS</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">AdSterra</h3>
                      <p className="text-sm text-gray-400">إعلانات عالية الجودة</p>
                    </div>
                  </div>
                  {adStats && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">
                        ${adStats.byPlatform.adsterra.earnings.toFixed(4)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {adStats.byPlatform.adsterra.views} مشاهدة
                      </div>
                    </div>
                  )}
                </div>

                {/* AdSterra Widgets */}
                <div className="space-y-4">
                  <AdSterraWidget 
                    adType="banner" 
                    placement="main-banner" 
                    className="h-64"
                  />
                  <AdSterraWidget 
                    adType="native" 
                    placement="content-native" 
                    className="h-48"
                  />
                </div>
              </div>
            </div>

            {/* AdGem Section */}
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">AG</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">AdGem</h3>
                      <p className="text-sm text-gray-400">عروض وألعاب مربحة</p>
                    </div>
                  </div>
                  {adStats && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">
                        ${adStats.byPlatform.adgem.earnings.toFixed(4)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {adStats.byPlatform.adgem.completions} عرض مكتمل
                      </div>
                    </div>
                  )}
                </div>

                {/* AdGem Widgets */}
                <div className="space-y-4">
                  <AdGemWidget 
                    adType="offerwall" 
                    placement="main-offerwall" 
                    className="h-96"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Sharing Info */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-6 h-6 text-primary mr-3" />
              <h3 className="text-xl font-bold text-white">نسب الأرباح حسب المستوى</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((level) => (
                <div 
                  key={level}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    (profile?.level || 0) === level
                      ? 'border-primary/50 bg-primary/10 ring-2 ring-primary/20'
                      : 'border-white/20 bg-white/5'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-white mb-2">Level {level}</div>
                    <div className="text-2xl font-bold text-primary mb-1">
                      {getRevenueShare(level)}%
                    </div>
                    <div className="text-xs text-gray-400">من أرباح الإعلانات</div>
                    {(profile?.level || 0) === level && (
                      <div className="mt-2 text-xs bg-primary text-white px-2 py-1 rounded-full">
                        مستواك الحالي
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-center text-yellow-400 mb-2">
                <TrendingUp className="w-5 h-5 mr-2" />
                <span className="font-semibold">نصيحة للربح أكثر</span>
              </div>
              <p className="text-sm text-gray-300">
                قم بترقية مستواك للحصول على نسبة أرباح أعلى من الإعلانات والعروض. 
                كلما ارتفع مستواك، زادت أرباحك من نفس النشاط!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdsPage;
