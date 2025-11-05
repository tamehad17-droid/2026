import React, { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { adminService } from '../../../services/adminService';

const ApprovalHistoryModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    actionType: '',
    action: '',
    fromDate: '',
    toDate: ''
  });

  const actionTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'new_account', label: 'New Account' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'task', label: 'Task' },
    { value: 'level_upgrade', label: 'Level Upgrade' }
  ];

  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'approve', label: 'Approve' },
    { value: 'reject', label: 'Reject' }
  ];

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await adminService.getApprovalHistory({
          actionType: filters.actionType || undefined,
          action: filters.action || undefined,
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,
          limit: 100
        });
        if (!mounted) return;
        if (result?.success) {
          setHistory(result.history || []);
        } else {
          setError(result?.error || 'Failed to load approval history');
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load approval history');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => { mounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-6 z-50 overflow-auto p-6">
        <div className="bg-surface rounded-xl border border-border p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Approval History</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <Icon name="X" size={18} />
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select 
              className="glass rounded-lg p-2 text-sm"
              value={filters.actionType}
              onChange={(e) => setFilters({...filters, actionType: e.target.value})}
            >
              {actionTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              className="glass rounded-lg p-2 text-sm"
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
            >
              {actionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <input
              type="date"
              className="glass rounded-lg p-2 text-sm"
              value={filters.fromDate}
              onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
              placeholder="From Date"
            />

            <input
              type="date"
              className="glass rounded-lg p-2 text-sm"
              value={filters.toDate}
              onChange={(e) => setFilters({...filters, toDate: e.target.value})}
              placeholder="To Date"
            />
          </div>

          {loading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading approvals...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>
          ) : history?.length === 0 ? (
            <div className="p-6 text-center text-text-secondary">No approval history found.</div>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div key={idx} className="p-4 border border-border rounded-lg flex items-start justify-between">
                  <div>
                    <div className="text-sm text-text-secondary">{new Date(item?.approved_at || item?.created_at).toLocaleString()}</div>
                    <div className="font-medium text-foreground">{item?.full_name || item?.email || 'Unknown'}</div>
                    <div className="text-xs text-text-secondary">Status: {item?.approval_status}</div>
                  </div>
                  <div className="text-right text-sm text-text-secondary">
                    <div>Approved by: {item?.approver?.full_name || item?.approved_by || '—'}</div>
                    <div className="mt-2">ID: {item?.id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ApprovalHistoryModal;
