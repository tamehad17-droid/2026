import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExternalTaskWidget = ({ task, onTaskComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleExternalRedirect = () => {
    setIsLoading(true);
    // Simulate external redirect
    window.open(task?.externalUrl, '_blank');
    
    // Simulate completion tracking
    setTimeout(() => {
      setIsLoading(false);
      setIsCompleted(true);
      onTaskComplete();
    }, 3000);
  };

  const getProviderInfo = () => {
    switch (task?.provider) {
      case 'ADGEM':
        return {
          name: 'AdGem',
          description: 'Complete offers and surveys to earn rewards',
          color: 'purple',
          icon: 'Gem'
        };
      case 'ADSTERRA':
        return {
          name: 'AdSterra',
          description: 'View advertisements and complete actions',
          color: 'orange',
          icon: 'Star'
        };
      case 'CPALEAD':
        return {
          name: 'CPALead',
          description: 'Complete CPA offers and promotional tasks',
          color: 'green',
          icon: 'TrendingUp'
        };
      default:
        return {
          name: 'External Provider',
          description: 'Complete the external task',
          color: 'blue',
          icon: 'ExternalLink'
        };
    }
  };

  const providerInfo = getProviderInfo();

  return (
    <div className="glass rounded-xl p-6 border border-border">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name={providerInfo?.icon} size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-foreground">External Task Completion</h2>
      </div>
      <div className="text-center py-8">
        {/* Provider Logo/Icon */}
        <div className={`w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4`}>
          <Icon name={providerInfo?.icon} size={32} color="white" />
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-2">{providerInfo?.name}</h3>
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          {providerInfo?.description}
        </p>

        {/* Task Details */}
        <div className="glass rounded-lg p-4 mb-6 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Reward Amount:</span>
            <span className="text-lg font-bold text-success">${task?.reward?.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Estimated Time:</span>
            <span className="text-sm text-foreground">{task?.estimatedTime} minutes</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Difficulty:</span>
            <span className="text-sm text-foreground">{task?.difficulty}</span>
          </div>
        </div>

        {/* Action Button */}
        {!isCompleted ? (
          <Button
            variant="default"
            size="lg"
            loading={isLoading}
            onClick={handleExternalRedirect}
            iconName="ExternalLink"
            iconPosition="right"
            className="bg-gradient-primary hover:opacity-90 px-8"
          >
            {isLoading ? 'Redirecting...' : `Start ${providerInfo?.name} Task`}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-success">
              <Icon name="CheckCircle" size={24} />
              <span className="text-lg font-semibold">Task Completed!</span>
            </div>
            <p className="text-sm text-text-secondary">
              Your reward will be processed within 24-48 hours after verification.
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 text-left max-w-md mx-auto">
          <h4 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
            <Icon name="Info" size={16} className="text-primary" />
            <span>How it works:</span>
          </h4>
          <ol className="text-sm text-text-secondary space-y-2">
            <li className="flex items-start space-x-2">
              <span className="font-semibold text-primary">1.</span>
              <span>Click the button above to visit {providerInfo?.name}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-semibold text-primary">2.</span>
              <span>Complete the required actions on their platform</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-semibold text-primary">3.</span>
              <span>Return here to confirm completion</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-semibold text-primary">4.</span>
              <span>Receive your reward after verification</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ExternalTaskWidget;