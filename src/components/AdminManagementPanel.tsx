import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Check, 
  X,
  Sparkles,
  ShieldAlert,
  Info
} from 'lucide-react';
import { AdminRecord, AdminAccessRequest, User } from '../types';

interface AdminManagementPanelProps {
  currentUser?: User | null;
  onRefreshStats?: () => void;
}

export const AdminManagementPanel: React.FC<AdminManagementPanelProps> = ({
  currentUser,
  onRefreshStats,
}) => {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [requests, setRequests] = useState<AdminAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Admin form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('admin@2026');
  const [nameInput, setNameInput] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Change password modal state
  const [editingPasswordEmail, setEditingPasswordEmail] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete admin confirmation modal state
  const [deletingAdminEmail, setDeletingAdminEmail] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [processingDelete, setProcessingDelete] = useState(false);

  // Show passwords toggle
  const [revealedPasswords, setRevealedPasswords] = useState<{ [email: string]: boolean }>({});

  const isCurrentPrimary = 
    currentUser?.email?.toLowerCase() === 'pratikpanda2006@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'freeuser13012026@gmail.com';

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/manage/list');
      const data = await res.json();
      if (data.admins) setAdmins(data.admins);
      if (data.requests) setRequests(data.requests);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to load administrator records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll requests every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingAdmin(true);
    setFeedback(null);

    const targetEmail = emailInput.trim().toLowerCase();
    if (!targetEmail) {
      setFeedback({ type: 'error', message: 'Please enter an email address.' });
      setAddingAdmin(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/manage/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          password: passwordInput.trim() || 'admin@2026',
          name: nameInput.trim() || targetEmail.split('@')[0],
          addedBy: currentUser?.email || 'pratikpanda2006@gmail.com',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setFeedback({ type: 'error', message: data.error || 'Failed to add administrator.' });
      } else {
        setFeedback({ 
          type: 'success', 
          message: `Admin ${targetEmail} successfully added with password: ${passwordInput || 'admin@2026'}.` 
        });
        setEmailInput('');
        setNameInput('');
        setPasswordInput('admin@2026');
        setShowAddForm(false);
        loadData();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Server error.' });
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/admin/manage/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewedBy: currentUser?.email || 'freeuser13012026@gmail.com' }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ 
          type: 'success', 
          message: 'Access request approved! User added to admin file with default password admin@2026.' 
        });
        loadData();
        if (onRefreshStats) onRefreshStats();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to approve request.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Server error.' });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/admin/manage/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewedBy: currentUser?.email || 'freeuser13012026@gmail.com' }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ 
          type: 'success', 
          message: 'Access request rejected. Requester will see "u cant acess it" notification.' 
        });
        loadData();
        if (onRefreshStats) onRefreshStats();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to reject request.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Server error.' });
    }
  };

  const handleChangePassword = async () => {
    if (!editingPasswordEmail || !newPasswordValue.trim()) return;
    setSavingPassword(true);
    try {
      const res = await fetch('/api/admin/manage/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editingPasswordEmail,
          newPassword: newPasswordValue.trim(),
          callerEmail: currentUser?.email || 'pratikpanda2006@gmail.com',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: `Password updated successfully for ${editingPasswordEmail}.` });
        setEditingPasswordEmail(null);
        setNewPasswordValue('');
        loadData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to update password.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Server error.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRemoveAdmin = async (targetEmail: string) => {
    setProcessingDelete(true);
    try {
      const res = await fetch('/api/admin/manage/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          callerEmail: currentUser?.email || 'pratikpanda2006@gmail.com',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: `Admin ${targetEmail} removed from administrators list.` });
        setDeletingAdminEmail(null);
        loadData();
        if (onRefreshStats) onRefreshStats();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to remove admin.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Server error.' });
    } finally {
      setProcessingDelete(false);
    }
  };

  const toggleReveal = (email: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [email]: !prev[email] }));
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div id="admin-management-panel" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Administrative Access & Team Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure authorized admin accounts, set default passwords (<code className="text-rose-300 font-mono">admin@2026</code>), and approve access requests.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="add-other-admins-button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'Add Other Admins'}</span>
          </button>
        </div>
      </div>

      {/* Primary Admin Notice Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-rose-900/40 flex items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="text-slate-300">
            <span className="font-bold text-white mr-1">Primary Administrators:</span>
            <span className="font-mono text-rose-300 font-semibold mr-2">pratikpanda2006@gmail.com</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-rose-300 font-semibold ml-2">freeuser13012026@gmail.com</span>
          </div>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold shrink-0">
          Permanent Authority
        </span>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80'
              : 'bg-rose-950/70 text-rose-300 border-rose-800/80'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white ml-2 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* ADD OTHER ADMIN FORM */}
      {showAddForm && (
        <div className="bg-slate-900 p-5 rounded-2xl border border-rose-900/40 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Add New Administrator</h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Appends directly to <code className="text-rose-300 font-mono">data/admins.json</code>
            </span>
          </div>

          <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Admin Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="admin.colleague@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Full Name / Designation
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Operations Lead"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">
                  Password <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-mono">Default: admin@2026</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="sm:col-span-3 flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingAdmin}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-900/30 flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{addingAdmin ? 'Adding Admin...' : 'Save & Authorize Admin'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PENDING APPROVAL REQUESTS SECTION */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/60 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-amber-200">
                Pending Admin Access Requests ({pendingRequests.length})
              </h3>
            </div>
            <span className="text-[11px] text-amber-400 font-medium">
              10-Minute Expiry Window Active
            </span>
          </div>
          <p className="text-xs text-slate-300">
            These users requested permission to access admin mode. Accepting adds their email to <code className="text-amber-200 font-mono">data/admins.json</code> with default password <code className="text-amber-200 font-mono">admin@2026</code>.
          </p>

          <div className="divide-y divide-amber-900/40 bg-slate-900/90 rounded-xl border border-amber-900/40 overflow-hidden">
            {pendingRequests.map((req) => {
              const secondsLeft = Math.max(
                0,
                Math.round((new Date(req.expiresAt).getTime() - Date.now()) / 1000)
              );
              const m = Math.floor(secondsLeft / 60);
              const s = secondsLeft % 60;
              const formattedTimer = `${m}:${s.toString().padStart(2, '0')}`;

              return (
                <div key={req.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{req.email}</span>
                      {req.name && (
                        <span className="text-slate-400">({req.name})</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                      <span>Requested: {new Date(req.requestedAt).toLocaleTimeString()}</span>
                      <span className="text-amber-400 font-mono font-bold">
                        Window remaining: {formattedTimer}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center space-x-1 transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept & Add to File</span>
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-rose-100 rounded-lg font-bold flex items-center space-x-1 transition-colors"
                      title="User will see 'u cant acess it' message"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* APPROVED ADMINISTRATORS ROSTER TABLE */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              AUTHORIZED ADMINISTRATOR ROSTER ({admins.length})
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              data/admins.json
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Only users in this list can access Admin Mode
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">ADMINISTRATOR</th>
                <th className="py-3 px-4">ROLE & AUTHORITY</th>
                <th className="py-3 px-4">PASSWORD</th>
                <th className="py-3 px-4">ADDED BY / DATE</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {admins.map((adm) => {
                const isPrimary = adm.isPrimary;
                const isRevealed = revealedPasswords[adm.email];

                return (
                  <tr key={adm.email} className="hover:bg-slate-850/80 transition-colors">
                    {/* Admin Name & Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isPrimary 
                            ? 'bg-rose-950 text-rose-300 border border-rose-700' 
                            : 'bg-slate-800 text-slate-200 border border-slate-700'
                        }`}>
                          {adm.name ? adm.name.slice(0, 2).toUpperCase() : adm.email.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-white block text-xs">
                            {adm.name || adm.email.split('@')[0]}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {adm.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role & Authority */}
                    <td className="py-3.5 px-4">
                      {isPrimary ? (
                        <span className="inline-flex items-center space-x-1 bg-rose-950/80 text-rose-300 border border-rose-800/80 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase font-mono">
                          <ShieldCheck className="w-3 h-3 text-rose-400" />
                          <span>Primary Admin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                          <span>Authorized Admin</span>
                        </span>
                      )}
                    </td>

                    {/* Password */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-200">
                          {isRevealed ? adm.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleReveal(adm.email)}
                          className="text-slate-400 hover:text-slate-200"
                          title={isRevealed ? 'Hide' : 'Show'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Added By & Date */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      <div>{adm.addedBy || 'System'}</div>
                      <div className="text-slate-500 font-mono text-[10px]">
                        {adm.addedAt ? new Date(adm.addedAt).toLocaleDateString() : 'Initial'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Change Password Button */}
                        <button
                          onClick={() => {
                            setEditingPasswordEmail(adm.email);
                            setNewPasswordValue(adm.password);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors flex items-center space-x-1"
                          title="Change password"
                        >
                          <Key className="w-3 h-3 text-amber-400" />
                          <span>Password</span>
                        </button>

                        {/* Remove Admin Button */}
                        {isPrimary ? (
                          <span 
                            className="px-2 py-1 text-[10px] text-slate-600 font-mono cursor-not-allowed"
                            title="Primary admins cannot be removed"
                          >
                            Protected
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setDeletingAdminEmail(adm.email);
                              setConfirmDelete(false);
                            }}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-800/40 transition-colors"
                            title="Revoke Admin Access"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {editingPasswordEmail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-white text-sm">Update Admin Password</h4>
              </div>
              <button
                onClick={() => setEditingPasswordEmail(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-300 mb-2">
                Changing password for <code className="text-rose-300 font-mono">{editingPasswordEmail}</code>:
              </p>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-3 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-200"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPasswordEmail(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={savingPassword || !newPasswordValue.trim()}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {savingPassword ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM REMOVE ADMIN MODAL */}
      {deletingAdminEmail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h4 className="font-bold text-white text-base">Revoke Admin Access?</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-white font-mono">{deletingAdminEmail}</strong> from the administrator list? They will immediately lose access to the admin console and their account will revert to standard student role.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAdminEmail(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRemoveAdmin(deletingAdminEmail)}
                disabled={processingDelete}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {processingDelete ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
