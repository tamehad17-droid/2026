import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AnalyticsChart = () => {
  const [activeChart, setActiveChart] = useState('users');
  const [timeRange, setTimeRange] = useState('7d');

  const userRegistrationData = [
    { date: '10/23', users: 45, approved: 38 },
    { date: '10/24', users: 52, approved: 44 },
    { date: '10/25', users: 38, approved: 35 },
    { date: '10/26', users: 67, approved: 58 },
    { date: '10/27', users: 73, approved: 65 },
    { date: '10/28', users: 89, approved: 76 },
    { date: '10/29', users: 94, approved: 82 }
  ];

  const taskCompletionData = [
    { category: 'Manual', completed: 234, pending: 45 },
    { category: 'AdGem', completed: 189, pending: 32 },
    { category: 'AdSterra', completed: 156, pending: 28 },
    { category: 'CPALead', completed: 98, pending: 15 }
  ];

  const revenueData = [
    { date: '10/23', revenue: 1250, withdrawals: 890 },
    { date: '10/24', revenue: 1380, withdrawals: 950 },
    { date: '10/25', revenue: 1120, withdrawals: 780 },
    { date: '10/26', revenue: 1650, withdrawals: 1200 },
    { date: '10/27', revenue: 1890, withdrawals: 1350 },
    { date: '10/28', revenue: 2100, withdrawals: 1480 },
    { date: '10/29', revenue: 2350, withdrawals: 1650 }
  ];

  const taskDistributionData = [
    { name: 'Manual Tasks', value: 45, color: '#00d4ff' },
    { name: 'AdGem', value: 28, color: '#ff0080' },
    { name: 'AdSterra', value: 18, color: '#6366f1' },
    { name: 'CPALead', value: 9, color: '#10b981' }
  ];

  const chartTypes = [
    { id: 'users', label: 'User Growth', icon: 'Users' },
    { id: 'tasks', label: 'Task Completion', icon: 'CheckSquare' },
    { id: 'revenue', label: 'Revenue Analytics', icon: 'DollarSign' },
    { id: 'distribution', label: 'Task Distribution', icon: 'PieChart' }
  ];

  const timeRanges = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' }
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'users':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userRegistrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="users" stroke="#00d4ff" strokeWidth={3} dot={{ fill: '#00d4ff', r: 4 }} />
              <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'tasks':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskCompletionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="category" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="completed" fill="#00d4ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="#ff0080" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              <Line type="monotone" dataKey="withdrawals" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskDistributionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
              >
                {taskDistributionData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <h2 className="text-xl font-semibold text-foreground">Analytics Overview</h2>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-1 bg-muted/30 rounded-lg p-1">
            {chartTypes?.map((chart) => (
              <button
                key={chart?.id}
                onClick={() => setActiveChart(chart?.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeChart === chart?.id
                    ? 'bg-primary text-white' :'text-text-secondary hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon name={chart?.icon} size={16} />
                <span className="hidden sm:inline">{chart?.label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex space-x-1 bg-muted/30 rounded-lg p-1">
            {timeRanges?.map((range) => (
              <button
                key={range?.id}
                onClick={() => setTimeRange(range?.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  timeRange === range?.id
                    ? 'bg-primary text-white' :'text-text-secondary hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {range?.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-4">
        {renderChart()}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-4 text-sm text-text-secondary">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span>Primary Metric</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-secondary rounded-full"></div>
            <span>Secondary Metric</span>
          </div>
        </div>
        
        <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
          Export Data
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsChart;