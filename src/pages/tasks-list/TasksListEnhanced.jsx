import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, Filter, SortAsc, Grid, List, Star, Clock, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';
import TaskCard from '../../components/ui/TaskCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';

const TasksListEnhanced = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories', count: 0 },
    { value: 'social', label: 'Social Media', count: 0 },
    { value: 'survey', label: 'Surveys', count: 0 },
    { value: 'gaming', label: 'Gaming', count: 0 },
    { value: 'content', label: 'Content Creation', count: 0 },
    { value: 'testing', label: 'App Testing', count: 0 }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'easy', label: 'Easy', color: 'success' },
    { value: 'medium', label: 'Medium', color: 'warning' },
    { value: 'hard', label: 'Hard', color: 'destructive' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'reward_high', label: 'Highest Reward' },
    { value: 'reward_low', label: 'Lowest Reward' },
    { value: 'difficulty', label: 'By Difficulty' }
  ];

  useEffect(() => {
    loadTasks();
  }, [user?.id]);

  const loadTasks = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { tasks: fetchedTasks } = await taskService.getTasksForUser(user.id, {});
      const { submissions } = await taskService.getUserSubmissions(user.id);
      
      setTasks(fetchedTasks || []);
      setUserSubmissions(submissions || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || task.difficulty_level === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'reward_high':
        return (b.reward_amount || 0) - (a.reward_amount || 0);
      case 'reward_low':
        return (a.reward_amount || 0) - (b.reward_amount || 0);
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return difficultyOrder[a.difficulty_level] - difficultyOrder[b.difficulty_level];
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  // Calculate statistics
  const stats = {
    total: tasks.length,
    available: tasks.filter(t => t.status === 'active').length,
    completed: userSubmissions.filter(s => s.status === 'approved').length,
    pending: userSubmissions.filter(s => s.status === 'pending').length,
    totalEarned: userSubmissions
      .filter(s => s.status === 'approved')
      .reduce((sum, s) => sum + (s.reward_amount || 0), 0)
  };

  const handleTaskStart = (task) => {
    if (task?.id) {
      navigate(`/task-details/${task.id}`);
    }
  };

  const handleTaskView = (task) => {
    console.log('Viewing task:', task);
    // Navigate to task details
  };

  return (
    <>
      <Helmet>
        <title>Available Tasks - PromoHive</title>
        <meta name="description" content="Browse and complete tasks to earn rewards" />
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
                <div className="text-2xl">📋</div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Available Tasks</h1>
                  <p className="text-sm text-muted-foreground">
                    Complete tasks to earn rewards • Level {profile?.level || 1}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="hidden sm:flex">
                  {stats.available} Available
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadTasks}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
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
                    <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Grid className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <Star className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold text-primary">${stats.totalEarned.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters and Search */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-3">
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <option value="all">All Categories</option>
                      <option value="social">Social Media</option>
                      <option value="survey">Surveys</option>
                      <option value="gaming">Gaming</option>
                      <option value="content">Content</option>
                      <option value="testing">Testing</option>
                    </Select>

                    <Select
                      value={selectedDifficulty}
                      onValueChange={setSelectedDifficulty}
                    >
                      <option value="all">All Levels</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </Select>

                    <Select
                      value={sortBy}
                      onValueChange={setSortBy}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="reward_high">Highest Reward</option>
                      <option value="reward_low">Lowest Reward</option>
                    </Select>

                    {/* View Mode Toggle */}
                    <div className="flex border rounded-lg">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-r-none"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-l-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Active Filters */}
                {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || searchTerm) && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    {searchTerm && (
                      <Badge variant="secondary">
                        Search: {searchTerm}
                        <button
                          onClick={() => setSearchTerm('')}
                          className="ml-2 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {selectedCategory !== 'all' && (
                      <Badge variant="secondary">
                        Category: {selectedCategory}
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className="ml-2 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {selectedDifficulty !== 'all' && (
                      <Badge variant="secondary">
                        Level: {selectedDifficulty}
                        <button
                          onClick={() => setSelectedDifficulty('all')}
                          className="ml-2 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks Grid/List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-full"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                        <div className="flex justify-between">
                          <div className="h-6 bg-muted rounded w-16"></div>
                          <div className="h-6 bg-muted rounded w-20"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedTasks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                      ? 'Try adjusting your filters to see more tasks.'
                      : 'Check back later for new tasks to complete.'}
                  </p>
                  {(searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSelectedDifficulty('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                <AnimatePresence>
                  {sortedTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TaskCard
                        task={task}
                        onStart={handleTaskStart}
                        onView={handleTaskView}
                        className={viewMode === 'list' ? 'w-full' : ''}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Load More Button */}
          {sortedTasks.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mt-8"
            >
              <Button variant="outline" size="lg">
                Load More Tasks
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default TasksListEnhanced;
