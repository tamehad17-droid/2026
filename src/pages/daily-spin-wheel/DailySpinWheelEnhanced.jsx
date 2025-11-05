import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Star, 
  Coins, 
  Zap, 
  Calendar,
  Trophy,
  Clock,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import { spinWheelService } from '../../services/spinWheelService';
import SpinWheel from '../../components/ui/SpinWheel';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { AdsterraBanner } from '../../components/ads/AdsterraAds';

const DailySpinWheelEnhanced = () => {
  const { user, profile } = useAuth();
  const [spinData, setSpinData] = useState(null);
  const [spinHistory, setSpinHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canSpin, setCanSpin] = useState(false);
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);

  const prizes = [
    { id: 1, label: '$0.50', value: 0.50, color: '#FF6B6B', icon: Coins },
    { id: 2, label: '$1.00', value: 1.00, color: '#4ECDC4', icon: Coins },
    { id: 3, label: '$2.00', value: 2.00, color: '#45B7D1', icon: Star },
    { id: 4, label: '$3.00', value: 3.00, color: '#96CEB4', icon: Gift },
    { id: 5, label: '$5.00', value: 5.00, color: '#FFEAA7', icon: Zap },
    { id: 6, label: '$1.50', value: 1.50, color: '#DDA0DD', icon: Star },
    { id: 7, label: '$2.50', value: 2.50, color: '#FFB6C1', icon: Coins },
    { id: 8, label: '$10.00', value: 10.00, color: '#98D8C8', icon: Trophy }
  ];

  useEffect(() => {
    loadSpinData();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadSpinData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [data, history] = await Promise.all([
        spinWheelService.getSpinData(user.id),
        spinWheelService.getSpinHistory(user.id)
      ]);
      
      setSpinData(data);
      setSpinHistory(history || []);
      setCanSpin(data?.canSpin || false);
      setTotalSpins(data?.totalSpins || 0);
      
      if (data?.nextSpinTime) {
        const nextSpin = new Date(data.nextSpinTime);
        const now = new Date();
        setTimeUntilNextSpin(Math.max(0, nextSpin - now));
      }
    } catch (error) {
      console.error('Error loading spin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTimer = () => {
    setTimeUntilNextSpin(prev => {
      if (prev <= 1000) {
        setCanSpin(true);
        return 0;
      }
      return prev - 1000;
    });
  };

  const handleSpin = async () => {
    if (!canSpin || !user?.id) return;

    try {
      setCanSpin(false);
      const result = await spinWheelService.spin(user.id);
      
      // Update data
      setSpinData(prev => ({
        ...prev,
        totalEarned: (prev?.totalEarned || 0) + result.prize.value,
        todaySpins: (prev?.todaySpins || 0) + 1,
        canSpin: false,
        nextSpinTime: result.nextSpinTime
      }));

      setSpinHistory(prev => [result, ...prev.slice(0, 9)]);
      setTotalSpins(prev => prev + 1);
      
      // Set next spin timer
      const nextSpin = new Date(result.nextSpinTime);
      const now = new Date();
      setTimeUntilNextSpin(Math.max(0, nextSpin - now));
      
      return result.prize;
    } catch (error) {
      console.error('Error spinning wheel:', error);
      setCanSpin(true);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStreakBonus = () => {
    const streak = spinData?.currentStreak || 0;
    if (streak >= 7) return 2.0;
    if (streak >= 5) return 1.5;
    if (streak >= 3) return 1.2;
    return 1.0;
  };

  return (
    <>
      <Helmet>
        <title>Daily Spin Wheel - PromoHive</title>
        <meta name="description" content="Spin the wheel daily to win cash prizes and bonuses" />
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
                <div className="text-2xl">🎰</div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Daily Spin Wheel</h1>
                  <p className="text-sm text-muted-foreground">
                    Spin daily to win cash prizes and bonuses
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="hidden sm:flex">
                  {totalSpins} total spins
                </Badge>
                <Badge variant="success">
                  {formatCurrency(spinData?.totalEarned || 0)} earned
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
                    <p className="text-sm font-medium text-muted-foreground">Total Spins</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalSpins}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <RefreshCw className="h-6 w-6 text-blue-500" />
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
                      {formatCurrency(spinData?.totalEarned || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <Coins className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {spinData?.currentStreak || 0} days
                    </p>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-full">
                    <Calendar className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Biggest Win</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(spinData?.biggestWin || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-full">
                    <Trophy className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Spin Wheel Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="h-fit">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Gift className="h-6 w-6" />
                    Daily Spin Wheel
                  </CardTitle>
                  {!canSpin && timeUntilNextSpin > 0 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Next spin available in:
                      </p>
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatTime(timeUntilNextSpin)}
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <SpinWheel
                    prizes={prizes}
                    onSpin={handleSpin}
                    onResult={(prize) => console.log('Won:', prize)}
                    disabled={!canSpin}
                  />
                  
                  {/* Streak Bonus */}
                  {spinData?.currentStreak > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-yellow-700">Streak Bonus Active!</h4>
                          <p className="text-sm text-yellow-600">
                            {spinData.currentStreak} day streak • {getStreakBonus()}x multiplier
                          </p>
                        </div>
                        <div className="text-2xl">🔥</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Side Panel */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Today's Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Today's Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Daily Spins</span>
                        <span>{spinData?.todaySpins || 0}/3</span>
                      </div>
                      <Progress 
                        value={(spinData?.todaySpins || 0) * 33.33} 
                        className="h-2"
                        color="primary"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Today's Earnings</span>
                        <span>{formatCurrency(spinData?.todayEarned || 0)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Complete 3 spins for bonus reward!
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Wins */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Wins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {spinHistory.length === 0 ? (
                    <div className="text-center py-4">
                      <Gift className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No spins yet today
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {spinHistory.slice(0, 5).map((spin, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: spin.prize.color }}
                            />
                            <span className="font-medium">{spin.prize.label}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(spin.timestamp).toLocaleTimeString()}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Adsterra Banner */}
              <AdsterraBanner width={300} height={250} />
            </motion.div>
          </div>

          {/* Weekly Challenge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Weekly Spin Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Spin 7 Days in a Row</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete your daily spin for 7 consecutive days to unlock a special bonus!
                    </p>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(spinData?.currentStreak || 0) * 14.28} 
                        className="flex-1 h-3"
                        color="success"
                      />
                      <span className="text-sm font-medium">
                        {spinData?.currentStreak || 0}/7
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🏆</div>
                      <div className="font-bold text-lg text-primary">
                        $10.00 Bonus
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Weekly Challenge Reward
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DailySpinWheelEnhanced;
