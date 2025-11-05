import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { notificationService } from '../../../services/notificationService';
import Icon from '../../../components/AppIcon';

const ErrorMonitor = () => {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadErrors();
    setupErrorListener();
  }, []);

  const loadErrors = async () => {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setErrors(data);
    } catch (error) {
      console.error('Error loading error logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupErrorListener = () => {
    const subscription = supabase
      .channel('error_logs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'error_logs'
      }, payload => {
        setErrors(prev => [payload.new, ...prev].slice(0, 50));
        notifyError(payload.new);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const notifyError = (error) => {
    notificationService.createAdminNotification(
      'error',
      `New error: ${error.error_message}`,
      { errorId: error.id }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">System Errors</h2>
        <button
          onClick={loadErrors}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Icon name="RefreshCw" size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {errors.map((error) => (
          <div key={error.id} className="glass p-4 rounded-xl space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" className="text-red-500" />
                <span className="font-medium text-foreground">
                  {error.error_message}
                </span>
              </div>
              <span className="text-sm text-text-secondary">
                {new Date(error.created_at).toLocaleString()}
              </span>
            </div>
            
            {error.error_stack && (
              <pre className="text-sm bg-muted p-2 rounded overflow-x-auto">
                {error.error_stack}
              </pre>
            )}
            
            {error.context && (
              <div className="text-sm text-text-secondary">
                <strong>Context:</strong>
                <pre className="mt-1 bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(JSON.parse(error.context), null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}

        {errors.length === 0 && (
          <div className="text-center py-8">
            <Icon
              name="CheckCircle"
              size={48}
              className="text-success mx-auto mb-4"
            />
            <p className="text-text-secondary">No errors found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMonitor;