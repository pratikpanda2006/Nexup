import React from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  Table as TableIcon, 
  X,
  RotateCcw
} from 'lucide-react';
import { FilterState, OpportunityCategory } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  viewMode: 'table' | 'card';
  onViewModeChange: (mode: 'table' | 'card') => void;
  totalResults: number;
  activeCategory: OpportunityCategory | 'all';
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
  totalResults,
  activeCategory,
}) => {
  const domains = [
    'All Domains',
    'AI/ML',
    'Data Science',
    'Web Development',
    'Robotics',
    'Cybersecurity',
    'FinTech',
    'Blockchain',
    'Healthcare',
    'Research',
    'Software Development',
  ];

  const modes = [
    { value: 'all', label: 'All Modes' },
    { value: 'online', label: 'Online / Virtual' },
    { value: 'offline', label: 'In-Person' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const geographies = [
    { value: 'all', label: 'All Geographies' },
    { value: 'international', label: 'International' },
    { value: 'national', label: 'National' },
    { value: 'regional', label: 'Regional' },
    { value: 'university', label: 'University' },
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'closing_soon', label: 'Closing Soon (≤ 3 days)' },
    { value: 'closed', label: 'Closed / Expired' },
  ];

  const sortOptions = [
    { value: 'deadline_asc', label: 'Deadline — Nearest First' },
    { value: 'popularity', label: 'Most Bookmarked' },
    { value: 'recently_added', label: 'Recently Added' },
    { value: 'start_date', label: 'Start Date' },
    { value: 'organization', label: 'Organization (A-Z)' },
  ];

  const hasActiveFilters =
    filters.search !== '' ||
    filters.domain !== 'all' ||
    filters.mode !== 'all' ||
    filters.geography !== 'all' ||
    filters.status !== 'all';

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 mb-6 space-y-3 text-slate-100">
      {/* Top row: Search, Sort, View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder={`Search ${activeCategory === 'all' ? 'opportunities' : activeCategory + 's'} by title, organization, domain, or skills...`}
            className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-slate-800/90 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & View Mode controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="w-full sm:w-auto pl-8 pr-7 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Switcher: Table | Card */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Modern Summary Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="text-[11px]">Table</span>
            </button>
            <button
              onClick={() => onViewModeChange('card')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 font-semibold transition-all ${
                viewMode === 'card'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Rich Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px]">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary filter chips & dropdowns */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
        {/* Domain Filter */}
        <select
          value={filters.domain}
          onChange={(e) => onFilterChange({ domain: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 hover:bg-slate-750 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
        >
          {domains.map((d) => (
            <option key={d} value={d === 'All Domains' ? 'all' : d} className="bg-slate-900 text-slate-100">
              {d}
            </option>
          ))}
        </select>

        {/* Mode Filter */}
        <select
          value={filters.mode}
          onChange={(e) => onFilterChange({ mode: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 hover:bg-slate-750 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
        >
          {modes.map((m) => (
            <option key={m.value} value={m.value} className="bg-slate-900 text-slate-100">
              {m.label}
            </option>
          ))}
        </select>

        {/* Geography */}
        <select
          value={filters.geography}
          onChange={(e) => onFilterChange({ geography: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 hover:bg-slate-750 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
        >
          {geographies.map((g) => (
            <option key={g.value} value={g.value} className="bg-slate-900 text-slate-100">
              {g.label}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 hover:bg-slate-750 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value} className="bg-slate-900 text-slate-100">
              {s.label}
            </option>
          ))}
        </select>

        {/* Reset button if filters active */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-950/60 rounded-lg font-medium transition-colors ml-auto border border-rose-900/40"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}

        {/* Results count indicator */}
        <div className={`text-slate-400 text-xs ml-auto ${hasActiveFilters ? 'hidden sm:block' : ''}`}>
          <span className="font-semibold text-slate-200">{totalResults}</span>{' '}
          {totalResults === 1 ? 'opportunity' : 'opportunities'} found
        </div>
      </div>
    </div>
  );
};
