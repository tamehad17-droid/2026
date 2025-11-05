import React, { useState } from 'react';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';

const TestCredentials = () => {
  const [copiedItem, setCopiedItem] = useState(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const credentials = [
    {
      label: 'Admin Account',
      email: 'admin@promohive.com',
      password: 'Admin123!',
      role: 'Admin Dashboard Access',
      bgColor: 'bg-red-500/10 border-red-500/20',
      iconColor: 'text-red-500'
    },
    {
      label: 'User Account 1',
      email: 'user@promohive.com',
      password: 'User123!',
      role: 'Standard User Access',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      iconColor: 'text-blue-500'
    },
    {
      label: 'User Account 2',
      email: 'john.doe@promohive.com',
      password: 'John123!',
      role: 'Standard User Access',
      bgColor: 'bg-green-500/10 border-green-500/20',
      iconColor: 'text-green-500'
    }
  ];

  const copyToClipboard = async (text, type, index) => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopiedItem(`${type}-${index}`);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const fillCredentials = (email, password) => {
    // Find and fill email field
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');
    
    if (emailInput && passwordInput) {
      // Create and dispatch input events to trigger React's onChange
      const emailEvent = new Event('input', { bubbles: true });
      const passwordEvent = new Event('input', { bubbles: true });
      
      emailInput.value = email;
      passwordInput.value = password;
      
      emailInput?.dispatchEvent(emailEvent);
      passwordInput?.dispatchEvent(passwordEvent);
    }
  };

  return (
    <div className="mt-8 p-4 bg-surface/30 rounded-xl border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          🚀 Demo Credentials
        </h3>
        <button
          onClick={() => setShowPasswords(!showPasswords)}
          className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          {showPasswords ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {showPasswords ? 'Hide' : 'Show'} Passwords
        </button>
      </div>
      <div className="space-y-3">
        {credentials?.map((cred, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${cred?.bgColor} backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${cred?.iconColor}`}>
                {cred?.label}
              </span>
              <span className="text-xs text-text-secondary">
                {cred?.role}
              </span>
            </div>
            
            <div className="space-y-2">
              {/* Email */}
              <div className="flex items-center justify-between bg-surface/50 rounded-lg p-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-text-secondary">Email:</div>
                  <div className="text-sm font-mono text-text-primary truncate">
                    {cred?.email}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(cred?.email, 'email', index)}
                  className="ml-2 p-1 hover:bg-surface/50 rounded transition-colors"
                  title="Copy email"
                >
                  {copiedItem === `email-${index}` ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3 text-text-secondary" />
                  )}
                </button>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between bg-surface/50 rounded-lg p-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-text-secondary">Password:</div>
                  <div className="text-sm font-mono text-text-primary">
                    {showPasswords ? cred?.password : '••••••••'}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(cred?.password, 'password', index)}
                  className="ml-2 p-1 hover:bg-surface/50 rounded transition-colors"
                  title="Copy password"
                >
                  {copiedItem === `password-${index}` ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3 text-text-secondary" />
                  )}
                </button>
              </div>

              {/* Quick Fill Button */}
              <button
                onClick={() => fillCredentials(cred?.email, cred?.password)}
                className={`w-full mt-2 py-1.5 px-3 rounded-lg border transition-colors text-xs font-medium
                  ${cred?.bgColor} ${cred?.iconColor} border-current/20 hover:bg-current/5`}
              >
                ⚡ Quick Fill
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-text-secondary mt-4 text-center">
        🔒 These are demo accounts with real Supabase authentication
      </p>
    </div>
  );
};

export default TestCredentials;