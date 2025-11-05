import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const LoginFooter = () => {
  return (
    <div className="mt-8 space-y-6">
      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-primary hover:text-primary/80 font-medium transition-colors focus:outline-none focus:underline"
          >
            Create one now
          </Link>
        </p>
      </div>

      {/* Security Notice */}
      <div className="glass rounded-lg p-4 border border-border/50 backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={16} className="text-success flex-shrink-0 mt-0.5" />
          <div className="text-xs text-text-secondary">
            <p className="font-medium text-foreground mb-1">Secure Login</p>
            <p>
              Your connection is encrypted and your data is protected. By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginFooter;