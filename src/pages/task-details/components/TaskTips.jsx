import React from 'react';
import Icon from '../../../components/AppIcon';

const TaskTips = ({ task }) => {
  const generalTips = [
    "Read all instructions carefully before starting",
    "Take screenshots of your progress for proof submission",
    "Complete tasks in a distraction-free environment",
    "Double-check all requirements before submitting proof",
    "Contact support if you encounter any technical issues"
  ];

  const providerSpecificTips = {
    ADGEM: [
      "Create a new account if you don't have one",
      "Complete your profile for better offer availability",
      "Clear your browser cache before starting offers",
      "Use a valid email address for verification"
    ],
    ADSTERRA: [
      "Disable ad blockers for proper tracking",
      "Allow pop-ups from the advertiser\'s website",
      "Complete the full advertiser flow",
      "Wait for confirmation before closing tabs"
    ],
    CPALEAD: [
      "Use real information when required",
      "Complete surveys honestly and thoroughly",
      "Don\'t use VPN or proxy services",
      "Ensure stable internet connection"
    ],
    MANUAL: [
      "Follow instructions exactly as written",
      "Provide detailed proof of completion",
      "Include timestamps when possible",
      "Be specific in your proof description"
    ]
  };

  const tips = providerSpecificTips?.[task?.provider] || [];

  return (
    <div className="glass rounded-xl p-6 border border-border">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Lightbulb" size={20} className="text-warning" />
        <h2 className="text-xl font-semibold text-foreground">Tips for Success</h2>
      </div>
      <div className="space-y-6">
        {/* Provider-Specific Tips */}
        {tips?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
              <Icon name="Target" size={16} className="text-primary" />
              <span>{task?.provider} Specific Tips</span>
            </h3>
            <ul className="space-y-2">
              {tips?.map((tip, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* General Tips */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
            <Icon name="Star" size={16} className="text-warning" />
            <span>General Guidelines</span>
          </h3>
          <ul className="space-y-2">
            {generalTips?.map((tip, index) => (
              <li key={index} className="flex items-start space-x-3">
                <Icon name="ArrowRight" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-text-secondary">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Success Rate Info */}
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="TrendingUp" size={20} className="text-success flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-success mb-2">Improve Your Success Rate</h4>
              <p className="text-sm text-success/80 mb-2">
                Tasks with proper proof submission have a 95% approval rate.
              </p>
              <div className="text-sm text-success/80">
                <strong>Average approval time:</strong> 24-48 hours
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-destructive mb-2">Important Warning</h4>
              <p className="text-sm text-destructive/80">
                Submitting false or misleading proof will result in immediate task rejection 
                and may lead to account suspension. Always provide genuine completion evidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTips;