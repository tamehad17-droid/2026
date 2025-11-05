import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProofCard from './components/ProofCard';
import ProofFilters from './components/ProofFilters';
import ReviewModal from './components/ReviewModal';
import BulkActions from './components/BulkActions';
import ProofStats from './components/ProofStats';

const ProofsReview = () => {
  const [proofs, setProofs] = useState([]);
  const [selectedProofs, setSelectedProofs] = useState([]);
  const [selectedProof, setSelectedProof] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    taskType: '',
    proofType: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'newest'
  });

  const proofsPerPage = 10;

  // Mock data for proof submissions
  const mockProofs = [
  {
    id: 'PROOF_001',
    taskId: 'TASK_001',
    taskTitle: 'Complete Social Media Survey',
    taskType: 'MANUAL',
    userId: 'USER_001',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@email.com',
    userJoinDate: '2024-08-15T10:30:00Z',
    status: 'PENDING',
    proofType: 'URL',
    proofUrl: 'https://survey-platform.com/completed/abc123',
    reward: 5.50,
    submittedAt: '2024-10-29T14:30:00Z',
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null
  },
  {
    id: 'PROOF_002',
    taskId: 'TASK_002',
    taskTitle: 'AdGem Mobile App Install',
    taskType: 'ADGEM',
    userId: 'USER_002',
    userName: 'Michael Chen',
    userEmail: 'michael.chen@email.com',
    userJoinDate: '2024-09-01T08:15:00Z',
    status: 'PENDING',
    proofType: 'IMAGE',
    proofImages: [
    {
      url: "https://images.unsplash.com/photo-1727528775619-23a73b9a7612",
      alt: 'Screenshot of mobile app installation confirmation screen showing successful download'
    },
    {
      url: "https://images.unsplash.com/photo-1648202842046-66acde22cae0",
      alt: 'Mobile phone screen displaying app icon on home screen after installation'
    }],

    reward: 8.25,
    submittedAt: '2024-10-29T13:45:00Z',
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null
  },
  {
    id: 'PROOF_003',
    taskId: 'TASK_003',
    taskTitle: 'Product Review Submission',
    taskType: 'MANUAL',
    userId: 'USER_003',
    userName: 'Emily Rodriguez',
    userEmail: 'emily.rodriguez@email.com',
    userJoinDate: '2024-07-20T16:45:00Z',
    status: 'APPROVED',
    proofType: 'TEXT',
    proofText: `I recently purchased this wireless headphone and I'm extremely satisfied with the quality. The sound is crystal clear with excellent bass response. The battery life lasts for over 20 hours of continuous use, which is perfect for my daily commute and workout sessions.\n\nThe build quality feels premium with comfortable ear cushions that don't cause fatigue even after extended use. The noise cancellation feature works exceptionally well in busy environments.\n\nOverall, I would highly recommend this product to anyone looking for high-quality wireless headphones at a reasonable price point. The value for money is outstanding.`,
    reward: 12.00,
    submittedAt: '2024-10-29T11:20:00Z',
    reviewedAt: '2024-10-29T12:15:00Z',
    reviewedBy: 'ADMIN_001',
    rejectionReason: null
  },
  {
    id: 'PROOF_004',
    taskId: 'TASK_004',
    taskTitle: 'AdSterra Banner Click Campaign',
    taskType: 'ADSTERRA',
    userId: 'USER_004',
    userName: 'David Thompson',
    userEmail: 'david.thompson@email.com',
    userJoinDate: '2024-08-30T12:00:00Z',
    status: 'REJECTED',
    proofType: 'URL',
    proofUrl: 'https://invalid-url-example.com/fake-proof',
    reward: 3.75,
    submittedAt: '2024-10-29T10:15:00Z',
    reviewedAt: '2024-10-29T11:30:00Z',
    reviewedBy: 'ADMIN_002',
    rejectionReason: 'The provided URL does not lead to a valid completion page. Please ensure you complete the entire campaign flow and submit the correct confirmation URL.'
  },
  {
    id: 'PROOF_005',
    taskId: 'TASK_005',
    taskTitle: 'CPALead Email Signup',
    taskType: 'CPALEAD',
    userId: 'USER_005',
    userName: 'Lisa Wang',
    userEmail: 'lisa.wang@email.com',
    userJoinDate: '2024-09-10T14:30:00Z',
    status: 'PENDING',
    proofType: 'IMAGE',
    proofImages: [
    {
      url: "https://images.unsplash.com/photo-1678227547327-ec5745559b29",
      alt: 'Email confirmation screen showing successful newsletter subscription with welcome message'
    }],

    reward: 4.50,
    submittedAt: '2024-10-29T09:45:00Z',
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null
  },
  {
    id: 'PROOF_006',
    taskId: 'TASK_006',
    taskTitle: 'Social Media Engagement Task',
    taskType: 'MANUAL',
    userId: 'USER_006',
    userName: 'James Wilson',
    userEmail: 'james.wilson@email.com',
    userJoinDate: '2024-08-05T09:20:00Z',
    status: 'PENDING',
    proofType: 'TEXT',
    proofText: `Completed the social media engagement task as requested. I have:\n\n1. Followed the company's official Instagram account (@promohive_official)\n2. Liked the last 5 posts on their feed\n3. Shared their latest promotional post to my story\n4. Left a positive comment on their most recent product announcement\n\nMy Instagram username is @jameswilson_official for verification purposes. The engagement was completed on October 29, 2024 at approximately 2:30 PM EST.\n\nAll actions were performed genuinely and will remain active as per the task requirements.`,
    reward: 6.75,
    submittedAt: '2024-10-29T08:30:00Z',
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null
  }];


  // Mock stats data
  const mockStats = {
    total: 156,
    pending: 23,
    approvedToday: 18,
    rejectedToday: 4,
    avgReviewTime: 2.5,
    totalRewards: 2847.50
  };

  useEffect(() => {
    const loadProofs = async () => {
      try {
        const data = await adminService.getPendingProofs();
        setProofs(data);
      } catch (error) {
        console.error('Error loading proofs:', error);
        toast.error('Failed to load proofs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProofs();
  }, []);

  // Filter and sort proofs
  const filteredProofs = useMemo(() => {
    let filtered = proofs?.filter((proof) => {
      const matchesStatus = !filters?.status || proof?.status === filters?.status;
      const matchesTaskType = !filters?.taskType || proof?.taskType === filters?.taskType;
      const matchesProofType = !filters?.proofType || proof?.proofType === filters?.proofType;
      const matchesSearch = !filters?.search ||
      proof?.userName?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
      proof?.taskTitle?.toLowerCase()?.includes(filters?.search?.toLowerCase());

      const submittedDate = new Date(proof.submittedAt);
      const matchesDateFrom = !filters?.dateFrom || submittedDate >= new Date(filters.dateFrom);
      const matchesDateTo = !filters?.dateTo || submittedDate <= new Date(filters.dateTo);

      return matchesStatus && matchesTaskType && matchesProofType && matchesSearch && matchesDateFrom && matchesDateTo;
    });

    // Sort proofs
    filtered?.sort((a, b) => {
      switch (filters?.sortBy) {
        case 'oldest':
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        case 'reward_high':
          return b?.reward - a?.reward;
        case 'reward_low':
          return a?.reward - b?.reward;
        case 'user_name':
          return a?.userName?.localeCompare(b?.userName);
        case 'newest':
        default:
          return new Date(b.submittedAt) - new Date(a.submittedAt);
      }
    });

    return filtered;
  }, [proofs, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredProofs?.length / proofsPerPage);
  const paginatedProofs = filteredProofs?.slice(
    (currentPage - 1) * proofsPerPage,
    currentPage * proofsPerPage
  );

  const handleProofSelect = (proofId) => {
    setSelectedProofs((prev) =>
    prev?.includes(proofId) ?
    prev?.filter((id) => id !== proofId) :
    [...prev, proofId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProofs?.length === paginatedProofs?.length) {
      setSelectedProofs([]);
    } else {
      setSelectedProofs(paginatedProofs?.map((proof) => proof?.id));
    }
  };

  const handleViewDetails = (proof) => {
    setSelectedProof(proof);
    setIsModalOpen(true);
  };

  const handleApprove = async (proofId) => {
    try {
      const updatedProof = await adminService.reviewProof(proofId, 'approve');
      setProofs((prev) => prev?.map((proof) =>
        proof?.id === proofId ? updatedProof : proof
      ));
    } catch (error) {
      console.error('Error approving proof:', error);
      toast.error('Failed to approve proof. Please try again.');
    }
  };

  const handleReject = async (proofId, reason) => {
    try {
      const updatedProof = await adminService.reviewProof(proofId, 'reject', reason);
      setProofs((prev) => prev?.map((proof) =>
        proof?.id === proofId ? updatedProof : proof
      ));
    } catch (error) {
      console.error('Error rejecting proof:', error);
      // TODO: Add error toast
    }
  };

  const handleBulkApprove = async (proofIds) => {
    try {
      await Promise.all(
        proofIds.map(proofId => adminService.reviewProof(proofId, 'approve'))
      );
      
      // Refresh proofs list
      const updatedProofs = await adminService.getPendingProofs();
      setProofs(updatedProofs);
      setSelectedProofs([]);
    } catch (error) {
      console.error('Error in bulk approve:', error);
      // TODO: Add error toast
    }
  };

  const handleBulkReject = async (proofIds) => {
    try {
      await Promise.all(
        proofIds.map(proofId => 
          adminService.reviewProof(proofId, 'reject', 'Bulk rejection - requires individual review')
        )
      );
      
      // Refresh proofs list
      const updatedProofs = await adminService.getPendingProofs();
      setProofs(updatedProofs);
      setSelectedProofs([]);
    } catch (error) {
      console.error('Error in bulk reject:', error);
      // TODO: Add error toast
    }
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      taskType: '',
      proofType: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'newest'
    });
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Proofs Review - PromoHive Admin</title>
        </Helmet>
        
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-lg text-text-secondary">Loading proof submissions...</span>
              </div>
            </div>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Proofs Review - PromoHive Admin</title>
        <meta name="description" content="Review and manage user-submitted task proofs with approval and rejection capabilities" />
      </Helmet>
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <Breadcrumb />
              <h1 className="text-3xl font-bold text-foreground mt-2">Proofs Review</h1>
              <p className="text-text-secondary mt-1">
                Review and manage user-submitted task proofs
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => window.location?.reload()}
                iconName="RefreshCw"
                iconPosition="left">

                Refresh
              </Button>
              
              <Button
                variant="default"
                onClick={() => setFilters((prev) => ({ ...prev, status: 'PENDING' }))}
                iconName="Clock"
                iconPosition="left">

                Pending Only
              </Button>
            </div>
          </div>

          {/* Stats */}
          <ProofStats stats={mockStats} />

          {/* Filters */}
          <ProofFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
            totalProofs={proofs?.length}
            filteredCount={filteredProofs?.length} />


          {/* Proofs List */}
          <div className="space-y-6">
            {/* List Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedProofs?.length === paginatedProofs?.length && paginatedProofs?.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-ring" />

                  <span className="text-sm text-text-secondary">
                    Select All ({paginatedProofs?.length})
                  </span>
                </div>
                
                {selectedProofs?.length > 0 &&
                <span className="text-sm text-primary">
                    {selectedProofs?.length} selected
                  </span>
                }
              </div>

              <div className="text-sm text-text-secondary">
                Showing {(currentPage - 1) * proofsPerPage + 1}-{Math.min(currentPage * proofsPerPage, filteredProofs?.length)} of {filteredProofs?.length}
              </div>
            </div>

            {/* Proofs */}
            {paginatedProofs?.length > 0 ?
            <div className="space-y-4">
                {paginatedProofs?.map((proof) =>
              <div key={proof?.id} className="relative">
                    <div className="absolute left-4 top-6 z-10">
                      <input
                    type="checkbox"
                    checked={selectedProofs?.includes(proof?.id)}
                    onChange={() => handleProofSelect(proof?.id)}
                    className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-ring" />

                    </div>
                    <div className="pl-12">
                      <ProofCard
                    proof={proof}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewDetails={handleViewDetails} />

                    </div>
                  </div>
              )}
              </div> :

            <div className="glass rounded-lg border border-border p-12 text-center">
                <Icon name="FileX" size={48} className="text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Proofs Found</h3>
                <p className="text-text-secondary">
                  {Object.values(filters)?.some((v) => v !== '' && v !== 'newest') ?
                'Try adjusting your filters to see more results.' : 'No proof submissions available at the moment.'
                }
                </p>
              </div>
            }

            {/* Pagination */}
            {totalPages > 1 &&
            <div className="flex items-center justify-center space-x-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                iconName="ChevronLeft"
                iconPosition="left">

                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}>

                        {pageNum}
                      </Button>);

                })}
                </div>
                
                <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                iconName="ChevronRight"
                iconPosition="right">

                  Next
                </Button>
              </div>
            }
          </div>
        </div>
      </div>
      {/* Review Modal */}
      <ReviewModal
        proof={selectedProof}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProof(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject} />

      {/* Bulk Actions */}
      <BulkActions
        selectedProofs={selectedProofs}
        onBulkApprove={handleBulkApprove}
        onBulkReject={handleBulkReject}
        onClearSelection={() => setSelectedProofs([])}
        totalProofs={paginatedProofs?.length} />

    </div>);

};

export default ProofsReview;