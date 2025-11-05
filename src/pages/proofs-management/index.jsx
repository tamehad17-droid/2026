import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProofStats from './components/ProofStats';
import ProofFilters from './components/ProofFilters';
import ProofTable from './components/ProofTable';
import ProofCard from './components/ProofCard';
import ProofModal from './components/ProofModal';

const ProofsManagement = () => {
  const navigate = useNavigate();
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [selectedProofs, setSelectedProofs] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    proof: null,
    mode: 'view' // 'view' or 'resubmit'
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Mock data
  const mockProofs = [
  {
    id: 1,
    taskName: "Complete AdGem Survey - Consumer Preferences",
    taskCategory: "adgem",
    proofType: "image",
    content: "https://images.unsplash.com/photo-1633446576428-8ec752e33f0d",
    status: "approved",
    rewardAmount: 15.50,
    submittedAt: "2024-10-28T14:30:00Z",
    reviewedAt: "2024-10-28T16:45:00Z",
    taskDeadline: "2024-10-30T23:59:59Z",
    adminFeedback: "Excellent proof submission. All requirements met perfectly."
  },
  {
    id: 2,
    taskName: "AdSterra Banner Click Campaign",
    taskCategory: "adsterra",
    proofType: "url",
    content: "https://example-proof-link.com/campaign-completion",
    status: "pending",
    rewardAmount: 8.25,
    submittedAt: "2024-10-29T09:15:00Z",
    reviewedAt: null,
    taskDeadline: "2024-11-01T23:59:59Z",
    adminFeedback: null
  },
  {
    id: 3,
    taskName: "Manual Social Media Engagement Task",
    taskCategory: "manual",
    proofType: "text",
    content: `Task completed successfully:\n\n1. Followed @promohive_official on Instagram\n2. Liked the last 5 posts\n3. Shared the promotional post to my story\n4. Tagged 3 friends in the comments\n\nUsername: @john_doe_2024\nCompleted on: October 29, 2024 at 2:30 PM EST`,
    status: "rejected",
    rewardAmount: 12.00,
    submittedAt: "2024-10-27T18:20:00Z",
    reviewedAt: "2024-10-28T10:30:00Z",
    taskDeadline: "2024-10-29T23:59:59Z",
    adminFeedback: "The provided username could not be verified. Please ensure you're using the correct Instagram handle and that your account is public during verification."
  },
  {
    id: 4,
    taskName: "CPALead Mobile App Download",
    taskCategory: "cpalead",
    proofType: "image",
    content: "https://images.unsplash.com/photo-1735405887431-f8ace7262618",
    status: "approved",
    rewardAmount: 22.75,
    submittedAt: "2024-10-26T11:45:00Z",
    reviewedAt: "2024-10-26T14:20:00Z",
    taskDeadline: "2024-10-28T23:59:59Z",
    adminFeedback: "Perfect screenshot showing successful app installation and account creation."
  },
  {
    id: 5,
    taskName: "AdGem Video Watch Campaign",
    taskCategory: "adgem",
    proofType: "text",
    content: `Video watching task completed:\n\nWatched 10 promotional videos as required\nTotal watch time: 45 minutes\nCompleted surveys after each video\nReceived confirmation emails for all completions\n\nConfirmation codes:\n- VID001: ABC123XYZ\n- VID002: DEF456UVW\n- VID003: GHI789RST\n- VID004: JKL012MNO\n- VID005: PQR345STU`,
    status: "pending",
    rewardAmount: 18.90,
    submittedAt: "2024-10-29T16:00:00Z",
    reviewedAt: null,
    taskDeadline: "2024-11-02T23:59:59Z",
    adminFeedback: null
  },
  {
    id: 6,
    taskName: "Manual Product Review Task",
    taskCategory: "manual",
    proofType: "url",
    content: "https://amazon.com/review/R1234567890ABCDEF",
    status: "rejected",
    rewardAmount: 25.00,
    submittedAt: "2024-10-25T13:30:00Z",
    reviewedAt: "2024-10-26T09:15:00Z",
    taskDeadline: "2024-10-27T23:59:59Z",
    adminFeedback: "The review link provided does not contain the required keywords and product details as specified in the task requirements. Please rewrite the review to include all mandatory elements."
  },
  {
    id: 7,
    taskName: "AdSterra Pop-under Campaign",
    taskCategory: "adsterra",
    proofType: "image",
    content: "https://images.unsplash.com/photo-1583268853849-64d03729d6a2",
    status: "approved",
    rewardAmount: 11.40,
    submittedAt: "2024-10-24T20:10:00Z",
    reviewedAt: "2024-10-25T08:30:00Z",
    taskDeadline: "2024-10-26T23:59:59Z",
    adminFeedback: "All screenshots clearly show the campaign completion steps. Well documented proof."
  },
  {
    id: 8,
    taskName: "CPALead Email Subscription Campaign",
    taskCategory: "cpalead",
    proofType: "text",
    content: `Email subscription completed successfully:\n\nSubscribed to newsletter: TechDeals Weekly\nEmail used: john.doe.promo@gmail.com\nConfirmation received: Yes\nWelcome email received: Yes\nFirst newsletter received: Yes\n\nSubscription date: October 23, 2024\nConfirmation timestamp: 2024-10-23 15:42:18 UTC`,
    status: "pending",
    rewardAmount: 9.75,
    submittedAt: "2024-10-29T12:20:00Z",
    reviewedAt: null,
    taskDeadline: "2024-11-05T23:59:59Z",
    adminFeedback: null
  }];


  useEffect(() => {
    // Simulate API call
    const loadProofs = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProofs(mockProofs);
      setLoading(false);
    };

    loadProofs();
  }, []);

  // Filter proofs based on current filters
  const filteredProofs = useMemo(() => {
    return proofs?.filter((proof) => {
      // Status filter
      if (filters?.status && proof?.status !== filters?.status) return false;

      // Type filter
      if (filters?.type && proof?.proofType !== filters?.type) return false;

      // Category filter
      if (filters?.category && proof?.taskCategory !== filters?.category) return false;

      // Date range filter
      if (filters?.dateFrom) {
        const proofDate = new Date(proof.submittedAt);
        const fromDate = new Date(filters.dateFrom);
        if (proofDate < fromDate) return false;
      }

      if (filters?.dateTo) {
        const proofDate = new Date(proof.submittedAt);
        const toDate = new Date(filters.dateTo);
        toDate?.setHours(23, 59, 59, 999);
        if (proofDate > toDate) return false;
      }

      // Search filter
      if (filters?.search) {
        const searchTerm = filters?.search?.toLowerCase();
        return proof?.taskName?.toLowerCase()?.includes(searchTerm) ||
        proof?.content?.toLowerCase()?.includes(searchTerm) || proof?.taskCategory?.toLowerCase()?.includes(searchTerm);
      }

      return true;
    });
  }, [proofs, filters]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = proofs?.length;
    const pending = proofs?.filter((p) => p?.status === 'pending')?.length;
    const approved = proofs?.filter((p) => p?.status === 'approved')?.length;
    const rejected = proofs?.filter((p) => p?.status === 'rejected')?.length;
    const totalEarnings = proofs?.filter((p) => p?.status === 'approved')?.reduce((sum, p) => sum + p?.rewardAmount, 0);
    const pendingEarnings = proofs?.filter((p) => p?.status === 'pending')?.reduce((sum, p) => sum + p?.rewardAmount, 0);

    return {
      total,
      pending,
      approved,
      rejected,
      totalEarnings,
      pendingEarnings
    };
  }, [proofs]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      type: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  const handleExport = () => {
    // Mock export functionality
    const csvContent = [
    ['Task Name', 'Category', 'Proof Type', 'Status', 'Reward', 'Submitted', 'Reviewed']?.join(','),
    ...filteredProofs?.map((proof) => [
    `"${proof?.taskName}"`,
    proof?.taskCategory,
    proof?.proofType,
    proof?.status,
    proof?.rewardAmount,
    new Date(proof.submittedAt)?.toLocaleDateString(),
    proof?.reviewedAt ? new Date(proof.reviewedAt)?.toLocaleDateString() : 'N/A']?.
    join(','))]?.
    join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL?.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proofs-export-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
    a?.click();
    window.URL?.revokeObjectURL(url);
  };

  const handleSelectProof = (proofId, selected) => {
    setSelectedProofs((prev) =>
    selected ?
    [...prev, proofId] :
    prev?.filter((id) => id !== proofId)
    );
  };

  const handleSelectAll = (selected) => {
    setSelectedProofs(selected ? filteredProofs?.map((p) => p?.id) : []);
  };

  const handleBulkAction = (action) => {
    if (action === 'resubmit') {
      const rejectedProofs = selectedProofs?.filter((id) => {
        const proof = proofs?.find((p) => p?.id === id);
        return proof && proof?.status === 'rejected';
      });

      if (rejectedProofs?.length === 0) {
        alert('Please select rejected proofs to resubmit.');
        return;
      }

      // Mock bulk resubmission
      alert(`${rejectedProofs?.length} proof(s) marked for resubmission.`);
      setSelectedProofs([]);
    }
  };

  const handleViewDetails = (proof, imageIndex = 0) => {
    setModalState({
      isOpen: true,
      proof,
      mode: 'view',
      imageIndex
    });
  };

  const handleResubmit = (proof, resubmissionData = null) => {
    if (resubmissionData) {
      // Mock resubmission API call
      console.log('Resubmitting proof:', proof?.id, resubmissionData);
      alert('Proof resubmitted successfully!');
      setModalState({ isOpen: false, proof: null, mode: 'view' });
    } else {
      setModalState({
        isOpen: true,
        proof,
        mode: 'resubmit'
      });
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, proof: null, mode: 'view' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted/30 rounded w-1/4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[...Array(6)]?.map((_, i) =>
              <div key={i} className="h-24 bg-muted/30 rounded-lg"></div>
              )}
            </div>
            <div className="h-64 bg-muted/30 rounded-lg"></div>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Proofs Management
            </h1>
            <p className="text-text-secondary">
              Track and manage your task proof submissions
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/30 rounded-lg p-1">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                iconName="Table"
                className="h-8">

                Table
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                iconName="Grid3X3"
                className="h-8">

                Cards
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate('/tasks-list')}
              iconName="Plus"
              iconPosition="left">

              Browse Tasks
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <ProofStats stats={stats} />

        {/* Filters */}
        <ProofFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onExport={handleExport}
          totalProofs={proofs?.length}
          filteredCount={filteredProofs?.length} />


        {/* Content */}
        {viewMode === 'table' ?
        <ProofTable
          proofs={filteredProofs}
          onResubmit={handleResubmit}
          onViewDetails={handleViewDetails}
          onBulkAction={handleBulkAction}
          selectedProofs={selectedProofs}
          onSelectProof={handleSelectProof}
          onSelectAll={handleSelectAll} /> :


        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProofs?.map((proof) =>
          <ProofCard
            key={proof?.id}
            proof={proof}
            onResubmit={handleResubmit}
            onViewDetails={handleViewDetails} />

          )}
            
            {filteredProofs?.length === 0 &&
          <div className="col-span-full text-center py-12">
                <Icon name="FileSearch" size={48} className="text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No proofs found</h3>
                <p className="text-text-secondary mb-4">
                  No proofs match your current filters. Try adjusting your search criteria.
                </p>
                <Button
              variant="outline"
              onClick={handleClearFilters}
              iconName="RefreshCw"
              iconPosition="left">

                  Clear Filters
                </Button>
              </div>
          }
          </div>
        }

        {/* Proof Modal */}
        <ProofModal
          proof={modalState?.proof}
          isOpen={modalState?.isOpen}
          onClose={closeModal}
          onResubmit={handleResubmit}
          mode={modalState?.mode} />

      </div>
    </div>);

};

export default ProofsManagement;