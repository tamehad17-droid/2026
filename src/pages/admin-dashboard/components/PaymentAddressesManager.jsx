import React, { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';

const PaymentAddressesManager = ({ userId }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'paypal',
    address: '',
    is_primary: false
  });

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUserPaymentAddresses(userId);
      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading payment addresses:', error);
      toast.error('Failed to load payment addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [userId]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const result = await adminService.addPaymentAddress(userId, newAddress);
      toast.success('Payment address added successfully');
      setShowAddModal(false);
      setNewAddress({ type: 'paypal', address: '', is_primary: false });
      loadAddresses();
    } catch (error) {
      console.error('Error adding payment address:', error);
      toast.error('Failed to add payment address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this payment address?')) {
      return;
    }

    try {
      await adminService.deletePaymentAddress(addressId);
      toast.success('Payment address deleted successfully');
      loadAddresses();
    } catch (error) {
      console.error('Error deleting payment address:', error);
      toast.error('Failed to delete payment address');
    }
  };

  const handleSetPrimary = async (addressId) => {
    try {
      await adminService.setPrimaryPaymentAddress(userId, addressId);
      toast.success('Primary payment address updated');
      loadAddresses();
    } catch (error) {
      console.error('Error setting primary address:', error);
      toast.error('Failed to update primary address');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">Payment Addresses</h2>
        <Button onClick={() => setShowAddModal(true)}>
          <Icon name="Plus" className="mr-2" />
          Add Address
        </Button>
      </div>

      <div className="grid gap-4">
        {addresses.map((address) => (
          <div key={address.id} className="glass p-4 rounded-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Icon
                    name={address.type === 'paypal' ? 'CreditCard' : 'Wallet'}
                    className="text-primary"
                  />
                  <span className="font-medium capitalize">{address.type}</span>
                  {address.is_primary && (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Primary
                    </span>
                  )}
                </div>
                <p className="mt-1 text-text-secondary break-all">
                  {address.address}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {!address.is_primary && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetPrimary(address.id)}
                  >
                    Set Primary
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteAddress(address.id)}
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="text-center py-8 text-text-secondary">
            No payment addresses found
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-md glass rounded-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">
                  Add Payment Address
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-text-secondary hover:text-foreground"
                >
                  <Icon name="X" size={24} />
                </button>
              </div>

              <form onSubmit={handleAddAddress} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Payment Type
                  </label>
                  <select
                    value={newAddress.type}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring"
                  >
                    <option value="paypal">PayPal</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="bank">Bank Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newAddress.address}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring"
                    placeholder={
                      newAddress.type === 'paypal' ? 'PayPal email address' :
                      newAddress.type === 'crypto' ? 'Wallet address' :
                      'Bank account details'
                    }
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={newAddress.is_primary}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, is_primary: e.target.checked }))}
                    className="rounded border-border text-primary focus:ring-2 focus:ring-ring"
                  />
                  <label htmlFor="is_primary" className="ml-2 text-sm text-text-secondary">
                    Set as primary payment address
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Address</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentAddressesManager;