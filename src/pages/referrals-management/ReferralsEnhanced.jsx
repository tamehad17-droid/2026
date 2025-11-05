import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Share2, 
  Copy, 
  Gift, 
  TrendingUp, 
  Calendar,
  DollarSign,
  UserPlus,
  Award,
  Link as LinkIcon,
  QrCode,
  Mail,
  MessageCircle
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import { referralService } from '../../services/referralService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';

const ReferralsEnhanced = () => {
  const { user, profile } = useAuth();
  const [referralData, setReferralData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const referralTiers = [
    { level: 1, referrals: 5, bonus: 10, color: 'bg-blue-500' },
    { level: 2, referrals: 15, bonus: 25, color: 'bg-green-500' },
    { level: 3, referrals: 30, bonus: 50, color: 'bg-purple-500' },
    { level: 4, referrals: 50, bonus: 100, color: 'bg-orange-500' },
    { level: 5, referrals: 100, bonus: 250, color: 'bg-red-500' }
  ];

  useEffect(() => {
    loadReferralData();
  }, [user?.id, selectedPeriod]);

  const loadReferralData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [data, referralList] = await Promise.all([
        referralService.getReferralStats(user.id, { period: selectedPeriod }),
        referralService.getReferralList(user.id)
      ]);
      
      setReferralData(data);
      setReferrals(referralList || []);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    const referralLink = `${window.location.origin}/register?ref=${user?.referral_code || 'USER123'}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareViaEmail = () => {
    const referralLink = `${window.location.origin}/register?ref=${user?.referral_code || 'USER123'}`;
    const subject = 'Join PromoHive and Earn Money!';
    const body = `Hi! I've been earning money on PromoHive by completing simple tasks. Join using my referral link and we both get bonuses: ${referralLink}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const shareViaSMS = () => {
    const referralLink = `${window.location.origin}/register?ref=${user?.referral_code || 'USER123'}`;
    const message = `Join PromoHive and earn money completing tasks! Use my link: ${referralLink}`;
    window.open(`sms:?body=${encodeURIComponent(message)}`);
  };

  const getCurrentTier = () => {
    const totalReferrals = referralData?.totalReferrals || 0;
    return referralTiers.find(tier => totalReferrals < tier.referrals) || referralTiers[referralTiers.length - 1];
  };

  const getNextTierProgress = () => {
    const totalReferrals = referralData?.totalReferrals || 0;
    const currentTier = getCurrentTier();
    const previousTier = referralTiers[referralTiers.indexOf(currentTier) - 1];
    
    if (!previousTier) {
      return (totalReferrals / currentTier.referrals) * 100;
    }
    
    return ((totalReferrals - previousTier.referrals) / (currentTier.referrals - previousTier.referrals)) * 100;
  };

  const formatCurrency = (amount) => {
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
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const currentTier = getCurrentTier();
  const nextTierProgress = getNextTierProgress();

  return (
    <>
      <Helmet>
        <title>Referral Program - PromoHive</title>
        <meta name="description" content="Invite friends and earn bonuses through our referral program" />
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
                <div className="text-2xl">👥</div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Referral Program</h1>
                  <p className="text-sm text-muted-foreground">
                    Invite friends and earn together
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="hidden sm:flex">
                  Level {currentTier.level}
                </Badge>
                <Button variant="outline" size="sm" onClick={copyReferralLink}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Referral Link Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Your Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={`${window.location.origin}/register?ref=${user?.referral_code || 'USER123'}`}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      onClick={copyReferralLink}
                      variant={copied ? 'default' : 'outline'}
                      className="shrink-0"
                    >
                      {copied ? (
                        <>
                          <Award className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Share Options */}
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" onClick={shareViaEmail}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm" onClick={shareViaSMS}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      SMS
                    </Button>
                    <Button variant="outline" size="sm">
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                    <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold text-foreground">
                      {referralData?.totalReferrals || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Referrals</p>
                    <p className="text-2xl font-bold text-green-600">
                      {referralData?.activeReferrals || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <UserPlus className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(referralData?.totalEarned || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(referralData?.monthlyEarned || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-full">
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tier Progress */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Referral Tier Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Tier */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Current Tier: Level {currentTier.level}</h3>
                      <p className="text-sm text-muted-foreground">
                        {referralData?.totalReferrals || 0} / {currentTier.referrals} referrals
                      </p>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {formatCurrency(currentTier.bonus)} bonus
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to next tier</span>
                      <span>{Math.round(nextTierProgress)}%</span>
                    </div>
                    <Progress 
                      value={nextTierProgress} 
                      className="h-3"
                      color="primary"
                    />
                  </div>

                  {/* Tier List */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {referralTiers.map((tier, index) => (
                      <div
                        key={tier.level}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          tier.level === currentTier.level
                            ? 'border-primary bg-primary/5'
                            : (referralData?.totalReferrals || 0) >= tier.referrals
                            ? 'border-green-500 bg-green-500/5'
                            : 'border-muted bg-muted/20'
                        }`}
                      >
                        <div className="text-center space-y-2">
                          <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-white text-sm font-bold ${tier.color}`}>
                            {tier.level}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Level {tier.level}</p>
                            <p className="text-xs text-muted-foreground">{tier.referrals} refs</p>
                            <p className="text-xs font-medium text-primary">
                              {formatCurrency(tier.bonus)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Referrals</CardTitle>
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
                ) : referrals.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No referrals yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start sharing your referral link to earn bonuses!
                    </p>
                    <Button onClick={copyReferralLink}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Copy Referral Link
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Join Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tasks Completed</TableHead>
                          <TableHead className="text-right">Your Bonus</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {referrals.map((referral, index) => (
                            <motion.tr
                              key={referral.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-muted/50"
                            >
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Users className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {referral.username || `User ${referral.id.slice(0, 8)}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      ID: {referral.id.slice(0, 8)}...
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(referral.created_at)}
                                </span>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(referral.status)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{referral.tasksCompleted || 0}</span>
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(referral.bonusEarned || 0)}
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

export default ReferralsEnhanced;
