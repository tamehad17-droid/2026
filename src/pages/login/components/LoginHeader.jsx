import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <Link to="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/logo.png" 
            alt="PromoHive"
            className="w-20 h-20 object-contain drop-shadow-lg"
          />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-900">PromoHive</span>
            <span className="text-sm text-gray-500">GLOBAL PROMO NETWORK</span>
          </div>
        </div>
      </Link>

      {/* Welcome Text */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome Back
        </h1>
        <p className="text-text-secondary">
          Sign in to your account to continue earning rewards
        </p>
      </div>
    </div>
  );
};

export default LoginHeader;