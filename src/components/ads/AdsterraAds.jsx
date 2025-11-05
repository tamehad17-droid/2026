import React, { useEffect } from 'react';

// Adsterra Banner Component
export const AdsterraBanner = ({ 
  width = 728, 
  height = 90, 
  className = "",
  placement = "banner" 
}) => {
  useEffect(() => {
    // Load Adsterra script
    const script = document.createElement('script');
    script.src = import.meta.env?.VITE_ADSTERRA_DIRECT_URL || '';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className={`adsterra-banner ${className}`}>
      <div 
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          margin: '10px auto'
        }}
      >
        {/* Adsterra Referral Banner */}
        <a 
          href="https://beta.publishers.adsterra.com/referral/FxGeM89wHQ" 
          rel="nofollow"
          target="_blank"
        >
          <img 
            alt="Adsterra Banner" 
            src="https://landings-cdn.adsterratech.com/referralBanners/gif/120x60_adsterra_reff.gif"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </a>
      </div>
    </div>
  );
};

// Adsterra Popunder Component
export const AdsterraPopunder = () => {
  useEffect(() => {
    // Popunder script
    const script = document.createElement('script');
    script.innerHTML = `
      (function() {
        var script = document.createElement('script');
        script.src = import.meta.env?.VITE_ADSTERRA_DIRECT_URL || '';
        script.async = true;
        document.head.appendChild(script);
      })();
    `;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return null; // Popunder doesn't need visible component
};

// Adsterra Native Ad Component
export const AdsterraNative = ({ className = "" }) => {
  useEffect(() => {
    // Native ad script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      atOptions = {
        'key' : '105f8b3462908e23fb163a15bb1c7aa4',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    document.head.appendChild(script);

    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.src = (import.meta.env?.VITE_ADSTERRA_DIRECT_URL || '').replace('/ybajxvj6e9?key=','/').replace('https://www.effectivegatecpm.com/','https://www.effectivegatecpm.com/') + '/invoke.js';
    document.head.appendChild(adScript);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if (document.head.contains(adScript)) {
        document.head.removeChild(adScript);
      }
    };
  }, []);

  return (
    <div className={`adsterra-native ${className}`}>
      <div id="adsterra-native-ad" style={{ textAlign: 'center', margin: '20px 0' }}>
        {/* Native ad will be injected here */}
      </div>
    </div>
  );
};

// Smart Link Component for AdGem integration
export const AdGemSmartLink = ({ 
  userId, 
  taskId, 
  className = "",
  children = "Complete Offer" 
}) => {
  const handleClick = async () => {
    try {
      // Track click with AdGem
      const response = await fetch('/api/adgem/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          taskId,
          placementId: import.meta.env?.VITE_ADSTERRA_PLACEMENT_ID
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.redirectUrl) {
          window.open(data.redirectUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error tracking AdGem click:', error);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`adgem-smartlink ${className}`}
    >
      {children}
    </button>
  );
};

// Ad Revenue Tracker Component
export const AdRevenueTracker = ({ userId, adType, revenue }) => {
  useEffect(() => {
    const trackRevenue = async () => {
      try {
        await fetch('/api/ads/track-revenue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            adType,
            revenue,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Error tracking ad revenue:', error);
      }
    };

    if (userId && adType && revenue) {
      trackRevenue();
    }
  }, [userId, adType, revenue]);

  return null;
};

export default {
  AdsterraBanner,
  AdsterraPopunder,
  AdsterraNative,
  AdGemSmartLink,
  AdRevenueTracker
};
