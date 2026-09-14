import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, MapPin, Tag, ArrowRight, Bookmark, Building, Sparkles } from 'lucide-react';
import { Opportunity } from '../types';
import { formatDeadline } from '../utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunities: Opportunity[];
  onSelectOpportunity: (op: Opportunity) => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  opportunities,
  onSelectOpportunity,
  bookmarkedIds,
  onToggleBookmark,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hackathon' | 'internship' | 'research'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = opportunities.filter((op) => {
    const matchesCategory = selectedCategory === 'all' || op.category === selectedCategory;
    const matchesQuery =
      !query.trim() ||
      op.name.toLowerCase().includes(query.toLowerCase()) ||
      op.organization.toLowerCase().includes(query.toLowerCase()) ||
      op.domains.some((d) => d.toLowerCase().includes(query.toLowerCase())) ||
      op.skills.some((s) => s.toLowerCase().includes(query.toLowerCase())) ||
      op.location.toLowerCase().includes(query.toLowerCase());

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-blue-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hackathons, internships, fellowships, skills, companies..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-white mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-800 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-1.5 px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/90 text-xs overflow-x-auto">
          {(['all', 'hackathon', 'internship', 'research'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-medium capitalize transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Opportunities' : cat === 'research' ? 'Research Fellowships' : `${cat}s`}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 font-mono hidden sm:inline">
            {filtered.length} results
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((op) => {
              const isSaved = bookmarkedIds.has(op.id);
              return (
                <div
                  key={op.id}
                  onClick={() => {
                    onSelectOpportunity(op);
                    onClose();
                  }}
                  className="p-3 rounded-xl hover:bg-slate-800/70 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/80">
                        {op.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        {op.organization}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {op.name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        {formatDeadline(op.deadline)}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[11px] truncate max-w-[200px] text-slate-400">
                        {op.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(op.id);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isSaved
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title={isSaved ? 'Saved' : 'Save opportunity'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">No matching opportunities found</p>
              <p className="text-xs text-slate-400 mt-1">Try another keyword or category filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
