import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RegistrationHeader from './components/RegistrationHeader';
import RegistrationForm from './components/RegistrationForm';
import SecurityNotice from './components/SecurityNotice';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/user-dashboard', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Registration Container */}
      <div className="relative w-full max-w-md">
        <div className="glass rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <RegistrationHeader />

          {/* Registration Form */}
          <RegistrationForm />

          {/* Security Notice */}
          <SecurityNotice />
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-secondary">
            By creating an account, you acknowledge that you are at least 18 years old
            and agree to our platform's terms and conditions.
          </p>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <p className="text-xs text-text-secondary text-center">
          © 2022 PromoHive. Secure promotional task platform.
        </p>
      </div>
    </div>
  );
};

export default Register;