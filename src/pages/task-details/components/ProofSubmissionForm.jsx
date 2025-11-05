import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ProofSubmissionForm = ({ task, onSubmit, onCancel }) => {
  const [proofType, setProofType] = useState('url');
  const [proofData, setProofData] = useState({
    url: '',
    description: '',
    file: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const proofTypeOptions = [
    { value: 'url', label: 'Website URL', description: 'Link to completed task or profile' },
    { value: 'text', label: 'Text Description', description: 'Detailed description of completion' },
    { value: 'image', label: 'Image Upload', description: 'Screenshot or photo proof' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (proofType === 'url' && !proofData?.url?.trim()) {
      newErrors.url = 'URL is required';
    } else if (proofType === 'url' && !isValidUrl(proofData?.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    if (proofType === 'text' && !proofData?.description?.trim()) {
      newErrors.description = 'Description is required';
    } else if (proofType === 'text' && proofData?.description?.trim()?.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (proofType === 'image' && !proofData?.file) {
      newErrors.file = 'Please select an image file';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const submissionData = {
        taskId: task?.id,
        type: proofType,
        data: proofData,
        submittedAt: new Date()?.toISOString()
      };
      
      onSubmit(submissionData);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes?.includes(file?.type)) {
        setErrors({ file: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' });
        return;
      }

      if (file?.size > maxSize) {
        setErrors({ file: 'File size must be less than 5MB' });
        return;
      }

      setProofData({ ...proofData, file });
      setErrors({ ...errors, file: '' });
    }
  };

  return (
    <div className="glass rounded-xl p-6 border border-border">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="Upload" size={20} className="text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Submit Proof of Completion</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Proof Type Selection */}
        <div>
          <Select
            label="Proof Type"
            description="Choose how you want to submit your proof"
            options={proofTypeOptions}
            value={proofType}
            onChange={setProofType}
            required
          />
        </div>

        {/* URL Proof */}
        {proofType === 'url' && (
          <div>
            <Input
              label="Proof URL"
              type="url"
              placeholder="https://example.com/your-profile-or-completion-proof"
              description="Provide a link that shows you completed the task (e.g., your profile, screenshot link, etc.)"
              value={proofData?.url}
              onChange={(e) => setProofData({ ...proofData, url: e?.target?.value })}
              error={errors?.url}
              required
            />
          </div>
        )}

        {/* Text Description Proof */}
        {proofType === 'text' && (
          <div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Detailed Description *
              </label>
              <textarea
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={6}
                placeholder="Provide a detailed description of how you completed the task. Include specific steps, usernames, timestamps, or any other relevant information that proves completion."
                value={proofData?.description}
                onChange={(e) => setProofData({ ...proofData, description: e?.target?.value })}
                required
              />
              <div className="flex justify-between text-sm">
                <span className={`${errors?.description ? 'text-destructive' : 'text-text-secondary'}`}>
                  {errors?.description || 'Minimum 50 characters required'}
                </span>
                <span className="text-text-secondary">
                  {proofData?.description?.length}/500
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Image Upload Proof */}
        {proofType === 'image' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Upload Image Proof *
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              {proofData?.file ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="Image" size={24} className="text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{proofData?.file?.name}</p>
                    <p className="text-xs text-text-secondary">
                      {(proofData?.file?.size / 1024 / 1024)?.toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setProofData({ ...proofData, file: null })}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-lg flex items-center justify-center">
                    <Icon name="Upload" size={24} className="text-text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-text-secondary">
                      PNG, JPG, GIF, WebP up to 5MB
                    </p>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {errors?.file && (
              <p className="text-sm text-destructive mt-1">{errors?.file}</p>
            )}
          </div>
        )}

        {/* Submission Guidelines */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-primary mb-2">Submission Guidelines</h4>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Ensure your proof clearly shows task completion</li>
                <li>• Include your username or profile information when possible</li>
                <li>• Screenshots should be clear and readable</li>
                <li>• Fake or misleading proofs will result in account suspension</li>
                <li>• Review typically takes 24-48 hours</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            loading={isSubmitting}
            iconName="Send"
            iconPosition="right"
            className="flex-1 bg-gradient-primary hover:opacity-90"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Proof'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProofSubmissionForm;