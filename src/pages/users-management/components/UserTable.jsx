import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const UserTable = ({ 
  users, 
  selectedUsers, 
  onUserSelect, 
  onSelectAll, 
  onUserAction, 
  onViewDetails,
  sortBy,
  sortOrder,
  onSort 
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-warning/10 text-warning border-warning/20', icon: 'Clock', label: 'Pending Approval' },
      approved: { color: 'bg-success/10 text-success border-success/20', icon: 'CheckCircle', label: 'Approved' },
      suspended: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: 'XCircle', label: 'Suspended' },
      rejected: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: 'XCircle', label: 'Rejected' }
    };

    const config = statusConfig?.[status] || statusConfig?.pending;
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        <span>{config?.label || config?.status || 'Unknown'}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })?.format(amount);
  };

  const handleSort = (column) => {
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(column, newOrder);
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return 'ArrowUpDown';
    return sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  return (
    <div className="glass rounded-lg border border-border overflow-hidden">
      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left">
                <Checkbox
                  checked={selectedUsers?.length === users?.length && users?.length > 0}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                />
              </th>
              
              <th 
                className="px-6 py-4 text-left cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">User</span>
                  <Icon name={getSortIcon('name')} size={14} className="text-text-secondary" />
                </div>
              </th>
              
              <th 
                className="px-6 py-4 text-left cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => handleSort('registrationDate')}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">Registration</span>
                  <Icon name={getSortIcon('registrationDate')} size={14} className="text-text-secondary" />
                </div>
              </th>
              
              <th 
                className="px-6 py-4 text-left cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">Status</span>
                  <Icon name={getSortIcon('status')} size={14} className="text-text-secondary" />
                </div>
              </th>
              
              <th 
                className="px-6 py-4 text-left cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => handleSort('balance')}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">Balance</span>
                  <Icon name={getSortIcon('balance')} size={14} className="text-text-secondary" />
                </div>
              </th>
              
              <th 
                className="px-6 py-4 text-left cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => handleSort('referrals')}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">Referrals</span>
                  <Icon name={getSortIcon('referrals')} size={14} className="text-text-secondary" />
                </div>
              </th>
              
              <th 
                className="px-6 py-4 text-left cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => handleSort('lastActivity')}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">Last Activity</span>
                  <Icon name={getSortIcon('lastActivity')} size={14} className="text-text-secondary" />
                </div>
              </th>
              
              <th className="px-6 py-4 text-right">
                <span className="text-sm font-medium text-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-border">
            {users?.map((user) => (
              <tr 
                key={user?.id}
                className={`hover:bg-muted/20 transition-colors ${
                  selectedUsers?.includes(user?.id) ? 'bg-primary/5' : ''
                }`}
                onMouseEnter={() => setHoveredRow(user?.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-6 py-4">
                  <Checkbox
                    checked={selectedUsers?.includes(user?.id)}
                    onChange={(e) => onUserSelect(user?.id, e?.target?.checked)}
                  />
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={user?.avatar}
                        alt={user?.avatarAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.name}
                      </p>
                      <p className="text-sm text-text-secondary truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-text-secondary">
                        ID: {user?.referralCode}
                      </p>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-foreground">
                    {formatDate(user?.registrationDate)}
                  </div>
                  <div className="text-xs text-text-secondary flex items-center space-x-1">
                    <Icon name="MapPin" size={12} />
                    <span>{user?.country}</span>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  {getStatusBadge(user?.status)}
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm font-data text-foreground">
                    {formatCurrency(user?.balance)}
                  </div>
                  <div className="text-xs text-text-secondary">
                    Earned: {formatCurrency(user?.totalEarnings)}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Icon name="Users" size={14} className="text-text-secondary" />
                    <span className="text-sm text-foreground">{user?.referrals}</span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    Active: {user?.activeReferrals}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-foreground">
                    {formatDate(user?.lastActivity)}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {user?.isOnline ? (
                      <span className="flex items-center space-x-1 text-success">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span>Online</span>
                      </span>
                    ) : (
                      <span>Offline</span>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUserAction('upgrade', user?.id)}
                      className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                    >
                      <Icon name="ArrowUp" size={14} className="mr-1" />
                      Level
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUserAction('balance', user?.id)}
                      className="bg-success/10 hover:bg-success/20 text-success border-success/20"
                    >
                      <Icon name="CreditCard" size={14} className="mr-1" />
                      Balance
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUserAction('set_balance', user?.id)}
                      className="bg-secondary/10 hover:bg-secondary/20 text-secondary border-secondary/20"
                    >
                      <Icon name="CheckCircle" size={14} className="mr-1" />
                      Set Balance
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(user)}
                      iconName="Eye"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View
                    </Button>
                    
                    {/* Show approve button for both new registrations and pending users */}
                    {(user?.status === 'pending' || !user?.status) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUserAction('approve', user?.id)}
                        iconName="Check"
                        className="text-success hover:text-success hover:bg-success/10"
                      >
                        Approve
                      </Button>
                    )}
                    
                    {user?.status === 'approved' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUserAction('suspend', user?.id)}
                        iconName="Ban"
                        className="text-warning hover:text-warning hover:bg-warning/10"
                      >
                        Suspend
                      </Button>
                    )}
                    
                    {(user?.status === 'suspended' || user?.status === 'rejected') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUserAction('approve', user?.id)}
                        iconName="CheckCircle"
                        className="text-success hover:text-success hover:bg-success/10"
                      >
                        Restore
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUserAction('message', user?.id)}
                      iconName="MessageSquare"
                    >
                      Message
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Users" size={48} className="text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
          <p className="text-text-secondary">Try adjusting your filters to see more results.</p>
        </div>
      )}
    </div>
  );
};

export default UserTable;