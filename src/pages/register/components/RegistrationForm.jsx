import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Shield, AlertCircle, CheckCircle, Clock, Key } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { verificationService } from '../../../services/verificationService';
import { supabase } from '../../../lib/supabase';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState('register'); // 'register', 'pending', 'success'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    referralCode: ''
  });
  const [registrationData, setRegistrationData] = useState({
    email: '',
    fullName: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    sent: false,
    timeRemaining: 0
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Removed verification code handling - no longer needed

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData?.fullName?.trim()?.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/?.test(formData?.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and numbers';
    }

    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData?.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await signUp(
        formData?.email, 
        formData?.password,
        {
          fullName: formData?.fullName?.trim(),
          role: 'user'
        }
      );

      if (error) {
        setErrors({ 
          submit: error?.message 
        });
        return;
      }

      // Link referral if provided
      if (formData?.referralCode?.trim() && data?.user?.id) {
        const { data: referralResult, error: referralError } = await supabase?.rpc('link_referral_by_code', {
          p_referral_code: formData?.referralCode?.trim(),
          p_new_user_id: data?.user?.id
        });

        if (referralError) {
          setErrors(prev => ({
            ...prev,
            referralCode: referralError.message || 'Failed to link referral code'
          }));
          return;
        }

        if (!referralResult?.success) {
          setErrors(prev => ({
            ...prev,
            referralCode: referralResult?.error || 'Invalid referral code'
          }));
          return;
        }
      }

      // Set registration data and show pending approval message
      setRegistrationData({
        email: formData?.email,
        fullName: formData?.fullName
      });
      
      // Go directly to pending approval step
      setCurrentStep('pending');

    } catch (error) {
      setErrors({ 
        submit: 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed all verification handling - no longer needed

  const navigateToLogin = () => {
    navigate('/login', { 
      state: { 
        message: 'Registration successful! Please wait for admin approval before logging in.',
        email: registrationData?.email 
      }
    });
  };

  // Pending Approval Step
  if (currentStep === 'pending') {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Clock className="h-16 w-16 text-blue-500 mx-auto animate-pulse" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          Registration Successful!
        </h3>
        <p className="text-text-secondary mb-4">
          Your account has been created successfully.
          <br />
          <strong className="text-text-primary">{registrationData?.email}</strong>
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 text-sm mb-2">
            <strong>⏳ Awaiting Admin Approval</strong>
          </p>
          <p className="text-blue-700 text-sm">
            Your account is currently under review by our admin team.
            You will receive a welcome email with your $5 bonus once approved.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 text-sm">
            <strong>📧 What happens next:</strong>
          </p>
          <ul className="text-green-700 text-sm mt-2 space-y-1 text-left list-disc list-inside">
            <li>Admin reviews your account</li>
            <li>You receive a welcome email when approved</li>
            <li>$5 welcome bonus is added to your account</li>
            <li>You can then sign in and start earning!</li>
          </ul>
        </div>
        <button
          onClick={navigateToLogin}
          className="w-full bg-gradient-to-r from-primary to-primary-hover text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  // Registration Step (Default)
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name Field */}
      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-sm font-medium text-text-primary">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-white/40" />
          </div>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={formData?.fullName}
            onChange={handleChange}
            className={`
              block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm
              bg-white/5 text-white placeholder-white/50
              focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/25
              transition-all duration-200
              hover:bg-white/10
              ${errors?.fullName ? 'border-red-500/50 ring-red-500/20' : 'border-white/20 hover:border-white/30'}
            `}
            placeholder="Enter your full name"
            disabled={isLoading}
          />
        </div>
        {errors?.fullName && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors?.fullName}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-white">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-white/40" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData?.email}
            onChange={handleChange}
            className={`
              block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm
              bg-white/5 text-white placeholder-white/50
              focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/25
              transition-all duration-200
              hover:bg-white/10
              ${errors?.email ? 'border-red-500/50 ring-red-500/20' : 'border-white/20 hover:border-white/30'}
            `}
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>
        {errors?.email && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors?.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-text-primary">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-text-secondary" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={formData?.password}
            onChange={handleChange}
            className={`
              block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm
              bg-white/5 text-white placeholder-white/50
              focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/25
              transition-all duration-200
              hover:bg-white/10
              ${errors?.password ? 'border-red-500/50 ring-red-500/20' : 'border-white/20 hover:border-white/30'}
            `}
            placeholder="Choose a strong password"
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-surface/50 rounded-r-xl transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-text-secondary hover:text-text-primary" />
            ) : (
              <Eye className="h-5 w-5 text-text-secondary hover:text-text-primary" />
            )}
          </button>
        </div>
        {errors?.password && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors?.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-text-secondary" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={formData?.confirmPassword}
            onChange={handleChange}
            className={`
              block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm
              bg-white/5 text-white placeholder-white/50
              focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/25
              transition-all duration-200
              hover:bg-white/10
              ${errors?.confirmPassword ? 'border-red-500/50 ring-red-500/20' : 'border-white/20 hover:border-white/30'}
            `}
            placeholder="Re-enter your password"
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-surface/50 rounded-r-xl transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-text-secondary hover:text-text-primary" />
            ) : (
              <Eye className="h-5 w-5 text-text-secondary hover:text-text-primary" />
            )}
          </button>
        </div>
        {errors?.confirmPassword && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors?.confirmPassword}
          </p>
        )}
      </div>

      {/* Terms Agreement */}
      <div className="space-y-2">
        <div className="flex items-start">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData?.agreeToTerms}
            onChange={handleChange}
            className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
            disabled={isLoading}
          />
          <label htmlFor="agreeToTerms" className="mr-2 text-sm text-text-secondary">
            I agree to the{' '}
            <a href="#" className="text-primary hover:text-primary-hover underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:text-primary-hover underline">
              Privacy Policy
            </a>
          </label>
        </div>
        {errors?.agreeToTerms && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors?.agreeToTerms}
          </p>
        )}
      </div>

      {/* Referral Code (optional) */}
      <div className="space-y-2">
        <label htmlFor="referralCode" className="block text-sm font-medium text-white">
          Referral Code (optional)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key className="h-5 w-5 text-white/40" />
          </div>
          <input
            id="referralCode"
            name="referralCode"
            type="text"
            value={formData?.referralCode}
            onChange={handleChange}
            className={`
              block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm
              bg-white/5 text-white placeholder-white/50
              focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/25
              transition-all duration-200
              hover:bg-white/10
              border-white/20 hover:border-white/30
            `}
            placeholder="Enter a code if you have one"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Submit Error */}
      {errors?.submit && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {errors?.submit}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full flex justify-center items-center gap-2 py-3 px-4
          bg-gradient-to-r from-primary to-primary-hover
          border border-transparent rounded-xl shadow-lg
          text-white font-medium
          hover:shadow-xl hover:scale-[1.02]
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
          transition-all duration-200 ease-out
          ${isLoading ? 'opacity-70 cursor-not-allowed transform-none' : ''}
        `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Creating account...</span>
          </>
        ) : (
          <>
            <Shield className="h-5 w-5" />
            <span>Create Account</span>
          </>
        )}
      </button>
    </form>
  );
};

export default RegistrationForm;