/**
 * AdvancedAdGemWidget - Professional AdGem Integration Component
 * Features: Auto-placement detection, responsive design, async loading, error handling
 */

import React, { useEffect, useState, useRef } from 'react';

const AdvancedAdGemWidget = ({ 
  placement = 'sidebar', 
  widgetType = 'offerwall', 
  responsive = true,
  className = '',
  onLoad = null,
  onError = null,
  onOfferCompleted = null,
  autoDetectPlacement = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [detectedPlacement, setDetectedPlacement] = useState(placement);
  const [offers, setOffers] = useState([]);
  const widgetContainerRef = useRef(null);
  const widgetInstanceRef = useRef(null);

  // Environment variable detection with comprehensive fallbacks
  const getAdGemId = () => {
    // React/Create React App
    if (process.env.REACT_APP_ADGEM_APP_ID) {
      return process.env.REACT_APP_ADGEM_APP_ID;
    }
    // Vite
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADGEM_APP_ID) {
      return import.meta.env.VITE_ADGEM_APP_ID;
    }
    // Next.js
    if (process.env.NEXT_PUBLIC_ADGEM_APP_ID) {
      return process.env.NEXT_PUBLIC_ADGEM_APP_ID;
    }
    // Node.js/Server-side
    if (process.env.ADGEM_APP_ID) {
      return process.env.ADGEM_APP_ID;
    }
    // Fallback to direct value for production
    return '31409';
  };

  // Auto-detect optimal placement based on DOM position
  const detectOptimalPlacement = () => {
    if (!autoDetectPlacement || !widgetContainerRef.current) {
      return placement;
    }

    const container = widgetContainerRef.current;
    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // Header area (top 20% of viewport)
    if (rect.top + scrollY < viewportHeight * 0.2) {
      return 'header';
    }
    
    // Footer area (bottom 20% of viewport)
    if (rect.top + scrollY > document.body.scrollHeight - viewportHeight * 0.2) {
      return 'footer';
    }
    
    // Sidebar detection (narrow containers)
    if (container.offsetWidth < 400) {
      return 'sidebar';
    }
    
    // Default to inline for content areas
    return 'inline';
  };

  // Advanced widget configuration with responsive breakpoints
  const getWidgetConfig = () => {
    const adgemId = getAdGemId();
    
    if (!adgemId) {
      console.error('AdGem ID not found in environment variables');
      return null;
    }

    const currentPlacement = autoDetectPlacement ? detectedPlacement : placement;
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;

    const baseConfig = {
      appId: adgemId,
      placement: currentPlacement,
      responsive: responsive,
      device: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      theme: 'auto', // auto, light, dark
      language: 'en' // or detect from browser
    };

    // Advanced configuration based on widget type and device
    switch (widgetType) {
      case 'offerwall':
        return {
          ...baseConfig,
          type: 'offerwall',
          width: isMobile ? '100%' : currentPlacement === 'sidebar' ? 300 : 600,
          height: isMobile ? 400 : currentPlacement === 'sidebar' ? 500 : 600,
          categories: ['games', 'apps', 'surveys'], // Filter categories
          minPayout: 0.01 // Minimum payout to show
        };
      
      case 'survey':
        return {
          ...baseConfig,
          type: 'survey',
          width: isMobile ? '100%' : currentPlacement === 'sidebar' ? 300 : 500,
          height: isMobile ? 300 : 400,
          categories: ['surveys'],
          minPayout: 0.05
        };
      
      case 'game':
        return {
          ...baseConfig,
          type: 'game',
          width: isMobile ? '100%' : currentPlacement === 'sidebar' ? 300 : 500,
          height: isMobile ? 350 : 450,
          categories: ['games'],
          minPayout: 0.02
        };
      
      case 'video':
        return {
          ...baseConfig,
          type: 'video',
          width: isMobile ? '100%' : currentPlacement === 'sidebar' ? 300 : 480,
          height: isMobile ? 200 : currentPlacement === 'sidebar' ? 200 : 270,
          categories: ['videos'],
          autoplay: false,
          muted: true
        };
      
      case 'banner':
        return {
          ...baseConfig,
          type: 'banner',
          width: isMobile ? 320 : currentPlacement === 'sidebar' ? 300 : 728,
          height: isMobile ? 50 : currentPlacement === 'sidebar' ? 250 : 90
        };
      
      default:
        return {
          ...baseConfig,
          type: 'offerwall',
          width: isMobile ? '100%' : 300,
          height: isMobile ? 400 : 500
        };
    }
  };

  // Enhanced async script loading with retry mechanism
  const loadAdGemScript = (retries = 3) => {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (window.AdGem && typeof window.AdGem.init === 'function') {
        resolve(window.AdGem);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://api.adgem.com/v1/wall/js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => {
        script.remove();
        if (retries > 0) {
          console.warn(`AdGem script timeout, retrying... (${retries} attempts left)`);
          loadAdGemScript(retries - 1).then(resolve).catch(reject);
        } else {
          reject(new Error('AdGem script loading timeout'));
        }
      }, 10000); // 10 second timeout
      
      script.onload = () => {
        clearTimeout(timeout);
        if (window.AdGem && typeof window.AdGem.init === 'function') {
          resolve(window.AdGem);
        } else {
          if (retries > 0) {
            console.warn('AdGem API not ready, retrying...');
            setTimeout(() => {
              loadAdGemScript(retries - 1).then(resolve).catch(reject);
            }, 1000);
          } else {
            reject(new Error('AdGem script loaded but API not available'));
          }
        }
      };
      
      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        if (retries > 0) {
          console.warn(`AdGem script error, retrying... (${retries} attempts left)`);
          setTimeout(() => {
            loadAdGemScript(retries - 1).then(resolve).catch(reject);
          }, 2000);
        } else {
          reject(new Error('Failed to load AdGem script after multiple attempts'));
        }
      };

      document.head.appendChild(script);
    });
  };

  // Initialize widget with advanced error handling
  const initializeWidget = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      // Detect placement if auto-detection is enabled
      if (autoDetectPlacement) {
        const detected = detectOptimalPlacement();
        setDetectedPlacement(detected);
      }

      const widgetConfig = getWidgetConfig();
      if (!widgetConfig) {
        throw new Error('AdGem configuration failed - missing environment variables');
      }

      // Load AdGem script with retry mechanism
      const AdGem = await loadAdGemScript();
      
      // Create unique container ID
      const containerId = `adgem-${detectedPlacement}-${widgetType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      if (widgetContainerRef.current) {
        widgetContainerRef.current.id = containerId;
      }

      // Initialize AdGem with timeout
      const initPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Widget initialization timeout'));
        }, 15000);

        try {
          const widgetInstance = AdGem.init({
            ...widgetConfig,
            container: containerId,
            onReady: () => {
              clearTimeout(timeout);
              resolve(widgetInstance);
            },
            onError: (error) => {
              clearTimeout(timeout);
              reject(error);
            },
            onOfferCompleted: (offerData) => {
              if (onOfferCompleted) {
                onOfferCompleted(offerData);
              }
              // Show success notification
              showOfferCompletedNotification(offerData);
            },
            onOffersLoaded: (offersData) => {
              setOffers(offersData || []);
            }
          });

          // Fallback if onReady callback isn't supported
          setTimeout(() => {
            if (widgetContainerRef.current && widgetContainerRef.current.children.length > 0) {
              clearTimeout(timeout);
              resolve(widgetInstance);
            }
          }, 3000);

        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });

      const widgetInstance = await initPromise;
      widgetInstanceRef.current = widgetInstance;
      setWidgetLoaded(true);
      setIsLoading(false);
      
      if (onLoad) {
        onLoad(widgetInstance);
      }

    } catch (error) {
      console.error('AdGem initialization error:', error);
      setHasError(true);
      setIsLoading(false);
      
      if (onError) {
        onError(error);
      }
    }
  };

  // Show offer completed notification
  const showOfferCompletedNotification = (offerData) => {
    // Create floating notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #00d4ff, #ff0080);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      animation: slideInRight 0.3s ease-out;
      max-width: 300px;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center;">
        <div style="font-size: 20px; margin-right: 10px;">🎉</div>
        <div>
          <div style="font-weight: bold;">Offer Completed!</div>
          <div style="font-size: 12px; opacity: 0.9;">${offerData.name || 'Great job!'}</div>
        </div>
      </div>
    `;

    // Add animation keyframes
    if (!document.getElementById('adgem-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'adgem-notification-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  };

  // Enhanced cleanup function
  const cleanup = () => {
    if (widgetInstanceRef.current) {
      try {
        // Attempt to destroy widget instance
        if (typeof widgetInstanceRef.current.destroy === 'function') {
          widgetInstanceRef.current.destroy();
        }
        // Clear container
        if (widgetContainerRef.current) {
          widgetContainerRef.current.innerHTML = '';
        }
      } catch (error) {
        console.warn('AdGem cleanup warning:', error);
      }
    }
  };

  // Effect for initialization and cleanup
  useEffect(() => {
    const timer = setTimeout(initializeWidget, 100); // Small delay for DOM readiness
    
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [placement, widgetType, autoDetectPlacement]);

  // Responsive styles with advanced CSS
  const getContainerStyles = () => {
    const currentPlacement = autoDetectPlacement ? detectedPlacement : placement;
    
    const baseStyles = {
      display: 'block',
      margin: '10px 0',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden'
    };

    if (!responsive) {
      return baseStyles;
    }

    const styles = {
      header: {
        ...baseStyles,
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto 20px',
        '@media (max-width: 768px)': {
          maxWidth: '100%',
          margin: '0 auto 15px'
        }
      },
      
      sidebar: {
        ...baseStyles,
        width: '100%',
        maxWidth: '300px',
        margin: '10px 0',
        '@media (max-width: 768px)': {
          maxWidth: '100%',
          margin: '15px 0'
        }
      },
      
      inline: {
        ...baseStyles,
        width: '100%',
        maxWidth: '600px',
        margin: '20px auto',
        '@media (max-width: 768px)': {
          margin: '15px auto'
        }
      },
      
      footer: {
        ...baseStyles,
        width: '100%',
        maxWidth: '600px',
        margin: '20px auto 0',
        '@media (max-width: 768px)': {
          margin: '15px auto 0'
        }
      }
    };

    return styles[currentPlacement] || baseStyles;
  };

  // Enhanced loading component
  const LoadingPlaceholder = () => (
    <div 
      style={{
        ...getContainerStyles(),
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '30px 20px',
        color: 'white',
        fontSize: '14px',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <div 
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'adgem-spin 1s linear infinite',
            marginBottom: '15px'
          }}
        />
        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>
          Loading AdGem {widgetType}...
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          {autoDetectPlacement ? `Detected: ${detectedPlacement}` : `Placement: ${placement}`}
        </div>
        {offers.length > 0 && (
          <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '5px' }}>
            {offers.length} offers available
          </div>
        )}
      </div>
    </div>
  );

  // Enhanced error component
  const ErrorPlaceholder = () => (
    <div 
      style={{
        ...getContainerStyles(),
        background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '20px',
        color: 'white',
        fontSize: '13px',
        minHeight: '150px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>
          AdGem Widget Failed to Load
        </div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          Please check your AdGem configuration
        </div>
      </div>
    </div>
  );

  // Development mode warning
  const DevelopmentWarning = () => (
    <div style={{ 
      ...getContainerStyles(), 
      background: 'linear-gradient(135deg, #ff7675, #d63031)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px', 
      padding: '20px', 
      color: 'white', 
      fontSize: '13px',
      minHeight: '120px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', marginBottom: '10px' }}>🚫</div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
          AdGem ID Missing
        </div>
        <div style={{ fontSize: '11px', lineHeight: '1.4', opacity: 0.9 }}>
          Set one of: REACT_APP_ADGEM_ID, VITE_ADGEM_ID,<br />
          NEXT_PUBLIC_ADGEM_ID, or ADGEM_ID
        </div>
      </div>
    </div>
  );

  // Don't render if no AdGem ID
  if (!getAdGemId()) {
    if (process.env.NODE_ENV === 'development') {
      return <DevelopmentWarning />;
    }
    return null;
  }

  return (
    <>
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes adgem-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .adgem-widget {
          position: relative;
        }
        
        .adgem-widget[data-placement="header"] {
          margin-bottom: 20px;
        }
        
        .adgem-widget[data-placement="footer"] {
          margin-top: 20px;
        }
        
        @media (max-width: 768px) {
          .adgem-widget[data-placement="header"],
          .adgem-widget[data-placement="footer"] {
            margin: 15px 0;
          }
          
          .adgem-widget[data-placement="sidebar"] {
            margin: 10px 0;
          }
        }
      `}</style>
      
      <div 
        className={`adgem-widget ${className}`}
        data-placement={autoDetectPlacement ? detectedPlacement : placement}
        data-widget-type={widgetType}
        data-responsive={responsive}
      >
        {isLoading && <LoadingPlaceholder />}
        {hasError && <ErrorPlaceholder />}
        
        <div
          ref={widgetContainerRef}
          style={{
            ...getContainerStyles(),
            display: (isLoading || hasError) ? 'none' : 'block'
          }}
          data-adgem-container="true"
        />
      </div>
    </>
  );
};

export default AdvancedAdGemWidget;
