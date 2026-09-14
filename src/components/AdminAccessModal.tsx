import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Mail, 
  X, 
  Clock, 
  AlertTriangle, 
  ArrowLeft, 
  Send, 
  Eye, 
  EyeOff,
  Radio,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { User } from '../types';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  currentUser?: User | null;
}

type Step = 'email' | 'password' | 'denied' | 'waiting' | 'rejected' | 'expired';

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
}) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Background authorization request & countdown state
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(600); // 10 minutes = 600s
  const [denialMessage, setDenialMessage] = useState<string>('u cant acess it');
  const [expiredMessage, setExpiredMessage] = useState<string>(
    'henceforth not a authorised admin pls contact PRATIK'
  );

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset or prefill when modal is opened
  useEffect(() => {
    if (isOpen) {
      if (currentUser?.email && !email) {
        setEmail(currentUser.email);
      }
      setStep('email');
      setPassword('');
      setError(null);
      setActiveRequestId(null);
    }
  }, [isOpen]);

  // Clean up polling timer
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  // Polling loop when in 'waiting' mode (silent background listener)
  useEffect(() => {
    if (step !== 'waiting' || !activeRequestId) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/admin/auth/status?id=${activeRequestId}`);
        const data = await res.json();

        if (data.status === 'accepted' && data.user) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          onLoginSuccess(data.user);
          onClose();
        } else if (data.status === 'rejected') {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setDenialMessage(data.message || 'u cant acess it');
          setStep('rejected');
        } else if (data.status === 'expired') {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setExpiredMessage(data.message || 'henceforth not a authorised admin pls contact PRATIK');
          setStep('expired');
        } else if (typeof data.remainingSeconds === 'number') {
          setRemainingSeconds(data.remainingSeconds);
          if (data.remainingSeconds <= 0) {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            setStep('expired');
          }
        }
      } catch (err) {
        console.error('Error checking authorization status:', err);
      }
    };

    checkStatus();
    pollTimerRef.current = setInterval(checkStatus, 2500);

    const localTimer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(localTimer);
          setStep('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      clearInterval(localTimer);
    };
  }, [step, activeRequestId]);

  if (!isOpen) return null;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // STEP 1: Verify Email in Database
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();

      if (data.exists) {
        // Email found in admin database -> Proceed to ask password
        setStep('password');
      } else {
        // Email NOT in file -> Show Access Denied
        setStep('denied');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify Password
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const targetPassword = password.trim();
    if (!targetPassword) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: targetPassword,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onLoginSuccess(data.user);
        onClose();
        return;
      }

      if (res.status === 401 || data.error) {
        setError(data.error || 'Incorrect password. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Request Access when denied
  const handleSendAccessRequest = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: email.trim().split('@')[0],
        }),
      });
      const data = await res.json();

      if (data.success && data.requestId) {
        setActiveRequestId(data.requestId);
        setRemainingSeconds(600);
        setStep('waiting');
      } else {
        setError(data.error || 'Could not dispatch access request.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error while requesting access.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToEmail = () => {
    setStep('email');
    setError(null);
    setPassword('');
    setActiveRequestId(null);
  };

  return (
    <div 
      id="admin-access-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl text-slate-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-900/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Admin Mode</h3>
              <p className="text-xs text-slate-400">Operations Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {/* STEP 1: ENTER EMAIL ONLY */}
          {step === 'email' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-white">Administrator Verification</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your registered administrator email address to continue.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      autoFocus
                      placeholder="name@organization.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking directory...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: EMAIL VERIFIED -> ASK FOR PASSWORD */}
          {step === 'password' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">Enter Password</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setPassword('');
                      setError(null);
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Change Email
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  Signing in as <span className="font-mono text-slate-200 font-medium">{email}</span>
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      placeholder="Enter administrator password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sign In as Administrator</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReturnToEmail}
                    className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Back to email input
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: ACCESS DENIED (EMAIL NOT IN ADMIN FILE) */}
          {step === 'denied' && (
            <div className="text-center space-y-4 py-2 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto shadow-xl">
                <ShieldAlert className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-rose-400 tracking-tight">
                  Access Denied
                </h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  <span className="font-mono text-slate-200 font-semibold">{email}</span> is not registered in the administrator database.
                </p>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs">
                  {error}
                </div>
              )}

              <div className="pt-2 space-y-2 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={handleSendAccessRequest}
                  disabled={loading}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Sending Request...' : 'Request Access Approval'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReturnToEmail}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Try Another Email</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AWAITING APPROVAL (SILENT LISTENER + 10-MIN COUNTDOWN) */}
          {step === 'waiting' && (
            <div className="text-center space-y-4 py-2 animate-in fade-in duration-200">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500/20 opacity-75"></span>
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-rose-500/50 flex items-center justify-center relative shadow-inner">
                  <Radio className="w-6 h-6 text-rose-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  Request Sent for Approval
                </h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  Your access request has been submitted to the administrator. Waiting for approval...
                </p>
              </div>

              {/* Countdown Ticker */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl max-w-xs mx-auto space-y-1">
                <div className="flex items-center justify-center space-x-1.5 text-slate-400 text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Approval Window:</span>
                </div>
                <div className="font-mono text-2xl font-bold text-amber-300 tracking-wider">
                  {formatTime(remainingSeconds)}
                </div>
                <p className="text-[11px] text-slate-400">
                  Access expires automatically if not authorized within 10 minutes.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReturnToEmail}
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
                >
                  Cancel and return to sign in
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REJECTED ("u cant acess it") */}
          {step === 'rejected' && (
            <div className="text-center space-y-4 py-3 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto shadow-xl">
                <ShieldAlert className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-rose-400 tracking-tight">
                  {denialMessage}
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Your administrator access request was reviewed and denied.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReturnToEmail}
                  className="w-full max-w-xs mx-auto py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: EXPIRED ("henceforth not a authorised admin pls contact PRATIK") */}
          {step === 'expired' && (
            <div className="text-center space-y-4 py-3 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-amber-400 tracking-tight leading-snug">
                  {expiredMessage}
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  The 10-minute administrative approval window has elapsed.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReturnToEmail}
                  className="w-full max-w-xs mx-auto py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
