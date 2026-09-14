import React, { useState } from 'react';
import { 
  User as UserIcon, 
  X, 
  Mail, 
  GraduationCap, 
  Clock, 
  ShieldCheck, 
  Check, 
  Bell
} from 'lucide-react';
import { User } from '../types';

interface ProfileModalProps {
  currentUser: User | null;
  onClose: () => void;
  onSaveProfile: (profile: Partial<User>) => Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUser,
  onClose,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [education, setEducation] = useState(currentUser?.education || 'Undergraduate in Computer Science');
  const [emailAlerts, setEmailAlerts] = useState(currentUser?.notificationPreferences?.emailAlerts ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await onSaveProfile({
        name,
        education,
        notificationPreferences: {
          ...currentUser?.notificationPreferences,
          emailAlerts,
          deadlineThresholdDays: currentUser?.notificationPreferences?.deadlineThresholdDays || 3,
          reminderCadence: currentUser?.notificationPreferences?.reminderCadence || 'every_3_days',
          preferredTime: currentUser?.notificationPreferences?.preferredTime || '20:00',
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-800 text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Student Profile & Settings</h3>
              <p className="text-[11px] text-slate-400">Manage account information & preferences</p>
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
          {/* User Role Badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="font-bold text-white text-xs block">{currentUser?.email}</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Current Role: <strong className="capitalize text-slate-200">{currentUser?.role}</strong>
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              currentUser?.role === 'admin' 
                ? 'bg-violet-950 text-violet-300 border-violet-800' 
                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
            }`}>
              {currentUser?.role === 'admin' ? 'Admin Director' : 'Verified Student'}
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Academic Status / Major</label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="font-bold text-white block mb-2">Notification Preferences</label>
            <label className="flex items-center space-x-2.5 cursor-pointer p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-white block">Deliver Upcoming Deadline Alerts</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Send reminder notifications every 3 days prior to application cutoffs.
                </span>
              </div>
            </label>
          </div>

          {saved && (
            <div className="p-2.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center space-x-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Profile preferences saved successfully!</span>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
