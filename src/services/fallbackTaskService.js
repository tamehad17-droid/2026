// Fallback Task Service - Works without database
export const fallbackTaskService = {
  // Mock tasks data
  getMockTasks() {
    return [
      {
        id: 'task_1',
        title: 'Complete Daily Survey',
        description: 'Answer a quick survey about your shopping preferences',
        category: 'surveys',
        reward_amount: 1.50,
        status: 'pending',
        requirements: {
          time_estimate: '5-10 minutes',
          difficulty: 'Easy'
        },
        external_url: 'https://example.com/survey',
        created_at: new Date().toISOString(),
        slots_available: 100,
        total_slots: 100
      },
      {
        id: 'task_2',
        title: 'Download Mobile Game',
        description: 'Download and play a mobile game for 15 minutes',
        category: 'gaming',
        reward_amount: 2.25,
        status: 'pending',
        requirements: {
          time_estimate: '15-20 minutes',
          difficulty: 'Medium',
          device: 'Mobile required'
        },
        external_url: 'https://example.com/game',
        created_at: new Date().toISOString(),
        slots_available: 50,
        total_slots: 50
      },
      {
        id: 'task_3',
        title: 'Social Media Follow',
        description: 'Follow our social media accounts and like recent posts',
        category: 'social',
        reward_amount: 0.75,
        status: 'pending',
        requirements: {
          time_estimate: '3-5 minutes',
          difficulty: 'Easy',
          platforms: ['Instagram', 'Twitter', 'Facebook']
        },
        external_url: 'https://example.com/social',
        created_at: new Date().toISOString(),
        slots_available: 200,
        total_slots: 200
      },
      {
        id: 'task_4',
        title: 'Product Review',
        description: 'Write a detailed review for a product you recently purchased',
        category: 'content',
        reward_amount: 3.00,
        status: 'pending',
        requirements: {
          time_estimate: '10-15 minutes',
          difficulty: 'Medium',
          min_words: 100
        },
        external_url: 'https://example.com/review',
        created_at: new Date().toISOString(),
        slots_available: 25,
        total_slots: 25
      },
      {
        id: 'task_5',
        title: 'App Testing',
        description: 'Test a new mobile app and provide feedback',
        category: 'testing',
        reward_amount: 4.50,
        status: 'pending',
        requirements: {
          time_estimate: '20-30 minutes',
          difficulty: 'Hard',
          device: 'iOS or Android'
        },
        external_url: 'https://example.com/app-test',
        created_at: new Date().toISOString(),
        slots_available: 15,
        total_slots: 15
      },
      {
        id: 'task_6',
        title: 'Video Watch & Share',
        description: 'Watch promotional videos and share on social media',
        category: 'video',
        reward_amount: 1.25,
        status: 'pending',
        requirements: {
          time_estimate: '8-12 minutes',
          difficulty: 'Easy',
          videos_count: 3
        },
        external_url: 'https://example.com/videos',
        created_at: new Date().toISOString(),
        slots_available: 75,
        total_slots: 75
      }
    ];
  },

  // Get tasks with filters
  async getTasks(filters = {}) {
    try {
      let tasks = this.getMockTasks();

      // Apply category filter
      if (filters.category && filters.category !== 'all') {
        tasks = tasks.filter(task => task.category === filters.category);
      }

      // Apply reward filters
      if (filters.minReward) {
        tasks = tasks.filter(task => task.reward_amount >= filters.minReward);
      }

      if (filters.maxReward) {
        tasks = tasks.filter(task => task.reward_amount <= filters.maxReward);
      }

      // Sort tasks
      if (filters.sortBy === 'reward_high') {
        tasks.sort((a, b) => b.reward_amount - a.reward_amount);
      } else if (filters.sortBy === 'reward_low') {
        tasks.sort((a, b) => a.reward_amount - b.reward_amount);
      } else {
        // Default: newest first
        tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      return { tasks, error: null };
    } catch (error) {
      return { tasks: [], error };
    }
  },

  // Get tasks for specific user (with level-based rewards)
  async getTasksForUser(userId, filters = {}) {
    try {
      const { tasks } = await this.getTasks(filters);
      
      // Mock user level (in real app, this would come from database)
      const userLevel = 1; // Default level
      
      // Adjust rewards based on user level (mock calculation)
      const adjustedTasks = tasks.map(task => ({
        ...task,
        reward_amount: this.calculateLevelBasedReward(task.reward_amount, userLevel),
        user_level: userLevel
      }));

      return { tasks: adjustedTasks, error: null };
    } catch (error) {
      return { tasks: [], error };
    }
  },

  // Calculate level-based reward
  calculateLevelBasedReward(baseReward, userLevel) {
    const multipliers = {
      0: 0.8,  // Level 0: 80% of base reward
      1: 1.0,  // Level 1: 100% of base reward
      2: 1.2,  // Level 2: 120% of base reward
      3: 1.4,  // Level 3: 140% of base reward
      4: 1.6,  // Level 4: 160% of base reward
      5: 1.8   // Level 5+: 180% of base reward
    };

    const multiplier = userLevel >= 5 ? multipliers[5] : (multipliers[userLevel] || multipliers[0]);
    return parseFloat((baseReward * multiplier).toFixed(2));
  },

  // Get user submissions (mock)
  async getUserSubmissions(userId) {
    try {
      // Mock user submissions
      const mockSubmissions = [
        {
          id: 'sub_1',
          task_id: 'task_1',
          user_id: userId,
          status: 'pending',
          submitted_at: new Date().toISOString(),
          proof_url: 'https://example.com/proof1'
        }
      ];

      return { submissions: mockSubmissions, error: null };
    } catch (error) {
      return { submissions: [], error };
    }
  },

  // Submit task (mock)
  async submitTask(taskId, userId, proofData) {
    try {
      // Mock submission
      const submission = {
        id: `sub_${Date.now()}`,
        task_id: taskId,
        user_id: userId,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        proof_url: proofData.proof_url || '',
        notes: proofData.notes || ''
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { submission, error: null };
    } catch (error) {
      return { submission: null, error };
    }
  },

  // Get user profile (mock)
  async getUserProfile(userId) {
    try {
      const mockProfile = {
        id: userId,
        full_name: 'User Name',
        email: 'user@example.com',
        level: 1,
        balance: 25.50,
        total_earned: 125.75,
        tasks_completed: 8,
        referrals_count: 2
      };

      return { profile: mockProfile, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  },

  // Get task categories
  getTaskCategories() {
    return [
      { value: 'all', label: 'All Categories' },
      { value: 'surveys', label: 'Surveys' },
      { value: 'gaming', label: 'Gaming' },
      { value: 'social', label: 'Social Media' },
      { value: 'content', label: 'Content Creation' },
      { value: 'testing', label: 'App Testing' },
      { value: 'video', label: 'Video Tasks' }
    ];
  },

  // Get task stats (mock)
  async getTaskStats(userId) {
    try {
      const stats = {
        total_tasks: 6,
        completed_tasks: 3,
        pending_submissions: 1,
        total_earned: 8.75,
        success_rate: 85
      };

      return { stats, error: null };
    } catch (error) {
      return { stats: null, error };
    }
  }
};

export default fallbackTaskService;
