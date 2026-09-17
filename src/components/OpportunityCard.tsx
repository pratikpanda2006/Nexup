import React from 'react';
import { 
  Bookmark, 
  Bell, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Users, 
  Award, 
  DollarSign, 
  Sparkles,
  CheckCircle2,
  ExternalLink,
  GitPullRequest
} from 'lucide-react';
import { Opportunity } from '../types';
import { getDeadlineBadgeInfo, getCategoryBadge, formatDeadline } from '../utils';

interface OpportunityCardProps {
  opportunity: Opportunity;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onOpenReminder: (op: Opportunity) => void;
  onViewDetails: (op: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  isBookmarked,
  onToggleBookmark,
  onOpenReminder,
  onViewDetails,
}) => {
  const deadlineBadge = getDeadlineBadgeInfo(opportunity.deadline, opportunity.status);
  const categoryBadge = getCategoryBadge(opportunity.category);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between overflow-hidden group">
      {/* Header Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <img
              src={opportunity.logoUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80'}
              alt={opportunity.organization}
              className="w-10 h-10 rounded-xl object-cover border border-slate-750 shrink-0 bg-slate-800"
              loading="lazy"
            />
            <div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${categoryBadge.bgClass} ${categoryBadge.textClass} ${categoryBadge.borderClass}`}>
                {categoryBadge.label}
              </span>
              <p className="text-xs text-slate-400 font-medium line-clamp-1 mt-0.5">
                {opportunity.organization}
              </p>
            </div>
          </div>

          {/* Action buttons: Bookmark & Reminder */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenReminder(opportunity);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
              title="Set deadline reminder"
              aria-label="Set reminder"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(opportunity.id);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-blue-400 bg-blue-950/70 border border-blue-800/60'
                  : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Save opportunity'}
              aria-label="Bookmark opportunity"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Opportunity Title */}
        <h3
          onClick={() => onViewDetails(opportunity)}
          className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer mb-2"
        >
          {opportunity.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Category specific highlight */}
        <div className="mb-4 text-xs font-medium text-slate-200 bg-slate-800/80 p-2.5 rounded-xl border border-slate-750 flex items-center gap-2">
          {opportunity.category === 'hackathon' && (
            <>
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{opportunity.prizePool || 'Certificates & Venture Track'}</span>
            </>
          )}
          {opportunity.category === 'internship' && (
            <>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{opportunity.stipend || 'Competitive Compensation'}</span>
            </>
          )}
          {opportunity.category === 'research' && (
            <>
              <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="truncate">{opportunity.funding || opportunity.researchArea || 'Research Fellowship'}</span>
            </>
          )}
          {opportunity.category === 'opensource' && (
            <>
              <GitPullRequest className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{opportunity.stipend || opportunity.programType || 'Open Source Contributor Track'}</span>
            </>
          )}
        </div>

        {/* Domains / Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {opportunity.domains.slice(0, 3).map((domain) => (
            <span
              key={domain}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
            >
              {domain}
            </span>
          ))}
          {opportunity.domains.length > 3 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-800/60 text-slate-400 border border-slate-700/50">
              +{opportunity.domains.length - 3}
            </span>
          )}
        </div>

        {/* Location & Mode */}
        <div className="flex items-center text-[11px] text-slate-400 space-x-3 mb-1">
          <div className="flex items-center space-x-1 truncate">
            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{opportunity.location}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <span className="capitalize shrink-0 font-medium text-slate-300">{opportunity.mode}</span>
        </div>
      </div>

      {/* Footer: Deadline & Action */}
      <div className="px-5 py-3.5 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${deadlineBadge.dotColor}`}></span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${deadlineBadge.colorClass}`}>
            {deadlineBadge.label}
          </span>
        </div>

        <button
          onClick={() => onViewDetails(opportunity)}
          className="inline-flex items-center space-x-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
