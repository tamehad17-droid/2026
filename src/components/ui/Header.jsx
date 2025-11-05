import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuToggle, isMenuOpen = false }) => {
  const { user, profile, isAdmin } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    // Handle logout logic
    setUser(null);
    setIsDropdownOpen(false);
  };

  const isAuthPage = location?.pathname === '/login' || location?.pathname === '/register';

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section - Menu Toggle & Logo */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden"
            aria-label="Toggle menu"
          >
            <Icon name={isMenuOpen ? 'X' : 'Menu'} size={24} />
          </Button>

          <Link to="/user-dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Icon name="Zap" size={20} color="white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              PromoHive
            </span>
          </Link>
        </div>

        {/* Center Section - Primary Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-1">
          {/* Admin Dashboard Button - Shows only for admins */}
          {isAdmin() && (
            <Link
              to="/admin-dashboard"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gradient-primary text-white hover:opacity-90 flex items-center gap-2"
            >
              <Icon name="Shield" size={16} />
              Admin Dashboard
            </Link>
          )}
          
          <Link
            to="/user-dashboard"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              location?.pathname === '/user-dashboard' ?'bg-primary/10 text-primary' :'text-text-secondary hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/tasks-list"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              location?.pathname?.startsWith('/task')
                ? 'bg-primary/10 text-primary' :'text-text-secondary hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Tasks
          </Link>
          <Link
            to="/wallet-overview"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              location?.pathname?.includes('wallet') || location?.pathname?.includes('withdrawal')
                ? 'bg-primary/10 text-primary' :'text-text-secondary hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Wallet
          </Link>
          <Link
            to="/referrals-management"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              location?.pathname === '/referrals-management' ?'bg-primary/10 text-primary' :'text-text-secondary hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Referrals
          </Link>
          <Link
            to="/daily-spin-wheel"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              location?.pathname === '/daily-spin-wheel' ?'bg-primary/10 text-primary' :'text-text-secondary hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Rewards
          </Link>
        </nav>

        {/* Right Section - User Menu */}
        <div className="flex items-center space-x-4">
          {/* Balance Display */}
          {user && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg glass">
              <Icon name="Wallet" size={16} className="text-success" />
              <span className="text-sm font-data text-success">
                ${user?.balance?.toFixed(2)}
              </span>
            </div>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Icon name="Bell" size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full"></span>
          </Button>

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.name}
                </span>
                <Icon 
                  name="ChevronDown" 
                  size={16} 
                  className={`transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </Button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 glass rounded-lg shadow-glass-lg border border-border z-50">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {user?.name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user?.name}</p>
                          <p className="text-sm text-text-secondary">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        to="/profile-settings"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Icon name="User" size={16} />
                        <span className="text-sm">Profile Settings</span>
                      </Link>
                      
                      <Link
                        to="/wallet-overview"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Icon name="Wallet" size={16} />
                        <span className="text-sm">Wallet</span>
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin-dashboard"
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Icon name="Shield" size={16} />
                          <span className="text-sm">Admin Panel</span>
                        </Link>
                      )}

                      <div className="border-t border-border my-2" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
                      >
                        <Icon name="LogOut" size={16} />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="default" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;