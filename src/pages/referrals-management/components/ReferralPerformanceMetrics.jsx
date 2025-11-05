import React from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const ReferralPerformanceMetrics = () => {
  const monthlyData = [
  { month: 'Jun', referrals: 8, earnings: 156.50 },
  { month: 'Jul', referrals: 12, earnings: 234.75 },
  { month: 'Aug', referrals: 15, earnings: 298.25 },
  { month: 'Sep', referrals: 18, earnings: 367.80 },
  { month: 'Oct', referrals: 23, earnings: 456.90 }];


  const conversionData = [
  { week: 'Week 1', clicks: 145, signups: 12, conversion: 8.3 },
  { week: 'Week 2', clicks: 189, signups: 18, conversion: 9.5 },
  { week: 'Week 3', clicks: 167, signups: 15, conversion: 9.0 },
  { week: 'Week 4', clicks: 203, signups: 22, conversion: 10.8 }];


  const levelDistribution = [
  { name: 'Level 1', value: 12, color: '#00d4ff' },
  { name: 'Level 2', value: 23, color: '#ff0080' },
  { name: 'Level 3', value: 12, color: '#6366f1' }];


  const topPerformers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: "https://images.unsplash.com/photo-1561259200-024d8b793651",
    avatarAlt: 'Professional woman with long brown hair in white blazer smiling outdoors',
    referrals: 8,
    earnings: 234.50,
    bonus: 23.45
  },
  {
    id: 2,
    name: 'Michael Chen',
    avatar: "https://images.unsplash.com/photo-1698072556534-40ec6e337311",
    avatarAlt: 'Asian man with short black hair in navy blue shirt smiling at camera',
    referrals: 5,
    earnings: 189.25,
    bonus: 18.93
  },
  {
    id: 3,
    name: 'David Wilson',
    avatar: "https://images.unsplash.com/photo-1624799027443-b21da9f4f677",
    avatarAlt: 'Caucasian man with beard in casual gray shirt outdoors',
    referrals: 3,
    earnings: 156.75,
    bonus: 7.84
  }];


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="glass rounded-lg p-3 border border-border shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload?.map((entry, index) =>
          <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {entry?.dataKey}: {entry?.value}
              {entry?.dataKey === 'earnings' && '$'}
              {entry?.dataKey === 'conversion' && '%'}
            </p>
          )}
        </div>);

    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth Chart */}
        <div className="glass rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Monthly Growth</h3>
              <p className="text-sm text-text-secondary">Referrals and earnings over time</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="TrendingUp" size={20} className="text-primary" />
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={12} />

                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="referrals" fill="#00d4ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Rate Chart */}
        <div className="glass rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Conversion Rate</h3>
              <p className="text-sm text-text-secondary">Weekly conversion performance</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Icon name="Target" size={20} className="text-success" />
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="week"
                  stroke="#94a3b8"
                  fontSize={12} />

                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="conversion"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />

              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Level Distribution and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Distribution */}
        <div className="glass rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Level Distribution</h3>
              <p className="text-sm text-text-secondary">Referrals by level breakdown</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Icon name="PieChart" size={20} className="text-secondary" />
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={levelDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value">

                  {levelDistribution?.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                  )}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center space-x-6 mt-4">
            {levelDistribution?.map((item) =>
            <div key={item?.name} className="flex items-center space-x-2">
                <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item?.color }} />

                <span className="text-sm text-text-secondary">
                  {item?.name}: {item?.value}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Top Performers */}
        <div className="glass rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Top Performers</h3>
              <p className="text-sm text-text-secondary">Highest earning referrals</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Icon name="Award" size={20} className="text-warning" />
            </div>
          </div>

          <div className="space-y-4">
            {topPerformers?.map((performer, index) =>
            <div key={performer?.id} className="flex items-center justify-between p-4 glass rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                    src={performer?.avatar}
                    alt={performer?.avatarAlt}
                    className="w-12 h-12 rounded-full object-cover" />

                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{performer?.name}</h4>
                    <p className="text-sm text-text-secondary">{performer?.referrals} referrals</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-success">
                    ${performer?.earnings?.toFixed(2)}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Bonus: ${performer?.bonus?.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Performance Insights */}
      <div className="glass rounded-xl p-6 border border-border">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon name="Lightbulb" size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Performance Insights</h3>
            <p className="text-sm text-text-secondary">AI-powered recommendations to boost your referrals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="TrendingUp" size={16} className="text-success" />
              <span className="text-sm font-medium text-success">Growth Opportunity</span>
            </div>
            <p className="text-sm text-text-secondary">
              Your conversion rate increased by 23% this month. Consider sharing more on social media to capitalize on this trend.
            </p>
          </div>

          <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Clock" size={16} className="text-warning" />
              <span className="text-sm font-medium text-warning">Timing Insight</span>
            </div>
            <p className="text-sm text-text-secondary">
              Most of your successful referrals join on weekends. Schedule your promotional posts accordingly.
            </p>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Users" size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">Network Effect</span>
            </div>
            <p className="text-sm text-text-secondary">
              Level 2 referrals are performing 15% better than average. Focus on supporting your direct referrals.
            </p>
          </div>
        </div>
      </div>
    </div>);

};

export default ReferralPerformanceMetrics;