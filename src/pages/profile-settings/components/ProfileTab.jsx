import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const ProfileTab = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john@promohive.com',
    phone: user?.phone || '+1 (555) 123-4567',
    country: user?.country || 'United States',
    timezone: user?.timezone || 'America/New_York',
    bio: user?.bio || 'Passionate about digital marketing and earning through promotional tasks.'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData?.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onUpdate(formData);
      setIsEditing(false);
      setIsLoading(false);
    }, 1500);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || 'John',
      lastName: user?.lastName || 'Doe',
      email: user?.email || 'john@promohive.com',
      phone: user?.phone || '+1 (555) 123-4567',
      country: user?.country || 'United States',
      timezone: user?.timezone || 'America/New_York',
      bio: user?.bio || 'Passionate about digital marketing and earning through promotional tasks.'
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      if (file?.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'Image size must be less than 5MB'
        }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e?.target?.result);
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      };
      reader?.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Profile Picture</h3>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
              <Image
                src={profileImage}
                alt="Professional headshot of user with friendly smile"
                className="w-full h-full object-cover"
              />
            </div>
            
            {isEditing && (
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                <Icon name="Camera" size={16} color="white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-text-secondary mb-2">
              Upload a professional photo to personalize your profile
            </p>
            <p className="text-xs text-text-secondary">
              Recommended: Square image, at least 200x200px, max 5MB
            </p>
            {errors?.image && (
              <p className="text-xs text-destructive mt-1">{errors?.image}</p>
            )}
          </div>
        </div>
      </div>
      {/* Personal Information */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
          
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              iconName="Edit"
              iconPosition="left"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                iconName="Save"
                iconPosition="left"
                onClick={handleSave}
                loading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            name="firstName"
            value={formData?.firstName}
            onChange={handleInputChange}
            disabled={!isEditing}
            error={errors?.firstName}
            required
            placeholder="Enter your first name"
          />

          <Input
            label="Last Name"
            name="lastName"
            value={formData?.lastName}
            onChange={handleInputChange}
            disabled={!isEditing}
            error={errors?.lastName}
            required
            placeholder="Enter your last name"
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData?.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            error={errors?.email}
            required
            placeholder="Enter your email address"
            description="This email is used for account notifications"
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData?.phone}
            onChange={handleInputChange}
            disabled={!isEditing}
            error={errors?.phone}
            required
            placeholder="Enter your phone number"
          />

          <Input
            label="Country"
            name="country"
            value={formData?.country}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Enter your country"
          />

          <Input
            label="Timezone"
            name="timezone"
            value={formData?.timezone}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Select your timezone"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData?.bio}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows={4}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            placeholder="Tell us about yourself..."
          />
          <p className="text-xs text-text-secondary mt-1">
            Brief description about yourself and your interests
          </p>
        </div>
      </div>
      {/* Account Statistics */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Account Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary mb-1">156</div>
            <div className="text-sm text-text-secondary">Tasks Completed</div>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-success mb-1">$1,250.75</div>
            <div className="text-sm text-text-secondary">Total Earned</div>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-secondary mb-1">23</div>
            <div className="text-sm text-text-secondary">Referrals</div>
          </div>
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-accent mb-1">45</div>
            <div className="text-sm text-text-secondary">Days Active</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;