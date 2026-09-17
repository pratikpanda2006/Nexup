import React from 'react';
import { 
  Bookmark, 
  Bell, 
  ExternalLink, 
  ArrowRight, 
  MapPin, 
  Calendar,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { Opportunity } from '../types';
import { formatDeadline } from '../utils';

interface OpportunityTableProps {
  opportunities: Opportunity[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  onOpenReminder: (op: Opportunity) => void;
  onViewDetails: (op: Opportunity) => void;
}

export const OpportunityTable: React.FC<OpportunityTableProps> = ({
  opportunities,
  bookmarkedIds,
  onToggleBookmark,
  onOpenReminder,
  onViewDetails,
}) => {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* =========================================================================
          DESKTOP DATA TABLE (Visible on md+ screens: laptops / desktops)
         ========================================================================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-5 font-semibold">TITLE & ORG</th>
              <th className="py-3.5 px-4 font-semibold">CATEGORY</th>
              <th className="py-3.5 px-4 font-semibold">DEADLINE</th>
              <th className="py-3.5 px-4 font-semibold">STATUS</th>
              <th className="py-3.5 px-4 font-semibold">VERIFICATION</th>
              <th className="py-3.5 px-5 font-semibold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 font-sans">
            {opportunities.map((op) => {
              const isBookmarked = bookmarkedIds.has(op.id);
              
              // Status formatting with micro status dot
              const statusPill = (() => {
                if (op.status === 'closing_soon') {
                  return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-amber-950/50 text-amber-300 border border-amber-800/60 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      <span>Closing soon</span>
                    </span>
                  );
                }
                if (op.status === 'closed') {
                  return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-900 text-slate-400 border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                      <span>Closed</span>
                    </span>
                  );
                }
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Active</span>
                  </span>
                );
              })();

              const categoryBadgeClass =
                op.category === 'hackathon'
                  ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                  : op.category === 'internship'
                  ? 'bg-blue-950/50 text-cyan-300 border-blue-800/60'
                  : op.category === 'opensource'
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                  : 'bg-purple-950/50 text-purple-300 border-purple-800/60';

              const categoryLabel =
                op.category === 'opensource'
                  ? 'Open Source'
                  : op.category.charAt(0).toUpperCase() + op.category.slice(1);

              return (
                <tr
                  key={op.id}
                  onClick={() => onViewDetails(op)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  {/* TITLE & ORG */}
                  <td className="py-3.5 px-5 max-w-sm">
                    <div className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors text-sm line-clamp-1">
                      {op.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-1 font-medium">
                      {op.organization}
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded border ${categoryBadgeClass}`}>
                      {categoryLabel}
                    </span>
                  </td>

                  {/* DEADLINE */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-mono text-xs">
                    {formatDeadline(op.deadline)}
                  </td>

                  {/* STATUS */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {statusPill}
                  </td>

                  {/* VERIFICATION */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-semibold bg-slate-950/80 text-slate-300 border border-slate-800">
                      <CheckCircle2 className="w-3 h-3 text-blue-400" />
                      <span>{op.verificationStatus || 'verified'}</span>
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td
                    className="py-3.5 px-5 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end space-x-1.5">
                      {/* External Link */}
                      <a
                        href={op.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                        title="Visit Official Website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {/* Reminder Bell */}
                      <button
                        onClick={() => onOpenReminder(op)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        title="Set deadline reminder"
                      >
                        <Bell className="w-4 h-4" />
                      </button>

                      {/* Bookmark */}
                      <button
                        onClick={() => onToggleBookmark(op.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBookmarked
                            ? 'text-blue-400 bg-blue-950/60 border border-blue-800/50'
                            : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                        }`}
                        title={isBookmarked ? 'Saved in bookmarks' : 'Bookmark opportunity'}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>

                      {/* View Details button */}
                      <button
                        onClick={() => onViewDetails(op)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs transition-colors border border-slate-700/60 ml-1 cursor-pointer"
                      >
                        View More
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* =========================================================================
          MOBILE CARD LIST (Visible on < md screens: phones & small tablets)
          Zero horizontal scrolling! Touch-friendly, comfortable reading experience
         ========================================================================= */}
      <div className="block md:hidden divide-y divide-slate-800/80">
        {opportunities.map((op) => {
          const isBookmarked = bookmarkedIds.has(op.id);

          const categoryBadgeClass =
            op.category === 'hackathon'
              ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
              : op.category === 'internship'
              ? 'bg-blue-950/50 text-cyan-300 border-blue-800/60'
              : op.category === 'opensource'
              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
              : 'bg-purple-950/50 text-purple-300 border-purple-800/60';

          const categoryLabel =
            op.category === 'opensource'
              ? 'Open Source'
              : op.category.charAt(0).toUpperCase() + op.category.slice(1);

          return (
            <div
              key={op.id}
              onClick={() => onViewDetails(op)}
              className="p-4 space-y-3 hover:bg-slate-850/50 transition-colors cursor-pointer"
            >
              {/* Top Row: Category + Status */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${categoryBadgeClass}`}>
                  {categoryLabel}
                </span>

                {op.status === 'closing_soon' ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-amber-950/50 text-amber-300 border border-amber-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>Closing soon</span>
                  </span>
                ) : op.status === 'closed' ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-950 text-slate-500 border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    <span>Closed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Active</span>
                  </span>
                )}
              </div>

              {/* Middle Row: Title & Organization */}
              <div>
                <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                  {op.name}
                </h4>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {op.organization}
                </p>
              </div>

              {/* Meta row: Deadline & Location */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                <span>
                  Deadline: <strong className="text-slate-200">{formatDeadline(op.deadline)}</strong>
                </span>
                <span className="capitalize text-slate-400">
                  {op.mode} • {op.geography}
                </span>
              </div>

              {/* Action Buttons Row */}
              <div
                className="flex items-center justify-between pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-1">
                  {/* Bookmark Button */}
                  <button
                    onClick={() => onToggleBookmark(op.id)}
                    className={`p-2 rounded-xl border transition-colors ${
                      isBookmarked
                        ? 'text-blue-400 bg-blue-950/60 border-blue-800/60'
                        : 'text-slate-400 hover:text-white bg-slate-800/70 border-slate-700/60'
                    }`}
                    title={isBookmarked ? 'Saved' : 'Save'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>

                  {/* Reminder Button */}
                  <button
                    onClick={() => onOpenReminder(op)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/70 border border-slate-700/60 transition-colors"
                    title="Set reminder"
                  >
                    <Bell className="w-4 h-4" />
                  </button>

                  {/* Official URL */}
                  <a
                    href={op.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/70 border border-slate-700/60 transition-colors"
                    title="Official site"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <button
                  onClick={() => onViewDetails(op)}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
