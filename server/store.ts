import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { Opportunity, User, Bookmark, Reminder, NotificationItem, EligibilityResult, AdminRecord, AdminAccessRequest, FeedbackItem, PlatformAnalytics, OpportunityCategory } from '../src/types';
import { initialOpportunities } from './seedData';
import { GoogleGenAI, Type } from '@google/genai';
import { extractTextFromPdfBuffer, parseOpportunitiesFallback, SAMPLE_SEPTEMBER_2026_HACKATHONS, normalizeDate } from './pdfParser';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export const PRIMARY_ADMIN_EMAILS = [
  'pratikpanda2006@gmail.com',
  'freeuser13012026@gmail.com',
];

export const ADMIN_ALLOWLIST = [
  'admin@example.com',
  'admin@nexup.io',
  'freeuser13012026@gmail.com',
  'pratikpanda2006@gmail.com',
  'sarah.chen@university.edu',
];

// ---------- row <-> object mappers ----------

function rowToOpportunity(r: any): Opportunity {
  return {
    id: r.id,
    category: r.category,
    name: r.name,
    organization: r.organization,
    logoUrl: r.logo_url,
    description: r.description,
    officialUrl: r.official_url,
    registrationUrl: r.registration_url,
    startDate: r.start_date,
    endDate: r.end_date,
    deadline: r.deadline,
    location: r.location,
    mode: r.mode,
    geography: r.geography,
    domains: r.domains || [],
    skills: r.skills || [],
    eligibility: r.eligibility,
    status: r.status,
    verificationStatus: r.verification_status,
    source: r.source,
    confidence: r.confidence,
    bookmarksCount: r.bookmarks_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    teamSize: r.team_size,
    prizePool: r.prize_pool,
    competitionType: r.competition_type,
    role: r.role,
    duration: r.duration,
    stipend: r.stipend,
    paidType: r.paid_type,
    professor: r.professor,
    institution: r.institution,
    researchArea: r.research_area,
    funding: r.funding,
    positionType: r.position_type,
    programType: r.program_type || r.position_type,
    projectUrl: r.project_url,
  } as Opportunity;
}

function opportunityToRow(op: Partial<Opportunity>): any {
  const row: any = {};
  if (op.id !== undefined) row.id = op.id;
  if (op.category !== undefined) row.category = op.category;
  if (op.name !== undefined) row.name = op.name;
  if (op.organization !== undefined) row.organization = op.organization;
  if (op.logoUrl !== undefined) row.logo_url = op.logoUrl;
  if (op.description !== undefined) row.description = op.description;
  if (op.officialUrl !== undefined) row.official_url = op.officialUrl;
  if (op.registrationUrl !== undefined) row.registration_url = op.registrationUrl;
  if (op.startDate !== undefined) row.start_date = op.startDate;
  if (op.endDate !== undefined) row.end_date = op.endDate;
  if (op.deadline !== undefined) row.deadline = op.deadline;
  if (op.location !== undefined) row.location = op.location;
  if (op.mode !== undefined) row.mode = op.mode;
  if (op.geography !== undefined) row.geography = op.geography;
  if (op.domains !== undefined) row.domains = op.domains;
  if (op.skills !== undefined) row.skills = op.skills;
  if (op.eligibility !== undefined) row.eligibility = op.eligibility;
  if (op.status !== undefined) row.status = op.status;
  if (op.verificationStatus !== undefined) row.verification_status = op.verificationStatus;
  if (op.source !== undefined) row.source = op.source;
  if (op.confidence !== undefined) row.confidence = op.confidence;
  if (op.bookmarksCount !== undefined) row.bookmarks_count = op.bookmarksCount;
  if (op.createdAt !== undefined) row.created_at = op.createdAt;
  if (op.updatedAt !== undefined) row.updated_at = op.updatedAt;
  if (op.teamSize !== undefined) row.team_size = op.teamSize;
  if (op.prizePool !== undefined) row.prize_pool = op.prizePool;
  if (op.competitionType !== undefined) row.competition_type = op.competitionType;
  if ((op as any).role !== undefined) row.role = (op as any).role;
  if (op.duration !== undefined) row.duration = op.duration;
  if (op.stipend !== undefined) row.stipend = op.stipend;
  if (op.paidType !== undefined) row.paid_type = op.paidType;
  if (op.professor !== undefined) row.professor = op.professor;
  if (op.institution !== undefined) row.institution = op.institution;
  if (op.researchArea !== undefined) row.research_area = op.researchArea;
  if (op.funding !== undefined) row.funding = op.funding;
  if (op.positionType !== undefined) row.position_type = op.positionType;
  if (op.programType !== undefined) row.program_type = op.programType;
  if (op.projectUrl !== undefined) row.project_url = op.projectUrl;
  return row;
}

function rowToUser(r: any): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    avatar: r.avatar,
    interests: r.interests || [],
    preferredDomains: r.preferred_domains || [],
    preferredTypes: r.preferred_types || [],
    locationPreference: r.location_preference,
    skills: r.skills || [],
    education: r.education,
    timezone: r.timezone,
    onboarded: r.onboarded,
    notificationPrefs: r.notification_prefs || { emailAlerts: true, deadlineThresholds: [7, 3, 1], frequency: 'every_3_days' },
  } as User;
}

function userToRow(u: Partial<User>): any {
  const row: any = {};
  if (u.id !== undefined) row.id = u.id;
  if (u.name !== undefined) row.name = u.name;
  if (u.email !== undefined) row.email = u.email;
  if (u.role !== undefined) row.role = u.role;
  if (u.avatar !== undefined) row.avatar = u.avatar;
  if (u.interests !== undefined) row.interests = u.interests;
  if (u.preferredDomains !== undefined) row.preferred_domains = u.preferredDomains;
  if (u.preferredTypes !== undefined) row.preferred_types = u.preferredTypes;
  if (u.locationPreference !== undefined) row.location_preference = u.locationPreference;
  if (u.skills !== undefined) row.skills = u.skills;
  if (u.education !== undefined) row.education = u.education;
  if (u.timezone !== undefined) row.timezone = u.timezone;
  if (u.onboarded !== undefined) row.onboarded = u.onboarded;
  if (u.notificationPrefs !== undefined) row.notification_prefs = u.notificationPrefs;
  return row;
}

function rowToReminder(r: any): Reminder {
  return {
    id: r.id,
    userId: r.user_id,
    opportunityId: r.opportunity_id,
    deadline: r.deadline,
    daysBefore: r.days_before,
    frequency: r.frequency,
    preferredTime: r.preferred_time,
    timezone: r.timezone,
    active: r.active,
    lastSentAt: r.last_sent_at,
    createdAt: r.created_at,
  } as Reminder;
}

function rowToNotification(r: any): NotificationItem {
  return {
    id: r.id,
    userId: r.user_id,
    opportunityId: r.opportunity_id,
    opportunityName: r.opportunity_name,
    opportunityCategory: r.opportunity_category,
    title: r.title,
    message: r.message,
    type: r.type,
    read: r.read,
    createdAt: r.created_at,
  } as NotificationItem;
}

function rowToAdmin(r: any): AdminRecord {
  return {
    email: r.email,
    password: r.password,
    name: r.name,
    isPrimary: r.is_primary,
    addedBy: r.added_by,
    addedAt: r.added_at,
  } as AdminRecord;
}

function rowToAdminRequest(r: any): AdminAccessRequest {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    requestedAt: r.requested_at,
    expiresAt: r.expires_at,
    status: r.status,
    reviewedBy: r.reviewed_by,
    reviewedAt: r.reviewed_at,
  } as AdminAccessRequest;
}

function rowToFeedback(r: any): FeedbackItem {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.user_name,
    userEmail: r.user_email,
    type: r.type || 'feedback',
    title: r.title,
    description: r.description,
    severity: r.severity,
    status: r.status || 'pending',
    resolvedAt: r.resolved_at,
    resolvedBy: r.resolved_by,
    createdAt: r.created_at,
  } as FeedbackItem;
}

const initialFeedbacks: FeedbackItem[] = [
  {
    id: 'fb-seed-1',
    userId: 'user-demo-1',
    userName: 'Pratik Panda',
    userEmail: 'pratikpanda2006@gmail.com',
    type: 'bug',
    title: 'Mobile calendar sync button overflows container margin',
    description: 'When viewing the opportunity detail modal on screens under 375px width, the calendar sync action button is slightly clipped on the right edge.',
    severity: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
  {
    id: 'fb-seed-2',
    userId: 'user-demo-2',
    userName: 'Aarav Sharma',
    userEmail: 'aarav.sharma@campus.edu',
    type: 'feature',
    title: 'Support Telegram & Discord alert notifications for hackathons',
    description: 'It would be amazing to have a Discord webhook or Telegram bot ping us 24h before major AI hackathon registrations close.',
    severity: 'low',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
  },
  {
    id: 'fb-seed-3',
    userId: 'user-demo-3',
    userName: 'Sarah Chen',
    userEmail: 'sarah.chen@university.edu',
    type: 'feedback',
    title: 'Love the new Open Source section!',
    description: 'The separate Open Source initiatives tab with stipend indicators is extremely helpful for student developers targeting GSoC and LFX.',
    severity: 'low',
    status: 'resolved',
    resolvedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    resolvedBy: 'pratikpanda2006@gmail.com',
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
  },
];

class Store {
  private inMemoryFeedbacks: FeedbackItem[] = [...initialFeedbacks];
  private userActivityMap: Map<string, string> = new Map();

  public recordUserActivity(userId: string): void {
    this.userActivityMap.set(userId, new Date().toISOString());
  }

  // --- OPPORTUNITY METHODS ---
  public async getOpportunities(filter?: {
    category?: string;
    search?: string;
    domain?: string;
    mode?: string;
    status?: string;
    geography?: string;
    includePending?: boolean;
  }): Promise<Opportunity[]> {
    const { data, error } = await supabase.from('opportunities').select('*');
    if (error) throw error;

    let list = (data || []).map(rowToOpportunity);

    const now = new Date();
    list = list.map((op) => {
      const deadlineDate = new Date(op.deadline + 'T23:59:59Z');
      const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let calculatedStatus: Opportunity['status'] = op.status;
      if (diffDays < 0) calculatedStatus = 'closed';
      else if (diffDays <= 3) calculatedStatus = 'closing_soon';
      else if (op.status !== 'archived') calculatedStatus = 'open';
      return { ...op, status: calculatedStatus };
    });

    if (!filter?.includePending) {
      list = list.filter((op) => op.verificationStatus === 'verified');
    }
    if (filter?.category && filter.category !== 'all') {
      list = list.filter((op) => op.category === filter.category);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (op) =>
          op.name.toLowerCase().includes(q) ||
          op.organization.toLowerCase().includes(q) ||
          op.description.toLowerCase().includes(q) ||
          op.domains.some((d) => d.toLowerCase().includes(q)) ||
          op.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (filter?.domain && filter.domain !== 'all') {
      list = list.filter((op) => op.domains.some((d) => d.toLowerCase() === filter.domain?.toLowerCase()));
    }
    if (filter?.mode && filter.mode !== 'all') {
      list = list.filter((op) => op.mode === filter.mode);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter((op) => op.status === filter.status);
    }
    if (filter?.geography && filter.geography !== 'all') {
      list = list.filter((op) => op.geography === filter.geography);
    }
    return list;
  }

  public async getOpportunityById(id: string): Promise<Opportunity | undefined> {
    const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? rowToOpportunity(data) : undefined;
  }

  public async createOpportunity(op: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'bookmarksCount'>): Promise<Opportunity> {
    const newOp: any = {
      ...opportunityToRow(op as any),
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      bookmarks_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('opportunities').insert(newOp).select().single();
    if (error) throw error;
    return rowToOpportunity(data);
  }

  public async updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity | null> {
    const row = { ...opportunityToRow(updates), updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('opportunities').update(row).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data ? rowToOpportunity(data) : null;
  }

  public async deleteOpportunity(id: string, soft: boolean = true): Promise<boolean> {
    if (soft) {
      const { error } = await supabase.from('opportunities').update({ status: 'archived' }).eq('id', id);
      if (error) throw error;
      return true;
    }
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  public async getReviewQueue(): Promise<Opportunity[]> {
    const { data, error } = await supabase.from('opportunities').select('*').eq('verification_status', 'pending');
    if (error) throw error;
    return (data || []).map(rowToOpportunity);
  }

  public async approveOpportunity(id: string, updates?: Partial<Opportunity>): Promise<Opportunity | null> {
    return this.updateOpportunity(id, { ...updates, verificationStatus: 'verified', status: 'open' });
  }

  public async rejectOpportunity(id: string): Promise<Opportunity | null> {
    return this.updateOpportunity(id, { verificationStatus: 'rejected', status: 'archived' });
  }

  // --- USER & AUTH METHODS ---
  public async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return (data || []).map(rowToUser);
  }

  public async getUserById(id: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? rowToUser(data) : undefined;
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').ilike('email', email).maybeSingle();
    if (error) throw error;
    return data ? rowToUser(data) : undefined;
  }

  public async createUser(userData: { name: string; email: string; requestedRole: 'user' | 'admin' }): Promise<{ user: User; isAdminApproved: boolean }> {
    const normalizedEmail = userData.email.toLowerCase().trim();
    const isAuthorizedAdmin = ADMIN_ALLOWLIST.includes(normalizedEmail);
    const assignedRole = userData.requestedRole === 'admin' && isAuthorizedAdmin ? 'admin' : 'user';

    const newUserRow = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: normalizedEmail,
      role: assignedRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80',
      interests: ['AI/ML', 'Software Development'],
      preferred_domains: ['AI/ML', 'Web Development'],
      preferred_types: ['hackathon', 'internship', 'research'],
      skills: ['Python', 'JavaScript'],
      timezone: 'UTC',
      onboarded: false,
      notification_prefs: { emailAlerts: true, deadlineThresholds: [7, 3, 1], frequency: 'every_3_days' },
    };

    const { data, error } = await supabase.from('users').insert(newUserRow).select().single();
    if (error) throw error;
    return { user: rowToUser(data), isAdminApproved: assignedRole === 'admin' };
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase.from('users').update(userToRow(updates)).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data ? rowToUser(data) : null;
  }

  // --- BOOKMARKS ---
  public async getBookmarks(userId: string): Promise<Opportunity[]> {
    const { data: bms, error } = await supabase.from('bookmarks').select('opportunity_id').eq('user_id', userId);
    if (error) throw error;
    const ids = (bms || []).map((b) => b.opportunity_id);
    if (ids.length === 0) return [];
    const { data, error: err2 } = await supabase.from('opportunities').select('*').in('id', ids);
    if (err2) throw err2;
    return (data || []).map(rowToOpportunity);
  }

  public async isBookmarked(userId: string, opportunityId: string): Promise<boolean> {
    const { data, error } = await supabase.from('bookmarks').select('id').eq('user_id', userId).eq('opportunity_id', opportunityId).maybeSingle();
    if (error) throw error;
    return !!data;
  }

  public async toggleBookmark(userId: string, opportunityId: string): Promise<{ bookmarked: boolean; count: number }> {
    const existing = await supabase.from('bookmarks').select('id').eq('user_id', userId).eq('opportunity_id', opportunityId).maybeSingle();
    const op = await this.getOpportunityById(opportunityId);

    if (existing.data) {
      await supabase.from('bookmarks').delete().eq('id', existing.data.id);
      const newCount = Math.max(0, (op?.bookmarksCount || 1) - 1);
      if (op) await supabase.from('opportunities').update({ bookmarks_count: newCount }).eq('id', opportunityId);
      return { bookmarked: false, count: newCount };
    } else {
      await supabase.from('bookmarks').insert({
        id: `bm-${Date.now()}`,
        user_id: userId,
        opportunity_id: opportunityId,
        created_at: new Date().toISOString(),
      });
      const newCount = (op?.bookmarksCount || 0) + 1;
      if (op) await supabase.from('opportunities').update({ bookmarks_count: newCount }).eq('id', opportunityId);
      return { bookmarked: true, count: newCount };
    }
  }

  // --- REMINDERS ---
  public async getReminders(userId: string): Promise<(Reminder & { opportunity?: Opportunity })[]> {
    const { data, error } = await supabase.from('reminders').select('*').eq('user_id', userId).eq('active', true);
    if (error) throw error;
    const reminders = (data || []).map(rowToReminder);
    const result = [];
    for (const r of reminders) {
      const op = await this.getOpportunityById(r.opportunityId);
      result.push({ ...r, opportunity: op });
    }
    return result;
  }

  public async createReminder(reminder: Omit<Reminder, 'id' | 'createdAt' | 'active'>): Promise<Reminder> {
    const { data: existing } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', reminder.userId)
      .eq('opportunity_id', reminder.opportunityId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('reminders')
        .update({
          days_before: reminder.daysBefore,
          frequency: reminder.frequency,
          preferred_time: reminder.preferredTime,
          timezone: reminder.timezone,
          active: true,
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return rowToReminder(data);
    }

    const newRow = {
      id: `rem-${Date.now()}`,
      user_id: reminder.userId,
      opportunity_id: reminder.opportunityId,
      deadline: reminder.deadline,
      days_before: reminder.daysBefore,
      frequency: reminder.frequency,
      preferred_time: reminder.preferredTime,
      timezone: reminder.timezone,
      active: true,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('reminders').insert(newRow).select().single();
    if (error) throw error;
    return rowToReminder(data);
  }

  public async deleteReminder(id: string): Promise<boolean> {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // --- NOTIFICATIONS ---
  public async createNotification(data: Omit<NotificationItem, 'id' | 'createdAt'>): Promise<NotificationItem> {
    const row = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: data.userId,
      opportunity_id: data.opportunityId,
      opportunity_name: data.opportunityName,
      opportunity_category: data.opportunityCategory,
      title: data.title,
      message: data.message,
      type: data.type,
      read: data.read,
      created_at: new Date().toISOString(),
    };
    const { data: inserted, error } = await supabase.from('notifications').insert(row).select().single();
    if (error) throw error;
    return rowToNotification(inserted);
  }

  public async getNotifications(userId: string): Promise<NotificationItem[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToNotification);
  }

  public async markNotificationRead(id: string): Promise<boolean> {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    return !error;
  }

  public async markAllNotificationsRead(userId: string): Promise<void> {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
  }

  public async dismissNotification(id: string): Promise<boolean> {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    return !error;
  }

  // --- SCHEDULED CRON PROCESSORS ---
  public async processReminders(): Promise<{ processed: number; notificationsCreated: number }> {
    const { data } = await supabase.from('reminders').select('*').eq('active', true);
    const reminders = (data || []).map(rowToReminder);
    const now = new Date();
    let notificationsCreated = 0;
    let processed = 0;

    for (const rem of reminders) {
      processed++;
      const op = await this.getOpportunityById(rem.opportunityId);
      if (!op || op.status === 'closed' || op.status === 'archived') {
        await supabase.from('reminders').update({ active: false }).eq('id', rem.id);
        continue;
      }

      const deadlineDate = new Date(op.deadline + 'T23:59:59Z');
      const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        await supabase.from('reminders').update({ active: false }).eq('id', rem.id);
        continue;
      }

      let shouldSend = false;
      const lastSent = rem.lastSentAt ? new Date(rem.lastSentAt) : null;
      const daysSinceLastSent = lastSent ? (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24) : 999;

      if (rem.frequency === 'every_3_days') {
        if (daysSinceLastSent >= 3) shouldSend = true;
      } else if (rem.frequency === 'once') {
        if (!rem.lastSentAt && diffDays <= rem.daysBefore) shouldSend = true;
      } else {
        if (diffDays <= rem.daysBefore && daysSinceLastSent >= 1) shouldSend = true;
      }

      if (shouldSend) {
        await this.createNotification({
          userId: rem.userId,
          opportunityId: op.id,
          opportunityName: op.name,
          opportunityCategory: op.category,
          title: `Upcoming Deadline: ${op.name}`,
          message: `${op.name} (${op.organization}) closes in ${diffDays} day${diffDays === 1 ? '' : 's'}. Don't miss the submission cutoff!`,
          type: 'reminder',
          read: false,
        });
        await supabase.from('reminders').update({ last_sent_at: now.toISOString() }).eq('id', rem.id);
        notificationsCreated++;
      }
    }

    return { processed, notificationsCreated };
  }

  public async checkExpiry(): Promise<{ expiredCount: number }> {
    const opportunities = await this.getOpportunities({ includePending: true });
    const now = new Date();
    let expiredCount = 0;

    for (const op of opportunities) {
      const deadlineDate = new Date(op.deadline + 'T23:59:59Z');
      if (deadlineDate.getTime() < now.getTime() && op.status !== 'closed' && op.status !== 'archived') {
        await supabase.from('opportunities').update({ status: 'closed' }).eq('id', op.id);
        await supabase.from('reminders').update({ active: false }).eq('opportunity_id', op.id);
        expiredCount++;
      }
    }
    return { expiredCount };
  }

  // --- AI DISCOVERY PIPELINE (GEMINI INTEGRATION) ---
  public async runAIDiscovery(category?: string): Promise<{ discoveredCount: number; duplicatesSkipped: number; items: Opportunity[] }> {
    const cat = category || 'all';
    let discoveredItems: any[] = [];
    let duplicatesSkipped = 0;

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
        const prompt = `You are the automated opportunity discovery engine for Nexup, an elite student opportunity intelligence platform.
Find 3 to 4 realistic, high-quality upcoming opportunities for university students.
Requested category: ${cat === 'all' ? 'a balanced mix of hackathon, internship, and research' : cat}.
Current date context: September 2026.
Deadlines must be in late 2026 or early 2027 (e.g. October 2026 to January 2027).
Return a JSON array matching the Opportunity fields (name, category, organization, description, officialUrl, registrationUrl, startDate, endDate, deadline, location, mode, geography, domains, skills, eligibility, teamSize, prizePool, role, duration, stipend, professor, institution, researchArea, funding, confidence).`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        if (response.text) discoveredItems = JSON.parse(response.text);
      } catch (err) {
        console.error('Gemini discovery failed, using fallback:', err);
      }
    }

    if (!discoveredItems || discoveredItems.length === 0) {
      discoveredItems = [
        {
          name: 'Anthropic Claude Agentic Hackathon 2026',
          category: 'hackathon',
          organization: 'Anthropic AI & Lab49',
          description: 'Build robust, tool-using computer-use agents that interact with APIs, web browsers, and enterprise databases.',
          officialUrl: 'https://anthropic.com/hackathons/agentic-2026',
          registrationUrl: 'https://anthropic.com/hackathons/agentic-2026/register',
          startDate: '2026-11-05', endDate: '2026-11-07', deadline: '2026-10-24',
          location: 'San Francisco, CA & Online Stream', mode: 'hybrid', geography: 'international',
          domains: ['AI/ML', 'Software Development', 'Cybersecurity'],
          skills: ['Python', 'TypeScript', 'Claude API', 'Tool Calling'],
          eligibility: 'Open to university students and independent researchers worldwide.',
          teamSize: '1-4 Members', prizePool: '$85,000 in API Credits & Cash', confidence: 0.96,
        },
      ];
    }

    const existingOps = await this.getOpportunities({ includePending: true });
    const newOpportunities: Opportunity[] = [];

    for (const item of discoveredItems) {
      const isDuplicate = existingOps.some(
        (existing) =>
          existing.officialUrl.toLowerCase().replace(/\/$/, '') === (item.officialUrl || '').toLowerCase().replace(/\/$/, '') ||
          (existing.name.toLowerCase() === item.name.toLowerCase() && existing.organization.toLowerCase() === item.organization.toLowerCase())
      );
      if (isDuplicate) { duplicatesSkipped++; continue; }

      const created = await this.createOpportunity({
        category: item.category || 'hackathon',
        name: item.name,
        organization: item.organization,
        logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
        description: item.description,
        officialUrl: item.officialUrl,
        registrationUrl: item.registrationUrl || item.officialUrl,
        startDate: item.startDate || '2026-11-01',
        endDate: item.endDate || '2026-11-03',
        deadline: item.deadline || '2026-10-20',
        location: item.location || 'Online / Remote',
        mode: item.mode || 'online',
        geography: item.geography || 'international',
        domains: item.domains || ['AI/ML', 'Software Development'],
        skills: item.skills || ['Python', 'TypeScript'],
        eligibility: item.eligibility || 'Open to all enrolled university students.',
        status: 'open',
        verificationStatus: 'pending',
        source: 'Nexup AI Discovery Pipeline (Gemini 3.8)',
        confidence: item.confidence || 0.92,
        teamSize: item.teamSize,
        prizePool: item.prizePool,
        competitionType: item.competitionType || 'Hackathon',
        role: item.role,
        duration: item.duration,
        stipend: item.stipend,
        paidType: item.paidType || 'paid',
        professor: item.professor,
        institution: item.institution,
        researchArea: item.researchArea,
        funding: item.funding,
        positionType: item.positionType || 'Fellowship',
      } as any);
      newOpportunities.push(created);
    }

    return { discoveredCount: newOpportunities.length, duplicatesSkipped, items: newOpportunities };
  }

  public async getGeminiApiKey(): Promise<string> {
    const { data } = await supabase.from('settings').select('value').eq('key', 'gemini_api_key').maybeSingle();
    return data?.value || process.env.GEMINI_API_KEY || '';
  }

  public async setGeminiApiKey(key: string): Promise<void> {
    const trimmed = key.trim();
    process.env.GEMINI_API_KEY = trimmed;
    await supabase.from('settings').upsert({ key: 'gemini_api_key', value: trimmed });
  }

  // --- AI PDF & LINK EXTRACTION PIPELINE ---
  public async extractOpportunitiesFromContent(params: {
    pdfBase64?: string; text?: string; urls?: string[]; apiKey?: string; category?: string; useFallbackSample?: boolean;
  }): Promise<{ discoveredCount: number; duplicatesSkipped: number; items: Opportunity[]; limitExceeded?: boolean; warning?: string }> {
    const activeApiKey = (params.apiKey || '').trim() || (await this.getGeminiApiKey());
    let extractedText = params.text || '';

    if (params.pdfBase64) {
      try {
        const buffer = Buffer.from(params.pdfBase64, 'base64');
        const pdfResult = await extractTextFromPdfBuffer(buffer);
        extractedText += (extractedText ? '\n\n' : '') + pdfResult.text;
      } catch (pdfErr: any) {
        if (!extractedText && !params.urls?.length && !params.useFallbackSample) {
          throw new Error(`Failed to extract text from PDF: ${pdfErr.message}`);
        }
      }
    }

    if (params.urls && params.urls.length > 0) {
      extractedText += (extractedText ? '\n\n' : '') + 'List of target opportunity links:\n' + params.urls.join('\n');
    }

    let parsedItems: any[] = [];
    let limitExceeded = false;
    let limitMessage = '';

    if (params.useFallbackSample) {
      parsedItems = [...SAMPLE_SEPTEMBER_2026_HACKATHONS];
    } else if (!activeApiKey) {
      limitExceeded = true;
      limitMessage = 'limit of ai exceeded pls use new api key';
      parsedItems = parseOpportunitiesFallback(extractedText, 'Heuristic PDF/Link Parser');
      if (parsedItems.length === 0) {
        const err: any = new Error(limitMessage);
        err.limitExceeded = true;
        err.status = 429;
        throw err;
      }
    } else {
      try {
        const ai = new GoogleGenAI({ apiKey: activeApiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
        const prompt = `You are Nexup's AI Opportunity Extraction Engine.
Analyze the following document/links containing hackathons and student opportunities.
Document/Links content:
"""
${extractedText.slice(0, 40000)}
"""
Return a JSON array of opportunities with fields: name, category, organization, description, officialUrl, registrationUrl, startDate, endDate, deadline, location, mode, geography, domains, skills, eligibility, prizePool, confidence.`;

        const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
        let responseText = '';
        let lastGeminiErr: any = null;

        for (const model of modelsToTry) {
          try {
            const resp = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: 'application/json' } });
            if (resp.text) { responseText = resp.text; break; }
          } catch (gErr: any) {
            lastGeminiErr = gErr;
            const errMsg = (gErr.message || '').toLowerCase();
            if (gErr.status === 429 || errMsg.includes('quota') || errMsg.includes('rate limit')) {
              limitExceeded = true;
              limitMessage = 'limit of ai exceeded pls use new api key';
              break;
            }
          }
        }

        if (responseText) {
          parsedItems = JSON.parse(responseText);
        } else if (limitExceeded || lastGeminiErr) {
          parsedItems = parseOpportunitiesFallback(extractedText, 'Heuristic PDF/Link Parser');
          if (parsedItems.length === 0 && lastGeminiErr) throw lastGeminiErr;
        }
      } catch (err: any) {
        const errMsg = (err.message || '').toLowerCase();
        if (err.status === 429 || errMsg.includes('quota') || errMsg.includes('rate limit') || err.limitExceeded) {
          limitExceeded = true;
          limitMessage = 'limit of ai exceeded pls use new api key';
          parsedItems = parseOpportunitiesFallback(extractedText, 'Heuristic PDF/Link Parser');
          if (parsedItems.length === 0) {
            const finalErr: any = new Error(limitMessage);
            finalErr.limitExceeded = true;
            finalErr.status = 429;
            throw finalErr;
          }
        } else {
          throw err;
        }
      }
    }

    const existingOps = await this.getOpportunities({ includePending: true });
    const newOpportunities: Opportunity[] = [];
    let duplicatesSkipped = 0;

    for (const item of parsedItems) {
      if (!item.name || !item.officialUrl) continue;
      const normUrl = item.officialUrl.toLowerCase().replace(/\/$/, '');
      const isDuplicate = existingOps.some(
        (existing) =>
          existing.officialUrl.toLowerCase().replace(/\/$/, '') === normUrl ||
          (existing.name.toLowerCase().trim() === item.name.toLowerCase().trim() &&
            existing.organization.toLowerCase().trim() === (item.organization || '').toLowerCase().trim())
      );
      if (isDuplicate) { duplicatesSkipped++; continue; }

      const created = await this.createOpportunity({
        category: (item.category as any) || 'hackathon',
        name: item.name.trim(),
        organization: item.organization?.trim() || 'Organizer',
        logoUrl: item.logoUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
        description: item.description?.trim() || `${item.name} organized by ${item.organization}`,
        officialUrl: item.officialUrl.trim(),
        registrationUrl: (item.registrationUrl || item.officialUrl).trim(),
        startDate: item.startDate || '2026-10-15',
        endDate: item.endDate || '2026-10-17',
        deadline: item.deadline ? normalizeDate(item.deadline) : '2026-10-01',
        location: item.location || (item.mode === 'online' ? 'Virtual Worldwide' : item.mode === 'hybrid' ? 'Hybrid / Worldwide' : 'In-person'),
        mode: (item.mode as any) || 'online',
        geography: (item.geography as any) || 'international',
        domains: Array.isArray(item.domains) && item.domains.length > 0 ? item.domains : ['AI/ML', 'Software Development'],
        skills: Array.isArray(item.skills) && item.skills.length > 0 ? item.skills : ['Python', 'TypeScript'],
        eligibility: item.eligibility || 'Open to all students worldwide.',
        status: 'open',
        verificationStatus: 'pending',
        source: limitExceeded ? 'AI PDF Extractor (Heuristic Fallback)' : 'AI PDF / Link Extractor',
        confidence: typeof item.confidence === 'number' ? item.confidence : 0.94,
        prizePool: item.prizePool || undefined,
        competitionType: item.competitionType || 'Hackathon',
      } as any);
      newOpportunities.push(created);
    }

    return { discoveredCount: newOpportunities.length, duplicatesSkipped, items: newOpportunities, limitExceeded, warning: limitExceeded ? limitMessage : undefined };
  }

  // --- AI ELIGIBILITY CHECKER ---
  public async checkEligibility(opportunityId: string, userProfile: { skills: string[]; education?: string; interests: string[]; experienceLevel?: string }): Promise<EligibilityResult> {
    const op = await this.getOpportunityById(opportunityId);
    if (!op) throw new Error('Opportunity not found');

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
        const prompt = `You are Nexup's AI Student Opportunity Advisor.
OPPORTUNITY: ${op.name} at ${op.organization}. Eligibility: ${op.eligibility}. Skills: ${op.skills.join(', ')}. Domains: ${op.domains.join(', ')}. Description: ${op.description}
STUDENT: Skills: ${userProfile.skills.join(', ')}. Education: ${userProfile.education || 'Undergraduate'}. Interests: ${userProfile.interests.join(', ')}.
Return JSON: score (0-100), verdict, summary, strengths[], gaps[], recommendations[].`;

        const response = await ai.models.generateContent({ model: 'gemini-3.8-flash', contents: prompt, config: { responseMimeType: 'application/json' } });
        if (response.text) {
          const parsed = JSON.parse(response.text);
          return {
            score: Math.min(100, Math.max(0, parsed.score)),
            verdict: parsed.verdict,
            summary: parsed.summary,
            strengths: parsed.strengths || [],
            gaps: parsed.gaps || [],
            recommendations: parsed.recommendations || [],
          };
        }
      } catch (err) {
        console.error('Gemini eligibility error, using fallback:', err);
      }
    }

    const matchedSkills = op.skills.filter((s) => userProfile.skills.some((us) => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase())));
    const missingSkills = op.skills.filter((s) => !matchedSkills.includes(s));
    const ratio = op.skills.length > 0 ? matchedSkills.length / op.skills.length : 0.8;
    const score = Math.round(55 + ratio * 40);
    let verdict: EligibilityResult['verdict'] = 'Moderate Match';
    if (score >= 82) verdict = 'High Match';
    else if (score <= 50) verdict = 'Needs Preparation';

    return {
      score, verdict,
      summary: `You match ${matchedSkills.length} key skills required by ${op.organization}.`,
      strengths: matchedSkills.length > 0 ? matchedSkills : ['Strong foundational STEM background'],
      gaps: missingSkills.length > 0 ? missingSkills.slice(0, 3) : ['Advanced project portfolio pieces'],
      recommendations: [
        'Highlight your hands-on projects demonstrating the matched skills on GitHub.',
        `Review the official prerequisites on ${op.organization}'s application page before submitting.`,
        'Tailor your resume bullets to mention specific technologies requested in the listing.',
      ],
    };
  }

  // --- ADMIN MANAGEMENT ---
  public async getAdmins(): Promise<AdminRecord[]> {
    const { data, error } = await supabase.from('admins').select('*');
    if (error) throw error;
    return (data || []).map(rowToAdmin);
  }

  public async getAdminByEmail(email: string): Promise<AdminRecord | undefined> {
    const { data, error } = await supabase.from('admins').select('*').ilike('email', email.trim()).maybeSingle();
    if (error) throw error;
    return data ? rowToAdmin(data) : undefined;
  }

  public async isEmailAdmin(email: string): Promise<boolean> {
    return !!(await this.getAdminByEmail(email));
  }

  public async isPrimaryAdmin(email: string): Promise<boolean> {
    const normalized = email.toLowerCase().trim();
    if (PRIMARY_ADMIN_EMAILS.includes(normalized)) return true;
    const admin = await this.getAdminByEmail(normalized);
    return !!admin?.isPrimary;
  }

  public async validateAdmin(email: string, password: string): Promise<{ valid: boolean; admin?: AdminRecord; reason?: string }> {
    const admin = await this.getAdminByEmail(email);
    if (!admin) return { valid: false, reason: 'not_in_admin_list' };
    if (admin.password !== password) return { valid: false, reason: 'incorrect_password' };
    return { valid: true, admin };
  }

  public async addAdmin(data: { email: string; password?: string; name?: string; addedBy?: string }): Promise<{ success: boolean; admin?: AdminRecord; error?: string }> {
    const normalized = data.email.toLowerCase().trim();
    if (!normalized || !normalized.includes('@')) return { success: false, error: 'A valid email address is required' };
    if (await this.isEmailAdmin(normalized)) return { success: false, error: 'An administrator with this email is already registered' };

    const isPrimary = PRIMARY_ADMIN_EMAILS.includes(normalized);
    const newAdminRow = {
      email: normalized,
      password: data.password || 'admin@2026',
      name: data.name || normalized.split('@')[0],
      is_primary: isPrimary,
      added_by: data.addedBy || 'Primary Administrator',
      added_at: new Date().toISOString(),
    };
    const { data: inserted, error } = await supabase.from('admins').insert(newAdminRow).select().single();
    if (error) throw error;

    let user = await this.getUserByEmail(normalized);
    if (!user) {
      await this.createUser({ name: newAdminRow.name, email: normalized, requestedRole: 'admin' });
    } else if (user.role !== 'admin') {
      await this.updateUser(user.id, { role: 'admin' });
    }

    return { success: true, admin: rowToAdmin(inserted) };
  }

  public async updateAdminPassword(email: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const admin = await this.getAdminByEmail(email);
    if (!admin) return { success: false, error: 'Administrator not found in records' };
    if (!newPassword || newPassword.length < 4) return { success: false, error: 'Password must be at least 4 characters long' };
    await supabase.from('admins').update({ password: newPassword }).eq('email', email.toLowerCase().trim());
    return { success: true };
  }

  public async removeAdmin(email: string): Promise<{ success: boolean; error?: string }> {
    const normalized = email.toLowerCase().trim();
    if (PRIMARY_ADMIN_EMAILS.includes(normalized)) return { success: false, error: 'Primary administrators cannot be removed' };
    const admin = await this.getAdminByEmail(normalized);
    if (!admin) return { success: false, error: 'Administrator not found' };
    await supabase.from('admins').delete().eq('email', normalized);
    const user = await this.getUserByEmail(normalized);
    if (user) await this.updateUser(user.id, { role: 'user' });
    return { success: true };
  }

  public async cleanExpiredRequests(): Promise<void> {
    await supabase.from('admin_requests').update({ status: 'expired' }).lt('expires_at', new Date().toISOString()).eq('status', 'pending');
  }

  public async createAdminAccessRequest(email: string, name?: string): Promise<AdminAccessRequest> {
    await this.cleanExpiredRequests();
    const normalized = email.toLowerCase().trim();
    const { data: existing } = await supabase.from('admin_requests').select('*').ilike('email', normalized).eq('status', 'pending').maybeSingle();
    if (existing) return rowToAdminRequest(existing);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
    const newReqRow = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: normalized,
      name: name || normalized.split('@')[0],
      requested_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'pending',
    };
    const { data: inserted, error } = await supabase.from('admin_requests').insert(newReqRow).select().single();
    if (error) throw error;

    const users = await this.getUsers();
    const primaryUsers = users.filter((u) => PRIMARY_ADMIN_EMAILS.includes(u.email.toLowerCase()));
    for (const pUser of primaryUsers) {
      await this.createNotification({
        userId: pUser.id,
        title: 'New Admin Permission Request',
        message: `${normalized} requested admin mode access. Please review within 10 minutes.`,
        type: 'system',
        read: false,
      } as any);
    }

    return rowToAdminRequest(inserted);
  }

  public async getAdminAccessRequests(): Promise<AdminAccessRequest[]> {
    await this.cleanExpiredRequests();
    const { data, error } = await supabase.from('admin_requests').select('*');
    if (error) throw error;
    return (data || []).map(rowToAdminRequest);
  }

  public async getAdminAccessRequestById(id: string): Promise<AdminAccessRequest | undefined> {
    await this.cleanExpiredRequests();
    const { data } = await supabase.from('admin_requests').select('*').eq('id', id).maybeSingle();
    return data ? rowToAdminRequest(data) : undefined;
  }

  public async getAdminAccessRequestByEmail(email: string): Promise<AdminAccessRequest | undefined> {
    await this.cleanExpiredRequests();
    const { data } = await supabase.from('admin_requests').select('*').ilike('email', email.trim()).in('status', ['pending', 'rejected', 'accepted']).maybeSingle();
    return data ? rowToAdminRequest(data) : undefined;
  }

  public async acceptAdminAccessRequest(id: string, reviewedBy: string): Promise<{ success: boolean; admin?: AdminRecord; error?: string }> {
    await this.cleanExpiredRequests();
    const req = await this.getAdminAccessRequestById(id);
    if (!req) return { success: false, error: 'Admin permission request not found' };
    if (req.status === 'expired') return { success: false, error: 'Request has expired (10-minute window passed)' };

    await supabase.from('admin_requests').update({ status: 'accepted', reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() }).eq('id', id);
    const addResult = await this.addAdmin({ email: req.email, password: 'admin@2026', name: req.name || req.email.split('@')[0], addedBy: reviewedBy || 'freeuser13012026@gmail.com' });
    return { success: true, admin: addResult.admin };
  }

  public async rejectAdminAccessRequest(id: string, reviewedBy: string): Promise<{ success: boolean; error?: string }> {
    const req = await this.getAdminAccessRequestById(id);
    if (!req) return { success: false, error: 'Admin permission request not found' };
    await supabase.from('admin_requests').update({ status: 'rejected', reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() }).eq('id', id);
    return { success: true };
  }

  // --- FEEDBACK & BUG REPORT METHODS ---
  public async getFeedbacks(statusFilter?: string): Promise<FeedbackItem[]> {
    try {
      let query = supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      const { data, error } = await query;
      if (!error && data && data.length >= 0) {
        return data.map(rowToFeedback);
      }
    } catch {
      // Fallback
    }

    let list = [...this.inMemoryFeedbacks];
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((f) => f.status === statusFilter);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async createFeedback(data: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    type: 'bug' | 'feedback' | 'feature';
    title: string;
    description: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<FeedbackItem> {
    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: data.userId,
      userName: data.userName || 'Anonymous Student',
      userEmail: data.userEmail || '',
      type: data.type || 'feedback',
      title: data.title.trim(),
      description: data.description.trim(),
      severity: data.type === 'bug' ? data.severity || 'medium' : undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      const row = {
        id: newItem.id,
        user_id: newItem.userId,
        user_name: newItem.userName,
        user_email: newItem.userEmail,
        type: newItem.type,
        title: newItem.title,
        description: newItem.description,
        severity: newItem.severity,
        status: newItem.status,
        created_at: newItem.createdAt,
      };
      const { data: inserted, error } = await supabase.from('feedbacks').insert(row).select().single();
      if (!error && inserted) {
        return rowToFeedback(inserted);
      }
    } catch {
      // Fallback
    }

    this.inMemoryFeedbacks.unshift(newItem);
    return newItem;
  }

  public async toggleResolveFeedback(id: string, resolvedBy?: string): Promise<FeedbackItem | null> {
    try {
      const { data: existing } = await supabase.from('feedbacks').select('*').eq('id', id).maybeSingle();
      if (existing) {
        const nextStatus = existing.status === 'resolved' ? 'pending' : 'resolved';
        const resolvedAt = nextStatus === 'resolved' ? new Date().toISOString() : null;
        const by = nextStatus === 'resolved' ? (resolvedBy || 'Admin') : null;
        const { data: updated, error } = await supabase
          .from('feedbacks')
          .update({ status: nextStatus, resolved_at: resolvedAt, resolved_by: by })
          .eq('id', id)
          .select()
          .single();
        if (!error && updated) {
          return rowToFeedback(updated);
        }
      }
    } catch {
      // Fallback
    }

    const item = this.inMemoryFeedbacks.find((f) => f.id === id);
    if (!item) return null;
    const nextStatus = item.status === 'resolved' ? 'pending' : 'resolved';
    item.status = nextStatus;
    item.resolvedAt = nextStatus === 'resolved' ? new Date().toISOString() : undefined;
    item.resolvedBy = nextStatus === 'resolved' ? (resolvedBy || 'Admin') : undefined;
    return item;
  }

  public async deleteFeedback(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('feedbacks').delete().eq('id', id);
      if (!error) return true;
    } catch {
      // Fallback
    }
    const idx = this.inMemoryFeedbacks.findIndex((f) => f.id === id);
    if (idx !== -1) {
      this.inMemoryFeedbacks.splice(idx, 1);
      return true;
    }
    return false;
  }

  // --- PLATFORM ANALYTICS FOR PITCHING & USER INTELLIGENCE ---
  public async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    const dbUsers = await this.getUsers();
    const allOps = await this.getOpportunities({ includePending: true });

    let dbBookmarks: any[] = [];
    let dbReminders: any[] = [];
    try {
      const { data: bData } = await supabase.from('bookmarks').select('*');
      if (bData) dbBookmarks = bData;
      const { data: rData } = await supabase.from('reminders').select('*');
      if (rData) dbReminders = rData;
    } catch {
      // ignore
    }

    // REAL USERS ONLY from Database (Zero fake seed accounts)
    const now = Date.now();
    const finalUsers: User[] = dbUsers.map((u) => {
      const lastActive = this.userActivityMap.get(u.id) || u.lastActiveAt;
      const userBms = dbBookmarks.filter(b => b.user_id === u.id);
      const userRems = dbReminders.filter(r => r.user_id === u.id);

      return {
        ...u,
        lastActiveAt: lastActive,
        bookmarksCount: userBms.length,
        remindersCount: userRems.length,
      };
    });

    // Real KPIs calculated strictly from actual database entries
    const totalUsers = finalUsers.length;
    const totalStudents = finalUsers.filter(u => u.role === 'user').length;
    const totalAdmins = finalUsers.filter(u => u.role === 'admin').length;

    const oneDayAgo = now - 24 * 3600 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 3600 * 1000;

    const activeToday = finalUsers.filter(u => u.lastActiveAt && new Date(u.lastActiveAt).getTime() >= oneDayAgo).length;
    const activeThisWeek = finalUsers.filter(u => u.lastActiveAt && new Date(u.lastActiveAt).getTime() >= sevenDaysAgo).length;

    const totalBookmarks = dbBookmarks.length;
    const totalReminders = dbReminders.length;
    const engagedUsers = finalUsers.filter(u => (u.bookmarksCount || 0) > 0 || (u.remindersCount || 0) > 0).length;
    const engagementRate = totalUsers > 0 ? Math.round((engagedUsers / totalUsers) * 1000) / 10 : 0;

    // Real Category Demand from actual bookmarks
    const catMap: Record<OpportunityCategory, number> = {
      hackathon: 0,
      internship: 0,
      research: 0,
      opensource: 0,
    };
    const opCategoryMap = new Map<string, OpportunityCategory>();
    for (const op of allOps) {
      opCategoryMap.set(op.id, op.category);
    }
    for (const bm of dbBookmarks) {
      const cat = opCategoryMap.get(bm.opportunity_id);
      if (cat && catMap[cat] !== undefined) {
        catMap[cat]++;
      }
    }
    const catTotal = Object.values(catMap).reduce((a, b) => a + b, 0);
    const categoryDemand = [
      { category: 'hackathon' as OpportunityCategory, label: 'Hackathons & Sprints', count: catMap.hackathon, percentage: catTotal > 0 ? Math.round((catMap.hackathon / catTotal) * 100) : 0 },
      { category: 'internship' as OpportunityCategory, label: 'Engineering Internships', count: catMap.internship, percentage: catTotal > 0 ? Math.round((catMap.internship / catTotal) * 100) : 0 },
      { category: 'research' as OpportunityCategory, label: 'Research Fellowships', count: catMap.research, percentage: catTotal > 0 ? Math.round((catMap.research / catTotal) * 100) : 0 },
      { category: 'opensource' as OpportunityCategory, label: 'Open Source Bounties', count: catMap.opensource, percentage: catTotal > 0 ? Math.round((catMap.opensource / catTotal) * 100) : 0 },
    ];

    // Real Skills distribution from actual registered users
    const skillCounts: Record<string, number> = {};
    for (const u of finalUsers) {
      for (const s of u.skills || []) {
        const clean = s.trim();
        if (clean) skillCounts[clean] = (skillCounts[clean] || 0) + 1;
      }
    }
    const topSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Real Domains distribution from actual registered users
    const domainCounts: Record<string, number> = {};
    for (const u of finalUsers) {
      for (const d of u.preferredDomains || u.interests || []) {
        const clean = d.trim();
        if (clean) domainCounts[clean] = (domainCounts[clean] || 0) + 1;
      }
    }
    const topDomains = Object.entries(domainCounts)
      .map(([domain, count]) => ({
        domain,
        count,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Real Top Opportunities: strictly from real user bookmarks
    const opBookmarksMap = new Map<string, number>();
    for (const bm of dbBookmarks) {
      opBookmarksMap.set(bm.opportunity_id, (opBookmarksMap.get(bm.opportunity_id) || 0) + 1);
    }

    const topOpportunities = allOps
      .map(o => ({
        id: o.id,
        name: o.name,
        organization: o.organization,
        category: o.category,
        deadline: o.deadline,
        bookmarksCount: opBookmarksMap.get(o.id) || 0,
      }))
      .filter(o => o.bookmarksCount > 0)
      .sort((a, b) => b.bookmarksCount - a.bookmarksCount)
      .slice(0, 6);

    return {
      kpis: {
        totalUsers,
        totalStudents,
        totalAdmins,
        activeThisWeek,
        activeToday,
        totalBookmarks,
        totalReminders,
        engagementRate,
        totalOpportunities: allOps.length,
      },
      categoryDemand,
      topSkills,
      topDomains,
      topOpportunities,
      users: finalUsers.sort((a, b) => {
        const timeB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
        const timeA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
        return timeB - timeA;
      }),
    };
  }
}

export const db = new Store();