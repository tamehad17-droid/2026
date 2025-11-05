import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { adgemService } from '../../../services/adgemService';

const AdGemTasksTab = () => {
  const [offers, setOffers] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, pending, completed

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    const { offers: data } = await adgemService.getOffers();
    setOffers(data || []);
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    const { success } = await adgemService.syncOffers();
    if (success) {
      await loadOffers();
      setLastSync(new Date());
    }
    setSyncing(false);
  };

  const filteredOffers = filter === 'all' 
    ? offers 
    : offers.filter(o => o.status === filter);

  const stats = {
    total: offers.length,
    active: offers.filter(o => o.status === 'active').length,
    pending: offers.filter(o => o.status === 'pending').length,
    completions: offers.reduce((sum, o) => sum + (o.completions || 0), 0),
    totalPayout: offers.reduce((sum, o) => sum + (o.total_payout || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Icon name="Gamepad2" size={28} />
            AdGem Automatic Tasks
          </h2>
          <p className="text-text-secondary mt-1">
            Automatically synced offers from AdGem API
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          <Icon name={syncing ? "Loader" : "RefreshCw"} size={20} className={syncing ? "animate-spin" : ""} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Last Sync Info */}
      {lastSync && (
        <div className="glass rounded-lg p-3 flex items-center gap-2">
          <Icon name="Clock" size={16} className="text-success" />
          <span className="text-sm text-text-secondary">
            Last synced: {lastSync.toLocaleString()}
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Layers" size={20} className="text-primary" />
            <p className="text-text-secondary text-sm">Total Offers</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.total}</p>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="CheckCircle" size={20} className="text-success" />
            <p className="text-text-secondary text-sm">Active</p>
          </div>
          <p className="text-3xl font-bold text-success">{stats.active}</p>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Clock" size={20} className="text-warning" />
            <p className="text-text-secondary text-sm">Pending</p>
          </div>
          <p className="text-3xl font-bold text-warning">{stats.pending}</p>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="TrendingUp" size={20} className="text-primary" />
            <p className="text-text-secondary text-sm">Completions</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.completions}</p>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="DollarSign" size={20} className="text-success" />
            <p className="text-text-secondary text-sm">Total Payout</p>
          </div>
          <p className="text-3xl font-bold text-success">${stats.totalPayout.toFixed(2)}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All', count: stats.total },
          { id: 'active', label: 'Active', count: stats.active },
          { id: 'pending', label: 'Pending', count: stats.pending }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === tab.id
                ? 'bg-primary text-white'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Offers List */}
      <div className="space-y-3">
        {filteredOffers.length > 0 ? (
          filteredOffers.map(offer => (
            <div key={offer.id} className="glass rounded-xl p-5 hover:shadow-lg transition">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {offer.name || offer.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      offer.status === 'active' 
                        ? 'bg-success/20 text-success' 
                        : offer.status === 'pending'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-muted text-text-secondary'
                    }`}>
                      {offer.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                    {offer.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Icon name="Hash" size={14} className="text-text-secondary" />
                      <span className="text-text-secondary">ID:</span>
                      <span className="font-mono">{offer.external_id || offer.id}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Icon name="DollarSign" size={14} className="text-success" />
                      <span className="text-text-secondary">Payout:</span>
                      <span className="font-bold text-success">
                        ${offer.payout || offer.reward_amount || '0.00'}
                      </span>
                    </div>
                    
                    {offer.platform && (
                      <div className="flex items-center gap-1">
                        <Icon name="Monitor" size={14} className="text-text-secondary" />
                        <span className="text-text-secondary">Platform:</span>
                        <span>{offer.platform}</span>
                      </div>
                    )}
                    
                    {offer.country && (
                      <div className="flex items-center gap-1">
                        <Icon name="Globe" size={14} className="text-text-secondary" />
                        <span className="text-text-secondary">Country:</span>
                        <span>{offer.country}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Icon name="Users" size={14} className="text-text-secondary" />
                      <span className="text-text-secondary">Completions:</span>
                      <span className="font-bold">{offer.completions || 0}</span>
                    </div>
                  </div>
                  
                  {offer.requirements && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-text-secondary mb-1">Requirements:</p>
                      <p className="text-sm">{JSON.stringify(offer.requirements)}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  {offer.link && (
                    <a
                      href={offer.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                      title="View Offer"
                    >
                      <Icon name="ExternalLink" size={16} />
                    </a>
                  )}
                  
                  <button
                    className="p-2 bg-muted hover:bg-muted/80 rounded-lg transition"
                    title="View Details"
                  >
                    <Icon name="Eye" size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass rounded-xl p-12 text-center">
            <Icon name="Inbox" size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">No offers found</p>
            <p className="text-text-secondary mb-4">
              {filter === 'all' 
                ? 'Click "Sync Now" to fetch offers from AdGem' 
                : `No ${filter} offers available`}
            </p>
            {filter === 'all' && (
              <button
                onClick={handleSync}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Sync Offers
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="glass rounded-xl p-6 bg-primary/5">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground mb-2">About AdGem Integration</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Offers are automatically synced from AdGem API</li>
              <li>• Level-based rewards are calculated dynamically</li>
              <li>• Users see different payouts based on their account level</li>
              <li>• Completions are tracked and verified automatically</li>
              <li>• Sync regularly to get the latest offers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdGemTasksTab;
