import { supabase } from '../lib/supabase';

export const taskService = {
  // Get all available tasks with level-based rewards for AdGem
  async getTasks(filters = {}) {
    try {
      // Only show tasks that are active/available to users (admin-created tasks should have status 'active')
      let query = supabase?.from('tasks')?.select(`
          *,
          created_by_profile:user_profiles!tasks_created_by_fkey(full_name, email)
        `)?.eq('status', 'active');

      // Apply filters
      if (filters?.category) {
        query = query?.eq('category', filters?.category);
      }

      if (filters?.minReward) {
        query = query?.gte('reward_amount', filters?.minReward);
      }

      if (filters?.maxReward) {
        query = query?.lte('reward_amount', filters?.maxReward);
      }

      // Order by created_at desc
      query = query?.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      return { tasks: data || [], error: null };
    } catch (error) {
      return { tasks: [], error };
    }
  },

  // Get tasks with user-specific rewards (for AdGem level-based display)
  async getTasksForUser(userId, filters = {}) {
    try {
      // Get user level first (defensive: return level 0 for unauthenticated users)
      let userLevel = 0;
      if (userId) {
        try {
          const { data: userProfile } = await supabase?.from('user_profiles')?.select('level')?.eq('id', userId)?.single();
          userLevel = userProfile?.level || 0;
        } catch (err) {
          console.warn('Failed to load user profile for level calculation, defaulting to level 0', err);
          userLevel = 0;
        }
      }

      // Fetch only active tasks for users. Admin may create tasks with status='active'.
      let query = supabase?.from('tasks')?.select(`
          *,
          created_by_profile:user_profiles!tasks_created_by_fkey(full_name, email)
        `)?.eq('status', 'active');

      // Apply filters
      if (filters?.category) {
        query = query?.eq('category', filters?.category);
      }

      if (filters?.minReward) {
        query = query?.gte('reward_amount', filters?.minReward);
      }

      if (filters?.maxReward) {
        query = query?.lte('reward_amount', filters?.maxReward);
      }

      // Order by created_at desc
      query = query?.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      // For AdGem tasks, adjust reward display based on user level
      const adjustedTasks = data?.map(task => {
        if (task?.category === 'adgem' && task?.requirements?.real_value) {
          const realValue = task?.requirements?.real_value;
          const displayReward = this.calculateLevelBasedReward(realValue, userLevel);
          
          return {
            ...task,
            reward_amount: displayReward, // Show level-based reward
            original_reward: undefined, // Hide real value
            user_level: userLevel,
            level_percentage: this.getLevelPercentage(userLevel)
          };
        }
        return task;
      });

      return { tasks: adjustedTasks || [], error: null };
    } catch (error) {
      return { tasks: [], error };
    }
  },

  // Calculate level-based reward for AdGem offers
  calculateLevelBasedReward(realValue, userLevel) {
    const percentages = {
      0: 0.10, // 10% for level 0
      1: 0.25, // 25% for level 1
      2: 0.40, // 40% for level 2

      3: 0.55, // 55% for level 3
      4: 0.70, // 70% for level 4
    };

    // Level 5+ gets 85%
    const percentage = userLevel >= 5 ? 0.85 : (percentages?.[userLevel] || 0.10);
    return parseFloat((realValue * percentage)?.toFixed(2));
  },

  // Get level percentage for display
  getLevelPercentage(userLevel) {
    const percentages = {
      0: 10, // 10% for level 0
      1: 25, // 25% for level 1
      2: 40, // 40% for level 2
      3: 55, // 55% for level 3
      4: 70, // 70% for level 4
    };

    return userLevel >= 5 ? 85 : (percentages?.[userLevel] || 10);
  },

  // Get user's task submissions
  async getUserSubmissions(userId) {
    try {
      const { data, error } = await supabase?.from('task_submissions')?.select(`
          *,
          task:tasks(id, title, reward_amount, category)
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false });

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      return { submissions: data || [], error: null };
    } catch (error) {
      return { submissions: [], error };
    }
  },

  // Submit task proof
  async submitTaskProof(taskId, userId, proofData) {
    try {
      const { data, error } = await supabase?.from('task_submissions')?.insert({
          task_id: taskId,
          user_id: userId,
          proof_text: proofData?.text || '',
          proof_urls: proofData?.urls || [],
          status: 'pending'
        })?.select()?.single();

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      return { submission: data, error: null };
    } catch (error) {
      return { submission: null, error };
    }
  },

  // Get task by ID with user-specific display for AdGem
  async getTaskById(taskId, userId = null) {
    try {
      const { data, error } = await supabase?.from('tasks')?.select(`
          *,
          created_by_profile:user_profiles!tasks_created_by_fkey(full_name, email)
        `)?.eq('id', taskId)?.single();

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      // If AdGem task and user provided, adjust reward display
      if (data?.category === 'adgem' && userId && data?.requirements?.real_value) {
        const { data: userProfile } = await supabase?.from('user_profiles')?.select('level')?.eq('id', userId)?.single();
        const userLevel = userProfile?.level || 0;
        const displayReward = this.calculateLevelBasedReward(data?.requirements?.real_value, userLevel);
        
        return {
          task: {
            ...data,
            reward_amount: displayReward,
            user_level: userLevel,
            level_percentage: this.getLevelPercentage(userLevel)
          },
          error: null
        };
      }

      return { task: data, error: null };
    } catch (error) {
      return { task: null, error };
    }
  },

  // Check if user has submitted for a task
  async hasUserSubmitted(taskId, userId) {
    try {
      const { data, error } = await supabase?.from('task_submissions')?.select('id')?.eq('task_id', taskId)?.eq('user_id', userId)?.single();

      if (error && error?.code !== 'PGRST116') {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      return { hasSubmitted: !!data, error: null };
    } catch (error) {
      return { hasSubmitted: false, error };
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError')) {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.');
        }
        throw error;
      }

      return { profile: data, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  }
};