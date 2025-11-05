import React from 'react';
import { Link } from 'react-router-dom';

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <Link to="/" className="inline-block mb-6">
        <div className="flex flex-col items-center gap-2">
          <img 
            src="/logo.png" 
            alt="PromoHive"
            className="w-16 h-16 object-contain"
          />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-foreground">PromoHive</span>
            <span className="text-sm text-text-secondary">GLOBAL PROMO NETWORK</span>
          </div>
        </div>
      </Link>

      {/* Welcome Text */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome Back
        </h1>
        <p className="text-text-secondary">
          Sign in to continue earning rewards
        </p>
      </div>
    </div>
  );
};

export default LoginHeader;