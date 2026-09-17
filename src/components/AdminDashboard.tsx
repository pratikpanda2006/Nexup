import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  RefreshCw, 
  Bot, 
  AlertTriangle,
  Layers,
  Award,
  Briefcase,
  GraduationCap,
  Calendar,
  Clock,
  Inbox,
  LayoutDashboard,
  Search,
  Eye,
  ArrowRight,
  ArrowLeft,
  Users,
  UserPlus,
  FileText,
  UploadCloud,
  GitPullRequest,
  MessageSquare
} from 'lucide-react';
import { Opportunity, OpportunityCategory, User } from '../types';
import { formatDeadline } from '../utils';
import { AdminManagementPanel } from './AdminManagementPanel';
import { AdminFeedbackPanel } from './AdminFeedbackPanel';
import { AIExtractorModal } from './AIExtractorModal';

interface AdminDashboardProps {
  opportunities: Opportunity[];
  onRefreshOpportunities: () => void;
  onSelectOpportunity?: (op: Opportunity) => void;
  onGoBack?: () => void;
  previousTabName?: string;
  currentUser?: User | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  opportunities,
  onRefreshOpportunities,
  onSelectOpportunity,
  onGoBack,
  previousTabName,
  currentUser,
}) => {
  // Admin subtabs: Overview, Past Dues, All Opportunities, AI Review Queue, + New Opportunity, Admins (Add other admins), Feedbacks
  const [activeTab, setActiveTab] = useState<'overview' | 'past_dues' | 'manage' | 'review' | 'create' | 'admins' | 'feedbacks'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [reviewQueue, setReviewQueue] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isExtractorOpen, setIsExtractorOpen] = useState(false);

  const handleExtractorSuccess = (count: number, message: string) => {
    setFeedback({ type: 'success', message });
    fetchAdminData();
    onRefreshOpportunities();
    setActiveTab('review');
  };

  // Past Dues state
  const [pastDueSearch, setPastDueSearch] = useState('');
  const [pastDueCategory, setPastDueCategory] = useState<string>('all');
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Search and filter for "All Opportunities" tab (Image 3)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form state for "+ New Opportunity" tab (Image 5)
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    category: 'hackathon' as OpportunityCategory,
    description: '',
    eligibility: 'Open to all enrolled undergraduate students worldwide.',
    startDate: '2026-10-15',
    endDate: '2026-10-17',
    deadline: '2026-10-01',
    mode: 'online' as 'online' | 'offline' | 'hybrid',
    location: 'Virtual Worldwide',
    geography: 'international' as 'international' | 'national' | 'regional' | 'university',
    officialUrl: 'https://',
    registrationUrl: 'https://',
    logoUrl: '',
    domains: 'AI/ML, Software Development',
    skills: 'Python, TypeScript',
    teamSize: '1-4 Members',
    prizePool: '$45,000 in Prizes & Grants',
    competitionType: 'Hackathon',
    role: '',
    stipend: '',
    duration: '',
    professor: '',
    institution: '',
    researchArea: '',
    funding: '',
    programType: '',
    projectUrl: '',
  });

  const [editingOpportunityId, setEditingOpportunityId] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null);
  const [runningJob, setRunningJob] = useState(false);

  // Fetch admin stats & review queue
  const fetchAdminData = async () => {
    try {
      const [statsRes, reviewRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/review'),
      ]);
      const sData = await statsRes.json();
      const rData = await reviewRes.json();
      setStats(sData);
      setReviewQueue(rData.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const payload = {
        ...formData,
        domains: formData.domains.split(',').map((d) => d.trim()).filter(Boolean),
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };

      const endpoint = editingOpportunityId ? `/api/opportunities/${editingOpportunityId}` : '/api/opportunities';
      const method = editingOpportunityId ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'admin-demo-1' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFeedback({
          type: 'success',
          message: editingOpportunityId
            ? 'Opportunity changes successfully updated!'
            : 'Opportunity successfully created and published!',
        });
        setEditingOpportunityId(null);
        onRefreshOpportunities();
        fetchAdminData();
        setActiveTab('manage');
      } else {
        const errData = await res.json();
        setFeedback({ type: 'error', message: errData.error || 'Failed to create opportunity' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/opportunities/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': 'admin-demo-1' },
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: `Archived ${deleteTarget.name}` });
        setDeleteTarget(null);
        onRefreshOpportunities();
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunExpiryJob = async () => {
    setRunningJob(true);
    try {
      const res = await fetch('/api/cron/check-expiry', { method: 'POST' });
      const data = await res.json();
      setFeedback({
        type: 'success',
        message: `Expiry sweep completed: ${data.expiredCount || 0} expired listings checked and updated.`,
      });
      fetchAdminData();
      onRefreshOpportunities();
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to run expiry job: ' + err.message });
    } finally {
      setRunningJob(false);
    }
  };

  const handleRunAIDiscovery = async () => {
    setRunningJob(true);
    try {
      const res = await fetch('/api/admin/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'admin-demo-1' },
        body: JSON.stringify({ category: 'all' }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `AI Discovery completed: ${data.discoveredCount} candidates extracted, ${data.duplicatesSkipped} duplicates skipped. Added to Review Queue.`,
        });
        fetchAdminData();
        onRefreshOpportunities();
      } else {
        setFeedback({ type: 'error', message: data.error || 'AI Discovery pipeline failed' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setRunningJob(false);
    }
  };

  const handleApproveReview = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/review/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'admin-demo-1' },
        body: JSON.stringify({ verificationStatus: 'verified' }),
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: 'Opportunity approved and published to student feeds!' });
        fetchAdminData();
        onRefreshOpportunities();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectReview = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/review/${id}/reject`, {
        method: 'POST',
        headers: { 'x-user-id': 'admin-demo-1' },
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: 'Candidate rejected and removed from review queue.' });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditAndApprove = (op: Opportunity) => {
    setEditingOpportunityId(op.id);
    setFormData({
      name: op.name,
      organization: op.organization,
      category: op.category,
      description: op.description,
      eligibility: op.eligibility || 'Open to all students.',
      startDate: op.startDate || '2026-10-15',
      endDate: op.endDate || '2026-10-17',
      deadline: op.deadline || '2026-10-01',
      mode: op.mode || 'online',
      location: op.location || 'Virtual Worldwide',
      geography: op.geography || 'international',
      officialUrl: op.officialUrl,
      registrationUrl: op.registrationUrl || op.officialUrl,
      logoUrl: op.logoUrl || '',
      domains: op.domains?.join(', ') || '',
      skills: op.skills?.join(', ') || '',
      teamSize: op.teamSize || '1-4 Members',
      prizePool: op.prizePool || '',
      competitionType: op.competitionType || 'Hackathon',
      role: op.role || '',
      stipend: op.stipend || '',
      duration: op.duration || '',
      professor: op.professor || '',
      institution: op.institution || '',
      researchArea: op.researchArea || '',
      funding: op.funding || '',
      programType: op.programType || '',
      projectUrl: op.projectUrl || '',
    });
    setActiveTab('create');
  };

  const handleEditOpportunity = handleEditAndApprove;

  // Past Due Opportunities Calculation (User prompt: "after overview add one more which is past dues where tjodw whoukd be therse whose deadlines are there (admin might eremove those then)")
  const isOpportunityPastDue = (op: Opportunity) => {
    if (op.status === 'closed') return true;
    if (!op.deadline) return false;
    const now = new Date();
    const deadlineDate = new Date(op.deadline.includes('T') ? op.deadline : op.deadline + 'T23:59:59Z');
    return deadlineDate.getTime() < now.getTime();
  };

  const pastDueOpportunities = opportunities.filter(isOpportunityPastDue);

  const filteredPastDues = pastDueOpportunities.filter((op) => {
    const matchesCat = pastDueCategory === 'all' || op.category === pastDueCategory;
    const q = pastDueSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      op.name.toLowerCase().includes(q) ||
      op.organization.toLowerCase().includes(q) ||
      op.domains.some((d) => d.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const getDaysOverdue = (deadlineStr?: string) => {
    if (!deadlineStr) return 0;
    const now = new Date();
    const deadlineDate = new Date(deadlineStr.includes('T') ? deadlineStr : deadlineStr + 'T23:59:59Z');
    const diff = Math.floor((now.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  };

  const handleExtendDeadline = async (op: Opportunity, daysToAdd: number = 14) => {
    try {
      const current = new Date(op.deadline || Date.now());
      const newDate = new Date(Math.max(current.getTime(), Date.now()) + daysToAdd * 24 * 60 * 60 * 1000);
      const newDeadlineStr = newDate.toISOString().split('T')[0];

      const res = await fetch(`/api/opportunities/${op.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'admin-demo-1' },
        body: JSON.stringify({
          deadline: newDeadlineStr,
          status: 'open',
        }),
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: `Extended deadline for ${op.name} to ${newDeadlineStr}` });
        onRefreshOpportunities();
        fetchAdminData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleBulkDeletePastDues = async () => {
    if (pastDueOpportunities.length === 0) return;
    setBulkDeleting(true);
    try {
      const ids = pastDueOpportunities.map((op) => op.id);
      const res = await fetch('/api/admin/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'admin-demo-1' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: data.message || `Removed ${ids.length} past due opportunities.` });
        setShowBulkDeleteModal(false);
        onRefreshOpportunities();
        fetchAdminData();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to bulk remove past dues' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setBulkDeleting(false);
    }
  };

  // Filtered opportunities for "All Opportunities" tab (Image 3)
  const filteredOpportunities = opportunities.filter((op) => {
    const matchesCat = filterCategory === 'all' || op.category === filterCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      op.name.toLowerCase().includes(q) ||
      op.organization.toLowerCase().includes(q) ||
      op.domains.some((d) => d.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  // Calculation for deadline badge in table (e.g. "• Closes in 1d", "• 4 days left")
  const getDeadlineBadge = (deadlineStr: string) => {
    const now = new Date();
    const deadline = new Date(deadlineStr + 'T23:59:59Z');
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
          • Closed
        </span>
      );
    }
    if (diffDays <= 1) {
      return (
        <span className="inline-flex items-center text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-950/70 text-amber-400 border border-amber-800/80">
          • Closes in {diffDays === 0 ? 'today' : '1d'}
        </span>
      );
    }
    if (diffDays <= 5) {
      return (
        <span className="inline-flex items-center text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/70">
          • {diffDays} days left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-blue-950/40 text-blue-300 border border-blue-800/50">
        • Open
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Top Admin Banner matching Screenshots 2, 3, 4, 5 */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col gap-4 shadow-xl">
        {onGoBack && (
          <div>
            <button
              type="button"
              onClick={onGoBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 text-xs font-semibold transition-all shadow-xs group cursor-pointer"
              title={`Return to ${previousTabName || 'Dashboard'}`}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-rose-400" />
              <span>Back to {previousTabName || 'Dashboard'}</span>
            </button>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                NEXUP Administrative Operations
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 uppercase font-bold tracking-wider">
                AUTHORIZED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage database records, configure listings, and review AI opportunity extractions.
            </p>
          </div>
        </div>

        {/* 4 Tabs right inside the top banner */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-rose-950/90 text-rose-200 border border-rose-800/90 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          {/* User requested: "after overview add one more which is past dues where tjodw whoukd be therse whose deadlines are there (admin might eremove those then )" */}
          <button
            onClick={() => setActiveTab('past_dues')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'past_dues'
                ? 'bg-rose-950/90 text-rose-200 border border-rose-800/90 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Past Dues</span>
            {pastDueOpportunities.length > 0 && (
              <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                {pastDueOpportunities.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'manage'
                ? 'bg-rose-950/90 text-rose-200 border border-rose-800/90 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Opportunities</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'review'
                ? 'bg-rose-950/90 text-rose-200 border border-rose-800/90 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Review Queue</span>
            {reviewQueue.length > 0 && (
              <span className="text-[10px] bg-indigo-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                {reviewQueue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (activeTab !== 'create') {
                setEditingOpportunityId(null);
              }
              setActiveTab('create');
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'create'
                ? 'bg-rose-950/90 text-rose-200 border border-rose-800/90 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingOpportunityId ? 'Edit Opportunity' : '+ New Opportunity'}</span>
          </button>

          <button
            id="tab-add-other-admins"
            onClick={() => setActiveTab('admins')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'admins'
                ? 'bg-rose-950/90 text-rose-200 border border-rose-800/90 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Add Other Admins</span>
          </button>

          <button
            id="tab-feedbacks"
            onClick={() => setActiveTab('feedbacks')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'feedbacks'
                ? 'bg-rose-950/90 text-rose-200 border border-rose-800/90 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedbacks</span>
          </button>
        </div>
        </div>
      </div>

      {/* Feedback banner */}
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

      {/* =========================================================================
          TAB 1: OVERVIEW (Matching Image 2)
         ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Header & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Database Metrics</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Live operational snapshot of all opportunities and review queues.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
              <button
                onClick={handleRunExpiryJob}
                disabled={runningJob}
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-750 transition-colors disabled:opacity-50 shadow-xs"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Run Expiry Job</span>
              </button>

              <button
                onClick={handleRunAIDiscovery}
                disabled={runningJob}
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors disabled:opacity-50 shadow-xs shadow-indigo-600/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Discovery</span>
              </button>

              <button
                onClick={() => setIsExtractorOpen(true)}
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-semibold text-white transition-colors shadow-xs shadow-indigo-600/20"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Import PDF/Link</span>
              </button>

              <button
                onClick={() => {
                  setEditingOpportunityId(null);
                  setActiveTab('create');
                }}
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors shadow-xs shadow-violet-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Listing</span>
              </button>
            </div>
          </div>

          {/* 5 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Total Listed */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  TOTAL LISTED
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-white">
                  {stats?.total || opportunities.length}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  {stats?.active || opportunities.length} active • {stats?.expired || 0} expired
                </p>
              </div>
            </div>

            {/* Hackathons */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  HACKATHONS
                </span>
                <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-800/60 flex items-center justify-center text-violet-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-white">
                  {stats?.hackathons || opportunities.filter((o) => o.category === 'hackathon').length}
                </span>
                <p className="text-xs text-slate-400 mt-1">Active coding sprints</p>
              </div>
            </div>

            {/* Internships */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  INTERNSHIPS
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-white">
                  {stats?.internships || opportunities.filter((o) => o.category === 'internship').length}
                </span>
                <p className="text-xs text-slate-400 mt-1">Industry & startup roles</p>
              </div>
            </div>

            {/* Research Labs */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  RESEARCH LABS
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-white">
                  {stats?.research || opportunities.filter((o) => o.category === 'research').length}
                </span>
                <p className="text-xs text-slate-400 mt-1">Funded fellowships</p>
              </div>
            </div>

            {/* Open Source */}
            <div className="col-span-2 sm:col-span-1 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  OPEN SOURCE
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
                  <GitPullRequest className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-white">
                  {stats?.opensource || opportunities.filter((o) => o.category === 'opensource').length}
                </span>
                <p className="text-xs text-slate-400 mt-1">GSoC, LFX & fellowships</p>
              </div>
            </div>
          </div>

          {/* Operational Banner: Add Other Admins & Manage Permissions */}
          <div className="bg-gradient-to-r from-slate-900 via-rose-950/25 to-slate-900 border border-rose-900/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h3 className="text-sm font-bold text-white">
                    Administrator Team Management & Access Control
                  </h3>
                  <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full font-semibold">
                    Admin Directory
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Authorized administrators can add other admin emails to the database, review incoming permission requests, update passwords, or revoke access.
                </p>
              </div>
            </div>

            <button
              id="btn-overview-add-other-admins"
              onClick={() => setActiveTab('admins')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 transition-all shadow-lg shadow-rose-900/30"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Other Admins</span>
            </button>
          </div>

          {/* Blue Review Queue Notification Banner */}
          <div className="bg-blue-950/40 border border-blue-800/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-900/60 border border-blue-700/60 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {reviewQueue.length} AI-Discovered Opportunities Pending Review
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  New candidate opportunities extracted from web feeds require administrative approval before being published.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('review')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors shadow-xs shadow-indigo-600/30"
            >
              <span>Open Review Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recently Added Opportunities Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                RECENTLY ADDED OPPORTUNITIES
              </h3>
              <button
                onClick={() => setActiveTab('manage')}
                className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                <span>Manage all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Desktop Table: md+ screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">TITLE</th>
                    <th className="py-3 px-4">CATEGORY</th>
                    <th className="py-3 px-4">ORGANIZATION</th>
                    <th className="py-3 px-4">DEADLINE</th>
                    <th className="py-3 px-4">SOURCE</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {opportunities.slice(0, 6).map((op) => (
                    <tr key={op.id} className="hover:bg-slate-850/80 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-semibold text-white truncate block text-xs">
                          {op.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                            op.category === 'hackathon'
                              ? 'bg-violet-950/70 text-violet-300 border border-violet-800/80'
                              : op.category === 'internship'
                              ? 'bg-blue-950/70 text-blue-300 border border-blue-800/80'
                              : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80'
                          }`}
                        >
                          {op.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-xs truncate max-w-xs">
                        {op.organization}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300 text-xs whitespace-nowrap">
                        {formatDeadline(op.deadline)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {op.source.includes('AI') ? 'AI AGENT' : 'MANUAL'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectOpportunity?.(op)}
                          className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-medium p-1 hover:bg-slate-800 rounded transition-colors"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Feed: < md screens (Zero horizontal scrolling) */}
            <div className="block md:hidden divide-y divide-slate-800/80">
              {opportunities.slice(0, 6).map((op) => (
                <div
                  key={op.id}
                  onClick={() => onSelectOpportunity?.(op)}
                  className="p-3.5 space-y-2 hover:bg-slate-850/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                        op.category === 'hackathon'
                          ? 'bg-violet-950/70 text-violet-300 border border-violet-800/80'
                          : op.category === 'internship'
                          ? 'bg-blue-950/70 text-blue-300 border border-blue-800/80'
                          : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80'
                      }`}
                    >
                      {op.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {op.source.includes('AI') ? 'AI AGENT' : 'MANUAL'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{op.name}</h4>
                    <p className="text-[11px] text-slate-400">{op.organization}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-300 border-t border-slate-800/60">
                    <span>Due: {formatDeadline(op.deadline)}</span>
                    <span className="text-blue-400 font-semibold inline-flex items-center gap-1">
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: PAST DUES (User prompt: "after overview add one more which is past dues where tjodw whoukd be therse whose deadlines are there (admin might eremove those then )")
         ========================================================================= */}
      {activeTab === 'past_dues' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/80 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">Past Due & Expired Listings</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold uppercase">
                    {pastDueOpportunities.length} EXPIRED
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Opportunities with passed application deadlines. Review, extend dates, or remove them so student listings stay fresh.
                </p>
              </div>
            </div>

            {/* Quick bulk action */}
            {pastDueOpportunities.length > 0 && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-colors shadow-xs shadow-red-600/20 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove All Past Dues ({pastDueOpportunities.length})</span>
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Total Past Due</div>
              <div className="text-2xl font-black text-red-400 mt-1">{pastDueOpportunities.length}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Expired Internships</div>
              <div className="text-2xl font-black text-blue-400 mt-1">
                {pastDueOpportunities.filter((o) => o.category === 'internship').length}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Expired Hackathons</div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {pastDueOpportunities.filter((o) => o.category === 'hackathon').length}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Expired Research</div>
              <div className="text-2xl font-black text-fuchsia-400 mt-1">
                {pastDueOpportunities.filter((o) => o.category === 'research').length}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Expired Open Source</div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {pastDueOpportunities.filter((o) => o.category === 'opensource').length}
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={pastDueSearch}
                onChange={(e) => setPastDueSearch(e.target.value)}
                placeholder="Search past due listings by title, company, skills..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex items-center space-x-1.5 shrink-0 overflow-x-auto w-full sm:w-auto">
              {(['all', 'hackathon', 'internship', 'research', 'opensource'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPastDueCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${
                    pastDueCategory === cat
                      ? 'bg-amber-950 text-amber-200 border border-amber-800/90 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat === 'all' ? 'All Expired' : cat === 'opensource' ? 'Open Source' : cat + 's'}
                </button>
              ))}
            </div>
          </div>

          {/* Past Dues Table */}
          {filteredPastDues.length === 0 ? (
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Past Due Opportunities</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                {pastDueOpportunities.length === 0
                  ? 'Great news! All database opportunities are currently within their active application windows.'
                  : 'No expired opportunities matched your current search filters.'}
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
              {/* Desktop Table: md+ screens */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">OPPORTUNITY</th>
                      <th className="py-3 px-4">CATEGORY</th>
                      <th className="py-3 px-4">ORGANIZATION</th>
                      <th className="py-3 px-4">DEADLINE & OVERDUE</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4 text-right">ADMIN ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {filteredPastDues.map((op) => {
                      const daysOverdue = getDaysOverdue(op.deadline);
                      return (
                        <tr key={op.id} className="hover:bg-slate-850/80 transition-colors">
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex items-center space-x-2.5">
                              {op.logoUrl ? (
                                <img
                                  src={op.logoUrl}
                                  alt={op.organization}
                                  className="w-7 h-7 rounded-lg object-cover bg-slate-800 border border-slate-700 shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-[10px] font-bold shrink-0">
                                  {op.name.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="font-semibold text-white block text-xs truncate">
                                  {op.name}
                                </span>
                                <div className="flex items-center space-x-1 mt-0.5">
                                  {op.domains.slice(0, 2).map((d) => (
                                    <span key={d} className="text-[10px] text-slate-400">
                                      #{d}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                                op.category === 'hackathon'
                                  ? 'bg-amber-950/70 text-amber-300 border border-amber-800/80'
                                  : op.category === 'internship'
                                  ? 'bg-blue-950/70 text-blue-300 border border-blue-800/80'
                                  : op.category === 'opensource'
                                  ? 'bg-orange-950/70 text-orange-300 border border-orange-800/80'
                                  : 'bg-fuchsia-950/70 text-fuchsia-300 border border-fuchsia-800/80'
                              }`}
                            >
                              {op.category === 'opensource' ? 'Open Source' : op.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 text-xs truncate max-w-xs">
                            {op.organization}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-slate-300">{formatDeadline(op.deadline)}</span>
                              <span className="text-[10px] text-red-400 font-bold flex items-center space-x-1 mt-0.5">
                                <Clock className="w-3 h-3 inline" />
                                <span>Expired {daysOverdue}d ago</span>
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800">
                              • Closed
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Extend Deadline */}
                              <button
                                onClick={() => handleExtendDeadline(op, 14)}
                                className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-1 bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-800/60 rounded-md transition-colors"
                                title="Reactivate with +14 days deadline"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>+14d</span>
                              </button>

                              {/* Edit details */}
                              <button
                                onClick={() => handleEditOpportunity(op)}
                                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                                title="Edit Opportunity"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete / Remove past due item */}
                              <button
                                onClick={() => setDeleteTarget(op)}
                                className="inline-flex items-center space-x-1 text-[11px] font-semibold text-red-400 hover:text-red-300 px-2 py-1 bg-red-950/50 hover:bg-red-950 border border-red-800/60 rounded-md transition-colors"
                                title="Remove from database"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Past Dues Cards (< md breakpoint: zero horizontal scrolling) */}
              <div className="block md:hidden divide-y divide-slate-800/80">
                {filteredPastDues.map((op) => {
                  const daysOverdue = getDaysOverdue(op.deadline);
                  return (
                    <div key={op.id} className="p-4 space-y-3 hover:bg-slate-850/50 transition-colors">
                      {/* Header row: category + expired pill */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                            op.category === 'hackathon'
                              ? 'bg-amber-950/70 text-amber-300 border border-amber-800/80'
                              : op.category === 'internship'
                              ? 'bg-blue-950/70 text-blue-300 border border-blue-800/80'
                              : op.category === 'opensource'
                              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80'
                              : 'bg-fuchsia-950/70 text-fuchsia-300 border border-fuchsia-800/80'
                          }`}
                        >
                          {op.category === 'opensource' ? 'Open Source' : op.category}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/80 border border-red-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Expired {daysOverdue}d ago</span>
                        </span>
                      </div>

                      {/* Title + Organization */}
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">{op.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{op.organization}</p>
                      </div>

                      {/* Deadline text */}
                      <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                        <span>Original Deadline:</span>
                        <strong className="text-slate-200">{formatDeadline(op.deadline)}</strong>
                      </div>

                      {/* Touch action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          onClick={() => handleExtendDeadline(op, 14)}
                          className="flex-1 py-1.5 px-2 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/70 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>+14d</span>
                        </button>

                        <button
                          onClick={() => handleEditOpportunity(op)}
                          className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setDeleteTarget(op)}
                          className="flex-1 py-1.5 px-2 bg-red-950/60 hover:bg-red-900/70 text-red-300 border border-red-800/70 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: ALL OPPORTUNITIES (Matching Image 3)
         ========================================================================= */}
      {activeTab === 'manage' && (
        <div className="space-y-5">
          {/* Header line */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Opportunity Catalog Management</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                View, edit, toggle visibility, and soft-delete opportunity records.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingOpportunityId(null);
                setActiveTab('create');
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors shadow-xs shadow-violet-600/20 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Opportunity</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search opportunities by title, organization, domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-44 py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="hackathon">Hackathon</option>
              <option value="internship">Internship</option>
              <option value="research">Research</option>
              <option value="opensource">Open Source</option>
            </select>

            <button
              onClick={() => {}}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors shrink-0"
            >
              Search
            </button>
          </div>

          {/* Full Opportunities Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            {/* Desktop Table: md+ screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">OPPORTUNITY</th>
                    <th className="py-3 px-4">CATEGORY</th>
                    <th className="py-3 px-4">ORGANIZATION</th>
                    <th className="py-3 px-4">DEADLINE</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4">SOURCE</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredOpportunities.map((op) => (
                    <tr key={op.id} className="hover:bg-slate-850/80 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <span className="font-semibold text-white truncate block text-xs">
                          {op.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                          {op.domains.slice(0, 2).join(', ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                            op.category === 'hackathon'
                              ? 'bg-violet-950/70 text-violet-300 border border-violet-800/80'
                              : op.category === 'internship'
                              ? 'bg-blue-950/70 text-blue-300 border border-blue-800/80'
                              : op.category === 'opensource'
                              ? 'bg-amber-950/70 text-amber-300 border border-amber-800/80'
                              : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80'
                          }`}
                        >
                          {op.category === 'opensource' ? 'Open Source' : op.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-xs truncate max-w-xs whitespace-nowrap">
                        {op.organization}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300 text-xs whitespace-nowrap">
                        {formatDeadline(op.deadline)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getDeadlineBadge(op.deadline)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {op.source.includes('AI') ? 'AI AGENT' : 'MANUAL'}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => onSelectOpportunity?.(op)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 inline-block transition-colors"
                          title="Preview details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(op)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 inline-block transition-colors"
                          title="Archive listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOpportunities.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                        No opportunities matching current search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile All Opportunities Cards (< md breakpoint: zero horizontal scrolling) */}
            <div className="block md:hidden divide-y divide-slate-800/80">
              {filteredOpportunities.map((op) => (
                <div
                  key={op.id}
                  className="p-4 space-y-3 hover:bg-slate-850/50 transition-colors"
                >
                  {/* Top row: Category + Deadline Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                        op.category === 'hackathon'
                          ? 'bg-violet-950/70 text-violet-300 border border-violet-800/80'
                          : op.category === 'internship'
                          ? 'bg-blue-950/70 text-blue-300 border border-blue-800/80'
                          : op.category === 'opensource'
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80'
                          : 'bg-amber-950/70 text-amber-300 border border-amber-800/80'
                      }`}
                    >
                      {op.category === 'opensource' ? 'Open Source' : op.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {getDeadlineBadge(op.deadline)}
                      <span className="text-[10px] font-mono text-slate-400">
                        {op.source.includes('AI') ? 'AI' : 'Manual'}
                      </span>
                    </div>
                  </div>

                  {/* Title + Org */}
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">{op.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{op.organization}</p>
                  </div>

                  {/* Deadline row */}
                  <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                    <span>Deadline:</span>
                    <strong className="text-slate-200">{formatDeadline(op.deadline)}</strong>
                  </div>

                  {/* Action buttons row */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => onSelectOpportunity?.(op)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingOpportunityId(op.id);
                        setActiveTab('create');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeleteTarget(op)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Archive</span>
                    </button>
                  </div>
                </div>
              ))}
              {filteredOpportunities.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No opportunities matching current search or filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: AI REVIEW QUEUE (Matching Image 4)
         ========================================================================= */}
      {activeTab === 'review' && (
        <div className="space-y-5">
          {/* Header line */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">AI Discovery Review Queue</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                    {reviewQueue.length} Pending
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review, verify, correct, or reject automated candidate opportunities before they become visible to students.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setIsExtractorOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-semibold text-white transition-all shadow-xs shadow-indigo-600/25"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Import from PDF / Links</span>
              </button>

              <button
                onClick={fetchAdminData}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Queue</span>
              </button>
            </div>
          </div>

          {/* List of Review Candidate Cards */}
          <div className="space-y-4">
            {reviewQueue.map((op) => (
              <div
                key={op.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4"
              >
                {/* Top Row: Category + Org + Source + Confidence Badge + Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                        op.category === 'hackathon'
                          ? 'bg-violet-950/70 text-violet-300 border border-violet-800/80'
                          : op.category === 'internship'
                          ? 'bg-blue-950/70 text-blue-300 border border-blue-800/80'
                          : op.category === 'opensource'
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-800/80'
                          : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80'
                      }`}
                    >
                      {op.category === 'opensource' ? 'Open Source' : op.category}
                    </span>
                    <span className="text-xs font-semibold text-white">{op.organization}</span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="text-xs text-slate-400">{op.source}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-bold">
                      {Math.round((op.confidence || 0.92) * 100)}% Confidence
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Discovered {new Date(op.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{op.name}</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{op.description}</p>
                </div>

                {/* 4-column Specification Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                      DEADLINE
                    </span>
                    <span className="font-semibold text-white mt-0.5 block font-mono">
                      {formatDeadline(op.deadline)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                      MODE & LOCATION
                    </span>
                    <span className="font-semibold text-white mt-0.5 block capitalize truncate">
                      {op.mode} • {op.location}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                      DOMAINS
                    </span>
                    <span className="font-semibold text-slate-300 mt-0.5 block truncate">
                      {op.domains?.join(', ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                      OFFICIAL LINK
                    </span>
                    <a
                      href={op.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-medium mt-0.5"
                    >
                      <span>Verify link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2.5 pt-2">
                  <button
                    onClick={() => handleRejectReview(op.id)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleEditAndApprove(op)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit & Approve</span>
                  </button>

                  <button
                    onClick={() => handleApproveReview(op.id)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-colors shadow-xs shadow-violet-600/30"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Publish</span>
                  </button>
                </div>
              </div>
            ))}

            {reviewQueue.length === 0 && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Review Queue is Clear</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  All automated AI extractions have been processed. Trigger AI Discovery to fetch new candidate opportunities.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={() => setIsExtractorOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-xs shadow-indigo-600/20"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Import from PDF or Links</span>
                  </button>

                  <button
                    onClick={handleRunAIDiscovery}
                    disabled={runningJob}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Trigger AI Discovery</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: + NEW OPPORTUNITY (Matching Image 5)
         ========================================================================= */}
      {activeTab === 'create' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Top Line: Back to Opportunities | Status */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <button
              onClick={() => setActiveTab('manage')}
              className="inline-flex items-center space-x-1 text-slate-300 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Opportunities</span>
            </button>
            <span className="font-mono text-slate-400">Status: Manual Admin Input</span>
          </div>

          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editingOpportunityId ? 'Edit Opportunity' : 'Add New Opportunity'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {editingOpportunityId
                  ? 'Update details, deadlines, links, and category-specific parameters.'
                  : 'Choose the opportunity category to dynamically adapt form fields.'}
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-6 text-xs">
              {/* 1. SELECT CATEGORY */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-2.5">
                  1. SELECT CATEGORY
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'hackathon', label: 'Hackathon', desc: 'Coding sprints, ideathons', icon: Award },
                    { id: 'internship', label: 'Internship', desc: 'SWE, AI, quant roles', icon: Briefcase },
                    { id: 'research', label: 'Research', desc: 'Labs, fellowships', icon: GraduationCap },
                    { id: 'opensource', label: 'Open Source', desc: 'GSoC, LFX, contributor tracks', icon: GitPullRequest },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = formData.category === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setFormData({ ...formData, category: item.id as any })}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-violet-950/40 border-violet-500 text-white shadow-xs shadow-violet-500/10'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? 'bg-violet-900/60 text-violet-300'
                                : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-white block text-sm">{item.label}</span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">{item.desc}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. COMMON OPPORTUNITY INFORMATION */}
              <div className="space-y-3.5 pt-4 border-t border-slate-800/80">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  2. COMMON OPPORTUNITY INFORMATION
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Opportunity Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HackMIT 2026 or Frontier AI Intern"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Organization / Host *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MIT CS, Google DeepMind, OpenAI"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Detailed Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Comprehensive description of the challenge, role specifications, or fellowship scope..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Official Website URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={formData.officialUrl}
                      onChange={(e) => setFormData({ ...formData, officialUrl: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Direct Registration / Apply URL (optional)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.registrationUrl}
                      onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Deadlines & Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Application Deadline *</label>
                    <input
                      type="date"
                      required
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Start Date (optional)</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">End Date (optional)</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Work Mode, Scope, Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Work Mode</label>
                    <select
                      value={formData.mode}
                      onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="online">Online / Virtual</option>
                      <option value="offline">Offline / On-site</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Geography Scope</label>
                    <select
                      value={formData.geography}
                      onChange={(e) => setFormData({ ...formData, geography: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="international">International (Global)</option>
                      <option value="national">National</option>
                      <option value="regional">Regional</option>
                      <option value="university">University Specific</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Physical Location</label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco, CA or Cambridge, MA"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Domains & Logo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Target Domains (comma separated)</label>
                    <input
                      type="text"
                      placeholder="AI/ML, Web Development, Robotics, Cloud"
                      value={formData.domains}
                      onChange={(e) => setFormData({ ...formData, domains: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Logo Image URL (optional)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Eligibility Criteria</label>
                  <input
                    type="text"
                    value={formData.eligibility}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 3. CATEGORY SPECIFIC PARAMETERS */}
              <div className="space-y-3.5 pt-4 border-t border-slate-800/80">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  3. {formData.category.toUpperCase()} SPECIFIC PARAMETERS
                </label>

                {formData.category === 'hackathon' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Team Size</label>
                      <input
                        type="text"
                        placeholder="e.g. 1-4 Members"
                        value={formData.teamSize}
                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Prize Pool</label>
                      <input
                        type="text"
                        placeholder="e.g. $45,000 in Prizes & Grants"
                        value={formData.prizePool}
                        onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Competition Type</label>
                      <select
                        value={formData.competitionType}
                        onChange={(e) => setFormData({ ...formData, competitionType: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Hackathon">Hackathon</option>
                        <option value="Ideathon">Ideathon</option>
                        <option value="Datathon">Datathon</option>
                        <option value="Innovation Challenge">Innovation Challenge</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.category === 'internship' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Role Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Machine Learning Engineer Intern"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Stipend / Compensation</label>
                      <input
                        type="text"
                        placeholder="e.g. $9,000/month + Housing"
                        value={formData.stipend}
                        onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 12 Weeks (Summer 2027)"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {formData.category === 'research' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Professor / Lab Director</label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Jane Doe"
                        value={formData.professor}
                        onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Research Area</label>
                      <input
                        type="text"
                        placeholder="e.g. Agentic AI & Reasoning"
                        value={formData.researchArea}
                        onChange={(e) => setFormData({ ...formData, researchArea: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Funding / Grant</label>
                      <input
                        type="text"
                        placeholder="e.g. $6,000 Semester Grant"
                        value={formData.funding}
                        onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {formData.category === 'opensource' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Program Type / Track</label>
                      <input
                        type="text"
                        placeholder="e.g. Mentorship Program, Fellowship, Bug Bounty"
                        value={formData.programType}
                        onChange={(e) => setFormData({ ...formData, programType: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Stipend / Grants / Perks</label>
                      <input
                        type="text"
                        placeholder="e.g. $3,000 Stipend + Mentorship"
                        value={formData.stipend}
                        onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Repository / Project URL</label>
                      <input
                        type="url"
                        placeholder="e.g. https://github.com/organization/repo"
                        value={formData.projectUrl}
                        onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setActiveTab('manage')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
                >
                  Save Draft
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors shadow-xs shadow-violet-600/30 disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>
                    {loading
                      ? editingOpportunityId
                        ? 'Saving Changes...'
                        : 'Publishing...'
                      : editingOpportunityId
                      ? 'Save Changes'
                      : 'Publish Opportunity'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: ADMIN MANAGEMENT (ADD OTHER ADMINS)
         ========================================================================= */}
      {activeTab === 'admins' && (
        <AdminManagementPanel
          currentUser={currentUser}
          onRefreshStats={fetchAdminData}
        />
      )}

      {/* =========================================================================
          TAB 7: USER FEEDBACKS & BUG REPORTS
         ========================================================================= */}
      {activeTab === 'feedbacks' && (
        <AdminFeedbackPanel
          currentUser={currentUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-400 flex items-center justify-center border border-rose-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Archive Opportunity?</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to archive <span className="text-white font-semibold">{deleteTarget.name}</span>? This will remove it from active student search radars.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal for Past Dues */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-800 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-950 text-red-400 flex items-center justify-center border border-red-800">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">Remove All Past Due Opportunities?</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This will permanently delete <span className="text-red-400 font-bold">{pastDueOpportunities.length} expired opportunities</span> from the database. Students will no longer see these in the table or category pages.
              </p>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              {pastDueOpportunities.map((op) => (
                <div key={op.id} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800/50 last:border-0">
                  <span className="truncate max-w-[240px] text-white">{op.name}</span>
                  <span className="text-red-400 font-mono text-[10px] shrink-0">Closed {formatDeadline(op.deadline)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={bulkDeleting}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDeletePastDues}
                disabled={bulkDeleting}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-xs transition-colors disabled:opacity-50 inline-flex items-center space-x-1.5"
              >
                {bulkDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI PDF & Link Extractor Modal */}
      <AIExtractorModal
        isOpen={isExtractorOpen}
        onClose={() => setIsExtractorOpen(false)}
        onSuccess={handleExtractorSuccess}
      />
    </div>
  );
};
