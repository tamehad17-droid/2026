import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import { spinWheelService } from '../../services/spinWheelService';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const DailySpinWheel = () => {
  const { user } = useAuth();
  const [canSpin, setCanSpin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [todayWinnings, setTodayWinnings] = useState(0);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      checkSpinEligibility(),
      loadTodayWinnings(),
      loadHistory(),
      loadStats()
    ]);
    setLoading(false);
  };

  const checkSpinEligibility = async () => {
    const { canSpin: eligible } = await spinWheelService.canSpinToday(user.id);
    setCanSpin(eligible);
  };

  const loadTodayWinnings = async () => {
    const { total } = await spinWheelService.getTodayWinnings(user.id);
    setTodayWinnings(total);
  };

  const loadHistory = async () => {
    const { history: data } = await spinWheelService.getSpinHistory(user.id, 10);
    setHistory(data || []);
  };

  const loadStats = async () => {
    const { stats: data } = await spinWheelService.getSpinStats(user.id);
    setStats(data);
  };

  const handleSpin = async () => {
    if (!canSpin || spinning) return;

    setSpinning(true);
    setResult(null);

    // Animate wheel spinning
    const spins = 5 + Math.random() * 3; // 5-8 full rotations
    const finalRotation = rotation + (360 * spins);
    setRotation(finalRotation);

    // Wait for animation
    setTimeout(async () => {
      try {
        const { result: spinResult, error } = await spinWheelService.processSpin(user.id);
        if (error) throw error;
        
        if (spinResult?.success) {
          setResult(spinResult);
          setCanSpin(false);
          await loadData();
        } else {
          // Handle specific error cases
          const errorMessage = spinResult?.error;
          switch (errorMessage) {
            case 'Account not active':
              alert('❌ Your account needs to be active to use the spin wheel');
              break;
            case 'Already spun today':
              alert('❌ You have already used your spin for today');
              break;
            case 'Daily limit reached':
              alert('❌ You have reached the maximum daily winnings');
              break;
            case 'System configuration error':
              alert('❌ System error. Please try again later');
              break;
            default:
              alert('❌ ' + (errorMessage || 'Failed to process spin'));
          }
        }
      } catch (err) {
        console.error('Spin error:', err);
        alert('❌ Failed to process spin. Please try again');
      } finally {
        setSpinning(false);
      }
    }, 3000);
  };

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
        <title>Daily Spin Wheel - PromoHive</title>
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <span className="text-4xl">🎰</span>
                Daily Spin Wheel
              </h1>
              <p className="text-text-secondary mt-2">
                Spin once per day and win up to $0.30!
              </p>
            </div>
            <Link
              to="/user-dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition"
            >
              <Icon name="ArrowLeft" size={20} />
              Back to Dashboard
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Wheel Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Winnings */}
              <div className="glass rounded-xl p-6 text-center bg-gradient-to-br from-primary/10 to-secondary/10">
                <p className="text-text-secondary mb-2">Today's Winnings</p>
                <p className="text-5xl font-bold text-success mb-2">
                  ${todayWinnings.toFixed(2)}
                </p>
                <p className="text-sm text-text-secondary">
                  Maximum: $0.30 per day
                </p>
                {todayWinnings >= 0.30 && (
                  <div className="mt-3 p-2 bg-warning/20 rounded-lg">
                    <p className="text-sm text-warning">
                      You've reached today's maximum! Come back tomorrow.
                    </p>
                  </div>
                )}
              </div>

              {/* Wheel */}
              <div className="glass rounded-xl p-8">
                <div className="relative">
                  {/* Wheel Container */}
                  <div className="relative w-80 h-80 mx-auto mb-8">
                    {/* Pointer */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                      <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-transparent border-t-destructive"></div>
                    </div>

                    {/* Wheel */}
                    <div
                      className={`relative w-full h-full rounded-full border-8 border-primary shadow-2xl transition-transform duration-3000 ease-out`}
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        background: 'conic-gradient(from 0deg, #6366f1 0deg 60deg, #8b5cf6 60deg 120deg, #ec4899 120deg 180deg, #f59e0b 180deg 240deg, #10b981 240deg 300deg, #3b82f6 300deg 360deg)'
                      }}
                    >
                      {/* Center Circle */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-background rounded-full shadow-lg flex items-center justify-center">
                          <span className="text-4xl">🎁</span>
                        </div>
                      </div>

                      {/* Prize Labels */}
                      {[0.05, 0.10, 0.15, 0.20, 0.25, 0.30].map((prize, i) => (
                        <div
                          key={i}
                          className="absolute top-1/2 left-1/2 origin-left text-white font-bold"
                          style={{
                            transform: `rotate(${i * 60 + 30}deg) translateX(100px)`,
                          }}
                        >
                          ${prize}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spin Button */}
                  <div className="text-center">
                    {canSpin ? (
                      <button
                        onClick={handleSpin}
                        disabled={spinning}
                        className={`px-12 py-4 text-xl font-bold rounded-xl transition-all ${
                          spinning
                            ? 'bg-muted text-text-secondary cursor-not-allowed'
                            : 'bg-gradient-primary text-white hover:scale-105 shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {spinning ? (
                          <span className="flex items-center gap-3">
                            <Icon name="Loader" size={24} className="animate-spin" />
                            Spinning...
                          </span>
                        ) : (
                          <span className="flex items-center gap-3">
                            <span>🎰</span>
                            SPIN NOW!
                          </span>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-lg font-semibold text-text-secondary">
                            You've used your spin for today
                          </p>
                          <p className="text-sm text-text-secondary mt-1">
                            Come back tomorrow for another chance!
                          </p>
                        </div>
                        <p className="text-xs text-text-secondary">
                          Resets at midnight (your local time)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Result */}
                  {result && result.success && (
                    <div className="mt-6 p-6 bg-success/20 rounded-xl text-center animate-bounce">
                      <p className="text-3xl font-bold text-success mb-2">
                        🎉 Congratulations!
                      </p>
                      <p className="text-2xl font-bold text-success">
                        You won ${result.prize}!
                      </p>
                      <p className="text-sm text-text-secondary mt-2">
                        Added to your balance
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              {stats && (
                <div className="glass rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Icon name="TrendingUp" size={20} />
                    Your Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Total Spins</span>
                      <span className="font-bold">{stats.totalSpins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Total Won</span>
                      <span className="font-bold text-success">
                        ${stats.totalWon.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Average Win</span>
                      <span className="font-bold">
                        ${stats.averageWin.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent History */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="History" size={20} />
                  Recent Spins
                </h3>
                <div className="space-y-2">
                  {history.length > 0 ? (
                    history.slice(0, 5).map((spin, i) => (
                      <div
                        key={spin.id}
                        className="flex justify-between items-center p-2 bg-muted rounded-lg"
                      >
                        <span className="text-sm text-text-secondary">
                          {new Date(spin.created_at).toLocaleDateString()}
                        </span>
                        <span className="font-bold text-success">
                          +${parseFloat(spin.prize_amount).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-secondary text-center py-4">
                      No spins yet. Try your luck!
                    </p>
                  )}
                </div>
              </div>

              {/* How it Works */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon name="HelpCircle" size={20} />
                  How it Works
                </h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-success mt-0.5" />
                    <span>Spin once per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-success mt-0.5" />
                    <span>Win between $0.05 - $0.30</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-success mt-0.5" />
                    <span>Maximum $0.30 per day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-success mt-0.5" />
                    <span>Winnings added instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" size={16} className="text-success mt-0.5" />
                    <span>Resets at midnight</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DailySpinWheel;
