import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';


const EarningsChart = ({ earningsData, sourceData }) => {
  const [activeChart, setActiveChart] = useState('trend');

  const chartTypes = [
    { id: 'trend', label: 'Earnings Trend', icon: 'TrendingUp' },
    { id: 'source', label: 'Income Sources', icon: 'PieChart' },
    { id: 'monthly', label: 'Monthly Breakdown', icon: 'BarChart3' }
  ];

  const COLORS = ['#00d4ff', '#ff0080', '#6366f1', '#10b981', '#f59e0b'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="glass rounded-lg p-3 border border-border shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {entry?.name}: ${entry?.value?.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0];
      return (
        <div className="glass rounded-lg p-3 border border-border shadow-lg">
          <p className="text-sm font-medium text-foreground">{data?.name}</p>
          <p className="text-sm text-primary">
            ${data?.value?.toFixed(2)} ({((data?.value / sourceData?.reduce((sum, item) => sum + item?.value, 0)) * 100)?.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'trend':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="earnings" 
                stroke="#00d4ff" 
                strokeWidth={3}
                dot={{ fill: '#00d4ff', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#00d4ff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'source':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
              >
                {sourceData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'monthly':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={earningsData?.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="earnings" 
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff0080" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="glass rounded-xl border border-border overflow-hidden">
      {/* Chart Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Earnings Analytics</h3>
            <p className="text-sm text-text-secondary mt-1">
              Visual breakdown of your earning patterns
            </p>
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex space-x-1 bg-muted/20 rounded-lg p-1">
          {chartTypes?.map((type) => (
            <button
              key={type?.id}
              onClick={() => setActiveChart(type?.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeChart === type?.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-foreground hover:bg-muted/30'
              }`}
            >
              <Icon name={type?.icon} size={16} />
              <span className="hidden sm:block">{type?.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Chart Content */}
      <div className="p-6">
        {renderChart()}
      </div>
      {/* Chart Insights */}
      <div className="p-6 border-t border-border bg-muted/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success mb-1">
              ${earningsData?.reduce((sum, item) => sum + item?.earnings, 0)?.toFixed(2)}
            </div>
            <div className="text-sm text-text-secondary">Total Earnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              ${(earningsData?.reduce((sum, item) => sum + item?.earnings, 0) / earningsData?.length)?.toFixed(2)}
            </div>
            <div className="text-sm text-text-secondary">Average Daily</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary mb-1">
              {sourceData?.length}
            </div>
            <div className="text-sm text-text-secondary">Income Sources</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsChart;