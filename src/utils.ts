import { Opportunity, OpportunityStatus } from './types';

export function formatDeadline(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatDateRange(startStr: string, endStr: string): string {
  try {
    const s = new Date(startStr + 'T00:00:00');
    const e = new Date(endStr + 'T00:00:00');
    const sFormatted = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const eFormatted = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${sFormatted} – ${eFormatted}`;
  } catch {
    return `${startStr} – ${endStr}`;
  }
}

export function getDaysRemaining(deadlineStr: string): number {
  const deadline = new Date(deadlineStr + 'T23:59:59Z');
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getDeadlineBadgeInfo(deadlineStr: string, status: OpportunityStatus): {
  label: string;
  colorClass: string;
  dotColor: string;
  urgency: 'critical' | 'warning' | 'normal' | 'closed';
} {
  if (status === 'closed') {
    return {
      label: 'Closed',
      colorClass: 'bg-slate-800/80 text-slate-400 border-slate-700',
      dotColor: 'bg-slate-500',
      urgency: 'closed',
    };
  }

  const days = getDaysRemaining(deadlineStr);

  if (days < 0) {
    return {
      label: 'Closed',
      colorClass: 'bg-slate-800/80 text-slate-400 border-slate-700',
      dotColor: 'bg-slate-500',
      urgency: 'closed',
    };
  }

  if (days === 0) {
    return {
      label: 'Deadline Today',
      colorClass: 'bg-rose-950/70 text-rose-300 border-rose-800/80 animate-pulse',
      dotColor: 'bg-rose-400',
      urgency: 'critical',
    };
  }

  if (days <= 3) {
    return {
      label: `${days} day${days === 1 ? '' : 's'} left (Closing Soon)`,
      colorClass: 'bg-amber-950/60 text-amber-300 border-amber-800/80 font-medium',
      dotColor: 'bg-amber-400',
      urgency: 'warning',
    };
  }

  if (days <= 7) {
    return {
      label: `${days} days left`,
      colorClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80',
      dotColor: 'bg-emerald-400',
      urgency: 'normal',
    };
  }

  return {
    label: `${days} days left`,
    colorClass: 'bg-blue-950/60 text-blue-300 border-blue-800/80',
    dotColor: 'bg-blue-400',
    urgency: 'normal',
  };
}

export function getCategoryBadge(category: Opportunity['category']): {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (category) {
    case 'hackathon':
      return {
        label: 'Hackathon',
        bgClass: 'bg-violet-950/70',
        textClass: 'text-violet-300',
        borderClass: 'border-violet-800/60',
      };
    case 'internship':
      return {
        label: 'Internship',
        bgClass: 'bg-blue-950/70',
        textClass: 'text-blue-300',
        borderClass: 'border-blue-800/60',
      };
    case 'research':
      return {
        label: 'Research',
        bgClass: 'bg-emerald-950/70',
        textClass: 'text-emerald-300',
        borderClass: 'border-emerald-800/60',
      };
    default:
      return {
        label: 'Opportunity',
        bgClass: 'bg-slate-800',
        textClass: 'text-slate-300',
        borderClass: 'border-slate-700',
      };
  }
}
