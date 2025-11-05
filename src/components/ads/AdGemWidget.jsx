import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adRevenueService } from '../../services/adRevenueService';

const AdGemWidget = ({ 
  adType = 'offerwall', // offerwall, survey, game, video
  placement = 'sidebar',
  className = ''
}) => {
  const { user, profile } = useAuth();
  const [adLoaded, setAdLoaded] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [availableOffers, setAvailableOffers] = useState([]);

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

  useEffect(() => {
    if (!user) return;

    // Load AdGem script
    const script = document.createElement('script');
    script.src = 'https://api.adgem.com/v1/wall/js';
    script.async = true;
    script.onload = () => {
      setAdLoaded(true);
      initializeAdGem();
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="adgem"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [user]);

  const initializeAdGem = () => {
    if (!window.AdGem) return;

    const adgemConfig = {
      appId: import.meta.env?.VITE_ADGEM_APP_ID,
      userId: user.id,
      userLevel: profile?.level || 0,
      placement: placement,
      theme: 'dark',
      language: 'ar'
    };

    // Initialize AdGem
    window.AdGem.initialize(adgemConfig);
    
    // Load offers
    loadOffers();

    // Set up event listeners
    window.AdGem.on('offer_completed', handleOfferCompleted);
    window.AdGem.on('offer_clicked', handleOfferClicked);
  };

  const loadOffers = async () => {
    try {
      if (!window.AdGem) return;

      const offers = await window.AdGem.getOffers({
        limit: 10,
        category: adType,
        userLevel: profile?.level || 0
      });

      setAvailableOffers(offers || []);
    } catch (error) {
      console.error('Error loading AdGem offers:', error);
    }
  };

  const handleOfferCompleted = async (offerData) => {
    try {
      const baseRevenue = offerData.payout || 0;
      const userShare = getRevenueShare(profile?.level || 0);
      const userEarnings = baseRevenue * userShare;

      setEarnings(prev => prev + userEarnings);

      // Record revenue in database
      await adRevenueService.recordOfferCompletion({
        userId: user.id,
        platform: 'adgem',
        offerId: offerData.id,
        offerName: offerData.name,
        adType: adType,
        placement: placement,
        baseRevenue: baseRevenue,
        userShare: userShare,
        userEarnings: userEarnings,
        userLevel: profile?.level || 0
      });

      // Show success notification
      showEarningsNotification(userEarnings);
    } catch (error) {
      console.error('Error handling offer completion:', error);
    }
  };

  const handleOfferClicked = async (offerData) => {
    try {
      // Track offer clicks
      await adRevenueService.recordOfferClick({
        userId: user.id,
        platform: 'adgem',
        offerId: offerData.id,
        placement: placement,
        userLevel: profile?.level || 0
      });
    } catch (error) {
      console.error('Error tracking offer click:', error);
    }
  };

  const showEarningsNotification = (amount) => {
    // Create floating notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce';
    notification.innerHTML = `🎉 ربحت $${amount.toFixed(4)}!`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const renderOfferwall = () => {
    if (!availableOffers.length) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">لا توجد عروض متاحة حالياً</div>
          <button 
            onClick={loadOffers}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80"
          >
            إعادة تحميل
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="text-lg font-bold text-white mb-4">
          العروض المتاحة ({availableOffers.length})
        </div>
        {availableOffers.map((offer, index) => (
          <div 
            key={offer.id || index}
            className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all cursor-pointer"
            onClick={() => window.AdGem.showOffer(offer.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-white">{offer.name || 'عرض مميز'}</h4>
                <p className="text-sm text-gray-300">{offer.description || 'اكمل هذا العرض واربح نقاط'}</p>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold">
                  ${((offer.payout || 0.5) * getRevenueShare(profile?.level || 0)).toFixed(3)}
                </div>
                <div className="text-xs text-gray-400">
                  {(getRevenueShare(profile?.level || 0) * 100).toFixed(0)}% من الربح
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!user || !adLoaded) {
    return (
      <div className={`ad-placeholder bg-gray-800 rounded-lg flex items-center justify-center p-6 ${className}`}>
        <div className="text-gray-400 text-sm">جاري تحميل العروض...</div>
      </div>
    );
  }

  return (
    <div className={`adgem-container relative bg-gray-900 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AG</span>
          </div>
          <span className="text-white font-semibold">AdGem</span>
        </div>
        
        {/* Level Badge */}
        <div className="bg-primary text-white text-xs px-3 py-1 rounded-full">
          Level {profile?.level || 0} • {(getRevenueShare(profile?.level || 0) * 100).toFixed(0)}%
        </div>
      </div>

      {/* Content */}
      {adType === 'offerwall' ? renderOfferwall() : (
        <div 
          id={`adgem-${placement}-${adType}`}
          className="adgem-content min-h-[200px]"
          data-ad-type={adType}
          data-placement={placement}
        >
          {/* AdGem content will be injected here */}
        </div>
      )}

      {/* Earnings Display */}
      {earnings > 0 && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          إجمالي الأرباح: ${earnings.toFixed(4)}
        </div>
      )}
    </div>
  );
};

export default AdGemWidget;
