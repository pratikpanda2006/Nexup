import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  CalendarDays,
  Repeat,
  Sparkles
} from 'lucide-react';
import { Opportunity } from '../types';
import { formatDeadline } from '../utils';

interface ReminderModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  userTimezone?: string;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  opportunity,
  onClose,
  onSuccess,
  userTimezone = 'America/Los_Angeles',
}) => {
  if (!opportunity) return null;

  const [daysBefore, setDaysBefore] = useState<number>(3);
  const [frequency, setFrequency] = useState<'once' | 'every_3_days' | 'custom'>('every_3_days');
  const [preferredTime, setPreferredTime] = useState<string>('20:00'); // 8:00 PM
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          deadline: opportunity.deadline,
          daysBefore,
          frequency,
          preferredTime,
          timezone: userTimezone,
        }),
      });

      if (res.ok) {
        onSuccess(
          frequency === 'every_3_days'
            ? `Reminder scheduled: alerts will trigger every 3 days at ${preferredTime} until ${opportunity.name}'s deadline.`
            : `Reminder scheduled for ${daysBefore} days before deadline.`
        );
        onClose();
      }
    } catch (err) {
      console.error('Failed to create reminder:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-800 text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Set Deadline Reminder</h3>
              <p className="text-[11px] text-slate-400 font-medium">Automatic alert scheduler</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Opportunity Highlight */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="font-bold text-white text-sm truncate">{opportunity.name}</p>
            <p className="text-slate-400 text-xs mt-0.5">{opportunity.organization}</p>
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold mt-2 text-xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Submission Cutoff: {formatDeadline(opportunity.deadline)}</span>
            </div>
          </div>

          {/* Timing Threshold Options */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              Notify Threshold:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { days: 7, label: '7 Days Before' },
                { days: 3, label: '3 Days Before' },
                { days: 1, label: '1 Day Before' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.days}
                  onClick={() => setDaysBefore(opt.days)}
                  className={`py-2 px-2 rounded-lg font-semibold border text-center transition-all ${
                    daysBefore === opt.days
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency Option */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">
              Reminder Cadence:
            </label>
            <div className="space-y-2">
              <label className="flex items-start space-x-2.5 p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="freq"
                  checked={frequency === 'every_3_days'}
                  onChange={() => setFrequency('every_3_days')}
                  className="mt-0.5 text-indigo-500 bg-slate-800 border-slate-700 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-white block">Every 3 Days (Recommended)</span>
                  <span className="text-[11px] text-slate-400 block leading-tight mt-0.5">
                    Generates recurring alerts every 3 days until deadline cutoff or closure.
                  </span>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="freq"
                  checked={frequency === 'once'}
                  onChange={() => setFrequency('once')}
                  className="mt-0.5 text-indigo-500 bg-slate-800 border-slate-700 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold text-white block">Single Alert</span>
                  <span className="text-[11px] text-slate-400 block leading-tight mt-0.5">
                    Send one final notification when entering the threshold period.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Preferred Time & Timezone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Preferred Time:
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl font-medium text-white"
              >
                <option value="09:00">09:00 AM (Morning)</option>
                <option value="13:00">01:00 PM (Afternoon)</option>
                <option value="18:00">06:00 PM (Evening)</option>
                <option value="20:00">08:00 PM (Night)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Timezone:
              </label>
              <input
                type="text"
                readOnly
                value={userTimezone}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Schedule Insight */}
          <div className="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-800 text-[11px] text-indigo-200 flex items-start space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Nexup automatically prevents duplicates and silences notifications immediately after the deadline passes.
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-sm shadow-indigo-500/20 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Setting...' : 'Confirm Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
