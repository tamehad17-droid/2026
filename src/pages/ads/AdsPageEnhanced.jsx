import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  DollarSign, 
  Clock, 
  Star, 
  Gift,
  TrendingUp,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Gamepad2
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import { adService } from '../../services/adService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { AdsterraBanner, AdsterraPopunder, AdsterraNative, AdGemSmartLink } from '../../components/ads/AdsterraAds';

const AdsPageEnhanced = () => {
  const { user, profile } = useAuth();
  const [adStats, setAdStats] = useState(null);
  const [availableAds, setAvailableAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchingAd, setWatchingAd] = useState(null);
  const [adProgress, setAdProgress] = useState(0);

  const adTypes = [
    {
      id: 'video',
      title: 'Video Ads',
      description: 'Watch short video advertisements',
      reward: 0.15,
      duration: 30,
      icon: Play,
      color: 'bg-blue-500'
    },
    {
      id: 'banner',
      title: 'Banner Clicks',
      description: 'Click on banner advertisements',
      reward: 0.08,
      duration: 5,
      icon: MousePointer,
      color: 'bg-green-500'
    },
    {
      id: 'native',
      title: 'Native Ads',
      description: 'Engage with native content ads',
      reward: 0.25,
      duration: 45,
      icon: Eye,
      color: 'bg-purple-500'
    },
    {
      id: 'mobile',
      title: 'Mobile Offers',
      description: 'Complete mobile app offers',
      reward: 0.75,
      duration: 300,
      icon: Smartphone,
      color: 'bg-orange-500'
    },
    {
      id: 'desktop',
      title: 'Desktop Offers',
      description: 'Complete desktop software offers',
      reward: 1.50,
      duration: 600,
      icon: Monitor,
      color: 'bg-red-500'
    },
    {
      id: 'gaming',
      title: 'Gaming Offers',
      description: 'Play games and reach milestones',
      reward: 1.00,
      duration: 1800,
      icon: Gamepad2,
      color: 'bg-indigo-500'
    }
  ];

  useEffect(() => {
    loadAdData();
  }, [user?.id]);

  const loadAdData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [stats, ads] = await Promise.all([
        adService.getAdStats(user.id),
        adService.getAvailableAds(user.id)
      ]);
      
      setAdStats(stats);
      setAvailableAds(ads || []);
    } catch (error) {
      console.error('Error loading ad data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchAd = async (adType) => {
    setWatchingAd(adType);
    setAdProgress(0);

    // Simulate ad watching progress
    const interval = setInterval(() => {
      setAdProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeAd(adType);
          return 100;
        }
        return prev + (100 / (adType.duration / 1000));
      });
    }, 1000);
  };

  const completeAd = async (adType) => {
    try {
      await adService.completeAd(user.id, adType.id, adType.reward);
      
      // Update stats
      setAdStats(prev => ({
        ...prev,
        totalEarned: (prev?.totalEarned || 0) + adType.reward,
        adsWatched: (prev?.adsWatched || 0) + 1
      }));

      // Reset watching state
      setTimeout(() => {
        setWatchingAd(null);
        setAdProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Error completing ad:', error);
      setWatchingAd(null);
      setAdProgress(0);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <>
      <Helmet>
        <title>Earn from Ads - PromoHive</title>
        <meta name="description" content="Watch ads and complete offers to earn money" />
      </Helmet>

      {/* Adsterra Popunder */}
      <AdsterraPopunder />

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
                <div className="text-2xl">📺</div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Earn from Ads</h1>
                  <p className="text-sm text-muted-foreground">
                    Watch ads and complete offers to earn rewards
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="hidden sm:flex">
                  {adStats?.adsWatched || 0} ads watched
                </Badge>
                <Badge variant="success">
                  {formatCurrency(adStats?.totalEarned || 0)} earned
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ads Watched</p>
                    <p className="text-2xl font-bold text-foreground">
                      {adStats?.adsWatched || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Eye className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(adStats?.totalEarned || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Today's Earnings</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(adStats?.todayEarned || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round((adStats?.completionRate || 0) * 100)}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-full">
                    <Star className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Adsterra Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <AdsterraBanner width={728} height={90} className="mx-auto" />
          </motion.div>

          {/* Ad Types Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {adTypes.map((adType, index) => {
              const IconComponent = adType.icon;
              const isWatching = watchingAd?.id === adType.id;
              
              return (
                <motion.div
                  key={adType.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-full ${adType.color}/10`}>
                          <IconComponent className={`h-6 w-6 ${adType.color.replace('bg-', 'text-')}`} />
                        </div>
                        <Badge variant="success" className="text-sm">
                          {formatCurrency(adType.reward)}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{adType.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {adType.description}
                      </p>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {formatDuration(adType.duration)}
                          </span>
                          <span className="flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            {formatCurrency(adType.reward)}
                          </span>
                        </div>

                        {isWatching && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{Math.round(adProgress)}%</span>
                            </div>
                            <Progress 
                              value={adProgress} 
                              className="h-2"
                              color="success"
                            />
                          </div>
                        )}

                        <Button
                          onClick={() => handleWatchAd(adType)}
                          disabled={isWatching}
                          className="w-full"
                          variant={isWatching ? "secondary" : "default"}
                        >
                          {isWatching ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Watching...
                            </>
                          ) : (
                            <>
                              <IconComponent className="h-4 w-4 mr-2" />
                              Start {adType.title}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* AdGem Offers Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Premium Offers
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  High-paying offers from our premium partners
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Gaming Offers</h4>
                      <Badge variant="success">Up to $5.00</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Play mobile games and reach specific levels to earn rewards.
                    </p>
                    <AdGemSmartLink 
                      userId={user?.id}
                      taskId="gaming-offers"
                      className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Browse Gaming Offers
                    </AdGemSmartLink>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">App Downloads</h4>
                      <Badge variant="success">Up to $2.50</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download and try new apps to earn instant rewards.
                    </p>
                    <AdGemSmartLink 
                      userId={user?.id}
                      taskId="app-downloads"
                      className="w-full bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
                    >
                      Browse App Offers
                    </AdGemSmartLink>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Native Ads Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AdsterraNative className="mb-8" />
          </motion.div>

          {/* Daily Bonus Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Daily Ad Bonus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Watch 10 ads today to unlock your daily bonus!
                    </p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(adStats?.todayAdsWatched || 0) * 10} 
                        max={100}
                        className="flex-1 h-2"
                        color="primary"
                      />
                      <span className="text-sm font-medium">
                        {adStats?.todayAdsWatched || 0}/10
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    +$0.50 Bonus
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdsPageEnhanced;
