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
      <div className="overflow-x-auto">
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
              
              // Status formatting matching Screenshot 3
              const statusPill = (() => {
                if (op.status === 'closing_soon') {
                  return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-950/70 text-amber-300 border border-amber-800/80 shadow-xs">
                      closing_soon
                    </span>
                  );
                }
                if (op.status === 'closed') {
                  return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700">
                      closed
                    </span>
                  );
                }
                return (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 shadow-xs">
                    open
                  </span>
                );
              })();

              const categoryLabel = op.category.charAt(0).toUpperCase() + op.category.slice(1);

              return (
                <tr
                  key={op.id}
                  onClick={() => onViewDetails(op)}
                  className="hover:bg-slate-850/90 cursor-pointer transition-colors group"
                >
                  {/* TITLE & ORG */}
                  <td className="py-3.5 px-5 max-w-sm">
                    <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors text-sm line-clamp-1">
                      {op.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-1 font-medium">
                      {op.organization}
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-medium text-xs">
                    {categoryLabel}
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium font-mono bg-slate-800/90 text-slate-300 border border-slate-700">
                      {op.verificationStatus || 'verified'}
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
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs transition-colors border border-slate-700/60 ml-1"
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
    </div>
  );
};
