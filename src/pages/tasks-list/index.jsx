import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Gamepad2, Filter, SortAsc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { taskService } from '../../services/taskService';
import { adgemService } from '../../services/adgemService';
import { adsterraService } from '../../services/adsterraService';
import { fallbackTaskService } from '../../services/fallbackTaskService';
import { useAuth } from '../../contexts/AuthContext';
import TaskCard from '../../components/ui/TaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

import TaskStats from './components/TaskStats';
import QuickActions from './components/QuickActions';

const TasksList = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [adgemOffers, setAdgemOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [userProfile, setUserProfile] = useState(null);

  // Add this block - Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) return;
      try {
        // Try main service first, fallback to mock
        let profile = null;
        try {
          const { profile: mainProfile } = await taskService.getUserProfile(user.id);
          profile = mainProfile;
        } catch (error) {
          console.warn('Main profile service failed, using fallback');
          const { profile: fallbackProfile } = await fallbackTaskService.getUserProfile(user.id);
          profile = fallbackProfile;
        }
        setUserProfile(profile || null);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };
    loadUserProfile();
  }, [user?.id]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const filters = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sortBy: sortBy
      };

      let allTasks = [];
      let submissions = [];

      // Try to load from main service first, fallback to mock service
      try {
        if (user?.id) {
          const { tasks: mainTasks, error: tasksError } = await taskService?.getTasksForUser(user?.id, filters);
          const { submissions: mainSubmissions, error: submissionsError } = await taskService?.getUserSubmissions(user?.id);
          
          if (!tasksError && !submissionsError) {
            allTasks = mainTasks || [];
            submissions = mainSubmissions || [];
          } else {
            throw new Error('Database connection failed');
          }
        } else {
          throw new Error('No user ID');
        }
      } catch (error) {
        console.warn('Main service failed, using fallback:', error.message);
        // Use fallback service
        const { tasks: fallbackTasks } = await fallbackTaskService.getTasksForUser(user?.id || 'guest', filters);
        const { submissions: fallbackSubmissions } = await fallbackTaskService.getUserSubmissions(user?.id || 'guest');
        
        allTasks = fallbackTasks || [];
        submissions = fallbackSubmissions || [];
      }

      // Load AdGem and Adsterra offers if category is appropriate or 'all'
      const [adsterraOffers, adgemOffers] = await Promise.all([
        (selectedCategory === 'all' || selectedCategory === 'adsterra') 
          ? adsterraService.getAdsterraOffers(user?.id).then(res => res.offers || [])
          : Promise.resolve([]),
        (selectedCategory === 'all' || selectedCategory === 'adgem')
          ? adgemService.getAdgemOffers(user?.id).then(res => res.offers || [])
          : Promise.resolve([])
      ]);
      if (selectedCategory === 'all' || selectedCategory === 'adgem') {
        try {
          const { offers, error: offersError } = await adgemService?.getAdgemOffers(user?.id);
          if (!offersError) setAdgemOffers(offers || []);
        } catch (error) {
          console.warn('AdGem offers failed:', error);
          setAdgemOffers([]);
        }
      }

      setTasks(allTasks.filter(Boolean));
      setUserSubmissions(submissions);
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Final fallback - show empty state
      setTasks([]);
      setUserSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = (tasks || []).filter(task => {
    const matchesSearch = task?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         task?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || task?.category === selectedCategory;

    return matchesSearch && matchesCategory;
  })?.sort((a, b) => {
    switch (sortBy) {
      case 'reward_high':
        return (b?.reward_amount || 0) - (a?.reward_amount || 0);
      case 'reward_low':
        return (a?.reward_amount || 0) - (b?.reward_amount || 0);
      case 'oldest':
        return new Date(a?.created_at) - new Date(b?.created_at);
      case 'newest':
      default:
        return new Date(b?.created_at) - new Date(a?.created_at);
    }
  });

  // Combine AdGem and Adsterra offers with filtered tasks
  const combinedTasks = (() => {
    if (selectedCategory === 'adgem') {
      return adgemOffers?.map(offer => ({
        id: offer?.id,
        title: offer?.title,
        description: offer?.description,
        category: 'adgem',
        reward_amount: offer?.display_reward,
        external_url: (offer?.external_url || '')?.replace('{USER_ID}', user?.id || 'guest'),
        requirements: offer?.requirements,
        created_at: offer?.created_at,
        total_slots: 1,
        completed_slots: 0,
        level_percentage: offer?.user_level >= 5 ? 85 : [10, 25, 40, 55, 70]?.[offer?.user_level] || 10,
        user_level: offer?.user_level,
        isAdgemOffer: true,
        status: 'active'
      }));
    } else if (selectedCategory === 'adsterra') {
      return adsterraOffers?.map(offer => ({
        id: offer?.id,
        title: offer?.title,
        description: offer?.description,
        category: 'adsterra',
        reward_amount: offer?.reward_amount,
        external_url: offer?.external_url,
        requirements: offer?.requirements,
        created_at: offer?.created_at,
        total_slots: 1,
        completed_slots: 0,
        isAdsterraOffer: true,
        status: 'active'
      }));
    } else {
      return [
        ...filteredTasks,
        ...(selectedCategory === 'all' ? [
          ...adgemOffers?.map(offer => ({
            id: offer?.id,
            title: offer?.title,
            description: offer?.description,
            category: 'adgem',
            reward_amount: offer?.display_reward,
            external_url: (offer?.external_url || '')?.replace('{USER_ID}', user?.id || 'guest'),
            requirements: offer?.requirements,
            created_at: offer?.created_at,
            total_slots: 1,
            completed_slots: 0,
            level_percentage: offer?.user_level >= 5 ? 85 : [10, 25, 40, 55, 70]?.[offer?.user_level] || 10,
            user_level: offer?.user_level,
            isAdgemOffer: true,
            status: 'active'
          })),
          ...adsterraOffers?.map(offer => ({
            id: offer?.id,
            title: offer?.title,
            description: offer?.description,
            category: 'adsterra',
            reward_amount: offer?.reward_amount,
            external_url: offer?.external_url,
            requirements: offer?.requirements,
            created_at: offer?.created_at,
            total_slots: 1,
            completed_slots: 0,
            isAdsterraOffer: true,
            status: 'active'
          }))
        ] : [])
      ];
    }
  })();

  // Add this block - Calculate stats for TaskStats component
  const taskStats = {
    total: combinedTasks?.length || 0,
    completed: userSubmissions?.filter(sub => sub?.status === 'approved')?.length || 0,
    pending: userSubmissions?.filter(sub => sub?.status === 'pending')?.length || 0,
    totalEarnings: userSubmissions?.filter(sub => sub?.status === 'approved')?.reduce((sum, sub) => sum + (sub?.reward_amount || 0), 0) || 0
  };

  // Use react-router navigation for regular tasks
  const navigate = typeof window !== 'undefined' && window.reactNavigate ? window.reactNavigate : null;
  const handleStartTask = (task) => {
    if (task?.isAdgemOffer) {
      // For AdGem offers, open external URL directly
      const url = (task?.external_url || '')?.replace('{USER_ID}', user?.id || 'guest');
      if (url) window.open(url, '_blank');
    } else if (task?.id) {
      // For regular tasks, navigate to details page
      if (navigate) {
        navigate(`/task-details?id=${task.id}`);
      } else if (window && window.location) {
        window.location.href = `/task-details?id=${task.id}`;
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">📋</div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Available Tasks</h1>
                <p className="text-sm text-text-secondary">
                  Complete tasks to earn rewards • Level {userProfile?.level || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* AdGem Indicator */}
              <div className="hidden sm:flex items-center space-x-2 bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
                <Gamepad2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  AdGem {userProfile?.level >= 5 ? 85 : [10, 25, 40, 55, 70]?.[userProfile?.level] || 10}%
                </span>
              </div>

              <button
                onClick={loadTasks}
                disabled={loading}
                className="p-2 text-text-secondary hover:text-foreground disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <TaskStats tasks={combinedTasks} userSubmissions={userSubmissions} stats={taskStats} />

        {/* Quick Actions */}
        <QuickActions onRefresh={loadTasks} refreshing={loading} />

        {/* Filters */}
        <div className="glass rounded-lg border border-border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Category and Sort Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e?.target?.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="all">All Categories</option>
                <option value="survey">Survey</option>
                <option value="social_media">Social Media</option>
                <option value="app_download">App Download</option>
                <option value="review">Review</option>
                <option value="referral">Referral</option>
                <option value="video_watch">Video Watch</option>
                <option value="adgem">🎮 AdGem Offers</option>
                <option value="adsterra">💰 Adsterra Offers</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e?.target?.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="reward_high">Highest Reward</option>
                <option value="reward_low">Lowest Reward</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {combinedTasks?.length > 0 ? (
              combinedTasks?.map(task => {
                const submission = userSubmissions?.find(sub => sub?.task_id === task?.id);
                return (
                  <TaskCard
                    key={task?.id}
                    task={task}
                    userSubmission={submission}
                    userLevel={userProfile?.level || 0}
                    onStart={handleStartTask}
                    onViewProof={() => console.log('View proof for:', task)}
                  />
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
                <p className="text-text-secondary">
                  {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your search or filters' : 'New tasks will appear here when available'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksList;
