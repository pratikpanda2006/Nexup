import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bug, 
  Lightbulb, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { User } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSuccess?: (msg: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const [type, setType] = useState<'bug' | 'feature' | 'feedback'>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        setName(currentUser.name || '');
        setEmail(currentUser.email || '');
      }
      setSubmittedSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide both a summary title and description.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          userName: name.trim() || currentUser?.name || 'Anonymous Student',
          userEmail: email.trim() || currentUser?.email || '',
          type,
          title: title.trim(),
          description: description.trim(),
          severity: type === 'bug' ? severity : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedSuccess(true);
        if (onSuccess) {
          onSuccess(
            type === 'bug'
              ? 'Bug report submitted to the admin team!'
              : 'Thank you for your feedback! The admin team will review it.'
          );
        }
        setTimeout(() => {
          setTitle('');
          setDescription('');
          onClose();
        }, 1500);
      } else {
        setErrorMessage(data.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-gradient-to-b from-slate-900 via-[#0d1424] to-[#070b14] border border-slate-700/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-colors duration-300 ${
          type === 'bug' 
            ? 'bg-rose-500/20' 
            : type === 'feature' 
            ? 'bg-sky-500/20' 
            : 'bg-emerald-500/20'
        }`} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-colors cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {submittedSuccess ? (
          <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-950/90 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-white">
                {type === 'bug' ? 'Report Received' : 'Feedback Sent!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-sm">
                Thank you for helping improve NexUP. The administrative team has been notified and will address your report.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono font-semibold text-slate-300 border border-slate-700 mb-2">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>USER FEEDBACK & ISSUES</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Send Feedback or Report a Bug
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your report is routed directly to the NexUP admin desk for review and resolution.
              </p>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Feedback Type Tabs */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-400 mb-1.5 uppercase">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setType('bug')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    type === 'bug'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-600/70 shadow-sm shadow-rose-500/20'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Bug className="w-3.5 h-3.5 text-rose-400" />
                  <span>Bug Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('feature')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    type === 'feature'
                      ? 'bg-sky-950/80 text-sky-300 border-sky-600/70 shadow-sm shadow-sky-500/20'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
                  <span>Feature Idea</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('feedback')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    type === 'feedback'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70 shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Feedback</span>
                </button>
              </div>
            </div>

            {/* Bug Severity (only visible if bug) */}
            {type === 'bug' && (
              <div>
                <label className="block text-[11px] font-mono font-semibold text-slate-400 mb-1.5 uppercase flex items-center justify-between">
                  <span>Severity Level</span>
                  <span className="text-slate-500 text-[10px] lowercase">how severely does this affect you?</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['low', 'medium', 'high', 'critical'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSeverity(lvl)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center capitalize transition-all cursor-pointer ${
                        severity === lvl
                          ? lvl === 'critical'
                            ? 'bg-red-600 text-white border-red-500 font-bold'
                            : lvl === 'high'
                            ? 'bg-orange-600 text-white border-orange-500 font-bold'
                            : lvl === 'medium'
                            ? 'bg-amber-600 text-white border-amber-500 font-bold'
                            : 'bg-blue-600 text-white border-blue-500 font-bold'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title / Summary */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-400 mb-1 uppercase">
                {type === 'bug' ? 'Bug Summary' : 'Topic / Title'} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === 'bug'
                    ? 'e.g., Reminder modal does not close on mobile screen'
                    : type === 'feature'
                    ? 'e.g., Add Discord or Slack notifications for hackathons'
                    : 'e.g., Feedback on the new Open Source initiatives page'
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/70 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-400 mb-1 uppercase">
                {type === 'bug' ? 'Steps to Reproduce / Details' : 'Details'} *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  type === 'bug'
                    ? '1. Went to Hackathons\n2. Clicked on Set Reminder\n3. The modal became unresponsive...'
                    : 'Describe what you would love to see, or any thoughts on how we can improve your experience...'
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/70 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none transition-colors placeholder:text-slate-600 resize-none leading-relaxed"
              />
            </div>

            {/* Contact info (optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">
                  YOUR NAME (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex Johnson"
                  className="w-full bg-slate-950/70 border border-slate-800/80 focus:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">
                  YOUR EMAIL (FOR UPDATES)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.edu"
                  className="w-full bg-slate-950/70 border border-slate-800/80 focus:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:scale-102 transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{type === 'bug' ? 'Submit Bug Report' : 'Send Feedback'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
