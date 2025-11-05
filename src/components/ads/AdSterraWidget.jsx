import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adRevenueService } from '../../services/adRevenueService';

const AdSterraWidget = ({ 
  adType = 'banner', // banner, popup, native, video
  placement = 'header',
  className = ''
}) => {
  const { user, profile } = useAuth();
  const [adLoaded, setAdLoaded] = useState(false);
  const [earnings, setEarnings] = useState(0);

  // Revenue sharing based on user level
  const getRevenueShare = (level) => {
    const shares = {
      0: 0.10, // 10%
      1: 0.35, // 35%
      2: 0.55, // 55%
      3: 0.78  // 78%
    };
    return shares[level] || 0.10;
  };

  const resolveAdKey = () => {
    if (import.meta?.env?.VITE_ADSTERRA_PUBLISHER_ID) return import.meta.env.VITE_ADSTERRA_PUBLISHER_ID;
    if (import.meta?.env?.VITE_ADSTERRA_API_KEY) return import.meta.env.VITE_ADSTERRA_API_KEY;
    if (typeof process !== 'undefined') {
      if (process.env.NEXT_PUBLIC_ADSTERRA_PUBLISHER_ID) return process.env.NEXT_PUBLIC_ADSTERRA_PUBLISHER_ID;
      if (process.env.REACT_APP_ADSTERRA_PUBLISHER_ID) return process.env.REACT_APP_ADSTERRA_PUBLISHER_ID;
      if (process.env.ADSTERRA_PUBLISHER_ID) return process.env.ADSTERRA_PUBLISHER_ID;
      if (process.env.ADSTERRA_API_KEY) return process.env.ADSTERRA_API_KEY;
    }
    return '';
  };

  useEffect(() => {
    if (!user) return;

    // Load AdSterra script
    const script = document.createElement('script');
    script.src = 'https://pl19566160.profitablegatecpm.com/js/adsterra.js';
    script.async = true;
    script.onload = () => {
      setAdLoaded(true);
      initializeAd();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="adsterra"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [user]);

  const initializeAd = () => {
    if (!window.adsterra) return;

    const adConfig = {
      key: resolveAdKey(),
      format: adType,
      height: adType === 'banner' ? 250 : 300,
      width: adType === 'banner' ? 300 : 250,
      params: {
        placement: placement,
        user_level: profile?.level || 0
      }
    };

    // Initialize AdSterra ad
    window.adsterra.cmd = window.adsterra.cmd || [];
    window.adsterra.cmd.push(() => {
      window.adsterra.display(adConfig);
    });

    // Track revenue (simulated - in real implementation, this would come from AdSterra API)
    trackAdRevenue();
  };

  const trackAdRevenue = async () => {
    try {
      // Simulate ad revenue tracking
      const baseRevenue = Math.random() * 0.05; // $0.00 - $0.05 per view
      const userShare = getRevenueShare(profile?.level || 0);
      const userEarnings = baseRevenue * userShare;

      setEarnings(prev => prev + userEarnings);

      // Record revenue in database
      await adRevenueService.recordAdView({
        userId: user.id,
        platform: 'adsterra',
        adType: adType,
        placement: placement,
        baseRevenue: baseRevenue,
        userShare: userShare,
        userEarnings: userEarnings,
        userLevel: profile?.level || 0
      });
    } catch (error) {
      console.error('Error tracking ad revenue:', error);
    }
  };

  if (!user || !adLoaded) {
    return (
      <div className={`ad-placeholder bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-sm">جاري تحميل الإعلان...</div>
      </div>
    );
  }

  return (
    <div className={`adsterra-container relative ${className}`}>
      {/* Ad Container */}
      <div 
        id={`adsterra-${placement}-${adType}`}
        className="ad-content"
        data-ad-type={adType}
        data-placement={placement}
      >
        {/* AdSterra ad will be injected here */}
      </div>

      {/* Earnings Display (for user) */}
      {earnings > 0 && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          +${earnings.toFixed(4)}
        </div>
      )}

      {/* Level Badge */}
      <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
        Level {profile?.level || 0} • {(getRevenueShare(profile?.level || 0) * 100).toFixed(0)}%
      </div>
    </div>
  );
};

export default AdSterraWidget;
