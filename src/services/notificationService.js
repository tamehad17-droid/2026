import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

class NotificationService {
  constructor() {
    this.subscribedChannels = new Set();
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(callback) {
    if (!this.subscribedChannels.has('notifications')) {
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications'
        }, payload => {
          callback(payload.new);
        })
        .subscribe();

      this.subscribedChannels.add('notifications');
    }
  }

  // Listen for balance changes
  subscribeToBalanceChanges(callback) {
    if (!this.subscribedChannels.has('balance_changes')) {
      const subscription = supabase
        .channel('balance_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_balances'
        }, payload => {
          callback(payload.new);
        })
        .subscribe();

      this.subscribedChannels.add('balance_changes');
    }
  }

  // Monitor task completions
  subscribeToTaskCompletions(callback) {
    if (!this.subscribedChannels.has('task_completions')) {
      const subscription = supabase
        .channel('task_completions')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'task_submissions'
        }, payload => {
          callback(payload.new);
        })
        .subscribe();

      this.subscribedChannels.add('task_completions');
    }
  }

  // Get total system balance
  async getTotalSystemBalance() {
    try {
      const { data, error } = await supabase.rpc('get_total_system_balance');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching total system balance:', error);
      throw error;
    }
  }

  // Get user balances report
  async getUserBalancesReport() {
    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select(`
          *,
          user:profiles(username, email)
        `)
        .order('balance', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user balances report:', error);
      throw error;
    }
  }

  // Create admin notification
  async createAdminNotification(type, message, metadata = {}) {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert([{
          type,
          message,
          metadata,
          read: false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating admin notification:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();