import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Bookmark, 
  Code2, 
  Briefcase, 
  GraduationCap, 
  ShieldCheck, 
  Sparkles, 
  Settings, 
  User as UserIcon, 
  LogOut, 
  HelpCircle, 
  ChevronRight, 
  SlidersHorizontal,
  Compass,
  ArrowUpRight,
  ExternalLink,
  Plus,
  GitPullRequest,
  Share2,
  MessageSquarePlus,
  X
} from 'lucide-react';
import { User } from '../types';

interface LeftSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User | null;
  savedCount: number;
  unreadNotifsCount: number;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenPersonalization: () => void;
  onOpenManageAlerts: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenShare?: () => void;
  onOpenFeedback?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  savedCount,
  unreadNotifsCount,
  onOpenSearch,
  onOpenNotifications,
  onOpenProfile,
  onOpenPersonalization,
  onOpenManageAlerts,
  onLogout,
  onOpenAuth,
  onOpenShare,
  onOpenFeedback,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Compute initials for avatar (defaults to "PP" for Pratik Panda)
  const getInitials = (name?: string) => {
    if (!name) return 'PP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = currentUser?.name ? getInitials(currentUser.name) : 'PP';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[68px] bg-[#020612] border-r border-slate-800/80 z-40 flex-col justify-between items-center py-4 select-none">
      {/* TOP SECTION: APP LOGO + PRIMARY CONTROLS matching Image 3 */}
      <div className="flex flex-col items-center space-y-5 w-full">
        {/* 1. APP LOGO: Clicking it brings user to dashboard (User prompt: "here it should be our logo") */}
        <button
          onClick={() => onTabChange('dashboard')}
          className="relative group p-1.5 rounded-2xl hover:bg-slate-850 transition-all focus:outline-none"
          title="NexUP Dashboard"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-blue-500/25 group-hover:scale-105 group-hover:shadow-blue-500/45 transition-all flex items-center justify-center">
            <div className="w-full h-full bg-[#030718] rounded-[14px] flex items-center justify-center overflow-hidden p-1">
              <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 transform group-hover:scale-110 transition-transform filter drop-shadow-[0_2px_8px_rgba(0,180,255,0.4)]"
              >
                <defs>
                  <linearGradient id="sidebar-nexup-main" x1="20" y1="180" x2="180" y2="20" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="35%" stopColor="#2979FF" />
                    <stop offset="75%" stopColor="#3D5AFE" />
                    <stop offset="100%" stopColor="#651FFF" />
                  </linearGradient>
                  <linearGradient id="sidebar-nexup-arrow" x1="100" y1="90" x2="160" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2979FF" />
                    <stop offset="60%" stopColor="#00D2FF" />
                    <stop offset="100%" stopColor="#00E5FF" />
                  </linearGradient>
                </defs>
                <path
                  d="M 46 160 C 38 160 32 154 32 146 L 32 64 C 32 50 44 40 58 44 C 70 48 76 60 76 72 L 76 138 C 76 150 64 160 46 160 Z"
                  fill="url(#sidebar-nexup-main)"
                />
                <path
                  d="M 52 152 C 42 152 34 144 34 134 L 34 68 C 34 52 46 42 62 46 C 74 49 82 60 82 72 L 82 120 C 82 134 94 144 108 144 C 118 144 128 138 136 128 L 156 102 L 138 90 L 182 40 L 184 96 L 168 84 L 146 112 C 134 128 118 136 102 136 C 88 136 78 126 78 112 L 78 68 C 78 58 70 50 60 50 C 50 50 52 58 52 68 Z"
                  fill="url(#sidebar-nexup-main)"
                />
                <polygon
                  points="184,34 128,60 148,74 116,112 138,126 168,88 184,100"
                  fill="url(#sidebar-nexup-arrow)"
                />
              </svg>
            </div>
          </div>
          {/* Subtle tooltip */}
          <span className="absolute left-16 px-2 py-1 ml-2 text-xs font-semibold text-white bg-slate-900 border border-slate-700 rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            NexUP Dashboard
          </span>
        </button>

        {/* Action / Divider */}
        <div className="w-8 h-[1px] bg-slate-800" />

        {/* 2. SEARCH BUTTON (User prompt: "then u have seqrch button") */}
        <button
          onClick={onOpenSearch}
          className="relative group p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors focus:outline-none"
          title="Search Opportunities (/)"
        >
          <Search className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
          <span className="absolute left-16 px-2 py-1 ml-2 text-xs font-semibold text-white bg-slate-900 border border-slate-700 rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Search Opportunities <kbd className="text-[10px] text-slate-400 font-mono ml-1">/</kbd>
          </span>
        </button>

        {/* 3. BELL ICON - NOTIFICATIONS (User prompt: "then bell icon ie notificatonsmmanfged there") */}
        <button
          onClick={onOpenNotifications}
          className="relative group p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors focus:outline-none"
          title="Notification Center"
        >
          <Bell className="w-5 h-5 text-slate-300 group-hover:text-amber-400 transition-colors" />
          {unreadNotifsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold flex items-center justify-center border border-slate-950">
              {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
            </span>
          )}
          <span className="absolute left-16 px-2 py-1 ml-2 text-xs font-semibold text-white bg-slate-900 border border-slate-700 rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Notifications {unreadNotifsCount > 0 && `(${unreadNotifsCount})`}
          </span>
        </button>

        {/* 4. BOOKMARKS ICON (User prompt: "then book marks") */}
        <button
          onClick={() => onTabChange('saved')}
          className={`relative group p-2.5 rounded-xl transition-colors focus:outline-none ${
            currentTab === 'saved'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
          title="Saved Bookmarks"
        >
          <Bookmark className={`w-5 h-5 ${currentTab === 'saved' ? 'fill-current text-blue-400' : 'text-slate-300 group-hover:text-blue-400'}`} />
          {savedCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white font-mono text-[9px] font-bold flex items-center justify-center border border-slate-950">
              {savedCount}
            </span>
          )}
          <span className="absolute left-16 px-2 py-1 ml-2 text-xs font-semibold text-white bg-slate-900 border border-slate-700 rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Saved Opportunities ({savedCount})
          </span>
        </button>

        {/* Direct Category Shortcuts */}
        <div className="w-8 h-[1px] bg-slate-800" />

        {/* Hackathons shortcut */}
        <button
          onClick={() => onTabChange('hackathons')}
          className={`relative group p-2.5 rounded-xl transition-colors focus:outline-none ${
            currentTab === 'hackathons'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
          title="Hackathons"
        >
          <Code2 className="w-5 h-5 text-slate-300 group-hover:text-orange-400 transition-colors" />
          <span className="absolute left-16 px-2 py-1 ml-2 text-xs font-semibold text-white bg-slate-900 border border-slate-700 rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Hackathons
          </span>
        </button>

        {/* Internships shortcut */}
        <button
          onClick={() => onTabChange('internships')}
          className={`relative group p-2.5 rounded-xl transition-colors focus:outline-none ${
            currentTab === 'internships'
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
          title="Internships"
        >
          <Briefcase className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
          <span className="absolute left-16 px-2 py-1 ml-2 text-xs font-semibold text-white bg-slate-900 border border-slate-700 rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Internships
          </span>
        </button>

        {/* Research shortcut */}
        <button
          onClick={() => onTabChange('research')}
          className={`relative group p-2.5 rounded-xl transition-colors focus:outline-none ${
            currentTab === 'research'
              ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
          title="Research Fellowships"
        >
          <GraduationCap className="w-5 h-5 text-slate-300 group-hover:text-fuchsia-400 transition-colors" />
          <span className="absolute left-16 px-2 py-1 ml-2 text-xs font-semibold text-white bg-slate-900 border border-slate-700 rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Research Fellowships
          </span>
        </button>

        {/* Open Source shortcut */}
        <button
          onClick={() => onTabChange('opensource')}
          className={`relative group p-2.5 rounded-xl transition-colors focus:outline-none cursor-pointer ${
            currentTab === 'opensource'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
          title="Open Source Programs"
        >
          <GitPullRequest className="w-5 h-5 text-slate-300 group-hover:text-emerald-400 transition-colors" />
          <span className="absolute left-16 px-2 py-1 ml-2 text-xs font-semibold text-white bg-slate-900 border border-slate-700 rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Open Source Programs
          </span>
        </button>

        {/* Admin shortcut */}
        <button
          onClick={() => onTabChange('admin')}
          className={`relative group p-2.5 rounded-xl transition-colors focus:outline-none cursor-pointer ${
            currentTab === 'admin'
              ? 'bg-rose-600/20 text-rose-400 border border-rose-500/40'
              : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30'
          }`}
          title={isAdmin ? "Admin Operations Console" : "Admin Mode (Sign In / Request Access)"}
        >
          <ShieldCheck className={`w-5 h-5 ${isAdmin ? 'text-rose-400' : 'text-slate-400 group-hover:text-rose-400'}`} />
          <span className="absolute left-16 px-2 py-1 ml-2 text-xs font-semibold text-white bg-slate-900 border border-slate-700 rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            {isAdmin ? "Admin Operations Console" : "Admin Mode (Sign In / Request Access)"}
          </span>
        </button>

        {/* Share Platform Button ("onside") */}
        {onOpenShare && (
          <button
            onClick={onOpenShare}
            className="relative group p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors focus:outline-none cursor-pointer"
            title="Share NexUP (https://nexup.onrender.com)"
          >
            <Share2 className="w-5 h-5 text-slate-300 group-hover:text-cyan-400 transition-colors" />
            <span className="absolute left-16 px-2 py-1 ml-2 text-xs font-semibold text-white bg-slate-900 border border-slate-700 rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Share NexUP
            </span>
          </button>
        )}

        {/* Bug / Feedback button */}
        {onOpenFeedback && (
          <button
            onClick={onOpenFeedback}
            className="relative group p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors focus:outline-none cursor-pointer"
            title="Report Bug / Give Feedback"
          >
            <MessageSquarePlus className="w-5 h-5 text-slate-300 group-hover:text-amber-400 transition-colors" />
            <span className="absolute left-16 px-2 py-1 ml-2 text-xs font-semibold text-white bg-slate-900 border border-slate-700 rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Report Bug / Feedback
            </span>
          </button>
        )}
      </div>

      {/* =========================================================================
          BOTTOM SECTION: USER AVATAR & FLYOUT POPUP MENU (Matching Image 3 & Image 4)
          "thrn at very eblow u have ur that lsignin logout opt or manage alerts only"
         ========================================================================= */}
      <div className="relative w-full flex flex-col items-center" ref={menuRef}>
        {/* AVATAR TRIGGER (Matching Image 3 & Image 4 circular button with "PP") */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs tracking-wider transition-all focus:outline-none ${
            isMenuOpen
              ? 'ring-2 ring-blue-500 bg-[#293649] text-white'
              : 'bg-[#1E293B] text-slate-200 hover:bg-[#2A374A] hover:text-white border border-slate-700/60'
          }`}
          title={currentUser ? currentUser.name : 'Account settings'}
        >
          {initials}
        </button>

        {/* FLYOUT MENU (Directly reproducing the exact popup layout from Image 4) */}
        {isMenuOpen && (
          <div
            className="absolute left-16 sm:left-18 bottom-0 w-72 bg-[#1E1F22] border border-[#2E3035] rounded-2xl shadow-2xl overflow-hidden z-50 text-slate-200 animate-fadeIn select-none"
            style={{
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}
          >
            {/* Top User Header matching Image 4 */}
            <div 
              onClick={() => {
                onOpenProfile();
                setIsMenuOpen(false);
              }}
              className="p-3.5 flex items-center justify-between hover:bg-[#2B2D31] cursor-pointer transition-colors border-b border-[#2B2D31]"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#35373C] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white tracking-wide truncate">
                    {currentUser?.name?.toUpperCase() || 'PRATIK PANDA'}
                  </h4>
                  <p className="text-xs text-slate-400 capitalize">
                    {isAdmin ? 'Administrator' : 'Free • Student'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            </div>

            {/* Menu Options matching Image 4 */}
            <div className="py-1.5 text-xs font-medium">
              {/* 1. Upgrade plan */}
              <button
                onClick={() => {
                  onOpenManageAlerts();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 flex items-center space-x-3 text-slate-200 hover:bg-[#2B2D31] hover:text-white transition-colors text-left"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Upgrade plan</span>
              </button>

              {/* 2. Personalization */}
              <button
                onClick={() => {
                  onOpenPersonalization();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 flex items-center space-x-3 text-slate-200 hover:bg-[#2B2D31] hover:text-white transition-colors text-left"
              >
                <Compass className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Personalization</span>
              </button>

              {/* 3. Profile */}
              <button
                onClick={() => {
                  onOpenProfile();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 flex items-center space-x-3 text-slate-200 hover:bg-[#2B2D31] hover:text-white transition-colors text-left"
              >
                <UserIcon className="w-4 h-4 text-slate-300 shrink-0" />
                <span>Profile</span>
              </button>

              {/* 4. Settings / Manage Alerts */}
              <button
                onClick={() => {
                  onOpenManageAlerts();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 flex items-center space-x-3 text-slate-200 hover:bg-[#2B2D31] hover:text-white transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-slate-300 shrink-0" />
                <span>Settings & Manage Alerts</span>
              </button>

              {/* Admin Console / Access */}
              <button
                onClick={() => {
                  onTabChange('admin');
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 flex items-center space-x-3 text-slate-200 hover:bg-[#2B2D31] hover:text-white transition-colors text-left"
              >
                <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{isAdmin ? 'Admin Console' : 'Sign in as Admin / Request Access'}</span>
              </button>

              {/* Divider */}
              <div className="my-1.5 border-t border-[#2B2D31]" />

              {/* Report Bug / Feedback */}
              {onOpenFeedback && (
                <button
                  onClick={() => {
                    onOpenFeedback();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center space-x-3 text-amber-300/90 hover:bg-[#2B2D31] hover:text-amber-200 transition-colors text-left"
                >
                  <MessageSquarePlus className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Report Bug / Feedback</span>
                </button>
              )}

              {/* 5. Help (Community reference matching Image 4 & footer) */}
              <a
                href="https://chat.whatsapp.com/IythdNIQIgI4dUQ9GhGw7J"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-slate-200 hover:bg-[#2B2D31] hover:text-white transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-4 h-4 text-slate-300 shrink-0" />
                  <span>Help & Community</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </a>

              {/* 6. Log out / Switch Account */}
              <button
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 flex items-center space-x-3 text-rose-400 hover:bg-[#2B2D31] hover:text-rose-300 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>{currentUser ? 'Log out' : 'Sign in / Switch account'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>

    {/* =========================================================================
        MOBILE BOTTOM NAVIGATION BAR (< md breakpoint: phones / small tablets)
        Gives 100% full-width viewport on mobile without horizontal cramping
       ========================================================================= */}
    <nav className="flex md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#020612]/95 backdrop-blur-xl border-t border-slate-800/90 items-center justify-around px-2 py-1.5 safe-area-bottom select-none shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      {/* 1. Explore / Dashboard */}
      <button
        onClick={() => {
          onTabChange('dashboard');
          setIsMobileMenuOpen(false);
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          currentTab === 'dashboard'
            ? 'text-blue-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Compass className={`w-5 h-5 ${currentTab === 'dashboard' ? 'text-blue-400 scale-105' : 'text-slate-400'}`} />
        <span className="text-[10px] mt-0.5 tracking-tight">Explore</span>
      </button>

      {/* 2. Search */}
      <button
        onClick={() => {
          onOpenSearch();
          setIsMobileMenuOpen(false);
        }}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
      >
        <Search className="w-5 h-5 text-slate-400" />
        <span className="text-[10px] mt-0.5 tracking-tight">Search</span>
      </button>

      {/* 3. Saved Opportunities */}
      <button
        onClick={() => {
          onTabChange('saved');
          setIsMobileMenuOpen(false);
        }}
        className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          currentTab === 'saved'
            ? 'text-indigo-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Bookmark className={`w-5 h-5 ${currentTab === 'saved' ? 'text-indigo-400 fill-indigo-400/20' : 'text-slate-400'}`} />
          {savedCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {savedCount > 9 ? '9+' : savedCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Saved</span>
      </button>

      {/* 4. Bug / Feedback */}
      {onOpenFeedback && (
        <button
          onClick={() => {
            onOpenFeedback();
            setIsMobileMenuOpen(false);
          }}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-amber-400 hover:text-amber-300 transition-all cursor-pointer"
        >
          <MessageSquarePlus className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] mt-0.5 tracking-tight">Feedback</span>
        </button>
      )}

      {/* 5. User Avatar / Menu Drawer Trigger */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
          isMobileMenuOpen
            ? 'text-white'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border transition-all ${
          isMobileMenuOpen
            ? 'border-blue-400 bg-blue-600 text-white'
            : 'border-slate-700 bg-slate-800 text-slate-200'
        }`}>
          {initials}
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
      </button>
    </nav>

    {/* =========================================================================
        MOBILE DRAWER / BOTTOM SHEET (< md breakpoint)
        Displays complete category navigation, Admin mode, and user controls
       ========================================================================= */}
    {isMobileMenuOpen && (
      <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 select-none">
        {/* Backdrop click to dismiss */}
        <div
          className="flex-1 w-full"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer content card */}
        <div className="bg-[#121620] border-t border-slate-800 rounded-t-3xl max-h-[85vh] overflow-y-auto p-4 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-250 pb-20">
          {/* Grab handle bar */}
          <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto" />

          {/* Header: User Profile Summary & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div
              onClick={() => {
                onOpenProfile();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                {initials}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {currentUser?.name || 'Student Account'}
                </h4>
                <p className="text-[11px] text-slate-400 capitalize">
                  {isAdmin ? 'Administrator' : 'Student • Explorer'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Category Quick Navigation */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-2 px-1">
              OPPORTUNITY DIRECTORIES
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onTabChange('hackathons');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                  currentTab === 'hackathons'
                    ? 'bg-amber-950/60 text-amber-200 border-amber-800'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <Code2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hackathons</span>
              </button>

              <button
                onClick={() => {
                  onTabChange('internships');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                  currentTab === 'internships'
                    ? 'bg-blue-950/60 text-blue-200 border-blue-800'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <Briefcase className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Internships</span>
              </button>

              <button
                onClick={() => {
                  onTabChange('research');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                  currentTab === 'research'
                    ? 'bg-purple-950/60 text-purple-200 border-purple-800'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Fellowships</span>
              </button>

              <button
                onClick={() => {
                  onTabChange('opensource');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                  currentTab === 'opensource'
                    ? 'bg-emerald-950/60 text-emerald-200 border-emerald-800'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <GitPullRequest className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Open Source</span>
              </button>
            </div>
          </div>

          {/* Platform Shortcuts */}
          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1.5 px-1">
              ACTIONS & CONTROLS
            </span>

            {/* Admin Mode Shortcut */}
            <button
              onClick={() => {
                onTabChange('admin');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-rose-300 hover:bg-rose-950/50 text-xs font-semibold transition-all"
            >
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>{isAdmin ? 'Admin Operations Console' : 'Sign in as Admin / Request Access'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400/70" />
            </button>

            {/* Share */}
            {onOpenShare && (
              <button
                onClick={() => {
                  onOpenShare();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs font-medium transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Share NexUP</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            )}

            {/* Personalization */}
            <button
              onClick={() => {
                onOpenPersonalization();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs font-medium transition-all"
            >
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Personalize Preferences</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Settings / Manage Alerts */}
            <button
              onClick={() => {
                onOpenManageAlerts();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs font-medium transition-all"
            >
              <div className="flex items-center space-x-2.5">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings & Manage Alerts</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            {/* Help & Community */}
            <a
              href="https://chat.whatsapp.com/IythdNIQIgI4dUQ9GhGw7J"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs font-medium transition-all"
            >
              <div className="flex items-center space-x-2.5">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Community WhatsApp</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>

            {/* Sign Out / Switch Account */}
            <button
              onClick={() => {
                onLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2.5 p-2.5 rounded-xl text-rose-400 hover:bg-rose-950/20 text-xs font-semibold transition-all pt-3"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>{currentUser ? 'Sign out of NexUP' : 'Sign in / Switch account'}</span>
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};
