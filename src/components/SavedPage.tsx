import React, { useState } from 'react';
import { Opportunity, OpportunityCategory } from '../types';
import { OpportunityCard } from './OpportunityCard';
import { OpportunityTable } from './OpportunityTable';
import { Bookmark, ArrowRight, ArrowLeft, FolderHeart, Table as TableIcon, LayoutGrid } from 'lucide-react';

interface SavedPageProps {
  savedOpportunities: Opportunity[];
  onToggleBookmark: (id: string) => void;
  onOpenReminder: (op: Opportunity) => void;
  onViewDetails: (op: Opportunity) => void;
  onExplore: () => void;
  onGoBack?: () => void;
  previousTabName?: string;
}

export const SavedPage: React.FC<SavedPageProps> = ({
  savedOpportunities,
  onToggleBookmark,
  onOpenReminder,
  onViewDetails,
  onExplore,
  onGoBack,
  previousTabName,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | OpportunityCategory>('all');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const filtered = savedOpportunities.filter((op) => {
    if (activeTab === 'all') return true;
    return op.category === activeTab;
  });

  const categories = [
    { id: 'all', label: 'All Saved', count: savedOpportunities.length },
    {
      id: 'hackathon',
      label: 'Hackathons',
      count: savedOpportunities.filter((o) => o.category === 'hackathon').length,
    },
    {
      id: 'internship',
      label: 'Internships',
      count: savedOpportunities.filter((o) => o.category === 'internship').length,
    },
    {
      id: 'research',
      label: 'Research',
      count: savedOpportunities.filter((o) => o.category === 'research').length,
    },
  ];

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        {onGoBack && (
          <div className="mb-4">
            <button
              type="button"
              onClick={onGoBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 text-xs font-semibold transition-all shadow-xs group cursor-pointer"
              title={`Return to ${previousTabName || 'previous step'}`}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-blue-400" />
              <span>Back to {previousTabName || 'Dashboard'}</span>
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                My Saved Opportunities
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Personal workspace to organize upcoming applications and track active deadlines.
              </p>
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="text-[11px]">Table</span>
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 font-semibold transition-all ${
                viewMode === 'card'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px]">Cards</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                activeTab === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === cat.id ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid, Table or Empty */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center max-w-lg mx-auto shadow-xl">
          <FolderHeart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No saved opportunities yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Browse hackathons, internships, or research programs and click the bookmark icon to keep them organized here.
          </p>
          <button
            onClick={onExplore}
            className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-500/20 transition-all"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <OpportunityTable
          opportunities={filtered}
          bookmarkedIds={new Set(savedOpportunities.map((o) => o.id))}
          onToggleBookmark={onToggleBookmark}
          onOpenReminder={onOpenReminder}
          onViewDetails={onViewDetails}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((op) => (
            <OpportunityCard
              key={op.id}
              opportunity={op}
              isBookmarked={true}
              onToggleBookmark={onToggleBookmark}
              onOpenReminder={onOpenReminder}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};
