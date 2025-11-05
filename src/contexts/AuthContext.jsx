import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { verificationService } from '../services/verificationService';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({
    emailVerified: false,
    approvalStatus: 'pending',
    userStatus: 'pending'
  });

  useEffect(() => {
    // Get initial session
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const { session } = await authService?.getSession();
      if (session?.user) {
        setUser(session?.user);
        await loadUserProfile(session?.user?.id);
        await loadVerificationStatus(session?.user?.id);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      const { profile, error } = await authService?.getUserProfile(userId);
      if (profile && !error) {
        setProfile(profile);

        // Ensure welcome bonus is applied for brand new level 0 users (defensive)
        try {
          if (profile?.level === 0 && profile?.welcome_bonus_used === false) {
            await supabase?.rpc('give_welcome_bonus', { user_uuid: userId });
            // reload to reflect new balance
            const refreshed = await authService?.getUserProfile(userId);
            if (refreshed?.profile) setProfile(refreshed.profile);
          }
        } catch (e) {
          // non-fatal
          // eslint-disable-next-line no-console
          console.warn('Welcome bonus check failed:', e?.message || e);
        }
      }
    } catch (error) {
      console.error('Profile loading error:', error);
    }
  };

  const loadVerificationStatus = async (userId) => {
    try {
      const result = await verificationService?.getVerificationStatus(userId);
      if (result?.success) {
        setVerificationStatus(result?.data);
      }
    } catch (error) {
      console.error('Verification status loading error:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      const result = await authService?.signIn(email, password);
      if (result?.user && !result?.error) {
        setUser(result?.user);
        await loadUserProfile(result?.user?.id);
        await loadVerificationStatus(result?.user?.id);
      }
      return result;
    } catch (error) {
      return { user: null, session: null, error };
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      const result = await authService?.signUp(email, password, metadata);
      if (result?.user && !result?.error) {
        setUser(result?.user);
        // Don't load profile immediately for new users - they need verification first
        setVerificationStatus({
          emailVerified: false,
          approvalStatus: 'pending',
          userStatus: 'pending'
        });
      }
      return result;
    } catch (error) {
      return { user: null, session: null, error };
    }
  };

  const signOut = async () => {
    try {
      const result = await authService?.signOut();
      if (!result?.error) {
        setUser(null);
        setProfile(null);
        setVerificationStatus({
          emailVerified: false,
          approvalStatus: 'pending',
          userStatus: 'pending'
        });
      }
      return result;
    } catch (error) {
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await loadUserProfile(user?.id);
      await loadVerificationStatus(user?.id);
    }
  };

  const updateProfile = async (updates) => {
    if (!user?.id) {
      return { profile: null, error: new Error('No user logged in') };
    }

    try {
      const result = await authService?.updateUserProfile(user?.id, updates);
      if (result?.profile && !result?.error) {
        setProfile(result?.profile);
      }
      return result;
    } catch (error) {
      return { profile: null, error };
    }
  };

  // Check if user needs email verification
  const needsEmailVerification = () => {
    return user && !verificationStatus?.emailVerified;
  };

  // Check if user needs admin approval
  const needsAdminApproval = () => {
    return user && verificationStatus?.emailVerified && verificationStatus?.approvalStatus === 'pending';
  };

  // Check if user is fully activated
  const isFullyActivated = () => {
    return user && verificationStatus?.emailVerified && verificationStatus?.approvalStatus === 'approved';
  };

  // Check if user is admin
  const isAdmin = () => {
    return profile?.role === 'admin' || profile?.role === 'super_admin';
  };

  const value = {
    user,
    profile,
    loading,
    verificationStatus,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
    needsEmailVerification,
    needsAdminApproval,
    isFullyActivated,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuthContext(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: useAuthContext is not implemented yet.', args);
  return null;
}

export { useAuthContext };