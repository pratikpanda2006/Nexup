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
  Plus
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
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-[68px] bg-[#020612] border-r border-slate-800/80 z-40 flex flex-col justify-between items-center py-4 select-none">
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

        {/* Admin shortcut */}
        <button
          onClick={() => onTabChange('admin')}
          className={`relative group p-2.5 rounded-xl transition-colors focus:outline-none ${
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
  );
};
