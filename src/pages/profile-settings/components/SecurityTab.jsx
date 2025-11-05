import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const SecurityTab = ({ onPasswordChange, onTwoFactorToggle }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const passwordStrength = (password) => {
    let strength = 0;
    if (password?.length >= 8) strength++;
    if (/[a-z]/?.test(password)) strength++;
    if (/[A-Z]/?.test(password)) strength++;
    if (/[0-9]/?.test(password)) strength++;
    if (/[^A-Za-z0-9]/?.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength) => {
    if (strength <= 1) return 'bg-destructive';
    if (strength <= 2) return 'bg-warning';
    if (strength <= 3) return 'bg-accent';
    return 'bg-success';
  };

  const getStrengthText = (strength) => {
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    return 'Strong';
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e?.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (passwordErrors?.[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm?.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm?.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm?.newPassword?.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (passwordStrength(passwordForm?.newPassword) < 3) {
      errors.newPassword = 'Password is too weak';
    }
    
    if (!passwordForm?.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm?.newPassword !== passwordForm?.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) return;
    
    setIsChangingPassword(true);
    
    // Simulate API call
    setTimeout(() => {
      onPasswordChange(passwordForm);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
    }, 2000);
  };

  const handleEnable2FA = async () => {
    setIsEnabling2FA(true);
    
    // Simulate QR code generation
    setTimeout(() => {
      setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/PromoHive:john@promohive.com?secret=JBSWY3DPEHPK3PXP&issuer=PromoHive');
      setIsEnabling2FA(false);
    }, 1000);
  };

  const handleVerify2FA = async () => {
    if (verificationCode?.length !== 6) return;
    
    setIsEnabling2FA(true);
    
    // Simulate verification
    setTimeout(() => {
      setTwoFactorEnabled(true);
      setQrCode('');
      setVerificationCode('');
      setIsEnabling2FA(false);
      onTwoFactorToggle(true);
    }, 1500);
  };

  const handleDisable2FA = async () => {
    setIsEnabling2FA(true);
    
    // Simulate API call
    setTimeout(() => {
      setTwoFactorEnabled(false);
      setIsEnabling2FA(false);
      onTwoFactorToggle(false);
    }, 1000);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev?.[field]
    }));
  };

  let strength = passwordStrength(passwordForm?.newPassword);

  return (
    <div className="space-y-8">
      {/* Password Change Section */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Change Password</h3>
        
        <div className="space-y-6">
          <div className="relative">
            <Input
              label="Current Password"
              name="currentPassword"
              type={showPasswords?.current ? 'text' : 'password'}
              value={passwordForm?.currentPassword}
              onChange={handlePasswordInputChange}
              error={passwordErrors?.currentPassword}
              required
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-9 text-text-secondary hover:text-foreground"
            >
              <Icon name={showPasswords?.current ? 'EyeOff' : 'Eye'} size={16} />
            </button>
          </div>

          <div className="relative">
            <Input
              label="New Password"
              name="newPassword"
              type={showPasswords?.new ? 'text' : 'password'}
              value={passwordForm?.newPassword}
              onChange={handlePasswordInputChange}
              error={passwordErrors?.newPassword}
              required
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-9 text-text-secondary hover:text-foreground"
            >
              <Icon name={showPasswords?.new ? 'EyeOff' : 'Eye'} size={16} />
            </button>
            
            {passwordForm?.newPassword && (
              <div className="mt-2">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthColor(strength)}`}
                      style={{ width: `${(strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    strength <= 1 ? 'text-destructive' :
                    strength <= 2 ? 'text-warning' :
                    strength <= 3 ? 'text-accent' : 'text-success'
                  }`}>
                    {getStrengthText(strength)}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">
                  Use 8+ characters with uppercase, lowercase, numbers, and symbols
                </p>
              </div>
            )}
          </div>

          <div className="relative">
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type={showPasswords?.confirm ? 'text' : 'password'}
              value={passwordForm?.confirmPassword}
              onChange={handlePasswordInputChange}
              error={passwordErrors?.confirmPassword}
              required
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-9 text-text-secondary hover:text-foreground"
            >
              <Icon name={showPasswords?.confirm ? 'EyeOff' : 'Eye'} size={16} />
            </button>
          </div>

          <Button
            variant="default"
            onClick={handlePasswordChange}
            loading={isChangingPassword}
            iconName="Lock"
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            Update Password
          </Button>
        </div>
      </div>
      {/* Two-Factor Authentication */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h3>
            <p className="text-sm text-text-secondary mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          
          <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
            twoFactorEnabled ? 'bg-success' : 'bg-muted'
          }`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
              twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'
            } mt-0.5`} />
          </div>
        </div>

        {!twoFactorEnabled ? (
          <div className="space-y-4">
            {!qrCode ? (
              <div>
                <p className="text-sm text-text-secondary mb-4">
                  Enable two-factor authentication using an authenticator app like Google Authenticator or Authy.
                </p>
                <Button
                  variant="outline"
                  onClick={handleEnable2FA}
                  loading={isEnabling2FA}
                  iconName="Shield"
                  iconPosition="left"
                >
                  Enable 2FA
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-text-secondary mb-4">
                    Scan this QR code with your authenticator app:
                  </p>
                  <div className="inline-block p-4 bg-white rounded-lg">
                    <img 
                      src={qrCode} 
                      alt="QR code for two-factor authentication setup"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
                
                <div className="max-w-xs mx-auto">
                  <Input
                    label="Verification Code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e?.target?.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                  
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setQrCode('')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleVerify2FA}
                      loading={isEnabling2FA}
                      disabled={verificationCode?.length !== 6}
                      className="flex-1"
                    >
                      Verify
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-success/10 border border-success/20 rounded-lg">
              <Icon name="CheckCircle" size={20} className="text-success" />
              <div>
                <p className="text-sm font-medium text-success">Two-Factor Authentication Enabled</p>
                <p className="text-xs text-success/80">Your account is protected with 2FA</p>
              </div>
            </div>
            
            <Button
              variant="destructive"
              onClick={handleDisable2FA}
              loading={isEnabling2FA}
              iconName="ShieldOff"
              iconPosition="left"
            >
              Disable 2FA
            </Button>
          </div>
        )}
      </div>
      {/* Security Tips */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Security Tips</h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Icon name="Shield" size={16} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Use a strong password</p>
              <p className="text-xs text-text-secondary">Combine uppercase, lowercase, numbers, and symbols</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Icon name="Smartphone" size={16} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Enable two-factor authentication</p>
              <p className="text-xs text-text-secondary">Add an extra layer of security to your account</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Icon name="Eye" size={16} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Monitor your sessions</p>
              <p className="text-xs text-text-secondary">Regularly check for unauthorized access</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Icon name="Mail" size={16} className="text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Keep your email secure</p>
              <p className="text-xs text-text-secondary">Your email is used for account recovery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;