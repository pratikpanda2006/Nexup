import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  Lightbulb, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertTriangle,
  Mail,
  User as UserIcon,
  Check,
  Undo2,
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { FeedbackItem, User } from '../types';

interface AdminFeedbackPanelProps {
  currentUser?: User | null;
}

export const AdminFeedbackPanel: React.FC<AdminFeedbackPanelProps> = ({ currentUser }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    bugs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all' | 'resolved'>('pending');
  const [typeFilter, setTypeFilter] = useState<'all' | 'bug' | 'feature' | 'feedback'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; undoId?: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeedbackItem | null>(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      if (res.ok && data.feedbacks) {
        setFeedbacks(data.feedbacks);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleToggleSolved = async (item: FeedbackItem) => {
    setTogglingId(item.id);
    const wasPending = item.status === 'pending';
    
    try {
      const res = await fetch(`/api/feedback/${item.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolvedBy: currentUser?.email || 'Admin',
        }),
      });
      const data = await res.json();
      
      if (res.ok && data.feedback) {
        // Update local state
        setFeedbacks((prev) =>
          prev.map((f) => (f.id === item.id ? data.feedback : f))
        );
        // Re-calculate stats
        setStats((prev) => ({
          ...prev,
          pending: wasPending ? prev.pending - 1 : prev.pending + 1,
          resolved: wasPending ? prev.resolved + 1 : prev.resolved - 1,
        }));

        if (wasPending) {
          setNotification({
            message: `Issue marked as Solved! It has been moved to the Resolved section.`,
            undoId: item.id,
          });
          setTimeout(() => setNotification(null), 5000);
        }
      }
    } catch (err) {
      console.error('Error toggling feedback status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleUndo = async (id: string) => {
    setNotification(null);
    const item = feedbacks.find((f) => f.id === id);
    if (item) {
      await handleToggleSolved(item);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFeedbacks((prev) => prev.filter((f) => f.id !== id));
        fetchFeedbacks();
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error('Failed to delete feedback:', err);
    }
  };

  // Filter items
  const filteredFeedbacks = feedbacks.filter((item) => {
    // 1. Status filter (Default is 'pending' -> active issues only)
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }
    // 2. Type filter
    if (typeFilter !== 'all' && item.type !== typeFilter) {
      return false;
    }
    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchUser = item.userName?.toLowerCase().includes(q) || item.userEmail?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchUser) return false;
    }
    return true;
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Notice / Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Active / Unresolved
            </span>
            <h3 className="text-3xl font-extrabold text-white mt-1">
              {stats.pending}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Awaiting review & resolution
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold">
              Open Bug Reports
            </span>
            <h3 className="text-3xl font-extrabold text-white mt-1">
              {stats.bugs}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Student-reported software issues
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-950/70 border border-rose-800/60 flex items-center justify-center text-rose-400 shadow-inner">
            <Bug className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Solved / Resolved
            </span>
            <h3 className="text-3xl font-extrabold text-white mt-1">
              {stats.resolved}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Addressed by administration
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Undo / Success Banner */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-medium flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification.message}</span>
          </div>
          {notification.undoId && (
            <button
              onClick={() => handleUndo(notification.undoId!)}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Undo</span>
            </button>
          )}
        </div>
      )}

      {/* Control Bar: Status Tabs, Category Filter, Search, Refresh */}
      <div className="bg-slate-900/95 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        {/* Status Navigation Tabs (Default: Active Issues) */}
        <div className="flex items-center space-x-1.5 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800/90 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-rose-950 text-rose-200 border border-rose-800 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Issues</span>
            {stats.pending > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold">
                {stats.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setStatusFilter('all')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-rose-950 text-rose-200 border border-rose-800 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>All Issues</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold">
              {stats.total}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('resolved')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'resolved'
                ? 'bg-rose-950 text-rose-200 border border-rose-800 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Resolved / Solved</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              {stats.resolved}
            </span>
          </button>
        </div>

        {/* Right Controls: Category filter + Search input */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Type Filter */}
          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            {(['all', 'bug', 'feature', 'feedback'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all capitalize cursor-pointer ${
                  typeFilter === t
                    ? 'bg-slate-800 text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/70 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchFeedbacks}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Refresh Feedbacks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Feedback Items List */}
      <div className="space-y-4">
        {loading && feedbacks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center">
            <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mb-3" />
            <span>Loading user feedbacks & bug reports...</span>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl py-16 px-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
              {statusFilter === 'pending' ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              ) : (
                <MessageSquare className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <h4 className="text-base font-bold text-white">
              {statusFilter === 'pending'
                ? 'All Caught Up!'
                : statusFilter === 'resolved'
                ? 'No Resolved Issues Yet'
                : 'No Reports Found'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {statusFilter === 'pending'
                ? 'There are currently zero unresolved issues. When students report bugs or submit feedback, they will appear right here.'
                : 'No feedback items match the selected filter or search query.'}
            </p>
          </div>
        ) : (
          filteredFeedbacks.map((item) => {
            const isResolved = item.status === 'resolved';
            const isToggling = togglingId === item.id;

            return (
              <div
                key={item.id}
                className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 border transition-all duration-300 ${
                  isResolved
                    ? 'bg-slate-950/60 border-slate-800/70 opacity-75 hover:opacity-100'
                    : item.type === 'bug'
                    ? 'bg-gradient-to-b from-rose-950/20 via-slate-900/90 to-slate-950 border-rose-900/40 hover:border-rose-700/60 shadow-lg'
                    : item.type === 'feature'
                    ? 'bg-gradient-to-b from-sky-950/20 via-slate-900/90 to-slate-950 border-sky-900/40 hover:border-sky-700/60 shadow-lg'
                    : 'bg-gradient-to-b from-emerald-950/20 via-slate-900/90 to-slate-950 border-emerald-900/40 hover:border-emerald-700/60 shadow-lg'
                }`}
              >
                {/* Accent top line */}
                <div
                  className={`absolute top-0 inset-x-0 h-1 ${
                    isResolved
                      ? 'bg-slate-700'
                      : item.type === 'bug'
                      ? 'bg-gradient-to-r from-rose-500 to-red-500'
                      : item.type === 'feature'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    {/* Header tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Category Badge */}
                      {item.type === 'bug' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800/70">
                          <Bug className="w-3 h-3 text-rose-400" />
                          <span>Bug Report</span>
                        </span>
                      ) : item.type === 'feature' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-sky-950/80 text-sky-300 border border-sky-800/70">
                          <Lightbulb className="w-3 h-3 text-sky-400" />
                          <span>Feature Idea</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/70">
                          <MessageSquare className="w-3 h-3 text-emerald-400" />
                          <span>General Feedback</span>
                        </span>
                      )}

                      {/* Severity if bug */}
                      {item.severity && (
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                            item.severity === 'critical'
                              ? 'bg-red-900/80 text-red-200 border-red-700 animate-pulse'
                              : item.severity === 'high'
                              ? 'bg-orange-950/80 text-orange-300 border-orange-700'
                              : item.severity === 'medium'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                              : 'bg-blue-950/80 text-blue-300 border-blue-800'
                          }`}
                        >
                          {item.severity} Severity
                        </span>
                      )}

                      {/* Status indicator pill */}
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Solved</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/70">
                          <Clock className="w-3 h-3" />
                          <span>Unresolved</span>
                        </span>
                      )}

                      <span className="text-[11px] text-slate-500 font-mono">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                      {item.description}
                    </p>

                    {/* Submitter details */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                      <div className="flex items-center space-x-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-300 font-medium">
                          {item.userName || 'Anonymous Student'}
                        </span>
                      </div>

                      {item.userEmail && (
                        <div className="flex items-center space-x-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <a
                            href={`mailto:${item.userEmail}?subject=Regarding your NexUP report: ${encodeURIComponent(item.title)}`}
                            className="text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
                          >
                            {item.userEmail}
                          </a>
                        </div>
                      )}

                      {isResolved && item.resolvedBy && (
                        <span className="text-[11px] text-emerald-400 font-mono">
                          • Solved by {item.resolvedBy} on {formatDate(item.resolvedAt || '')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Action Bar: Toggle Solved button & Delete */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 pt-2 sm:pt-0">
                    {/* The Primary Issue Solved Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleSolved(item)}
                      disabled={isToggling}
                      className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
                        isResolved
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 hover:scale-102'
                      }`}
                      title={isResolved ? "Click to reopen this issue" : "Mark issue as solved (will move out of active list)"}
                    >
                      {isToggling ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : isResolved ? (
                        <>
                          <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Reopen Issue</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Issue Solved ✓</span>
                        </>
                      )}
                    </button>

                    {/* Delete entry */}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/60 transition-colors cursor-pointer"
                      title="Delete this feedback report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-400 flex items-center justify-center border border-rose-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Delete Feedback Entry?</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to remove &quot;<span className="text-white font-semibold">{deleteTarget.title}</span>&quot;? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFeedback(deleteTarget.id)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
