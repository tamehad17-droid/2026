import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import { levelUpgradeService } from '../../services/levelUpgradeService';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

const LevelUpgrade = () => {
  const { user, profile } = useAuth();
  const [upgrades, setUpgrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [paymentProof, setPaymentProof] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: null, message: '' });
  const [myRequests, setMyRequests] = useState([]);
  const [depositAddresses, setDepositAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const currentLevel = profile?.level || 0;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadAvailableUpgrades(),
      loadMyRequests(),
      loadDepositAddresses()
    ]);
    setLoading(false);
  };

  const loadAvailableUpgrades = async () => {
    const { upgrades: data } = await levelUpgradeService.getAvailableUpgrades(currentLevel);
    setUpgrades(data || []);
  };

  const loadMyRequests = async () => {
    const { requests } = await levelUpgradeService.getUserUpgradeRequests(user.id);
    setMyRequests(requests || []);
  };

  const loadDepositAddresses = async () => {
    try {
      const addrs = await adminService.getUSDTAddresses();
      setDepositAddresses(addrs || []);
      if (addrs && addrs.length > 0) setSelectedAddressId(addrs[0].id);
    } catch (e) {
      setDepositAddresses([]);
    }
  };

  const handleSelectLevel = (level, price) => {
    setSelectedLevel({ level, price });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLevel) return;

    setSubmitting(true);
    const selectedAddr = depositAddresses.find(a => a.id === selectedAddressId);
    const addrText = selectedAddr?.address || null;
    const { result } = await levelUpgradeService.requestUpgrade(
      user.id,
      selectedLevel.level,
      paymentProof,
      addrText
    );

    if (result?.success) {
      setNotice({ type: 'success', message: 'Upgrade request submitted successfully! Awaiting admin approval.' });
      setSelectedLevel(null);
      setPaymentProof('');
      await loadMyRequests();
    } else {
      setNotice({ type: 'error', message: 'Error submitting upgrade request. Please try again.' });
    }
    setSubmitting(false);
  };

  const levelBenefits = {
    1: ['Higher task rewards', 'Priority support', 'Exclusive offers', 'Referral bonuses'],
    2: ['Premium rewards', 'VIP support', 'Better referral system', 'Special tasks'],
    3: ['Elite rewards', 'Dedicated support', 'Maximum benefits', 'Lifetime perks']
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Level Upgrade - PromoHive</title>
      </Helmet>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {notice?.message && (
          <div className={`rounded-md p-3 border ${notice.type==='success'?'border-green-200 bg-green-50 text-green-700':'border-red-200 bg-red-50 text-red-700'}`}>
            {notice.message}
          </div>
        )}
        <div className="glass rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4">Choose your upgrade</h2>
          {upgrades?.length === 0 ? (
            <p className="text-text-secondary">No upgrades available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upgrades.map(u => (
                <button key={u.level} onClick={() => handleSelectLevel(u.level, u.price)} className={`p-4 rounded-lg border ${selectedLevel?.level===u.level?'border-primary bg-primary/5':'border-border hover:bg-muted/30'}`}>
                  <div className="text-2xl font-bold">Level {u.level}</div>
                  <div className="text-text-secondary mt-1">Price: ${u.price}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-3">Pay to Admin USDT Wallet</h3>
          {depositAddresses?.length === 0 ? (
            <p className="text-text-secondary">Admin has not added USDT wallets yet. Contact support.</p>
          ) : (
            <div className="space-y-3">
              {depositAddresses.map(addr => (
                <label key={addr.id} className={`flex items-start gap-3 p-3 rounded-lg border ${selectedAddressId===addr.id?'border-primary bg-primary/5':'border-border'}`}>
                  <input type="radio" name="usdtAddress" checked={selectedAddressId===addr.id} onChange={() => setSelectedAddressId(addr.id)} />
                  <div className="flex-1">
                    <div className="font-medium">{addr.label || `${addr.network} Address`}</div>
                    <div className="font-mono text-sm break-all">{addr.address}</div>
                    <div className="text-xs text-text-secondary">Network: {addr.network}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-3">Submit Payment Proof</h3>
          <div className="space-y-3">
            <label className="text-sm text-text-secondary">Transaction ID / Hash</label>
            <input className="w-full px-3 py-2 rounded-md border border-border bg-background" value={paymentProof} onChange={e=>setPaymentProof(e.target.value)} placeholder="e.g. TXID123..." required />
            <button disabled={submitting || !selectedLevel || !selectedAddressId} className="btn btn-primary px-4 py-2 rounded-md bg-primary text-white disabled:opacity-50">
              {submitting? 'Submitting...' : 'Request Upgrade'}
            </button>
          </div>
        </form>

        <div className="glass rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-3">My Requests</h3>
          {myRequests?.length === 0 ? (
            <p className="text-text-secondary">No requests yet.</p>
          ) : (
            <ul className="space-y-2">
              {myRequests.map(r => (
                <li key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span>Level {r.to_level}</span>
                  <span className="text-sm text-text-secondary capitalize">{r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default LevelUpgrade;
