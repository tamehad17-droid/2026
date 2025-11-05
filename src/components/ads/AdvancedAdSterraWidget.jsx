/**
 * AdvancedAdSterraWidget - Professional AdSterra Integration Component
 * Features: Auto-placement detection, responsive design, async loading, error handling
 */

import React, { useEffect, useState, useRef } from 'react';

const AdvancedAdSterraWidget = ({ 
  placement = 'header', 
  adType = 'banner', 
  responsive = true,
  className = '',
  onLoad = null,
  onError = null,
  autoDetectPlacement = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [detectedPlacement, setDetectedPlacement] = useState(placement);
  const adContainerRef = useRef(null);
  const adInstanceRef = useRef(null);

  // Environment variable detection with comprehensive fallbacks
  const getAdSterraId = () => {
    // React/Create React App
    if (process.env.REACT_APP_ADSTERRA_PUBLISHER_ID) {
      return process.env.REACT_APP_ADSTERRA_PUBLISHER_ID;
    }
    // Vite
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSTERRA_PUBLISHER_ID) {
      return import.meta.env.VITE_ADSTERRA_PUBLISHER_ID;
    }
    // Accept API key variables as a fallback if publisher ID not provided
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSTERRA_API_KEY) {
      return import.meta.env.VITE_ADSTERRA_API_KEY;
    }
    // Next.js
    if (process.env.NEXT_PUBLIC_ADSTERRA_PUBLISHER_ID) {
      return process.env.NEXT_PUBLIC_ADSTERRA_PUBLISHER_ID;
    }
    // Node.js/Server-side
    if (process.env.ADSTERRA_PUBLISHER_ID) {
      return process.env.ADSTERRA_PUBLISHER_ID;
    }
    if (process.env.ADSTERRA_API_KEY) {
      return process.env.ADSTERRA_API_KEY;
    }
    // Fallback to direct value for production
    return 'YOUR_ADSTERRA_PUBLISHER_ID';
  };

  // Auto-detect optimal placement based on DOM position
  const detectOptimalPlacement = () => {
    if (!autoDetectPlacement || !adContainerRef.current) {
      return placement;
    }

    const container = adContainerRef.current;
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

  // Advanced ad configuration with responsive breakpoints
  const getAdConfig = () => {
    const adsterraId = getAdSterraId();
    
    if (!adsterraId) {
      console.error('AdSterra ID not found in environment variables');
      return null;
    }

    const currentPlacement = autoDetectPlacement ? detectedPlacement : placement;
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;

    const baseConfig = {
      key: adsterraId,
      placement: currentPlacement,
      responsive: responsive,
      device: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
    };

    // Advanced configuration based on ad type and device
    switch (adType) {
      case 'banner':
        if (currentPlacement === 'header') {
          return {
            ...baseConfig,
            format: 'banner',
            width: isMobile ? 320 : isTablet ? 728 : 728,
            height: isMobile ? 50 : isTablet ? 90 : 90
          };
        } else if (currentPlacement === 'sidebar') {
          return {
            ...baseConfig,
            format: 'banner',
            width: isMobile ? 300 : 300,
            height: isMobile ? 250 : 250
          };
        }
        return {
          ...baseConfig,
          format: 'banner',
          width: isMobile ? 320 : 728,
          height: isMobile ? 100 : 90
        };
      
      case 'native':
        return {
          ...baseConfig,
          format: 'native',
          width: '100%',
          height: 'auto',
          template: currentPlacement === 'sidebar' ? 'vertical' : 'horizontal'
        };
      
      case 'video':
        return {
          ...baseConfig,
          format: 'video',
          width: isMobile ? 300 : isTablet ? 480 : 640,
          height: isMobile ? 169 : isTablet ? 270 : 360,
          autoplay: false,
          muted: true
        };
      
      case 'popup':
        return {
          ...baseConfig,
          format: 'popup',
          frequency: 1,
          delay: 30000 // 30 seconds delay
        };
      
      case 'interstitial':
        return {
          ...baseConfig,
          format: 'interstitial',
          frequency: 1
        };
      
      default:
        return {
          ...baseConfig,
          format: 'banner',
          width: isMobile ? 320 : 728,
          height: isMobile ? 50 : 90
        };
    }
  };

  // Enhanced async script loading with retry mechanism
  const loadAdSterraScript = (retries = 3) => {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (window.adsterra && typeof window.adsterra.display === 'function') {
        resolve(window.adsterra);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://pl19566160.profitablegatecpm.com/js/adsterra.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => {
        script.remove();
        if (retries > 0) {
          console.warn(`AdSterra script timeout, retrying... (${retries} attempts left)`);
          loadAdSterraScript(retries - 1).then(resolve).catch(reject);
        } else {
          reject(new Error('AdSterra script loading timeout'));
        }
      }, 10000); // 10 second timeout
      
      script.onload = () => {
        clearTimeout(timeout);
        if (window.adsterra && typeof window.adsterra.display === 'function') {
          resolve(window.adsterra);
        } else {
          if (retries > 0) {
            console.warn('AdSterra API not ready, retrying...');
            setTimeout(() => {
              loadAdSterraScript(retries - 1).then(resolve).catch(reject);
            }, 1000);
          } else {
            reject(new Error('AdSterra script loaded but API not available'));
          }
        }
      };
      
      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        if (retries > 0) {
          console.warn(`AdSterra script error, retrying... (${retries} attempts left)`);
          setTimeout(() => {
            loadAdSterraScript(retries - 1).then(resolve).catch(reject);
          }, 2000);
        } else {
          reject(new Error('Failed to load AdSterra script after multiple attempts'));
        }
      };

      document.head.appendChild(script);
    });
  };

  // Initialize ad widget with advanced error handling
  const initializeAd = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      // Detect placement if auto-detection is enabled
      if (autoDetectPlacement) {
        const detected = detectOptimalPlacement();
        setDetectedPlacement(detected);
      }

      const adConfig = getAdConfig();
      if (!adConfig) {
        throw new Error('AdSterra configuration failed - missing environment variables');
      }

      // Load AdSterra script with retry mechanism
      const adsterra = await loadAdSterraScript();
      
      // Initialize AdSterra command queue
      window.adsterra.cmd = window.adsterra.cmd || [];
      
      // Create unique container ID
      const containerId = `adsterra-${detectedPlacement}-${adType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      if (adContainerRef.current) {
        adContainerRef.current.id = containerId;
      }

      // Queue ad initialization with timeout
      const initPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Ad initialization timeout'));
        }, 15000);

        window.adsterra.cmd.push(() => {
          try {
            const adInstance = window.adsterra.display({
              ...adConfig,
              container: containerId,
              onLoad: () => {
                clearTimeout(timeout);
                resolve(adInstance);
              },
              onError: (error) => {
                clearTimeout(timeout);
                reject(error);
              }
            });
            
            // Fallback if onLoad/onError callbacks aren't supported
            setTimeout(() => {
              if (adContainerRef.current && adContainerRef.current.children.length > 0) {
                clearTimeout(timeout);
                resolve(adInstance);
              }
            }, 3000);
            
          } catch (error) {
            clearTimeout(timeout);
            reject(error);
          }
        });
      });

      const adInstance = await initPromise;
      adInstanceRef.current = adInstance;
      setAdLoaded(true);
      setIsLoading(false);
      
      if (onLoad) {
        onLoad(adInstance);
      }

    } catch (error) {
      console.error('AdSterra initialization error:', error);
      setHasError(true);
      setIsLoading(false);
      
      if (onError) {
        onError(error);
      }
    }
  };

  // Enhanced cleanup function
  const cleanup = () => {
    if (adInstanceRef.current) {
      try {
        // Attempt to destroy ad instance
        if (typeof adInstanceRef.current.destroy === 'function') {
          adInstanceRef.current.destroy();
        }
        // Clear container
        if (adContainerRef.current) {
          adContainerRef.current.innerHTML = '';
        }
      } catch (error) {
        console.warn('AdSterra cleanup warning:', error);
      }
    }
  };

  // Effect for initialization and cleanup
  useEffect(() => {
    const timer = setTimeout(initializeAd, 100); // Small delay for DOM readiness
    
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [placement, adType, autoDetectPlacement]);

  // Responsive styles with advanced CSS
  const getContainerStyles = () => {
    const currentPlacement = autoDetectPlacement ? detectedPlacement : placement;
    
    const baseStyles = {
      display: 'block',
      margin: '10px 0',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      position: 'relative'
    };

    if (!responsive) {
      return baseStyles;
    }

    const styles = {
      header: {
        ...baseStyles,
        width: '100%',
        maxWidth: '728px',
        margin: '0 auto 20px',
        '@media (max-width: 768px)': {
          maxWidth: '320px',
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
        margin: '20px 0',
        '@media (max-width: 768px)': {
          margin: '15px 0'
        }
      },
      
      footer: {
        ...baseStyles,
        width: '100%',
        maxWidth: '728px',
        margin: '20px auto 0',
        '@media (max-width: 768px)': {
          maxWidth: '320px',
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
        backgroundColor: '#f8f9fa',
        border: '1px dashed #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        color: '#6c757d',
        fontSize: '14px',
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <div 
          style={{
            width: '24px',
            height: '24px',
            border: '3px solid #e9ecef',
            borderTop: '3px solid #007bff',
            borderRadius: '50%',
            animation: 'adsterra-spin 1s linear infinite',
            marginBottom: '10px'
          }}
        />
        <div>Loading AdSterra Ad...</div>
        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
          {autoDetectPlacement ? `Detected: ${detectedPlacement}` : `Placement: ${placement}`}
        </div>
      </div>
    </div>
  );

  // Enhanced error component
  const ErrorPlaceholder = () => (
    <div 
      style={{
        ...getContainerStyles(),
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '15px',
        color: '#856404',
        fontSize: '13px',
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '16px', marginBottom: '5px' }}>⚠️</div>
        <div>Ad failed to load</div>
        <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '5px' }}>
          Please check your AdSterra configuration
        </div>
      </div>
    </div>
  );

  // Development mode warning
  const DevelopmentWarning = () => (
    <div style={{ 
      ...getContainerStyles(), 
      backgroundColor: '#f8d7da', 
      border: '1px solid #f5c6cb', 
      borderRadius: '8px', 
      padding: '15px', 
      color: '#721c24', 
      fontSize: '13px',
      minHeight: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '16px', marginBottom: '5px' }}>🚫</div>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>AdSterra ID Missing</div>
        <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
          Set one of: REACT_APP_ADSTERRA_ID, VITE_ADSTERRA_ID, NEXT_PUBLIC_ADSTERRA_ID, or ADSTERRA_ID
        </div>
      </div>
    </div>
  );

  // Don't render if no AdSterra ID
  if (!getAdSterraId()) {
    if (process.env.NODE_ENV === 'development') {
      return <DevelopmentWarning />;
    }
    return null;
  }

  return (
    <>
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes adsterra-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .adsterra-widget {
          position: relative;
        }
        
        .adsterra-widget[data-placement="header"] {
          margin-bottom: 20px;
        }
        
        .adsterra-widget[data-placement="footer"] {
          margin-top: 20px;
        }
        
        @media (max-width: 768px) {
          .adsterra-widget[data-placement="header"],
          .adsterra-widget[data-placement="footer"] {
            margin: 15px 0;
          }
          
          .adsterra-widget[data-placement="sidebar"] {
            margin: 10px 0;
          }
        }
      `}</style>
      
      <div 
        className={`adsterra-widget ${className}`}
        data-placement={autoDetectPlacement ? detectedPlacement : placement}
        data-ad-type={adType}
        data-responsive={responsive}
      >
        {isLoading && <LoadingPlaceholder />}
        {hasError && <ErrorPlaceholder />}
        
        <div
          ref={adContainerRef}
          style={{
            ...getContainerStyles(),
            display: (isLoading || hasError) ? 'none' : 'block'
          }}
          data-adsterra-container="true"
        />
      </div>
    </>
  );
};

export default AdvancedAdSterraWidget;
