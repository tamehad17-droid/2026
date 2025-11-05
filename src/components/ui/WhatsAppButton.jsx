import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { adminService } from '../../services/adminService';

const WhatsAppButton = () => {
  const [phoneNumber, setPhoneNumber] = useState('+17253348692');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Get phone number from admin settings
    const fetchPhoneNumber = async () => {
      try {
        const settings = await adminService?.getSettings();
        const phoneSettings = settings?.find(s => s?.key === 'customer_service_phone');
        if (phoneSettings?.value) {
          // Fix: Check if value is already a string or needs parsing
          const phoneValue = typeof phoneSettings.value === 'string' && !phoneSettings.value.startsWith('{') 
            ? phoneSettings.value 
            : JSON.parse(phoneSettings.value);
          setPhoneNumber(phoneValue);
        }
      } catch (error) {
        console.error('Failed to fetch phone number:', error);
        // Keep default phone number if fetch fails
      }
    };

    fetchPhoneNumber();
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hello, I need help regarding PromoHive");
    const whatsappUrl = `https://wa.me/${phoneNumber?.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsAppClick}
        className="group relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
        title="Contact us on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
        
        {/* Pulse Animation */}
        <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping"></div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Customer Support
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>

      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-colors duration-200 opacity-60 hover:opacity-100"
        title="Hide"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default WhatsAppButton;