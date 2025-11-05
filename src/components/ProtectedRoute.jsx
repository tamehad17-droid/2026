import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Icon from './AppIcon';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and specific roles
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Give some time for auth to initialize
    const timer = setTimeout(() => {
      setChecking(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking authentication
  if (loading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if route requires admin access
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="ShieldX" size={32} className="text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-text-secondary mb-6">
            Sorry, you don't have permission to access this page. This page is for administrators only.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/user-dashboard'}
              className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
