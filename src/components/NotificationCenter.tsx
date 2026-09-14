import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  CalendarClock, 
  Clock, 
  Play, 
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { NotificationItem, Opportunity } from '../types';
import { formatDeadline } from '../utils';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  onSelectOpportunity: (id: string) => void;
  onTriggerCronReminders: () => Promise<void>;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onSelectOpportunity,
  onTriggerCronReminders,
}) => {
  const [runningCron, setRunningCron] = useState(false);
  const [cronFeedback, setCronFeedback] = useState<string | null>(null);

  const handleCronTest = async () => {
    setRunningCron(true);
    setCronFeedback(null);
    try {
      await onTriggerCronReminders();
      setCronFeedback('Cron process executed: reminders analyzed against live deadlines.');
      setTimeout(() => setCronFeedback(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setRunningCron(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-slate-900 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-800 text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-sm">Notification Center</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Scheduled deadline alerts & match updates</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline px-2 py-1"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cron Simulation Runner Bar */}
        <div className="px-5 py-2.5 bg-indigo-950/60 border-b border-indigo-850 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-indigo-200 font-medium">
            <CalendarClock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Automated Cron Engine</span>
          </div>
          <button
            onClick={handleCronTest}
            disabled={runningCron}
            className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3" />
            <span>{runningCron ? 'Processing...' : 'Run Scheduled Check'}</span>
          </button>
        </div>

        {cronFeedback && (
          <div className="px-5 py-2 bg-emerald-950/80 text-emerald-300 text-xs font-medium border-b border-emerald-800">
            {cronFeedback}
          </div>
        )}

        {/* List of Notifications */}
        <div className="overflow-y-auto p-4 divide-y divide-slate-800 space-y-2 flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-slate-300">No notifications yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Save an opportunity and set a reminder to receive scheduled notifications.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`pt-2.5 pb-2.5 px-3 rounded-xl transition-colors ${
                  !n.read ? 'bg-blue-950/40 border border-blue-800/60' : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-1.5">
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                      )}
                      <h4 className="font-bold text-white text-xs">{n.title}</h4>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {n.opportunityId && (
                      <button
                        onClick={() => {
                          onSelectOpportunity(n.opportunityId!);
                          onClose();
                        }}
                        className="px-2 py-1 rounded text-blue-400 hover:bg-blue-950 hover:text-blue-300 text-xs font-medium transition-colors"
                        title="Open opportunity"
                      >
                        View
                      </button>
                    )}
                    {!n.read && (
                      <button
                        onClick={() => onMarkRead(n.id)}
                        className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                        title="Mark read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDismiss(n.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Dismiss"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
