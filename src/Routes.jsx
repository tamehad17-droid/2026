import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
import NotFound from "pages/NotFound";

// Lazy load pages for better performance
const AdminDashboard = lazy(() => import('./pages/admin-dashboard'));
const AdminSettings = lazy(() => import('./pages/admin-settings'));
const ProofsReview = lazy(() => import('./pages/proofs-review'));
const LoginPage = lazy(() => import('./pages/login'));
const UserDashboard = lazy(() => import('./pages/user-dashboard'));
const WithdrawalsProcessing = lazy(() => import('./pages/withdrawals-processing'));
const AdminWallets = lazy(() => import('./pages/admin-wallets'));
const DailySpinWheel = lazy(() => import('./pages/daily-spin-wheel'));
const TaskDetails = lazy(() => import('./pages/task-details'));
const ReferralsManagement = lazy(() => import('./pages/referrals-management'));
const WalletOverview = lazy(() => import('./pages/wallet-overview'));
const ProofsManagement = lazy(() => import('./pages/proofs-management'));
const UsersManagement = lazy(() => import('./pages/users-management'));
const WithdrawalRequest = lazy(() => import('./pages/withdrawal-request'));
const ProfileSettings = lazy(() => import('./pages/profile-settings'));
const Register = lazy(() => import('./pages/register'));
const TasksList = lazy(() => import('./pages/tasks-list'));
const LevelUpgrade = lazy(() => import('./pages/level-upgrade'));
const TasksManagement = lazy(() => import('./pages/tasks-management'));
const UpgradeRequests = lazy(() => import('./pages/upgrade-requests'));
const AdsPage = lazy(() => import('./pages/ads'));
const AdminAdRevenue = lazy(() => import('./pages/admin/ad-revenue'));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-text-secondary">Loading...</p>
    </div>
  </div>
);

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <RouterRoutes>
          {/* Public routes */}
          <Route path="/admin-wallets" element={<ProtectedRoute requireAdmin={true}><AdminWallets /></ProtectedRoute>} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin routes - require admin role */}
          <Route path="/admin-dashboard" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin-settings" element={<ProtectedRoute requireAdmin={true}><AdminSettings /></ProtectedRoute>} />
          <Route path="/proofs-review" element={<ProtectedRoute requireAdmin={true}><ProofsReview /></ProtectedRoute>} />
          <Route path="/withdrawals-processing" element={<ProtectedRoute requireAdmin={true}><WithdrawalsProcessing /></ProtectedRoute>} />
          <Route path="/tasks-management" element={<ProtectedRoute requireAdmin={true}><TasksManagement /></ProtectedRoute>} />
          <Route path="/upgrade-requests" element={<ProtectedRoute requireAdmin={true}><UpgradeRequests /></ProtectedRoute>} />
          <Route path="/users-management" element={<ProtectedRoute requireAdmin={true}><UsersManagement /></ProtectedRoute>} />
          <Route path="/admin/ad-revenue" element={<ProtectedRoute requireAdmin={true}><AdminAdRevenue /></ProtectedRoute>} />
          
          {/* User routes - require authentication only */}
          <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/daily-spin-wheel" element={<ProtectedRoute><DailySpinWheel /></ProtectedRoute>} />
          <Route path="/level-upgrade" element={<ProtectedRoute><LevelUpgrade /></ProtectedRoute>} />
          <Route path="/task-details/:taskId" element={<ProtectedRoute><TaskDetails /></ProtectedRoute>} />
          <Route path="/task-details" element={<ProtectedRoute><TaskDetails /></ProtectedRoute>} />
          <Route path="/tasks-list" element={<ProtectedRoute><TasksList /></ProtectedRoute>} />
          <Route path="/referrals-management" element={<ProtectedRoute><ReferralsManagement /></ProtectedRoute>} />
          <Route path="/wallet-overview" element={<ProtectedRoute><WalletOverview /></ProtectedRoute>} />
          <Route path="/proofs-management" element={<ProtectedRoute><ProofsManagement /></ProtectedRoute>} />
          <Route path="/withdrawal-request" element={<ProtectedRoute><WithdrawalRequest /></ProtectedRoute>} />
          <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
          <Route path="/ads" element={<ProtectedRoute><AdsPage /></ProtectedRoute>} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
