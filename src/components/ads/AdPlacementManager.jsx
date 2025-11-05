/**
 * AdPlacementManager - Intelligent Ad Placement System
 * Automatically detects optimal positions and manages multiple ad widgets
 */

import React, { useEffect, useState, useRef } from 'react';
import AdvancedAdSterraWidget from './AdvancedAdSterraWidget';
import AdvancedAdGemWidget from './AdvancedAdGemWidget';

const AdPlacementManager = ({
  enableAutoPlacement = true,
  maxAdsPerPage = 4,
  minDistanceBetweenAds = 500, // pixels
  adTypes = ['adsterra', 'adgem'],
  className = ''
}) => {
  const [placements, setPlacements] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const managerRef = useRef(null);
  const observerRef = useRef(null);

  // Analyze page structure and detect optimal ad placements
  const analyzePage = () => {
    if (!enableAutoPlacement) {
      return [];
    }

    const detectedPlacements = [];
    
    try {
      // 1. Header placement - look for header, nav, or top elements
      const headerElements = document.querySelectorAll('header, nav, .header, .navbar, .top-bar');
      if (headerElements.length > 0) {
        const headerElement = headerElements[0];
        const rect = headerElement.getBoundingClientRect();
        
        detectedPlacements.push({
          id: 'auto-header',
          type: 'header',
          position: { top: rect.bottom + 20, left: '50%', transform: 'translateX(-50%)' },
          adType: 'adsterra',
          widgetType: 'banner',
          priority: 1
        });
      }

      // 2. Content area placements - look for articles, main content
      const contentElements = document.querySelectorAll('article, main, .content, .post, .article-body');
      if (contentElements.length > 0) {
        const contentElement = contentElements[0];
        const paragraphs = contentElement.querySelectorAll('p, .paragraph');
        
        // Place ads between paragraphs (every 3-4 paragraphs)
        paragraphs.forEach((paragraph, index) => {
          if (index > 0 && index % 3 === 0 && detectedPlacements.length < maxAdsPerPage) {
            const rect = paragraph.getBoundingClientRect();
            
            detectedPlacements.push({
              id: `auto-inline-${index}`,
              type: 'inline',
              position: { top: rect.top - 10, left: '50%', transform: 'translateX(-50%)' },
              adType: index % 2 === 0 ? 'adsterra' : 'adgem',
              widgetType: index % 2 === 0 ? 'native' : 'banner',
              priority: 3
            });
          }
        });
      }

      // 3. Sidebar placement - look for sidebar elements
      const sidebarElements = document.querySelectorAll('aside, .sidebar, .side-panel, .widget-area');
      if (sidebarElements.length > 0 && detectedPlacements.length < maxAdsPerPage) {
        const sidebarElement = sidebarElements[0];
        const rect = sidebarElement.getBoundingClientRect();
        
        detectedPlacements.push({
          id: 'auto-sidebar',
          type: 'sidebar',
          position: { top: rect.top + 50, left: rect.left, width: rect.width },
          adType: 'adgem',
          widgetType: 'offerwall',
          priority: 2
        });
      }

      // 4. Footer placement - look for footer elements
      const footerElements = document.querySelectorAll('footer, .footer, .bottom-bar');
      if (footerElements.length > 0 && detectedPlacements.length < maxAdsPerPage) {
        const footerElement = footerElements[0];
        const rect = footerElement.getBoundingClientRect();
        
        detectedPlacements.push({
          id: 'auto-footer',
          type: 'footer',
          position: { top: rect.top - 100, left: '50%', transform: 'translateX(-50%)' },
          adType: 'adsterra',
          widgetType: 'banner',
          priority: 4
        });
      }

      // 5. Floating/sticky placements for mobile
      if (window.innerWidth <= 768 && detectedPlacements.length < maxAdsPerPage) {
        detectedPlacements.push({
          id: 'auto-mobile-sticky',
          type: 'sticky',
          position: { bottom: 0, left: 0, right: 0, position: 'fixed' },
          adType: 'adsterra',
          widgetType: 'banner',
          priority: 5,
          mobile: true
        });
      }

    } catch (error) {
      console.warn('Ad placement analysis error:', error);
    }

    // Filter out placements that are too close to each other
    const filteredPlacements = filterPlacementsByDistance(detectedPlacements);
    
    // Sort by priority and limit to maxAdsPerPage
    return filteredPlacements
      .sort((a, b) => a.priority - b.priority)
      .slice(0, maxAdsPerPage);
  };

  // Filter placements that are too close to each other
  const filterPlacementsByDistance = (placements) => {
    const filtered = [];
    
    placements.forEach(placement => {
      const tooClose = filtered.some(existing => {
        const distance = Math.abs(placement.position.top - existing.position.top);
        return distance < minDistanceBetweenAds;
      });
      
      if (!tooClose) {
        filtered.push(placement);
      }
    });
    
    return filtered;
  };

  // Create intersection observer for lazy loading
  const createIntersectionObserver = () => {
    if (!window.IntersectionObserver) {
      return null;
    }

    return new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const placementId = entry.target.dataset.placementId;
            const placement = placements.find(p => p.id === placementId);
            
            if (placement && !placement.loaded) {
              // Mark as loaded to trigger ad rendering
              setPlacements(prev => 
                prev.map(p => 
                  p.id === placementId ? { ...p, loaded: true } : p
                )
              );
            }
          }
        });
      },
      {
        rootMargin: '100px', // Load ads 100px before they come into view
        threshold: 0.1
      }
    );
  };

  // Initialize placement analysis
  useEffect(() => {
    const initializePlacements = () => {
      setIsAnalyzing(true);
      
      // Wait for DOM to be ready
      setTimeout(() => {
        const detectedPlacements = analyzePage();
        setPlacements(detectedPlacements.map(p => ({ ...p, loaded: false })));
        setIsAnalyzing(false);
      }, 1000);
    };

    // Run analysis on mount and when window resizes
    initializePlacements();
    
    const handleResize = () => {
      // Debounce resize events
      clearTimeout(window.adPlacementResizeTimeout);
      window.adPlacementResizeTimeout = setTimeout(initializePlacements, 500);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.adPlacementResizeTimeout) {
        clearTimeout(window.adPlacementResizeTimeout);
      }
    };
  }, [enableAutoPlacement, maxAdsPerPage, minDistanceBetweenAds]);

  // Set up intersection observer
  useEffect(() => {
    if (placements.length > 0) {
      observerRef.current = createIntersectionObserver();
      
      // Observe all placement containers
      const containers = document.querySelectorAll('[data-placement-id]');
      containers.forEach(container => {
        if (observerRef.current) {
          observerRef.current.observe(container);
        }
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [placements]);

  // Render individual ad placement
  const renderAdPlacement = (placement) => {
    const { id, type, adType, widgetType, position, loaded, mobile } = placement;
    
    // Don't render mobile-specific ads on desktop and vice versa
    if (mobile && window.innerWidth > 768) return null;
    if (!mobile && type === 'sticky' && window.innerWidth <= 768) return null;

    const containerStyle = {
      position: position.position || 'absolute',
      top: position.top,
      left: position.left,
      right: position.right,
      bottom: position.bottom,
      width: position.width,
      transform: position.transform,
      zIndex: type === 'sticky' ? 1000 : 'auto',
      pointerEvents: 'auto'
    };

    // Lazy loading - only render when in viewport
    if (!loaded) {
      return (
        <div
          key={id}
          data-placement-id={id}
          style={{
            ...containerStyle,
            minHeight: '100px',
            backgroundColor: 'transparent'
          }}
        />
      );
    }

    return (
      <div
        key={id}
        data-placement-id={id}
        style={containerStyle}
        className="ad-placement-container"
      >
        {adType === 'adsterra' ? (
          <AdvancedAdSterraWidget
            placement={type}
            adType={widgetType}
            responsive={true}
            autoDetectPlacement={false}
            className="auto-placed-ad"
          />
        ) : (
          <AdvancedAdGemWidget
            placement={type}
            widgetType={widgetType}
            responsive={true}
            autoDetectPlacement={false}
            className="auto-placed-ad"
          />
        )}
      </div>
    );
  };

  // Manual placement components for specific use cases
  const ManualPlacement = ({ children, placement, ...props }) => {
    return (
      <div className="manual-ad-placement" data-placement={placement}>
        {React.cloneElement(children, { placement, ...props })}
      </div>
    );
  };

  // If auto-placement is disabled, render children manually
  if (!enableAutoPlacement) {
    return (
      <div ref={managerRef} className={`ad-placement-manager manual ${className}`}>
        {/* Provide manual placement components */}
        <ManualPlacement placement="header">
          <AdvancedAdSterraWidget adType="banner" />
        </ManualPlacement>
        
        <ManualPlacement placement="sidebar">
          <AdvancedAdGemWidget widgetType="offerwall" />
        </ManualPlacement>
        
        <ManualPlacement placement="footer">
          <AdvancedAdSterraWidget adType="banner" />
        </ManualPlacement>
      </div>
    );
  }

  return (
    <>
      {/* CSS for ad placements */}
      <style jsx>{`
        .ad-placement-manager {
          position: relative;
          pointer-events: none;
        }
        
        .ad-placement-container {
          pointer-events: auto;
        }
        
        .auto-placed-ad {
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .analyzing-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          pointer-events: none;
        }
        
        .analyzing-message {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          color: #333;
        }
        
        @media (max-width: 768px) {
          .auto-placed-ad {
            margin: 10px;
          }
        }
      `}</style>
      
      <div ref={managerRef} className={`ad-placement-manager auto ${className}`}>
        {/* Show analyzing overlay */}
        {isAnalyzing && (
          <div className="analyzing-overlay">
            <div className="analyzing-message">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #ccc',
                  borderTop: '2px solid #007bff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '10px'
                }} />
                Analyzing page for optimal ad placements...
              </div>
            </div>
          </div>
        )}
        
        {/* Render detected placements */}
        {placements.map(renderAdPlacement)}
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && placements.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 10000,
            maxWidth: '300px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              Ad Placements Detected: {placements.length}
            </div>
            {placements.map(p => (
              <div key={p.id} style={{ fontSize: '10px', opacity: 0.8 }}>
                {p.id}: {p.adType} ({p.type}) {p.loaded ? '✓' : '⏳'}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// Export individual components for manual use
export { AdvancedAdSterraWidget, AdvancedAdGemWidget };
export default AdPlacementManager;
