import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { adminService } from '../../services/adminService';

const AdminWallets = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ label: '', address: '', network: 'TRC20' });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await adminService.getUSDTAddresses();
        setAddresses(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load addresses');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await adminService.createUSDTAddress(form);
      setAddresses(prev => [created, ...prev]);
      setForm({ user_id: '', label: '', address: '', network: 'TRC20' });
    } catch (err) {
      setError(err.message || 'Failed to create address');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await adminService.deleteUSDTAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete address');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin - USDT Addresses</title>
      </Helmet>
      <div className="p-6 max-w-6xl mx-auto">
        <Breadcrumb />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">USDT Addresses (Admin Managed)</h1>
            <p className="text-text-secondary">Create, edit or remove user USDT payout addresses.</p>
          </div>
          <div>
            <Button variant="default" iconName="RefreshCw" onClick={() => window.location.reload()}>Refresh</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-lg p-4 lg:col-span-1">
            <h3 className="font-semibold mb-2">Add USDT Address</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <p className="text-sm text-text-secondary">These addresses will be shown to users when purchasing services (e.g. account upgrade). No User ID is required.</p>
              </div>
              <div>
                <label className="text-sm">Label</label>
                <input value={form.label} onChange={e => setForm({...form, label: e.target.value})} className="w-full input" />
              </div>
              <div>
                <label className="text-sm">Address</label>
                <input
                  placeholder="Example: TRC20: T... or ERC20/BEP20: 0x..."
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full input"
                  required
                />
              </div>
              <div>
                <label className="text-sm">Network</label>
                <select value={form.network} onChange={e => setForm({...form, network: e.target.value})} className="w-full input">
                  <option value="TRC20">TRC20 (TRON)</option>
                  <option value="ERC20">ERC20 (Ethereum)</option>
                  <option value="BEP20">BEP20 (BNB Chain)</option>
                </select>
              </div>
              <div>
                <Button type="submit" variant="default">Create Address</Button>
              </div>
            </form>
            {error && <p className="text-destructive mt-2">{error}</p>}
          </div>

          <div className="glass rounded-lg p-4 lg:col-span-2">
            <h3 className="font-semibold mb-2">Addresses</h3>
            {loading ? (
              <p className="text-text-secondary">Loading...</p>
            ) : (
              <div className="space-y-3">
                {addresses?.length === 0 ? (
                  <p className="text-text-secondary">No managed addresses found.</p>
                ) : (
                  addresses.map(addr => (
                    <div key={addr.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{addr.label || addr.address}</div>
                        <div className="text-sm text-text-secondary">{addr.address}</div>
                        <div className="text-xs text-text-secondary">{addr.network} • {addr.user_profiles?.email || '—'}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(addr.address)}>Copy</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(addr.id)}>Delete</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWallets;
