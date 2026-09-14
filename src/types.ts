export type OpportunityCategory = 'hackathon' | 'internship' | 'research';

export type OpportunityStatus = 'open' | 'closing_soon' | 'closed' | 'archived';

export type WorkMode = 'online' | 'offline' | 'hybrid';

export type GeographyLevel = 'international' | 'national' | 'regional' | 'university';

export interface Opportunity {
  id: string;
  category: OpportunityCategory;
  name: string;
  organization: string;
  logoUrl?: string;
  description: string;
  officialUrl: string;
  registrationUrl: string;
  startDate: string;
  endDate: string;
  deadline: string;
  location: string;
  mode: WorkMode;
  geography: GeographyLevel;
  domains: string[];
  skills: string[];
  eligibility: string;
  status: OpportunityStatus;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  source: string;
  sourceUrl?: string;
  confidence?: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  bookmarksCount: number;

  // Hackathon specific
  teamSize?: string;
  prizePool?: string;
  competitionType?: string; // 'Hackathon' | 'Coding Competition' | 'Ideathon' | 'Innovation Challenge' | 'Case Competition'

  // Internship specific
  role?: string;
  duration?: string;
  stipend?: string;
  paidType?: 'paid' | 'unpaid' | 'stipend_available' | 'not_specified';

  // Research specific
  professor?: string;
  institution?: string;
  researchArea?: string;
  funding?: string;
  positionType?: string; // 'Fellowship' | 'Research Assistant' | 'Open Research Project'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  interests: string[];
  preferredDomains: string[];
  preferredTypes: OpportunityCategory[];
  locationPreference?: string;
  skills: string[];
  education?: string;
  timezone: string;
  onboarded: boolean;
  notificationPrefs: {
    emailAlerts: boolean;
    deadlineThresholds: number[]; // e.g. [7, 3, 1]
    frequency: 'once' | 'every_3_days';
  };
}

export interface Bookmark {
  id: string;
  userId: string;
  opportunityId: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  opportunityId: string;
  deadline: string;
  daysBefore: number;
  frequency: 'once' | 'every_3_days' | 'custom';
  preferredTime: string; // e.g. '20:00'
  timezone: string;
  active: boolean;
  lastSentAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  opportunityId?: string;
  opportunityName?: string;
  opportunityCategory?: OpportunityCategory;
  title: string;
  message: string;
  type: 'reminder' | 'deadline_warning' | 'new_match' | 'system';
  read: boolean;
  createdAt: string;
}

export interface FilterState {
  search: string;
  category: OpportunityCategory | 'all';
  type: string;
  geography: string;
  mode: string;
  domain: string;
  status: string;
  dateFilter: string;
  sortBy: 'deadline_asc' | 'recently_added' | 'recently_updated' | 'start_date' | 'popularity' | 'organization';
  paidOnly?: boolean;
}

export interface EligibilityResult {
  score: number; // 0 - 100
  verdict: 'High Match' | 'Moderate Match' | 'Needs Preparation' | 'Ineligible';
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface AdminRecord {
  email: string;
  password: string;
  name: string;
  isPrimary: boolean;
  addedBy: string;
  addedAt: string;
}

export interface AdminAccessRequest {
  id: string;
  email: string;
  name?: string;
  requestedAt: string;
  expiresAt: string; // 10 minutes from requestedAt
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  reviewedBy?: string;
  reviewedAt?: string;
}
