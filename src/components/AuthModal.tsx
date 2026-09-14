import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  X, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuickDemo = async (targetRole: 'user' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/switch-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (data.user) {
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
    const payload = mode === 'signup' ? { name, email, role } : { email, role };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      if (data.user) {
        if (data.message && data.isAdminApproved === false) {
          setMessage(data.message);
          setTimeout(() => {
            onLoginSuccess(data.user);
            onClose();
          }, 2000);
        } else {
          onLoginSuccess(data.user);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
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
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {mode === 'signin' ? 'Sign in to Nexup' : 'Create Student Account'}
              </h3>
              <p className="text-[11px] text-slate-400">Opportunity Intelligence Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 text-xs">
          <span className="font-bold text-blue-400 block mb-2">⚡ Instant One-Click Demo Access:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              disabled={loading}
              className="py-2 px-3 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-white rounded-xl font-semibold text-center transition-colors"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={loading}
              className="py-2 px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-center transition-colors shadow-sm"
            >
              Demo Admin (Director)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                mode === 'signin' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                mode === 'signup' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-800 text-xs flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-2.5 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-800 text-xs flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="font-bold text-slate-300 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500"
              />
            </div>
          )}

          <div>
            <label className="font-bold text-slate-300 block mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Password</label>
            <input
              type="password"
              defaultValue="••••••••"
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="font-bold text-slate-300 block mb-1">Requested Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-2 rounded-xl border font-semibold text-center transition-all ${
                    role === 'user'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-2 rounded-xl border font-semibold text-center transition-all ${
                    role === 'admin'
                      ? 'bg-violet-600 text-white border-violet-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  Admin Director
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Admin requests are verified against server allowlist (e.g. freeuser13012026@gmail.com).
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};
