import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft,
  ExternalLink, 
  Bookmark, 
  Bell, 
  MapPin, 
  Calendar, 
  Users, 
  Award, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Share2,
  Clock,
  Briefcase,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Bot,
  GitPullRequest
} from 'lucide-react';
import { Opportunity, EligibilityResult, User } from '../types';
import { getDeadlineBadgeInfo, getCategoryBadge, formatDeadline, formatDateRange } from '../utils';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onOpenReminder: (op: Opportunity) => void;
  currentUser: User | null;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onOpenReminder,
  currentUser,
}) => {
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!opportunity) return null;

  const deadlineBadge = getDeadlineBadgeInfo(opportunity.deadline, opportunity.status);
  const categoryBadge = getCategoryBadge(opportunity.category);

  const handleRunEligibilityCheck = async () => {
    setCheckingEligibility(true);
    try {
      const res = await fetch('/api/ai/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: opportunity.id,
          profile: {
            skills: currentUser?.skills || ['Python', 'React', 'PyTorch'],
            interests: currentUser?.interests || ['AI/ML', 'Software'],
            education: currentUser?.education || 'Computer Science Student',
          },
        }),
      });
      const data = await res.json();
      if (data.data) {
        setEligibilityResult(data.data);
      }
    } catch (err) {
      console.error('Eligibility check error:', err);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-800 text-slate-100 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all mr-1 group cursor-pointer"
              title="Go back (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-blue-400" />
              <span>Back</span>
            </button>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${categoryBadge.bgClass} ${categoryBadge.textClass} ${categoryBadge.borderClass}`}>
              {categoryBadge.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${deadlineBadge.colorClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${deadlineBadge.dotColor}`}></span>
              {deadlineBadge.label}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenReminder(opportunity)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
              title="Set reminder"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleBookmark(opportunity.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-blue-400 bg-blue-950/70 border border-blue-800/60'
                  : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
              }`}
              title={isBookmarked ? 'Saved in bookmarks' : 'Save bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Main Title & Organization Banner */}
          <div className="flex items-start gap-3 sm:gap-4">
            <img
              src={opportunity.logoUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80'}
              alt={opportunity.organization}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-750 shrink-0 bg-slate-800 shadow-md"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight break-words">
                {opportunity.name}
              </h2>
              <p className="text-sm font-semibold text-slate-400 mt-1">
                {opportunity.organization}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {opportunity.location} ({opportunity.mode})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Deadline: <strong className="text-slate-200">{formatDeadline(opportunity.deadline)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics Quick Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">
                {opportunity.category === 'hackathon'
                  ? 'Prize Pool'
                  : opportunity.category === 'internship'
                  ? 'Stipend'
                  : opportunity.category === 'opensource'
                  ? 'Stipend / Grant'
                  : 'Funding'}
              </span>
              <span className="font-bold text-white text-sm mt-0.5 block truncate">
                {opportunity.prizePool ||
                  opportunity.stipend ||
                  opportunity.funding ||
                  (opportunity.category === 'opensource' ? 'Community Grants' : 'Academic Bursary')}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">
                {opportunity.category === 'hackathon'
                  ? 'Team Format'
                  : opportunity.category === 'internship'
                  ? 'Duration'
                  : opportunity.category === 'opensource'
                  ? 'Program Track'
                  : 'Position'}
              </span>
              <span className="font-bold text-white text-sm mt-0.5 block truncate">
                {opportunity.teamSize ||
                  opportunity.duration ||
                  opportunity.programType ||
                  opportunity.positionType ||
                  (opportunity.category === 'opensource' ? 'Contributor Fellowship' : '1-4 Members')}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Event Dates</span>
              <span className="font-bold text-white text-xs mt-1 block truncate">
                {formatDateRange(opportunity.startDate, opportunity.endDate)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">Scope</span>
              <span className="font-bold text-white text-xs mt-1 block capitalize">
                {opportunity.geography}
              </span>
            </div>
          </div>

          {/* About Description */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-2">
              About This Opportunity
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </p>
          </div>

          {/* Important Dates Timeline */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-3">
              Timeline & Critical Cutoffs
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/60">
                <span className="text-[10px] font-bold text-blue-300 block">Registration Cutoff</span>
                <span className="font-semibold text-white">{formatDeadline(opportunity.deadline)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-violet-950/40 border border-violet-800/60">
                <span className="text-[10px] font-bold text-violet-300 block">Start Date</span>
                <span className="font-semibold text-white">{formatDeadline(opportunity.startDate)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block">Conclusion</span>
                <span className="font-semibold text-white">{formatDeadline(opportunity.endDate)}</span>
              </div>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-2">
              Eligibility & Candidate Requirements
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{opportunity.eligibility}</span>
            </div>
          </div>

          {/* Target Domains and Skills */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-2">
              Target Tech Stack & Domains
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.domains.map((d) => (
                <span
                  key={d}
                  className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/70"
                >
                  {d}
                </span>
              ))}
              {opportunity.skills.map((s) => (
                <span
                  key={s}
                  className="text-xs font-mono font-medium px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive AI Fit & Eligibility Advisor */}
          <div className="p-4 rounded-xl border border-indigo-800/70 bg-gradient-to-br from-indigo-950/60 to-purple-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">
                  Nexup AI Eligibility & Profile Matcher
                </h4>
              </div>
              <button
                onClick={handleRunEligibilityCheck}
                disabled={checkingEligibility}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{checkingEligibility ? 'Analyzing...' : 'Am I Eligible?'}</span>
              </button>
            </div>

            {eligibilityResult ? (
              <div className="bg-slate-900 p-3.5 rounded-xl border border-indigo-800/60 text-xs space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Readiness Match:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-indigo-400 text-sm">
                      {eligibilityResult.score}%
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {eligibilityResult.verdict}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300">{eligibilityResult.summary}</p>

                {eligibilityResult.strengths.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-200 block text-[11px]">Matched Strengths:</span>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5 mt-0.5">
                      {eligibilityResult.strengths.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {eligibilityResult.recommendations.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-200 block text-[11px]">Preparation Advice:</span>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5 mt-0.5">
                      {eligibilityResult.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-300">
                Click “Am I Eligible?” to let Gemini evaluate your skills and resume background against {opportunity.organization}’s selection criteria.
              </p>
            )}
          </div>
        </div>

        {/* Fixed Footer with Official Action Buttons */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          <div className="text-xs text-slate-400 self-start sm:self-auto">
            Source: <span className="font-medium text-slate-300">{opportunity.source}</span>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            {opportunity.projectUrl && (
              <a
                href={opportunity.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl border border-amber-800/80 bg-amber-950/50 hover:bg-amber-900/60 text-xs font-semibold text-amber-300 transition-colors"
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Repository</span>
              </a>
            )}

            <button
              onClick={() => onOpenReminder(opportunity)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-indigo-400" />
              <span>Set Reminder</span>
            </button>

            <a
              href={opportunity.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
