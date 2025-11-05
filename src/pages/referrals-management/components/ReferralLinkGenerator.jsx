import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ReferralLinkGenerator = () => {
  const [customCode, setCustomCode] = useState('');
  const [generatedLink, setGeneratedLink] = useState('https://promohive.com/ref/JD2024');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerateLink = () => {
    const code = customCode || `JD${Date.now()?.toString()?.slice(-6)}`;
    setGeneratedLink(`https://promohive.com/ref/${code}`);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard?.writeText(generatedLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const socialPlatforms = [
    { name: 'Facebook', icon: 'Facebook', color: 'bg-blue-600', shareUrl: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(generatedLink)}` },
    { name: 'Twitter', icon: 'Twitter', color: 'bg-sky-500', shareUrl: `https://twitter.com/intent/tweet?url=${encodeURIComponent(generatedLink)}&text=Join%20PromoHive%20and%20start%20earning!` },
    { name: 'WhatsApp', icon: 'MessageCircle', color: 'bg-green-600', shareUrl: `https://wa.me/?text=Join%20PromoHive%20and%20start%20earning!%20${encodeURIComponent(generatedLink)}` },
    { name: 'Telegram', icon: 'Send', color: 'bg-blue-500', shareUrl: `https://t.me/share/url?url=${encodeURIComponent(generatedLink)}&text=Join%20PromoHive%20and%20start%20earning!` }
  ];

  return (
    <div className="glass rounded-xl p-6 border border-border">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
          <Icon name="Link" size={20} color="white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Referral Link Generator</h2>
          <p className="text-sm text-text-secondary">Create and share your personalized referral link</p>
        </div>
      </div>
      <div className="space-y-6">
        {/* Custom Code Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Custom Code (Optional)"
              type="text"
              placeholder="Enter custom referral code"
              value={customCode}
              onChange={(e) => setCustomCode(e?.target?.value)}
              description="Leave empty to auto-generate"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="default"
              onClick={handleGenerateLink}
              iconName="RefreshCw"
              iconPosition="left"
              fullWidth
            >
              Generate Link
            </Button>
          </div>
        </div>

        {/* Generated Link Display */}
        <div className="glass rounded-lg p-4 border border-border">
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Referral Link
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-muted/30 rounded-lg px-4 py-3 font-data text-sm text-foreground break-all">
              {generatedLink}
            </div>
            <Button
              variant={copySuccess ? "success" : "outline"}
              size="icon"
              onClick={handleCopyLink}
              className="flex-shrink-0"
            >
              <Icon name={copySuccess ? "Check" : "Copy"} size={16} />
            </Button>
          </div>
          {copySuccess && (
            <p className="text-sm text-success mt-2 flex items-center space-x-1">
              <Icon name="CheckCircle" size={14} />
              <span>Link copied to clipboard!</span>
            </p>
          )}
        </div>

        {/* Social Sharing */}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">Share on Social Media</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {socialPlatforms?.map((platform) => (
              <a
                key={platform?.name}
                href={platform?.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${platform?.color} hover:opacity-90 transition-opacity rounded-lg p-4 text-white text-center group`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Icon name={platform?.icon} size={24} color="white" />
                  <span className="text-sm font-medium">{platform?.name}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">156</div>
            <div className="text-sm text-text-secondary">Link Clicks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">23</div>
            <div className="text-sm text-text-secondary">Conversions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">14.7%</div>
            <div className="text-sm text-text-secondary">Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">$127.50</div>
            <div className="text-sm text-text-secondary">Earned</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralLinkGenerator;