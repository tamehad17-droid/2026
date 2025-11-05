import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RulesInfo = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const rules = [
    "Each user gets 3 free spins per day",
    "Spins reset at midnight UTC (00:00)",
    "All prizes are automatically added to your account balance",
    "Minimum prize value is $0.10, maximum is $50.00",
    "Bonus multipliers apply to your next task completion",
    "Special prizes may include extra spins or exclusive rewards",
    "Fair play is enforced - suspicious activity will be investigated",
    "Prizes cannot be transferred between accounts"
  ];

  const prizeDistribution = [
    { range: "$0.10 - $1.00", probability: "60%", type: "cash", color: "text-success" },
    { range: "$1.01 - $5.00", probability: "25%", type: "cash", color: "text-success" },
    { range: "$5.01 - $15.00", probability: "10%", type: "bonus", color: "text-warning" },
    { range: "$15.01 - $50.00", probability: "4%", type: "multiplier", color: "text-accent" },
    { range: "Special Prizes", probability: "1%", type: "special", color: "text-secondary" }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Icon name="Info" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Rules & Prize Information
            </h3>
          </div>
          <Icon 
            name="ChevronDown" 
            size={20} 
            className={`text-text-secondary transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="px-6 pb-6 space-y-6 animate-fade-in">
            {/* Game Rules */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
                <Icon name="BookOpen" size={16} />
                <span>Game Rules</span>
              </h4>
              <div className="space-y-2">
                {rules?.map((rule, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-text-secondary">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prize Distribution */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
                <Icon name="PieChart" size={16} />
                <span>Prize Distribution</span>
              </h4>
              <div className="space-y-3">
                {prizeDistribution?.map((prize, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        prize?.type === 'cash' ? 'bg-success' :
                        prize?.type === 'bonus' ? 'bg-warning' :
                        prize?.type === 'multiplier' ? 'bg-accent' : 'bg-secondary'
                      }`}></div>
                      <span className="text-sm font-medium text-foreground">
                        {prize?.range}
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${prize?.color}`}>
                      {prize?.probability}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fair Play Notice */}
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start space-x-3">
                <Icon name="Shield" size={16} className="text-warning mt-0.5" />
                <div>
                  <h5 className="font-medium text-warning mb-1">Fair Play Policy</h5>
                  <p className="text-sm text-text-secondary">
                    Our spin wheel uses a certified random number generator to ensure fair results. 
                    All spins are logged and audited for transparency.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Link */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-text-secondary mb-3">
                Have questions about the spin wheel?
              </p>
              <Button variant="outline" size="sm">
                <Icon name="MessageCircle" size={16} className="mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RulesInfo;