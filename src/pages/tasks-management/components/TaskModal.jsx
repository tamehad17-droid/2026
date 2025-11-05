import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TaskModal = ({ isOpen, onClose, task, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'survey',
    reward_amount: '',
    total_slots: '',
    level_required: 0,
    proof_type: 'text',
    proof_instructions: '',
    external_url: '',
    status: 'active'
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        category: task.category || 'survey',
        reward_amount: task.reward_amount || '',
        total_slots: task.total_slots || '',
        level_required: task.level_required || 0,
        proof_type: task.proof_type || 'text',
        proof_instructions: task.proof_instructions || '',
        external_url: task.external_url || '',
        status: task.status || 'active'
      });
    } else {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        category: 'survey',
        reward_amount: '',
        total_slots: '',
        level_required: 0,
        proof_type: 'text',
        proof_instructions: '',
        external_url: '',
        status: 'active'
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      reward_amount: parseFloat(formData.reward_amount),
      total_slots: parseInt(formData.total_slots),
      level_required: parseInt(formData.level_required)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-2xl glass rounded-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-foreground transition-colors"
            >
              <Icon name="X" size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring"
                  >
                    <option value="survey">Survey</option>
                    <option value="social_media">Social Media</option>
                    <option value="app_download">App Download</option>
                    <option value="review">Review</option>
                    <option value="referral">Referral</option>
                    <option value="video_watch">Video Watch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Reward Amount ($)
                  </label>
                  <input
                    type="number"
                    value={formData.reward_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, reward_amount: e.target.value }))}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Total Slots
                  </label>
                  <input
                    type="number"
                    value={formData.total_slots}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_slots: e.target.value }))}
                    required
                    min="1"
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Level Required
                  </label>
                  <input
                    type="number"
                    value={formData.level_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, level_required: e.target.value }))}
                    required
                    min="0"
                    max="5"
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Proof Type
                </label>
                <select
                  value={formData.proof_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, proof_type: e.target.value }))}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring"
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="url">URL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Proof Instructions
                </label>
                <textarea
                  value={formData.proof_instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, proof_instructions: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Enter instructions for proof submission"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  External URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.external_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, external_url: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-ring"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="default" type="submit">
                {task ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;