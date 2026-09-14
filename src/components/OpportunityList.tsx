import React, { useState, useEffect } from 'react';
import { Opportunity, FilterState, OpportunityCategory } from '../types';
import { FilterBar } from './FilterBar';
import { OpportunityCard } from './OpportunityCard';
import { OpportunityTable } from './OpportunityTable';
import { ChevronLeft, ChevronRight, Inbox, Sparkles, ArrowLeft } from 'lucide-react';

interface OpportunityListProps {
  category: OpportunityCategory | 'all';
  opportunities: Opportunity[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  onOpenReminder: (op: Opportunity) => void;
  onViewDetails: (op: Opportunity) => void;
  initialViewMode?: 'table' | 'card';
  onGoBack?: () => void;
  previousTabName?: string;
}

export const OpportunityList: React.FC<OpportunityListProps> = ({
  category,
  opportunities,
  bookmarkedIds,
  onToggleBookmark,
  onOpenReminder,
  onViewDetails,
  initialViewMode = 'table', // default to table as requested
  onGoBack,
  previousTabName,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>(initialViewMode);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const [filters, setFilters] = useState<FilterState>({
    category: category,
    search: '',
    domain: 'all',
    mode: 'all',
    geography: 'all',
    status: 'all',
    sortBy: 'deadline_asc',
  });

  // Whenever category or initialViewMode changes, ensure viewMode is set to table and filters match
  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
    setFilters((prev) => ({
      ...prev,
      category: category,
      search: '',
    }));
    setPage(1);
  }, [category, initialViewMode]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      category: category,
      search: '',
      domain: 'all',
      mode: 'all',
      geography: 'all',
      status: 'all',
      sortBy: 'deadline_asc',
    });
    setPage(1);
  };

  // Filter opportunities in memory
  const filtered = opportunities.filter((op) => {
    if (category !== 'all' && op.category !== category) return false;
    if (filters.domain !== 'all' && !op.domains.includes(filters.domain)) return false;
    if (filters.mode !== 'all' && op.mode !== filters.mode) return false;
    if (filters.geography !== 'all' && op.geography !== filters.geography) return false;
    if (filters.status !== 'all' && op.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchName = op.name.toLowerCase().includes(q);
      const matchOrg = op.organization.toLowerCase().includes(q);
      const matchDomain = op.domains.some((d) => d.toLowerCase().includes(q));
      const matchSkill = op.skills.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchOrg && !matchDomain && !matchSkill) return false;
    }
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (filters.sortBy === 'deadline_asc') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (filters.sortBy === 'popularity') {
      return b.bookmarksCount - a.bookmarksCount;
    }
    if (filters.sortBy === 'start_date') {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
    if (filters.sortBy === 'organization') {
      return a.organization.localeCompare(b.organization);
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getCategoryTitle = () => {
    switch (category) {
      case 'hackathon':
        return {
          title: 'Student Hackathons & Sprints',
          description: 'Collegiate competitions, code sprints, and venture prize challenges in structured summary view.',
        };
      case 'internship':
        return {
          title: 'Internships & Lab Co-ops',
          description: 'Software engineering, AI research, and systems engineering roles in structured summary view.',
        };
      case 'research':
        return {
          title: 'Academic Research & Fellowships',
          description: 'Faculty-led lab assistantships, summer research fellowships, and publication programs in structured summary view.',
        };
      default:
        return {
          title: 'All Student Opportunities',
          description: 'Complete summary directory of vetted hackathons, internships, and research programs.',
        };
    }
  };

  const headerInfo = getCategoryTitle();

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      {/* Category Header */}
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
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {headerInfo.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1">{headerInfo.description}</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700 font-mono shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>
              <strong className="text-white">{sorted.length}</strong> active listings
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalResults={sorted.length}
        activeCategory={category}
      />

      {/* Results View: Summary Table or Card */}
      {paginated.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center shadow-xl">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No opportunities match your filter</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing specific domain filters, or switching to all statuses.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm shadow-blue-500/20"
          >
            Reset all filters
          </button>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((op) => (
            <OpportunityCard
              key={op.id}
              opportunity={op}
              isBookmarked={bookmarkedIds.has(op.id)}
              onToggleBookmark={onToggleBookmark}
              onOpenReminder={onOpenReminder}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <OpportunityTable
          opportunities={paginated}
          bookmarkedIds={bookmarkedIds}
          onToggleBookmark={onToggleBookmark}
          onOpenReminder={onOpenReminder}
          onViewDetails={onViewDetails}
        />
      )}

      {/* Pagination Footer */}
      {sorted.length > itemsPerPage && (
        <div className="bg-slate-900 px-5 py-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400 shadow-lg">
          <span>
            Showing <strong className="text-slate-200">{(page - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong className="text-slate-200">{Math.min(page * itemsPerPage, sorted.length)}</strong> of{' '}
            <strong className="text-slate-200">{sorted.length}</strong> results
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg font-semibold transition-colors ${
                  page === p
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
