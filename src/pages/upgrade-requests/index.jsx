import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import MobileDrawer from '../../components/ui/MobileDrawer';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { levelUpgradeService } from '../../services/levelUpgradeService';
import { useAuth } from '../../contexts/AuthContext';

const UpgradeRequests = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState({ type: null, message: '' });
  const [requests, setRequests] = useState([]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const { requests: data, error: err } = await levelUpgradeService.getPendingUpgrades();
      if (err) throw err;
      setRequests(data || []);
    } catch (e) {
      setError(e?.message || 'Failed to load upgrade requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id) => {
    if (actionLoadingId) return;
    try {
      setActionLoadingId(id);
      const { success, error: err } = await levelUpgradeService.approveUpgrade(id, user?.id);
      if (!success) throw new Error(err?.message || 'Approval failed');
      await loadRequests();
      setNotice({ type: 'success', message: 'Upgrade approved successfully' });
    } catch (e) {
      setNotice({ type: 'error', message: e?.message || 'Approval failed' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    if (actionLoadingId) return;
    const reason = prompt('Reason for rejection (optional):', '');
    try {
      setActionLoadingId(id);
      const { success, error: err } = await levelUpgradeService.rejectUpgrade(id, user?.id, reason || null);
      if (!success) throw new Error(err?.message || 'Rejection failed');
      await loadRequests();
      setNotice({ type: 'success', message: 'Upgrade rejected' });
    } catch (e) {
      setNotice({ type: 'error', message: e?.message || 'Rejection failed' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Upgrade Requests - PromoHive Admin</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMenuOpen={isMobileMenuOpen} />

        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)} />

        <main className={`pt-16 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'
        }`}>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text">Upgrade Requests</h1>
                <p className="text-text-secondary mt-1">Review and process pending level upgrades</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={loadRequests}>
                  <Icon name="RefreshCw" size={16} className="mr-2" /> Refresh
                </Button>
              </div>
            </div>

            {notice?.message && (
              <div className={`rounded-md p-3 border ${notice.type==='success'?'border-green-200 bg-green-50 text-green-700':'border-red-200 bg-red-50 text-red-700'}`}>
                {notice.message}
              </div>
            )}

            {loading ? (
              <div className="glass rounded-lg border border-border p-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-text-secondary">Loading upgrade requests...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>
            ) : requests?.length === 0 ? (
              <div className="glass rounded-lg border border-border p-8 text-center text-text-secondary">
                No pending upgrade requests.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {requests.map((req) => (
                  <div key={req.id} className="glass rounded-lg border border-border p-4 flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                        {req?.user_profile?.full_name?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {req?.user_profile?.full_name || req?.user_profile?.email || req.user_id}
                        </div>
                        <div className="text-sm text-text-secondary mt-0.5">
                          Level {req.from_level} → Level {req.to_level} • ${parseFloat(req.price || 0).toFixed(2)}
                        </div>
                        {req.payment_address && (
                          <div className="text-xs text-text-secondary mt-1">Address: {req.payment_address}</div>
                        )}
                        {req.payment_proof && (
                          <a href={req.payment_proof} target="_blank" rel="noreferrer" className="text-xs text-primary mt-1 inline-flex items-center gap-1">
                            <Icon name="ExternalLink" size={12} /> View Payment Proof
                          </a>
                        )}
                        <div className="text-xs text-text-secondary mt-1">Requested at: {new Date(req.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleApprove(req.id)}
                      >
                        {actionLoadingId === req.id ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleReject(req.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default UpgradeRequests;


