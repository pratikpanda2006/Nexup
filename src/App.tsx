import React, { useState, useEffect } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { SearchModal } from './components/SearchModal';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { OpportunityList } from './components/OpportunityList';
import { SavedPage } from './components/SavedPage';
import { AdminDashboard } from './components/AdminDashboard';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { ReminderModal } from './components/ReminderModal';
import { NotificationCenter } from './components/NotificationCenter';
import { OnboardingModal } from './components/OnboardingModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { AdminSignInCard } from './components/AdminSignInCard';
import { ShareModal } from './components/ShareModal';
import { FeedbackModal } from './components/FeedbackModal';
import { ContributeModal } from './components/ContributeModal';
import { User, Opportunity, NotificationItem, OpportunityCategory } from './types';
import { Sparkles, CheckCircle2, AlertCircle, ArrowLeft, ShieldAlert, Bell, Share2, Heart } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [savedOpportunities, setSavedOpportunities] = useState<Opportunity[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);

  // Active view tab: 'dashboard' | 'hackathons' | 'internships' | 'research' | 'saved' | 'admin' | 'landing'
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [categoryViewMode, setCategoryViewMode] = useState<'table' | 'card'>('table');
  const [navHistory, setNavHistory] = useState<string[]>([]);

  // Modals state
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [reminderTarget, setReminderTarget] = useState<Opportunity | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper to format tab name for back button
  const getTabDisplayName = (tab?: string) => {
    if (!tab) return undefined;
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'internships':
        return 'Internships';
      case 'hackathons':
        return 'Hackathons';
      case 'research':
        return 'Research';
      case 'opensource':
        return 'Open Source';
      case 'saved':
        return 'Saved';
      case 'admin':
        return 'Admin';
      case 'landing':
        return 'Home';
      default:
        return 'Previous';
    }
  };

  // Determine what previous step was
  const previousTab = navHistory.length > 0 
    ? navHistory[navHistory.length - 1] 
    : (currentTab !== 'dashboard' && currentTab !== 'landing' ? 'dashboard' : undefined);
  const previousTabName = getTabDisplayName(previousTab);

  // Centralized tab navigation with history stack and browser history push
  const navigateToTab = (newTab: string, viewMode?: 'table' | 'card') => {
    if (viewMode) setCategoryViewMode(viewMode);

    if (newTab === currentTab) return;

    setNavHistory((prev) => {
      if (prev.length > 0 && prev[prev.length - 1] === currentTab) {
        return prev;
      }
      return [...prev, currentTab];
    });

    setCurrentTab(newTab);
    window.history.pushState({ tab: newTab, modal: null }, '', `#${newTab}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step back to previous tab or close modal
  const handleGoBack = () => {
    // 1. If any modal is open, close it first!
    if (
      selectedOpportunity ||
      reminderTarget ||
      isNotificationsOpen ||
      isProfileOpen ||
      isOnboardingOpen ||
      isAuthOpen ||
      isSearchOpen ||
      isShareOpen ||
      isFeedbackOpen ||
      isContributeOpen
    ) {
      setSelectedOpportunity(null);
      setReminderTarget(null);
      setIsNotificationsOpen(false);
      setIsProfileOpen(false);
      setIsOnboardingOpen(false);
      setIsAuthOpen(false);
      setIsSearchOpen(false);
      setIsShareOpen(false);
      setIsFeedbackOpen(false);
      setIsContributeOpen(false);
      window.history.replaceState({ tab: currentTab, modal: null }, '', `#${currentTab}`);
      return;
    }

    // 2. Return to previous tab in history
    if (navHistory.length > 0) {
      const prevTab = navHistory[navHistory.length - 1];
      setNavHistory((prev) => prev.slice(0, -1));
      setCurrentTab(prevTab);
      window.history.replaceState({ tab: prevTab, modal: null }, '', `#${prevTab}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentTab !== 'dashboard' && currentUser) {
      setCurrentTab('dashboard');
      window.history.replaceState({ tab: 'dashboard', modal: null }, '', '#dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Modal Openers with history state tracking
  const handleOpenOpportunity = (op: Opportunity) => {
    setSelectedOpportunity(op);
    window.history.pushState({ tab: currentTab, modal: 'opportunity-detail', opId: op.id }, '', `#op-${op.id}`);
  };

  const handleCloseOpportunity = () => {
    setSelectedOpportunity(null);
    if (window.history.state?.modal) {
      window.history.replaceState({ tab: currentTab, modal: null }, '', `#${currentTab}`);
    }
  };

  const handleOpenReminder = (op: Opportunity) => {
    setReminderTarget(op);
    window.history.pushState({ tab: currentTab, modal: 'reminder', opId: op.id }, '', `#reminder-${op.id}`);
  };

  const handleCloseReminder = () => {
    setReminderTarget(null);
    if (window.history.state?.modal) {
      window.history.replaceState({ tab: currentTab, modal: null }, '', `#${currentTab}`);
    }
  };

  const handleOpenNotifications = () => {
    setIsNotificationsOpen(true);
    window.history.pushState({ tab: currentTab, modal: 'notifications' }, '', `#notifications`);
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
    if (window.history.state?.modal) {
      window.history.replaceState({ tab: currentTab, modal: null }, '', `#${currentTab}`);
    }
  };

  const handleOpenProfile = () => {
    setIsProfileOpen(true);
    window.history.pushState({ tab: currentTab, modal: 'profile' }, '', `#profile`);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    if (window.history.state?.modal) {
      window.history.replaceState({ tab: currentTab, modal: null }, '', `#${currentTab}`);
    }
  };

  const handleOpenOnboarding = () => {
    setIsOnboardingOpen(true);
    window.history.pushState({ tab: currentTab, modal: 'preferences' }, '', `#preferences`);
  };

  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
    if (window.history.state?.modal) {
      window.history.replaceState({ tab: currentTab, modal: null }, '', `#${currentTab}`);
    }
  };

  const handleOpenAuth = () => {
    setIsAuthOpen(true);
    window.history.pushState({ tab: currentTab, modal: 'auth' }, '', `#auth`);
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
    if (window.history.state?.modal) {
      window.history.replaceState({ tab: currentTab, modal: null }, '', `#${currentTab}`);
    }
  };

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    window.history.pushState({ tab: currentTab, modal: 'search' }, '', `#search`);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    if (window.history.state?.modal) {
      window.history.replaceState({ tab: currentTab, modal: null }, '', `#${currentTab}`);
    }
  };

  // 1. Initial user & opportunities load
  const loadUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const loadOpportunities = async () => {
    try {
      const res = await fetch('/api/opportunities?limit=100');
      const data = await res.json();
      if (data.data) {
        setOpportunities(data.data);
      }
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    }
  };

  const loadBookmarks = async (userId?: string) => {
    try {
      const headers: Record<string, string> = {};
      if (userId) headers['x-user-id'] = userId;
      const res = await fetch('/api/bookmarks', { headers });
      const data = await res.json();
      if (data.data) {
        setSavedOpportunities(data.data);
        setBookmarkedIds(new Set(data.data.map((o: Opportunity) => o.id)));
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    }
  };

  const loadNotifications = async (userId?: string) => {
    try {
      const headers: Record<string, string> = {};
      if (userId) headers['x-user-id'] = userId;
      const res = await fetch('/api/notifications', { headers });
      const data = await res.json();
      if (data.data) {
        setNotifications(data.data);
        setUnreadNotifsCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadUser();
    loadOpportunities();
    loadBookmarks();
    loadNotifications();

    // Check expiry in background
    fetch('/api/cron/check-expiry', { method: 'POST' }).catch(() => {});
  }, []);

  // Keyboard shortcut listener ('/' to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        handleOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mobile & Browser Back Button navigation handler
  // In mobiles when user presses hardware/gesture back, it takes them to previous page/step instead of closing the app!
  useEffect(() => {
    // Initial sync with hash on first load
    const initialHash = window.location.hash.replace('#', '');
    const validTabs = ['landing', 'dashboard', 'hackathons', 'internships', 'research', 'saved', 'admin'];
    if (validTabs.includes(initialHash) && initialHash !== currentTab) {
      setCurrentTab(initialHash);
    }
    window.history.replaceState({ tab: currentTab, modal: null }, '', `#${currentTab}`);

    const handlePopState = (event: PopStateEvent) => {
      const hasModal = !!(
        selectedOpportunity ||
        reminderTarget ||
        isNotificationsOpen ||
        isProfileOpen ||
        isOnboardingOpen ||
        isAuthOpen ||
        isSearchOpen
      );

      // 1. If user presses back on mobile while a modal is open, close the modal first!
      if (hasModal) {
        setSelectedOpportunity(null);
        setReminderTarget(null);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
        setIsOnboardingOpen(false);
        setIsAuthOpen(false);
        setIsSearchOpen(false);
        return;
      }

      // 2. If event.state has a tab, navigate to it!
      if (event.state && event.state.tab) {
        setCurrentTab(event.state.tab);
        setNavHistory((prev) => (prev.length > 0 ? prev.slice(0, -1) : []));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback using our navHistory
        setNavHistory((prev) => {
          if (prev.length > 0) {
            const previous = prev[prev.length - 1];
            setCurrentTab(previous);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return prev.slice(0, -1);
          } else if (currentTab !== 'dashboard' && currentUser) {
            // Keep user in app on dashboard instead of exiting
            setCurrentTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return [];
          }
          return prev;
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    currentTab,
    selectedOpportunity,
    reminderTarget,
    isNotificationsOpen,
    isProfileOpen,
    isOnboardingOpen,
    isAuthOpen,
    isSearchOpen,
    currentUser,
  ]);

  const handleLogout = () => {
    setCurrentUser(null);
    navigateToTab('landing');
    showToast('Logged out of session. Welcome back anytime.');
  };

  // Toggle bookmark handler
  const handleToggleBookmark = async (id: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;

      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers,
        body: JSON.stringify({ opportunityId: id }),
      });
      const data = await res.json();

      if (data.bookmarked) {
        bookmarkedIds.add(id);
        setBookmarkedIds(new Set(bookmarkedIds));
        showToast('Opportunity saved to your bookmarks!', 'success');
      } else {
        bookmarkedIds.delete(id);
        setBookmarkedIds(new Set(bookmarkedIds));
        showToast('Opportunity removed from bookmarks.', 'info');
      }
      loadBookmarks(currentUser?.id);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  // Switch demo role handler
  const handleSwitchDemoRole = async (role: 'user' | 'admin', customDetails?: { username?: string; email?: string }) => {
    try {
      const res = await fetch('/api/auth/switch-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.user) {
        const userObj = {
          ...data.user,
          name: customDetails?.username ? customDetails.username : data.user.name,
          email: customDetails?.email ? customDetails.email : data.user.email,
        };
        setCurrentUser(userObj);
        loadBookmarks(userObj.id);
        loadNotifications(userObj.id);
        showToast(`Signed in as ${userObj.name} (${role === 'admin' ? 'Administrator' : 'Student Explorer'})`);
        navigateToTab(role === 'admin' ? 'admin' : 'dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger Cron Check
  const handleTriggerCronReminders = async () => {
    try {
      await fetch('/api/cron/process-reminders', { method: 'POST' });
      await loadNotifications(currentUser?.id);
      showToast('Scheduled cron check completed. Real-time deadline alerts updated.');
    } catch (err) {
      console.error(err);
    }
  };

  // Mark notification read
  const handleMarkNotifRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      loadNotifications(currentUser?.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      const headers: Record<string, string> = {};
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;
      await fetch('/api/notifications/mark-all-read', { method: 'POST', headers });
      loadNotifications(currentUser?.id);
      showToast('All notifications marked as read.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissNotif = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      loadNotifications(currentUser?.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (profileUpdate: Partial<User>) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(profileUpdate),
      });
      const data = await res.json();
      if (data.data) {
        setCurrentUser(data.data);
        showToast('Profile updated successfully.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectOpportunityById = (id: string) => {
    const found = opportunities.find((o) => o.id === id);
    if (found) {
      setSelectedOpportunity(found);
    }
  };

  const isUserSignedIn = Boolean(currentUser && currentTab !== 'landing');

  return (
    <div className={`min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 selection:bg-blue-600 selection:text-white ${isUserSignedIn ? 'pb-20 md:pb-0 md:pl-[68px]' : ''}`}>
      {/* Left Sidebar navigation: Shown ONLY after sign-in */}
      {isUserSignedIn && (
        <LeftSidebar
          currentTab={currentTab}
          onTabChange={(tab) => navigateToTab(tab)}
          currentUser={currentUser}
          savedCount={bookmarkedIds.size}
          unreadNotifsCount={unreadNotifsCount}
          onOpenSearch={handleOpenSearch}
          onOpenNotifications={handleOpenNotifications}
          onOpenProfile={handleOpenProfile}
          onOpenPersonalization={handleOpenOnboarding}
          onOpenManageAlerts={handleOpenNotifications}
          onLogout={handleLogout}
          onOpenAuth={handleOpenAuth}
          onOpenShare={() => setIsShareOpen(true)}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
          onOpenContribute={() => setIsContributeOpen(true)}
        />
      )}

      {/* Mobile Sticky Top Header (< md breakpoint) */}
      {isUserSignedIn && (
        <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-[#020612]/95 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
          {currentTab !== 'dashboard' ? (
            <button
              type="button"
              onClick={handleGoBack}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
              title={`Back to ${previousTabName || 'Dashboard'}`}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
              <span>Back ({previousTabName || 'Dashboard'})</span>
            </button>
          ) : (
            <button
              onClick={() => navigateToTab('dashboard')}
              className="flex items-center space-x-2 text-left"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] flex items-center justify-center shadow-xs shadow-blue-500/30">
                <div className="w-full h-full bg-[#030718] rounded-[11px] flex items-center justify-center">
                  <span className="text-[10px] font-black text-cyan-400 font-mono">N</span>
                </div>
              </div>
              <span className="font-extrabold text-sm text-white tracking-tight">NexUP</span>
            </button>
          )}

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsContributeOpen(true)}
              className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-slate-850 transition-colors cursor-pointer"
              title="Support / Contribute to NexUP"
            >
              <Heart className="w-4 h-4 fill-rose-500/20 text-rose-400" />
            </button>
            <button
              onClick={handleOpenNotifications}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-950 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition-colors cursor-pointer"
              title="Share NexUP"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 ${currentTab === 'dashboard' ? 'max-w-[1700px]' : 'max-w-7xl'}`}>
        {currentTab === 'landing' && (
          <LandingPage
            onExplore={(cat) => navigateToTab(cat ? `${cat}s` : 'dashboard')}
            onGetStarted={() => navigateToTab('dashboard')}
            onSignInAsStudent={(creds) => {
              handleSwitchDemoRole('user', creds);
            }}
            onSignInAsAdmin={(adminUser) => {
              if (adminUser) {
                setCurrentUser(adminUser);
                showToast(`Welcome to Admin Mode, ${adminUser.name || adminUser.email}!`);
              }
              navigateToTab('admin');
            }}
            onOpenAuth={handleOpenAuth}
            onOpenContribute={() => setIsContributeOpen(true)}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            opportunities={opportunities}
            onNavigateTab={(tab, viewMode) => navigateToTab(tab, viewMode)}
            onSelectOpportunity={(op) => handleOpenOpportunity(op)}
            currentUser={currentUser}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onOpenReminder={(op) => handleOpenReminder(op)}
            onGoBack={navHistory.length > 0 ? handleGoBack : undefined}
            previousTabName={previousTabName}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenContribute={() => setIsContributeOpen(true)}
          />
        )}

        {currentTab === 'hackathons' && (
          <OpportunityList
            category="hackathon"
            opportunities={opportunities}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onOpenReminder={(op) => handleOpenReminder(op)}
            onViewDetails={(op) => handleOpenOpportunity(op)}
            initialViewMode={categoryViewMode}
            onGoBack={handleGoBack}
            previousTabName={previousTabName}
          />
        )}

        {currentTab === 'internships' && (
          <OpportunityList
            category="internship"
            opportunities={opportunities}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onOpenReminder={(op) => handleOpenReminder(op)}
            onViewDetails={(op) => handleOpenOpportunity(op)}
            initialViewMode={categoryViewMode}
            onGoBack={handleGoBack}
            previousTabName={previousTabName}
          />
        )}

        {currentTab === 'research' && (
          <OpportunityList
            category="research"
            opportunities={opportunities}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onOpenReminder={(op) => handleOpenReminder(op)}
            onViewDetails={(op) => handleOpenOpportunity(op)}
            initialViewMode={categoryViewMode}
            onGoBack={handleGoBack}
            previousTabName={previousTabName}
          />
        )}

        {currentTab === 'opensource' && (
          <OpportunityList
            category="opensource"
            opportunities={opportunities}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onOpenReminder={(op) => handleOpenReminder(op)}
            onViewDetails={(op) => handleOpenOpportunity(op)}
            initialViewMode={categoryViewMode}
            onGoBack={handleGoBack}
            previousTabName={previousTabName}
          />
        )}

        {currentTab === 'saved' && (
          <SavedPage
            savedOpportunities={savedOpportunities}
            onToggleBookmark={handleToggleBookmark}
            onOpenReminder={(op) => handleOpenReminder(op)}
            onViewDetails={(op) => handleOpenOpportunity(op)}
            onExplore={() => navigateToTab('hackathons')}
            onGoBack={handleGoBack}
            previousTabName={previousTabName}
          />
        )}

        {currentTab === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminDashboard
              opportunities={opportunities}
              onRefreshOpportunities={() => {
                loadOpportunities();
                loadBookmarks();
              }}
              onSelectOpportunity={(op) => handleOpenOpportunity(op)}
              onGoBack={handleGoBack}
              previousTabName={previousTabName}
              currentUser={currentUser}
              onOpenContribute={() => setIsContributeOpen(true)}
            />
          ) : (
            <div className="py-8 flex flex-col items-center justify-center">
              <AdminSignInCard
                onSuccess={(adminUser) => {
                  setCurrentUser(adminUser);
                  showToast(`Welcome to Admin Mode, ${adminUser.name || adminUser.email}!`);
                }}
                onBack={() => {
                  if (navHistory.length > 0) {
                    handleGoBack();
                  } else {
                    navigateToTab('dashboard');
                  }
                }}
                initialEmail={currentUser?.email || ''}
              />
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/90 bg-[#020612] py-5 mt-auto text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center space-y-3 text-center">
          {/* PRIMARY CENTER HIGHLIGHT: Built & Maintained by Pratik Panda */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-950/70 via-indigo-950/80 to-purple-950/70 border border-blue-500/40 shadow-lg shadow-blue-950/50 hover:border-blue-400/70 transition-all">
            <span className="text-xs text-slate-300 font-medium">Built &amp; maintained by</span>
            <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 tracking-wide font-sans">
              Pratik Panda
            </span>
          </div>

          {/* SECONDARY ROW: Rights, Reference, Feedback & Contribute */}
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-xs text-slate-400 font-sans">
            <span className="text-slate-500">© 2026 NexUP. All rights reserved.</span>
            <span className="text-slate-700 hidden sm:inline">·</span>
            <span className="text-slate-400">
              Community reference:{' '}
              <a
                href="https://chat.whatsapp.com/IythdNIQIgI4dUQ9GhGw7J"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00E676] hover:text-emerald-300 font-medium underline underline-offset-4 transition-colors"
              >
                IIT Madras BS Research Hub
              </a>
            </span>
            <span className="text-slate-700 hidden sm:inline">·</span>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 transition-colors cursor-pointer"
            >
              Report Bug / Feedback
            </button>
            <span className="text-slate-700 hidden sm:inline">·</span>
            <button
              onClick={() => setIsContributeOpen(true)}
              className="text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-4 transition-colors cursor-pointer inline-flex items-center space-x-1"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500/30 text-rose-400" />
              <span>Contribute / Support Us</span>
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Opportunity Details Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={handleCloseOpportunity}
        isBookmarked={selectedOpportunity ? bookmarkedIds.has(selectedOpportunity.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onOpenReminder={(op) => handleOpenReminder(op)}
        currentUser={currentUser}
      />

      {/* 2. Set Reminder Modal */}
      <ReminderModal
        opportunity={reminderTarget}
        onClose={handleCloseReminder}
        onSuccess={(msg) => showToast(msg, 'success')}
        userTimezone={currentUser?.timezone}
      />

      {/* 3. Notification Center */}
      {isNotificationsOpen && (
        <NotificationCenter
          notifications={notifications}
          unreadCount={unreadNotifsCount}
          onClose={handleCloseNotifications}
          onMarkRead={handleMarkNotifRead}
          onMarkAllRead={handleMarkAllNotifsRead}
          onDismiss={handleDismissNotif}
          onSelectOpportunity={(id) => {
            handleCloseNotifications();
            handleSelectOpportunityById(id);
          }}
          onTriggerCronReminders={handleTriggerCronReminders}
        />
      )}

      {/* 4. Onboarding / Preferences Modal */}
      {isOnboardingOpen && (
        <OnboardingModal
          currentUser={currentUser}
          onClose={handleCloseOnboarding}
          onSavePreferences={async (prefs) => {
            await handleSaveProfile(prefs);
            showToast('Recommendations refreshed based on your selected interests!');
          }}
        />
      )}

      {/* 5. User Profile Modal */}
      {isProfileOpen && (
        <ProfileModal
          currentUser={currentUser}
          onClose={handleCloseProfile}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {/* 6. Auth Modal */}
      {isAuthOpen && (
        <AuthModal
          onClose={handleCloseAuth}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            loadBookmarks(user.id);
            loadNotifications(user.id);
            showToast(`Logged in as ${user.name} (${user.role})`);
          }}
        />
      )}

      {/* 7. Search Modal (Triggered by Search Button or '/' key) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        opportunities={opportunities}
        onSelectOpportunity={(op) => {
          handleCloseSearch();
          handleOpenOpportunity(op);
        }}
        bookmarkedIds={bookmarkedIds}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* 8. Share Platform Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url="https://nexup.onrender.com"
      />

      {/* 9. Feedback & Bug Report Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentUser={currentUser}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      {/* 10. Community Contribution & Support Modal (QR Code) */}
      <ContributeModal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
      />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 text-xs font-semibold border border-slate-800 max-w-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
