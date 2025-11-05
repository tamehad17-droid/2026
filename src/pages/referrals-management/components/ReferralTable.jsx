import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Image from '../../../components/AppImage';
import { referralService } from '../../../services/referralService';
import { useAuth } from '../../../contexts/AuthContext';

const ReferralTable = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('joinDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [referralData, setReferralData] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      const { referrals } = await referralService.getUserReferrals(user.id);
      const mapped = (referrals || []).map(r => ({
        id: r.id,
        name: r.referred_profile?.full_name || r.referred_profile?.email || 'Unknown',
        email: r.referred_profile?.email,
        avatar: '',
        avatarAlt: '',
        level: r.referred_profile?.level || 0,
        joinDate: r.referred_profile?.created_at,
        status: r.referred_profile?.status || 'active',
        totalEarnings: r.bonus_amount || 0,
        bonusEarned: r.bonus_amount || 0,
        referrals: 0,
        lastActive: r.referred_profile?.created_at
      }));
      setReferralData(mapped);
    };
    load();
  }, [user?.id]);

  // Filter and search logic
  const filteredData = referralData?.filter((referral) => {
    const matchesSearch = referral?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    referral?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesLevel = filterLevel === 'all' || referral?.level?.toString() === filterLevel;
    const matchesStatus = filterStatus === 'all' || referral?.status === filterStatus;

    return matchesSearch && matchesLevel && matchesStatus;
  });

  // Sort logic
  const sortedData = [...filteredData]?.sort((a, b) => {
    let aValue = a?.[sortBy];
    let bValue = b?.[sortBy];

    if (sortBy === 'joinDate' || sortBy === 'lastActive') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedData?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData?.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':return 'text-success bg-success/10';
      case 'inactive':return 'text-warning bg-warning/10';
      case 'suspended':return 'text-destructive bg-destructive/10';
      default:return 'text-text-secondary bg-muted/30';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 1:return 'text-primary bg-primary/10';
      case 2:return 'text-secondary bg-secondary/10';
      case 3:return 'text-warning bg-warning/10';
      default:return 'text-text-secondary bg-muted/30';
    }
  };

  return (
    <div className="glass rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Referral Details</h2>
            <p className="text-sm text-text-secondary">Manage and track your referral network</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Input
              type="search"
              placeholder="Search referrals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full sm:w-64" />

            
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e?.target?.value)}
              className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">

              <option value="all">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e?.target?.value)}
              className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">

              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/20">
            <tr>
              <th className="text-left p-4 font-medium text-text-secondary">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors">

                  <span>User</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-text-secondary">
                <button
                  onClick={() => handleSort('level')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors">

                  <span>Level</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-text-secondary">
                <button
                  onClick={() => handleSort('joinDate')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors">

                  <span>Join Date</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-text-secondary">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors">

                  <span>Status</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-text-secondary">
                <button
                  onClick={() => handleSort('totalEarnings')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors">

                  <span>Earnings</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-text-secondary">
                <button
                  onClick={() => handleSort('bonusEarned')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors">

                  <span>Your Bonus</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-text-secondary">
                <button
                  onClick={() => handleSort('referrals')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors">

                  <span>Referrals</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData?.map((referral) =>
            <tr key={referral?.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <Image
                    src={referral?.avatar}
                    alt={referral?.avatarAlt}
                    className="w-10 h-10 rounded-full object-cover" />

                    <div>
                      <div className="font-medium text-foreground">{referral?.name}</div>
                      <div className="text-sm text-text-secondary">{referral?.email}</div>
                      {referral?.referredBy &&
                    <div className="text-xs text-primary">via {referral?.referredBy}</div>
                    }
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getLevelColor(referral?.level)}`}>
                    Level {referral?.level}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-sm text-foreground">
                    {new Date(referral.joinDate)?.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Last active: {new Date(referral.lastActive)?.toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(referral?.status)}`}>
                    {referral?.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium text-foreground">
                    ${referral?.totalEarnings?.toFixed(2)}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium text-success">
                    ${referral?.bonusEarned?.toFixed(2)}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-foreground">
                    {referral?.referrals}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" iconName="Eye">
                      View
                    </Button>
                    <Button variant="ghost" size="sm" iconName="MessageCircle">
                      Message
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 &&
      <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData?.length)} of {sortedData?.length} results
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              iconName="ChevronLeft">

                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8">

                      {page}
                    </Button>);

              })}
              </div>
              
              <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              iconName="ChevronRight">

                Next
              </Button>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default ReferralTable;