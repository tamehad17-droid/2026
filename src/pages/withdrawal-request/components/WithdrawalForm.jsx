import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const WithdrawalForm = ({ userBalance, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    amount: '',
    walletAddress: '',
    network: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [conversionData, setConversionData] = useState({
    usdtAmount: 0,
    networkFee: 0,
    finalAmount: 0,
    exchangeRate: 1.0,
    rateExpiry: null
  });

  const networkOptions = [
    { 
      value: 'TRC20', 
      label: 'TRC20 (Tron)', 
      description: 'Fee: $1.00 USDT - Fastest processing' 
    },
    { 
      value: 'ERC20', 
      label: 'ERC20 (Ethereum)', 
      description: 'Fee: $15.00 USDT - Most secure' 
    },
    { 
      value: 'BEP20', 
      label: 'BEP20 (BSC)', 
      description: 'Fee: $0.50 USDT - Lowest cost' 
    }
  ];

  const networkFees = {
    TRC20: 1.00,
    ERC20: 15.00,
    BEP20: 0.50
  };

  const minWithdrawal = 10.00;
  const maxWithdrawal = 5000.00;

  useEffect(() => {
    if (formData?.amount && formData?.network) {
      calculateConversion();
    }
  }, [formData?.amount, formData?.network]);

  useEffect(() => {
    // Set rate expiry timer
    const timer = setInterval(() => {
      setConversionData(prev => ({
        ...prev,
        rateExpiry: new Date(Date.now() + 300000) // 5 minutes from now
      }));
    }, 300000);

    // Initial rate expiry
    setConversionData(prev => ({
      ...prev,
      rateExpiry: new Date(Date.now() + 300000)
    }));

    return () => clearInterval(timer);
  }, []);

  const calculateConversion = () => {
    const amount = parseFloat(formData?.amount) || 0;
    const fee = networkFees?.[formData?.network] || 0;
    const rate = 1.0; // Mock exchange rate USD to USDT
    
    const usdtAmount = amount * rate;
    const finalAmount = Math.max(0, usdtAmount - fee);

    setConversionData(prev => ({
      ...prev,
      usdtAmount,
      networkFee: fee,
      finalAmount,
      exchangeRate: rate
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const amount = parseFloat(formData?.amount);

    if (!formData?.amount) {
      newErrors.amount = 'Withdrawal amount is required';
    } else if (amount < minWithdrawal) {
      newErrors.amount = `Minimum withdrawal amount is $${minWithdrawal}`;
    } else if (amount > maxWithdrawal) {
      newErrors.amount = `Maximum withdrawal amount is $${maxWithdrawal}`;
    } else if (amount > userBalance) {
      newErrors.amount = 'Insufficient balance';
    }

    if (!formData?.walletAddress) {
      newErrors.walletAddress = 'USDT wallet address is required';
    } else if (!isValidWalletAddress(formData?.walletAddress, formData?.network)) {
      newErrors.walletAddress = `Invalid ${formData?.network} wallet address format`;
    }

    if (!formData?.network) {
      newErrors.network = 'Please select a network';
    }

    if (!formData?.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const isValidWalletAddress = (address, network) => {
    if (!address || !network) return false;
    
    const patterns = {
      TRC20: /^T[A-Za-z1-9]{33}$/,
      ERC20: /^0x[a-fA-F0-9]{40}$/,
      BEP20: /^0x[a-fA-F0-9]{40}$/
    };

    return patterns?.[network]?.test(address) || false;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        conversionData
      });
    }
  };

  const formatTimeRemaining = (expiry) => {
    if (!expiry) return '5:00';
    const remaining = Math.max(0, expiry?.getTime() - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds?.toString()?.padStart(2, '0')}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Available Balance Display */}
      <div className="glass rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Wallet" size={20} className="text-success" />
            <span className="text-sm text-text-secondary">Available Balance</span>
          </div>
          <span className="text-lg font-data text-success">
            ${userBalance?.toFixed(2)}
          </span>
        </div>
      </div>
      {/* Withdrawal Amount */}
      <div className="space-y-4">
        <Input
          label="Withdrawal Amount"
          type="number"
          placeholder="Enter amount in USD"
          value={formData?.amount}
          onChange={(e) => handleInputChange('amount', e?.target?.value)}
          error={errors?.amount}
          min={minWithdrawal}
          max={Math.min(maxWithdrawal, userBalance)}
          step="0.01"
          required
          description={`Min: $${minWithdrawal} | Max: $${maxWithdrawal}`}
        />

        {/* Quick Amount Buttons */}
        <div className="flex flex-wrap gap-2">
          {[25, 50, 100, 250]?.map(amount => (
            <Button
              key={amount}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleInputChange('amount', amount?.toString())}
              disabled={amount > userBalance}
            >
              ${amount}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleInputChange('amount', Math.min(userBalance, maxWithdrawal)?.toString())}
          >
            Max
          </Button>
        </div>
      </div>
      {/* Network Selection */}
      <Select
        label="Blockchain Network"
        placeholder="Select network"
        options={networkOptions}
        value={formData?.network}
        onChange={(value) => handleInputChange('network', value)}
        error={errors?.network}
        required
        description="Choose the blockchain network for your withdrawal"
      />
      {/* Wallet Address */}
      <Input
        label="USDT Wallet Address"
        type="text"
        placeholder={formData?.network ? `Enter your ${formData?.network} wallet address` : 'Select network first'}
        value={formData?.walletAddress}
        onChange={(e) => handleInputChange('walletAddress', e?.target?.value)}
        error={errors?.walletAddress}
        required
        disabled={!formData?.network}
        description="Double-check your wallet address. Incorrect addresses may result in permanent loss of funds."
      />
      {/* Conversion Summary */}
      {formData?.amount && formData?.network && (
        <div className="glass rounded-lg p-4 border border-border space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">USD Amount:</span>
            <span className="font-data">${parseFloat(formData?.amount)?.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Exchange Rate:</span>
            <div className="flex items-center space-x-2">
              <span className="font-data">1 USD = {conversionData?.exchangeRate} USDT</span>
              <div className="flex items-center space-x-1 text-xs text-warning">
                <Icon name="Clock" size={12} />
                <span>{formatTimeRemaining(conversionData?.rateExpiry)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Network Fee ({formData?.network}):</span>
            <span className="font-data text-warning">-${conversionData?.networkFee?.toFixed(2)} USDT</span>
          </div>
          
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">You'll Receive:</span>
              <span className="text-lg font-data text-success">
                {conversionData?.finalAmount?.toFixed(2)} USDT
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Security Information */}
      <div className="glass rounded-lg p-4 border border-border">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={20} className="text-primary mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Security & Processing</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Processing time: 24-48 hours</li>
              <li>• Email verification required</li>
              <li>• Daily limit: $5,000 USDT</li>
              <li>• Monthly limit: $50,000 USDT</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Terms Acceptance */}
      <Checkbox
        label="I accept the withdrawal terms and conditions"
        description="I understand that cryptocurrency transactions are irreversible and confirm the wallet address is correct."
        checked={formData?.acceptTerms}
        onChange={(e) => handleInputChange('acceptTerms', e?.target?.checked)}
        error={errors?.acceptTerms}
        required
      />
      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={!formData?.amount || !formData?.walletAddress || !formData?.network || !formData?.acceptTerms}
        iconName="Send"
        iconPosition="left"
      >
        {isLoading ? 'Processing Withdrawal...' : 'Submit Withdrawal Request'}
      </Button>
    </form>
  );
};

export default WithdrawalForm;