import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import { adminSettingsService } from '../../services/adminSettingsService';
import { useAuth } from '../../contexts/AuthContext';

const AdminSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { settings: data } = await adminSettingsService.getAllSettings();
    setSettings(data || []);
    setLoading(false);
  };

  const handleStartEdit = (setting) => {
    setEditingKey(setting.key);
    setEditValue(setting.value);
  };

  const handleSave = async (key) => {
    setSaving(true);
    await adminSettingsService.updateSetting(key, editValue);
    setEditingKey(null);
    await loadSettings();
    setSaving(false);
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const categories = [
    { id: 'all', label: 'All Settings', icon: 'Settings' },
    { id: 'general', label: 'General', icon: 'Info' },
    { id: 'financial', label: 'Financial', icon: 'DollarSign' },
    { id: 'rewards', label: 'Rewards', icon: 'Gift' },
    { id: 'levels', label: 'Levels', icon: 'TrendingUp' },
    { id: 'referrals', label: 'Referrals', icon: 'Users' },
    { id: 'email', label: 'Email', icon: 'Mail' },
    { id: 'limits', label: 'Limits', icon: 'AlertTriangle' }
  ];

  const filteredSettings = selectedCategory === 'all' 
    ? settings 
    : settings.filter(s => s.category === selectedCategory);

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
        <title>Admin Settings - PromoHive</title>
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
              <p className="text-text-secondary mt-2">
                Manage all system configurations and settings
              </p>
            </div>
            <button
              onClick={loadSettings}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              <Icon name="RefreshCw" size={20} />
              Refresh
            </button>
          </div>

          {/* Category Filter */}
          <div className="glass rounded-xl p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-white'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  <Icon name={cat.icon} size={16} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Count */}
          <div className="mb-4 text-sm text-text-secondary">
            Showing {filteredSettings.length} setting(s)
          </div>

          {/* Settings Grid */}
          <div className="grid gap-4">
            {filteredSettings.map(setting => (
              <div key={setting.id} className="glass rounded-xl p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {setting.key}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded ${
                        setting.category === 'financial' ? 'bg-success/20 text-success' :
                        setting.category === 'rewards' ? 'bg-warning/20 text-warning' :
                        setting.category === 'levels' ? 'bg-primary/20 text-primary' :
                        'bg-muted text-text-secondary'
                      }`}>
                        {setting.category}
                      </span>
                      {!setting.is_public && (
                        <span className="px-2 py-1 text-xs rounded bg-destructive/20 text-destructive">
                          Hidden from users
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mb-3">
                      {setting.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <span>Type: {setting.data_type}</span>
                      <span>•</span>
                      <span>Updated: {new Date(setting.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="w-80">
                    {editingKey === setting.key ? (
                      <div className="space-y-2">
                        <input
                          type={setting.data_type === 'number' ? 'number' : 'text'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(setting.key)}
                            disabled={saving}
                            className="flex-1 px-3 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="flex-1 px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border">
                          <span className="font-mono">{setting.value}</span>
                        </div>
                        <button
                          onClick={() => handleStartEdit(setting)}
                          className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                          title="Edit"
                        >
                          <Icon name="Edit2" size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSettings.length === 0 && (
            <div className="glass rounded-xl p-12 text-center">
              <Icon name="Settings" size={48} className="mx-auto text-text-secondary mb-4" />
              <p className="text-text-secondary">No settings found in this category</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminSettings;
