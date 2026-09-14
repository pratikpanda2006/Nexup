import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Bell, 
  Bookmark, 
  ShieldCheck, 
  User as UserIcon, 
  Code2, 
  Briefcase, 
  GraduationCap, 
  LayoutDashboard,
  Menu,
  X,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { User } from '../types';
import { NexUpLogo } from './NexUpLogo';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User | null;
  savedCount: number;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenOnboarding: () => void;
  onOpenAuth: () => void;
  onSwitchDemoRole: (role: 'user' | 'admin') => void;
  onSearchClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  savedCount,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenProfile,
  onOpenOnboarding,
  onOpenAuth,
  onSwitchDemoRole,
  onSearchClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hackathons', label: 'Hackathons', icon: Code2 },
    { id: 'internships', label: 'Internships', icon: Briefcase },
    { id: 'research', label: 'Research', icon: GraduationCap },
    { id: 'saved', label: 'Saved', icon: Bookmark, badge: savedCount > 0 ? savedCount : undefined },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/90 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onTabChange('landing')}
              className="flex items-center space-x-2 focus:outline-none group text-left"
              title="Return to starting portal"
            >
              <NexUpLogo size="sm" showTagline={false} className="flex-row items-center space-x-2" />
              <span className="hidden sm:block text-[10px] uppercase font-mono tracking-wider font-bold px-1.5 py-0.5 rounded bg-blue-950/90 text-blue-300 border border-blue-700/80 ml-1">
                BETA
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-1 text-xs px-1.5 py-0.2 rounded-full font-semibold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-blue-950 text-blue-300 border border-blue-800/50'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin Panel Link */}
            <button
              onClick={() => {
                onTabChange('admin');
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                currentTab === 'admin'
                  ? 'bg-rose-900 text-white border-rose-600 shadow-sm shadow-rose-900/40'
                  : 'text-rose-400 bg-rose-950/40 border-rose-800/80 hover:bg-rose-900/60 hover:text-rose-200'
              }`}
              title="Open NEXUP Administrative Operations Console"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Admin Panel</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Search trigger */}
            <button
              onClick={onSearchClick}
              className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 hover:bg-slate-850 hover:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-colors"
              title="Search opportunities"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search</span>
              <kbd className="font-mono bg-slate-800 border border-slate-700 rounded px-1 text-[10px] text-slate-400 shadow-2xs">
                /
              </kbd>
            </button>

            {/* Role quick switch pill for demonstration */}
            <div className="hidden lg:flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => onSwitchDemoRole('user')}
                className={`px-2 py-1 rounded-md font-medium transition-all ${
                  currentUser?.role === 'user'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to student demo mode"
              >
                Student
              </button>
              <button
                onClick={() => onSwitchDemoRole('admin')}
                className={`px-2 py-1 rounded-md font-medium transition-all ${
                  currentUser?.role === 'admin'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to admin demo mode"
              >
                Admin
              </button>
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none transition-colors border border-transparent hover:border-slate-800"
              title="Notification Center & Reminders"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-sm shadow-rose-500/50">
                  {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-900 focus:outline-none border border-transparent hover:border-slate-800"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 py-1.5 z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-800">
                      <p className="font-semibold text-white truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                      <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        currentUser.role === 'admin'
                          ? 'bg-violet-950 text-violet-300 border border-violet-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {currentUser.role === 'admin' ? 'Admin Director' : 'Verified Student'}
                      </span>
                    </div>

                    <button
                      onClick={onOpenProfile}
                      className="w-full text-left px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Preferences</span>
                    </button>

                    <button
                      onClick={onOpenOnboarding}
                      className="w-full text-left px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                      <span>Personalize Interests</span>
                    </button>

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={() => onSwitchDemoRole(currentUser.role === 'admin' ? 'user' : 'admin')}
                      className="w-full text-left px-3.5 py-2 text-indigo-400 hover:bg-slate-800 flex items-center space-x-2 font-medium"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Switch to {currentUser.role === 'admin' ? 'Student View' : 'Admin View'}</span>
                    </button>

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={onOpenAuth}
                      className="w-full text-left px-3.5 py-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 text-xs"
                    >
                      Switch / Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 font-semibold border border-blue-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => {
              if (currentUser?.role !== 'admin') {
                onSwitchDemoRole('admin');
              }
              onTabChange('admin');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
              currentTab === 'admin'
                ? 'bg-rose-900 text-white border-rose-600 shadow-sm shadow-rose-900/40'
                : 'text-rose-400 bg-rose-950/40 border-rose-800/80 hover:bg-rose-900/60 hover:text-rose-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>Admin Panel</span>
          </button>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Demo Role:</span>
            <div className="flex space-x-1">
              <button
                onClick={() => {
                  onSwitchDemoRole('user');
                  setMobileMenuOpen(false);
                }}
                className={`text-xs px-2.5 py-1 rounded font-medium ${
                  currentUser?.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => {
                  onSwitchDemoRole('admin');
                  setMobileMenuOpen(false);
                }}
                className={`text-xs px-2.5 py-1 rounded font-medium ${
                  currentUser?.role === 'admin' ? 'bg-violet-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
