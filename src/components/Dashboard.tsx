import React, { useState } from 'react';
import { 
  Code2, 
  Briefcase, 
  GraduationCap, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  Bookmark, 
  Bell, 
  Table as TableIcon,
  LayoutGrid,
  CheckCircle2,
  ExternalLink,
  Flame,
  Filter,
  Layers,
  Star,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { Opportunity, User } from '../types';
import { formatDeadline } from '../utils';
import { OpportunityTable } from './OpportunityTable';

interface DashboardProps {
  opportunities: Opportunity[];
  onNavigateTab: (tab: string, viewMode?: 'table' | 'card') => void;
  onSelectOpportunity: (op: Opportunity) => void;
  currentUser: User | null;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  onOpenReminder: (op: Opportunity) => void;
  onGoBack?: () => void;
  previousTabName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  opportunities,
  onNavigateTab,
  onSelectOpportunity,
  currentUser,
  bookmarkedIds,
  onToggleBookmark,
  onOpenReminder,
  onGoBack,
  previousTabName,
}) => {
  // Category counts
  const hackathons = opportunities.filter((o) => o.category === 'hackathon');
  const internships = opportunities.filter((o) => o.category === 'internship');
  const research = opportunities.filter((o) => o.category === 'research');

  const hackActive = hackathons.filter((o) => o.status !== 'closed');
  const internActive = internships.filter((o) => o.status !== 'closed');
  const resActive = research.filter((o) => o.status !== 'closed');

  // Filter state for the Opportunities Summary Table
  // User specifically requested: "then when scrolled below only those which user had saved in this table for vieweing"
  // Default to 'saved' mode so the table displays only the opportunities the user has saved!
  const [tableFilter, setTableFilter] = useState<
    'saved' | 'all' | 'hackathon' | 'internship' | 'research'
  >('saved');

  // Compute opportunities to display in the table
  const savedList = opportunities.filter((o) => bookmarkedIds.has(o.id));

  const tableOpportunities = (() => {
    if (tableFilter === 'saved') {
      return savedList;
    }

    if (tableFilter === 'all') {
      return opportunities;
    }

    return opportunities.filter((o) => o.category === tableFilter);
  })();

  // Recommended / Suggested for you section
  const userInterests = currentUser?.interests || [
    'AI/ML',
    'Software Engineering',
    'Autonomous Systems'
  ];

  const suggestedOpportunities = [...opportunities]
    .filter((o) => o.status !== 'closed')
    .filter((o) =>
      o.domains.some((d) =>
        userInterests.some(
          (ui) => ui.toLowerCase() === d.toLowerCase()
        )
      )
    )
    .slice(0, 4);

  return (
    <div className="space-y-12 pb-16 text-slate-100 w-full max-w-[1650px] mx-auto px-2 sm:px-4 lg:px-6">

      {/* =========================================================================
          HERO VIEWPORT SECTION (Occupies full space on page load)
          User prompts:
          - "at tiop write only welcome back username at center remove other things like active seesion student dashboard etc removesaved and closing also"
          - "on full pagee view card look a little small like i want the cars should occupy full space then when scrolledd those opurtunity table and all rest all ok"
         ========================================================================= */}

      <section className="min-h-[calc(100vh-6.5rem)] flex flex-col justify-between py-2 sm:py-4">

        {/* Previous Tab Back Button (if navigated from another view) */}
        {onGoBack && previousTabName && (
          <div className="pt-1 pb-1">
            <button
              type="button"
              onClick={onGoBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 text-xs font-semibold transition-all shadow-xs group cursor-pointer"
              title={`Return to ${previousTabName}`}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-blue-400" />
              <span>Back to {previousTabName}</span>
            </button>
          </div>
        )}

        {/* Centered Clean Welcome Greeting */}
        <div className="pt-3 sm:pt-5 pb-6 sm:pb-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono font-medium text-slate-400 mb-3.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>OPPORTUNITY INTELLIGENCE · LIVE FEED</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Welcome back, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Pratik'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Discover vetted hackathons, frontier engineering internships, and funded research fellowships.
          </p>
        </div>

        {/* Full-Space Professional Cards Grid */}
        <div
          className={`grid grid-cols-1 ${
            currentUser?.role === 'admin'
              ? 'sm:grid-cols-2 lg:grid-cols-4'
              : 'md:grid-cols-3'
          } gap-5 sm:gap-6 w-full my-auto flex-1 items-stretch`}
        >
          {/* CARD 1: TECH INTERNSHIPS */}
          <div
            onClick={() => onNavigateTab('internships', 'table')}
            className="relative overflow-hidden rounded-2xl p-7 sm:p-8 min-h-[320px] sm:min-h-[360px] flex flex-col justify-between cursor-pointer group transition-all duration-300 bg-slate-900/95 hover:bg-slate-900 border border-slate-800/90 hover:border-indigo-500/60 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 select-none"
          >
            {/* Ambient accent top light */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500" />

            {/* Top row */}
            <div className="flex items-start justify-between relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-105 group-hover:border-indigo-500/70 transition-all">
                <Briefcase className="w-7 h-7" />
              </div>

              <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-slate-950/80 text-indigo-300 border border-indigo-900/60 shadow-xs">
                {internActive.length} Active Listings
              </span>
            </div>

            {/* Middle info */}
            <div className="py-6 relative z-10">
              <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400/90 font-semibold mb-1">
                Industry Opportunities
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Tech Internships
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
                Competitive software engineering, systems, and AI research roles with verified compensation and housing stipends.
              </p>
            </div>

            {/* Bottom action */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-indigo-300 transition-colors relative z-10">
              <span>Explore directory</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-indigo-400" />
            </div>
          </div>

          {/* CARD 2: HACKATHONS */}
          <div
            onClick={() => onNavigateTab('hackathons', 'table')}
            className="relative overflow-hidden rounded-2xl p-7 sm:p-8 min-h-[320px] sm:min-h-[360px] flex flex-col justify-between cursor-pointer group transition-all duration-300 bg-slate-900/95 hover:bg-slate-900 border border-slate-800/90 hover:border-amber-500/60 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 select-none"
          >
            {/* Ambient accent top light */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />

            {/* Top row */}
            <div className="flex items-start justify-between relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-105 group-hover:border-amber-500/70 transition-all">
                <Code2 className="w-7 h-7" />
              </div>

              <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-slate-950/80 text-amber-300 border border-amber-900/60 shadow-xs">
                {hackActive.length} Active Challenges
              </span>
            </div>

            {/* Middle info */}
            <div className="py-6 relative z-10">
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400/90 font-semibold mb-1">
                Global Competitions
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Hackathons
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
                Build and ship innovative prototypes across AI, Web3, and robotics with ₹5Cr+ prize pools and fast-track incubation.
              </p>
            </div>

            {/* Bottom action */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-amber-300 transition-colors relative z-10">
              <span>Explore competitions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-amber-400" />
            </div>
          </div>

          {/* CARD 3: RESEARCH FELLOWSHIPS */}
          <div
            onClick={() => onNavigateTab('research', 'table')}
            className="relative overflow-hidden rounded-2xl p-7 sm:p-8 min-h-[320px] sm:min-h-[360px] flex flex-col justify-between cursor-pointer group transition-all duration-300 bg-slate-900/95 hover:bg-slate-900 border border-slate-800/90 hover:border-violet-500/60 shadow-xl hover:shadow-2xl hover:shadow-violet-500/10 select-none"
          >
            {/* Ambient accent top light */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-500/20 transition-all duration-500" />

            {/* Top row */}
            <div className="flex items-start justify-between relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-violet-950/60 border border-violet-800/60 flex items-center justify-center text-violet-400 shadow-inner group-hover:scale-105 group-hover:border-violet-500/70 transition-all">
                <GraduationCap className="w-7 h-7" />
              </div>

              <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-slate-950/80 text-violet-300 border border-violet-900/60 shadow-xs">
                {resActive.length} Active Grants
              </span>
            </div>

            {/* Middle info */}
            <div className="py-6 relative z-10">
              <div className="text-[11px] font-mono uppercase tracking-wider text-violet-400/90 font-semibold mb-1">
                Academic & Lab Tracks
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Research Fellowships
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
                Undergraduate research fellowships, funded lab appointments, and faculty collaborations at Stanford, ETH, and IIT.
              </p>
            </div>

            {/* Bottom action */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-violet-300 transition-colors relative z-10">
              <span>Explore fellowships</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-violet-400" />
            </div>
          </div>

          {/* CARD 4: ADMIN PANEL (when signed in as admin) */}
          {currentUser?.role === 'admin' && (
            <div
              onClick={() => onNavigateTab('admin')}
              className="relative overflow-hidden rounded-2xl p-7 sm:p-8 min-h-[320px] sm:min-h-[360px] flex flex-col justify-between cursor-pointer group transition-all duration-300 bg-slate-900/95 hover:bg-slate-900 border border-slate-800/90 hover:border-rose-500/60 shadow-xl hover:shadow-2xl hover:shadow-rose-500/10 select-none"
            >
              {/* Ambient accent top light */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-rose-500/20 transition-all duration-500" />

              {/* Top row */}
              <div className="flex items-start justify-between relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 shadow-inner group-hover:scale-105 group-hover:border-rose-500/70 transition-all">
                  <ShieldCheck className="w-7 h-7" />
                </div>

                <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-slate-950/80 text-rose-300 border border-rose-900/60 shadow-xs">
                  Console Ops
                </span>
              </div>

              {/* Middle info */}
              <div className="py-6 relative z-10">
                <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400/90 font-semibold mb-1">
                  System Administration
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Admin Console
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
                  Ingest PDF/link schedules, verify AI candidate listings, monitor cron expiration sweeps, and manage admins.
                </p>
              </div>

              {/* Bottom action */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-rose-300 transition-colors relative z-10">
                <span>Manage operations</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-rose-400" />
              </div>
            </div>
          )}
        </div>


        {/* Scroll Indicator Prompt to Opportunity Table */}
        <div
          className="pt-6 pb-2 flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
          onClick={() => {
            const el = document.getElementById('summary-table-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span className="text-xs font-medium tracking-wider uppercase text-slate-400 mb-1 flex items-center space-x-1">
            <span>Scroll down for opportunities table</span>
          </span>

          <ChevronDown className="w-5 h-5 animate-bounce text-slate-400" />
        </div>
      </section>


      {/* =========================================================================
          OPPORTUNITIES SUMMARY TABLE (Directly matching Image 5 & User Prompt)
          "then when scrolled below only those which user had saved in this table for vieweing"
         ========================================================================= */}

      <div id="summary-table-section" className="space-y-4 pt-2">

        {/* Table Header Bar matching Image 5 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800/80 shadow-xs">
              <TableIcon className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  Opportunities Summary Table
                </h3>

                {tableFilter === 'saved' && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                    USER SAVED VIEW
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-0.5">
                {tableFilter === 'saved'
                  ? 'Displaying only opportunities you have saved to your personal tracking list'
                  : 'Comprehensive dataset view with live cutoffs, verification badges, and action controls'}
              </p>
            </div>
          </div>


          {/* Filter Tabs matching Image 5 + Saved Filter */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs font-medium">

            {/* 1. Only Saved (Primary user requirement) */}
            <button
              onClick={() => setTableFilter('saved')}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                tableFilter === 'saved'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
              }`}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  tableFilter === 'saved' ? 'fill-current' : ''
                }`}
              />
              <span>My Saved ({savedList.length})</span>
            </button>


            {/* 2. All Opportunities */}
            <button
              onClick={() => setTableFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                tableFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
              }`}
            >
              All Opportunities ({opportunities.length})
            </button>


            {/* 3. Hackathons */}
            <button
              onClick={() => setTableFilter('hackathon')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                tableFilter === 'hackathon'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
              }`}
            >
              Hackathons
            </button>


            {/* 4. Internships */}
            <button
              onClick={() => setTableFilter('internship')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                tableFilter === 'internship'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
              }`}
            >
              Internships
            </button>


            {/* 5. Research */}
            <button
              onClick={() => setTableFilter('research')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                tableFilter === 'research'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
              }`}
            >
              Research
            </button>

          </div>
        </div>


        {/* Table Content */}
        {tableOpportunities.length > 0 ? (
          <OpportunityTable
            opportunities={tableOpportunities}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={onToggleBookmark}
            onOpenReminder={onOpenReminder}
            onViewDetails={onSelectOpportunity}
          />
        ) : (

          /* Empty State when Saved table has no entries yet */
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-8 sm:p-12 text-center">

            <div className="w-12 h-12 rounded-2xl bg-blue-950 text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-800/60">
              <Bookmark className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-white">
              No Saved Opportunities Yet
            </h4>

            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              You haven't bookmarked any opportunities yet. Save opportunities to track deadlines and receive alert schedules.
            </p>

            <div className="mt-5 flex items-center justify-center space-x-3">

              <button
                onClick={() => setTableFilter('all')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md"
              >
                Switch to All Opportunities
              </button>

              {opportunities.length > 0 && (
                <button
                  onClick={() => {
                    // Quick bookmark the first 2 opportunities for convenient testing
                    onToggleBookmark(opportunities[0].id);

                    if (opportunities[1]) {
                      onToggleBookmark(opportunities[1].id);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                >
                  Bookmark Top 2 Opportunities
                </button>
              )}

            </div>
          </div>
        )}
      </div>


      {/* =========================================================================
          SUGGESTED FOR YOU (Directly requested in user prompt)
          "and then suggested for u and final would be thid all right resrvd etc"
         ========================================================================= */}

      <div className="bg-slate-900 rounded-3xl border border-slate-800/90 shadow-2xl p-6 sm:p-8 space-y-5">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">

          <div className="flex items-center space-x-2.5">

            <div className="w-8 h-8 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800/80">
              <Sparkles className="w-4 h-4" />
            </div>

            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                Suggested for You
              </h3>

              <p className="text-xs text-slate-400 mt-0.5">
                Opportunities aligned with your domain profile & technical interests
              </p>
            </div>

          </div>

          <span className="text-xs font-medium text-indigo-300 bg-indigo-950/70 px-3 py-1 rounded-full border border-indigo-800/60 self-start sm:self-auto">
            Matched to: {userInterests.slice(0, 2).join(', ')}
          </span>

        </div>


        {/* 4 Suggestion Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {suggestedOpportunities.map((op) => {
            const isBookmarked = bookmarkedIds.has(op.id);

            return (
              <div
                key={op.id}
                onClick={() => onSelectOpportunity(op)}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-blue-500/70 hover:bg-slate-850/60 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
              >

                <div>

                  <div className="flex items-center justify-between gap-2 mb-2.5">

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950/90 text-blue-300 border border-blue-800/80 uppercase font-mono">
                      {op.category}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(op.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isBookmarked
                          ? 'text-blue-400 bg-blue-950/80'
                          : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                      }`}
                      title={isBookmarked ? 'Saved' : 'Save to bookmarks'}
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          isBookmarked ? 'fill-current' : ''
                        }`}
                      />
                    </button>

                  </div>


                  <h4 className="font-bold text-sm text-white line-clamp-1 mb-1 group-hover:text-blue-400 transition-colors">
                    {op.name}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-1 mb-3 font-medium">
                    {op.organization}
                  </p>


                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-200 leading-snug mb-3">
                    <span className="font-bold text-indigo-300">
                      Match score:
                    </span>{' '}
                    High fit with your {op.domains[0] || 'AI'} focus.
                  </div>

                </div>


                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-850 text-slate-400 font-mono">

                  <span>{formatDeadline(op.deadline)}</span>

                  <span className="text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    Details →
                  </span>

                </div>

              </div>
            );
          })}

        </div>
      </div>

    </div>
  );
};