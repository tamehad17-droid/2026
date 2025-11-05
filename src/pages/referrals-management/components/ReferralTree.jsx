import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ReferralTree = () => {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['level-1']));
  const [selectedLevel, setSelectedLevel] = useState('all');

  const referralData = {
    user: {
      id: 'user-main',
      name: 'John Doe',
      avatar: "https://images.unsplash.com/photo-1654727157781-e4d438e3a02a",
      avatarAlt: 'Professional headshot of man with brown hair in dark suit smiling at camera',
      totalReferrals: 47,
      totalEarnings: 892.50
    },
    levels: [
    {
      id: 'level-1',
      level: 1,
      title: 'Direct Referrals',
      count: 12,
      earnings: 456.75,
      referrals: [
      {
        id: 'ref-1',
        name: 'Sarah Johnson',
        avatar: "https://images.unsplash.com/photo-1561259200-024d8b793651",
        avatarAlt: 'Professional woman with long brown hair in white blazer smiling outdoors',
        joinDate: '2024-10-15',
        status: 'active',
        earnings: 234.50,
        referrals: 8
      },
      {
        id: 'ref-2',
        name: 'Michael Chen',
        avatar: "https://images.unsplash.com/photo-1698072556534-40ec6e337311",
        avatarAlt: 'Asian man with short black hair in navy blue shirt smiling at camera',
        joinDate: '2024-10-12',
        status: 'active',
        earnings: 189.25,
        referrals: 5
      },
      {
        id: 'ref-3',
        name: 'Emily Rodriguez',
        avatar: "https://images.unsplash.com/photo-1504148262317-4609625f5f1e",
        avatarAlt: 'Hispanic woman with curly dark hair in red top smiling warmly',
        joinDate: '2024-10-08',
        status: 'inactive',
        earnings: 32.00,
        referrals: 2
      }]

    },
    {
      id: 'level-2',
      level: 2,
      title: 'Level 2 Referrals',
      count: 23,
      earnings: 287.25,
      referrals: [
      {
        id: 'ref-4',
        name: 'David Wilson',
        avatar: "https://images.unsplash.com/photo-1624799027443-b21da9f4f677",
        avatarAlt: 'Caucasian man with beard in casual gray shirt outdoors',
        joinDate: '2024-10-20',
        status: 'active',
        earnings: 156.75,
        referrals: 3,
        referredBy: 'Sarah Johnson'
      },
      {
        id: 'ref-5',
        name: 'Lisa Park',
        avatar: "https://images.unsplash.com/photo-1597621969117-1a305d3e0c68",
        avatarAlt: 'Asian woman with straight black hair in white blouse professional headshot',
        joinDate: '2024-10-18',
        status: 'active',
        earnings: 98.50,
        referrals: 1,
        referredBy: 'Michael Chen'
      }]

    },
    {
      id: 'level-3',
      level: 3,
      title: 'Level 3 Referrals',
      count: 12,
      earnings: 148.50,
      referrals: [
      {
        id: 'ref-6',
        name: 'James Thompson',
        avatar: "https://images.unsplash.com/photo-1650091903029-fc3f1ddcb7f9",
        avatarAlt: 'Young man with short brown hair in blue button-up shirt smiling',
        joinDate: '2024-10-25',
        status: 'active',
        earnings: 67.25,
        referrals: 0,
        referredBy: 'David Wilson'
      }]

    }]

  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded?.has(nodeId)) {
      newExpanded?.delete(nodeId);
    } else {
      newExpanded?.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':return 'text-success bg-success/10';
      case 'inactive':return 'text-warning bg-warning/10';
      default:return 'text-text-secondary bg-muted/30';
    }
  };

  const filteredLevels = selectedLevel === 'all' ?
  referralData?.levels :
  referralData?.levels?.filter((level) => level?.level?.toString() === selectedLevel);

  return (
    <div className="glass rounded-xl p-6 border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Icon name="GitBranch" size={20} color="white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Referral Network</h2>
            <p className="text-sm text-text-secondary">Visualize your multi-level referral tree</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e?.target?.value)}
            className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">

            <option value="all">All Levels</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
          </select>
          <Button variant="outline" size="sm" iconName="Download">
            Export
          </Button>
        </div>
      </div>
      {/* Root User */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="glass rounded-xl p-6 border-2 border-primary/30 max-w-sm w-full">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image
                  src={referralData?.user?.avatar}
                  alt={referralData?.user?.avatarAlt}
                  className="w-16 h-16 rounded-full object-cover" />

                <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Crown" size={12} color="white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{referralData?.user?.name}</h3>
                <p className="text-sm text-text-secondary">You</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-primary font-medium">
                    {referralData?.user?.totalReferrals} Referrals
                  </span>
                  <span className="text-xs text-success font-medium">
                    ${referralData?.user?.totalEarnings?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Referral Levels */}
      <div className="space-y-6">
        {filteredLevels?.map((level) =>
        <div key={level?.id} className="space-y-4">
            {/* Level Header */}
            <div className="flex items-center justify-between">
              <button
              onClick={() => toggleNode(level?.id)}
              className="flex items-center space-x-3 hover:bg-muted/30 rounded-lg p-2 transition-colors">

                <Icon
                name={expandedNodes?.has(level?.id) ? "ChevronDown" : "ChevronRight"}
                size={20}
                className="text-text-secondary" />

                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{level?.title}</h3>
                  <p className="text-sm text-text-secondary">
                    {level?.count} members • ${level?.earnings?.toFixed(2)} earned
                  </p>
                </div>
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Level {level?.level}
                </span>
              </div>
            </div>

            {/* Level Content */}
            {expandedNodes?.has(level?.id) &&
          <div className="ml-8 space-y-3 animate-fade-in">
                {level?.referrals?.map((referral) =>
            <div key={referral?.id} className="glass rounded-lg p-4 border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Image
                    src={referral?.avatar}
                    alt={referral?.avatarAlt}
                    className="w-10 h-10 rounded-full object-cover" />

                        <div>
                          <h4 className="font-medium text-foreground">{referral?.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-text-secondary">
                            <span>Joined {new Date(referral.joinDate)?.toLocaleDateString()}</span>
                            {referral?.referredBy &&
                      <>
                                <span>•</span>
                                <span>via {referral?.referredBy}</span>
                              </>
                      }
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-success">
                            ${referral?.earnings?.toFixed(2)}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {referral?.referrals} referrals
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(referral?.status)}`}>
                          {referral?.status}
                        </span>
                      </div>
                    </div>
                  </div>
            )}
              </div>
          }
          </div>
        )}
      </div>
      {/* Mobile Simplified View */}
      <div className="block md:hidden mt-8">
        <div className="space-y-3">
          {referralData?.levels?.flatMap((level) =>
          level?.referrals?.map((referral) =>
          <div key={referral?.id} className="glass rounded-lg p-4 border border-border">
                <div className="flex items-center space-x-3">
                  <Image
                src={referral?.avatar}
                alt={referral?.avatarAlt}
                className="w-12 h-12 rounded-full object-cover" />

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground">{referral?.name}</h4>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        L{level?.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-success font-medium">
                        ${referral?.earnings?.toFixed(2)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(referral?.status)}`}>
                        {referral?.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
          )
          )}
        </div>
      </div>
    </div>);

};

export default ReferralTree;