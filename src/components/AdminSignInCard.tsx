import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Clock, 
  Radio, 
  AlertTriangle,
  RefreshCw,
  Send
} from 'lucide-react';
import { User } from '../types';

interface AdminSignInCardProps {
  onSuccess: (adminUser: User) => void;
  onBack: () => void;
  initialEmail?: string;
  initialUsername?: string;
}

type CardStep = 'email' | 'password' | 'denied' | 'waiting' | 'rejected' | 'expired';

export const AdminSignInCard: React.FC<AdminSignInCardProps> = ({
  onSuccess,
  onBack,
  initialEmail = '',
  initialUsername = '',
}) => {
  const [step, setStep] = useState<CardStep>('email');
  const [username, setUsername] = useState(initialUsername || '');
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Background authorization request & countdown state
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(600); // 10 mins = 600s
  const [denialMessage, setDenialMessage] = useState<string>('u cant acess it');
  const [expiredMessage, setExpiredMessage] = useState<string>(
    'henceforth not a authorised admin pls contact PRATIK'
  );

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling timer on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  // Polling loop when waiting for approval
  useEffect(() => {
    if (step !== 'waiting' || !activeRequestId) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/admin/auth/status?id=${activeRequestId}`);
        const data = await res.json();

        if (data.status === 'accepted' && data.user) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          onSuccess(data.user);
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

    const localCountdown = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(localCountdown);
          setStep('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      clearInterval(localCountdown);
    };
  }, [step, activeRequestId, onSuccess]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Unified Submit: Check email in database first, then verify password if present
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Please enter your administrator email address');
      return;
    }

    setLoading(true);
    try {
      // Step A: Check if email is in admins.json database
      const verifyRes = await fetch('/api/admin/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.exists) {
        // Email NOT in file -> write Access Denied immediately
        setStep('denied');
        setLoading(false);
        return;
      }

      // Step B: Email IS in database ("accept further")
      const targetPassword = password.trim();
      if (!targetPassword) {
        // If password wasn't entered yet, prompt for password
        setStep('password');
        setLoading(false);
        return;
      }

      // Step C: Verify password
      const loginRes = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          password: targetPassword,
          name: username.trim() || targetEmail.split('@')[0],
        }),
      });

      const loginData = await loginRes.json();
      if (loginData.success && loginData.user) {
        onSuccess(loginData.user);
        return;
      }

      if (loginRes.status === 401 || loginData.error) {
        setError(loginData.error || 'Incorrect password. Please verify and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Password
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
          name: username.trim() || email.trim().split('@')[0],
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onSuccess(data.user);
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

  // 3. Dispatch Access Request when Access Denied
  const handleSendAccessRequest = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: username.trim() || email.trim().split('@')[0],
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
    <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 animate-in fade-in zoom-in-95 duration-200">
      {/* Exact Card Design Matching Image 1 */}
      <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Top Glowing Gradient Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header bar: "← Change options" & "Administrator • Operations" Badge */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change options</span>
            </button>

            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80">
              <span>Administrator • Operations</span>
            </div>
          </div>

          {/* Icon Badge + Title Header */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md bg-gradient-to-br from-rose-500 to-orange-600 shadow-rose-500/20 shrink-0">
              A
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Sign In as Admin
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {step === 'password'
                  ? 'Enter password to access administrator mode'
                  : 'Enter your email & password to continue'}
              </p>
            </div>
          </div>

          {/* General Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* =========================================================================
              VIEW 1: SIGN IN CARD (USERNAME + EMAIL + PASSWORD matching Image 1)
             ========================================================================= */}
          {step === 'email' && (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              {/* 1. USERNAME */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  USERNAME
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ADMIN_PRATIK"
                    className="w-full pl-10 pr-4 py-3 bg-[#EAF1FB] text-slate-900 font-medium rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>
              </div>

              {/* 2. EMAIL */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  EMAIL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@nexup.edu"
                    className="w-full pl-10 pr-4 py-3 bg-[#EAF1FB] text-slate-900 font-medium rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>
              </div>

              {/* 3. PASSWORD */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-[#EAF1FB] text-slate-900 font-medium rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status info note */}
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Verification verified against Admin directory
                </span>
                <span className="text-[10px] text-rose-400/80 font-mono font-bold">
                  Full Console Access
                </span>
              </div>

              {/* Action Button: Sign In */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer transform active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                      <span>Verifying credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2 text-xs text-slate-500">
                <span>Restricted to authorized system administrators.</span>
              </div>
            </form>
          )}

          {/* =========================================================================
              VIEW 2: EMAIL IS IN DATABASE -> ASK FOR PASSWORD ("accept further")
             ========================================================================= */}
          {step === 'password' && (
            <form onSubmit={handleVerifyPassword} className="space-y-4 animate-in fade-in duration-150">
              {/* Selected Email Pill */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs font-mono text-slate-200 truncate">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={handleReturnToEmail}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold shrink-0 cursor-pointer ml-2"
                >
                  Change
                </button>
              </div>

              {/* PASSWORD Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-[#EAF1FB] text-slate-900 font-medium rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer transform active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-rose-600" />
                      <span>Sign In as Admin</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleReturnToEmail}
                  className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  ← Back to email input
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              VIEW 3: ACCESS DENIED (EMAIL NOT IN ADMIN FILE)
             ========================================================================= */}
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

              <div className="pt-3 space-y-2.5 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={handleSendAccessRequest}
                  disabled={loading}
                  className="w-full py-3 px-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Sending Request...' : 'Request Access Approval'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReturnToEmail}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 rounded-full text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Try Another Email</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 4: AWAITING APPROVAL (10-MIN COUNTDOWN)
             ========================================================================= */}
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
                  Your administrator access request has been submitted. Waiting for approval...
                </p>
              </div>

              {/* 10-Minute Countdown Ticker */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl max-w-xs mx-auto space-y-1">
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
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  Cancel and return to sign in
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 5: REJECTED ("u cant acess it")
             ========================================================================= */}
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
                  className="w-full max-w-xs mx-auto py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-full shadow-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 6: EXPIRED ("henceforth not a authorised admin pls contact PRATIK")
             ========================================================================= */}
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
                  className="w-full max-w-xs mx-auto py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-full border border-slate-700 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
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
