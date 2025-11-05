import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityNotice = () => {
  return (
    <div className="mt-8 p-4 rounded-lg glass border border-border">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon name="Shield" size={16} className="text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            Account Security & Approval Process
          </h3>
          <div className="text-xs text-text-secondary space-y-1">
            <p>• All new accounts require admin approval for security purposes</p>
            <p>• You'll receive an email notification once your account is approved</p>
            <p>• Approval typically takes 24-48 hours during business days</p>
            <p>• Your personal information is encrypted and securely stored</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityNotice;