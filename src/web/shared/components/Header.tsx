import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header as UIHeader, HeaderLogo } from '@voilajsx/uikit/header';
import { Button } from '@voilajsx/uikit/button';
import { useTheme } from '@voilajsx/uikit/theme-provider';
import { useAuth } from '../../features/auth';
import { hasRole, route } from '../utils';
import {
  LayoutDashboard,
  User,
  LogOut,
  Sun,
  Moon,
  Shield,
  LogIn,
  UserPlus,
  FileText,
  Calendar,
  ListChecks,
  Edit,
  ChevronDown
} from 'lucide-react';

// ---------------- Logo Component ----------------
const Logo: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-secondary-foreground font-bold text-sm">
      UI
    </div>
    <div>
      <h3 className="voila-brand-logo text-xl font-bold">MyApp</h3>
      <p className="text-xs text-background">Feature-Based Architecture</p>
    </div>
  </div>
);

// ---------------- Theme Actions Component ----------------
const ThemeActions: React.FC = () => {
  const { theme, mode, setTheme, availableThemes, toggleMode } = useTheme();

  return (
    <div className="flex items-center gap-3">
      {/* Theme Selector */}
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as any)}
        className="border border-input rounded px-3 py-2 text-sm focus:outline-none text-background"
      >
        {availableThemes.map(themeId => (
          <option key={themeId} value={themeId}>
            {themeId.charAt(0).toUpperCase() + themeId.slice(1)}
          </option>
        ))}
      </select>

      {/* Light/Dark Mode Toggle */}
      <Button onClick={toggleMode} variant="secondary" size="sm">
        {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className="ml-2 hidden sm:inline">{mode === 'dark' ? 'Light' : 'Dark'}</span>
      </Button>
    </div>
  );
};

// ---------------- Main Header Component ----------------
export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [leavesDropdownOpen, setLeavesDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const leavesDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (leavesDropdownRef.current && !leavesDropdownRef.current.contains(event.target as Node)) {
        setLeavesDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  if (isAuthenticated && user) {
    // Check if user has admin role
    const isAdmin = hasRole(user, ['admin.tenant', 'admin.org', 'admin.system']);
    
    // Check if current path is under leaves section
    const isLeavesPath = location.pathname.startsWith('/leaves/');
    const isProfilePath = location.pathname === route('/profile');

    return (
      <UIHeader tone="brand" size="xl" position="sticky">
        <HeaderLogo>
          <Logo />
        </HeaderLogo>

        {/* Empty space to push navigation to the right */}
        <div className="flex-1"></div>

        {/* Main Navigation Bar - Right Side */}
        <div className="flex items-center gap-4">
          
          {/* Dashboard Button */}
          <Button
            variant="ghost"
            className={`${
              location.pathname === route('/dashboard')
                ? 'bg-brand-100 text-brand-700'
                : 'text-brand-600 hover:bg-brand-50 hover:text-brand-700'
            }`}
            onClick={() => handleNavigation(route('/dashboard'))}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>

          {/* Payslips Button */}
          <Button
            variant="ghost"
            className={`${
              location.pathname === route('/payslips')
                ? 'bg-brand-100 text-brand-700'
                : 'text-brand-600 hover:bg-brand-50 hover:text-brand-700'
            }`}
            onClick={() => handleNavigation(route('/payslips'))}
          >
            <FileText className="h-4 w-4 mr-2" />
            Payslips
          </Button>

          {/* Leaves Dropdown */}
          <div className="relative" ref={leavesDropdownRef}>
            <Button
              variant="ghost"
              className={`${
                isLeavesPath || leavesDropdownOpen
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-brand-600 hover:bg-brand-50 hover:text-brand-700'
              }`}
              onClick={() => setLeavesDropdownOpen(!leavesDropdownOpen)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Leaves
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${leavesDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>

            {/* Leaves Dropdown Menu */}
            {leavesDropdownOpen && (
              <div 
                className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-50"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              >
                {/* My Leaves */}
                <button
                  onClick={() => {
                    navigate(route('/leaves/my-leaves'));
                    setLeavesDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left transition-colors ${
                    location.pathname === route('/leaves/my-leaves')
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>My Leaves</span>
                </button>

                {/* Apply Leave */}
                <button
                  onClick={() => {
                    navigate(route('/leaves/apply'));
                    setLeavesDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left transition-colors ${
                    location.pathname === route('/leaves/apply')
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Edit className="h-4 w-4" />
                  <span>Apply Leave</span>
                </button>

                {/* Manage Leaves (Admin Only) */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      navigate(route('/leaves/manage'));
                      setLeavesDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left transition-colors ${
                      location.pathname === route('/leaves/manage')
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ListChecks className="h-4 w-4" />
                    <span>Manage Leaves</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Admin Button (Admin Only) */}
          {isAdmin && (
            <Button
              variant="ghost"
              className={`${
                location.pathname === route('/admin')
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-brand-600 hover:bg-brand-50 hover:text-brand-700'
              }`}
              onClick={() => handleNavigation(route('/admin'))}
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          )}

          {/* User Dropdown (Profile & Sign Out) */}
          <div className="relative" ref={userDropdownRef}>
            <Button
              variant="ghost"
              className={`${
                isProfilePath || userDropdownOpen
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-brand-600 hover:bg-brand-50 hover:text-brand-700'
              }`}
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              <User className="h-4 w-4 mr-2" />
              {user.name || 'Profile'}
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>

            {/* User Dropdown Menu */}
            {userDropdownOpen && (
              <div 
                className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-50"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b">
                  <div className="font-medium">{user.name || 'User'}</div>
                  <div className="text-xs text-gray-500">{user.email || 'user@example.com'}</div>
                  {user.role && (
                    <div className="text-xs text-gray-400 mt-1">Role: {user.role}</div>
                  )}
                </div>

                {/* Profile */}
                <button
                  onClick={() => {
                    navigate(route('/profile'));
                    setUserDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left transition-colors ${
                    isProfilePath
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>

                {/* Sign Out */}
                <div className="border-t">
                  <button
                    onClick={() => {
                      navigate(route('/logout'));
                      setUserDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Theme Actions - Right Side */}
        <div className="flex items-center ml-4">
          <ThemeActions />
        </div>
      </UIHeader>
    );
  } else {
    // Public navigation for non-authenticated users
    return (
      <UIHeader tone="brand" size="xl" position="sticky">
        <HeaderLogo>
          <Logo />
        </HeaderLogo>

        {/* Empty space to push navigation to the right */}
        <div className="flex-1"></div>

        <div className="flex items-center gap-4">
          {/* Sign In Button */}
          <Button
            variant="ghost"
            className={`${
              location.pathname === route('/auth/login')
                ? 'bg-brand-100 text-brand-700'
                : 'text-brand-600 hover:bg-brand-50 hover:text-brand-700'
            }`}
            onClick={() => handleNavigation(route('/auth/login'))}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>

          {/* Sign Up Button */}
          <Button
            variant="ghost"
            className={`${
              location.pathname === route('/auth/register')
                ? 'bg-brand-100 text-brand-700'
                : 'text-brand-600 hover:bg-brand-50 hover:text-brand-700'
            }`}
            onClick={() => handleNavigation(route('/auth/register'))}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Sign Up
          </Button>
        </div>

        {/* Theme Actions */}
        <div className="flex items-center ml-4">
          <ThemeActions />
        </div>
      </UIHeader>
    );
  }
};

// Export PublicHeader for backward compatibility
export const PublicHeader = Header;