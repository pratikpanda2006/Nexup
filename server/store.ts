import fs from 'fs';
import path from 'path';
import { Opportunity, User, Bookmark, Reminder, NotificationItem, EligibilityResult, AdminRecord, AdminAccessRequest } from '../src/types';
import { initialOpportunities } from './seedData';
import { GoogleGenAI, Type } from '@google/genai';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
export const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
export const ADMIN_REQUESTS_FILE = path.join(DATA_DIR, 'admin_requests.json');

// Primary administrators with permanent supervisory permissions
export const PRIMARY_ADMIN_EMAILS = [
  'pratikpanda2006@gmail.com',
  'freeuser13012026@gmail.com',
];

export const DEFAULT_PRIMARY_ADMINS: AdminRecord[] = [
  {
    email: 'pratikpanda2006@gmail.com',
    password: 'admin@2026',
    name: 'Pratik Panda',
    isPrimary: true,
    addedBy: 'System (Primary)',
    addedAt: '2026-09-14T00:00:00.000Z',
  },
  {
    email: 'freeuser13012026@gmail.com',
    password: 'admin@2026',
    name: 'Primary Admin',
    isPrimary: true,
    addedBy: 'System (Primary)',
    addedAt: '2026-09-14T00:00:00.000Z',
  },
];

// Admin allowlist as requested in the prompt specification
export const ADMIN_ALLOWLIST = [
  'admin@example.com',
  'admin@nexup.io',
  'freeuser13012026@gmail.com',
  'pratikpanda2006@gmail.com',
  'sarah.chen@university.edu'
];

interface DatabaseSchema {
  opportunities: Opportunity[];
  users: User[];
  bookmarks: Bookmark[];
  reminders: Reminder[];
  notifications: NotificationItem[];
}

// Initial demo users
const initialUsers: User[] = [
  {
    id: 'user-demo-1',
    name: 'Alex Rivera',
    email: 'student@nexup.io',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
    interests: ['AI/ML', 'Robotics', 'Web Development'],
    preferredDomains: ['AI/ML', 'Robotics', 'Web Development'],
    preferredTypes: ['hackathon', 'internship', 'research'],
    locationPreference: 'Remote & California',
    skills: ['Python', 'TypeScript', 'PyTorch', 'React', 'Docker'],
    education: 'Junior in Computer Science & AI',
    timezone: 'America/Los_Angeles',
    onboarded: true,
    notificationPrefs: {
      emailAlerts: true,
      deadlineThresholds: [7, 3, 1],
      frequency: 'every_3_days',
    },
  },
  {
    id: 'admin-demo-1',
    name: 'Dr. Sarah Chen',
    email: 'admin@nexup.io',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&auto=format&fit=crop&q=80',
    interests: ['Research', 'AI/ML', 'Higher Education'],
    preferredDomains: ['Research', 'AI/ML', 'Software Development'],
    preferredTypes: ['research', 'hackathon', 'internship'],
    locationPreference: 'Global',
    skills: ['Machine Learning', 'Research Grant Review', 'Python'],
    education: 'Ph.D. in Computer Science',
    timezone: 'America/New_York',
    onboarded: true,
    notificationPrefs: {
      emailAlerts: true,
      deadlineThresholds: [7, 3],
      frequency: 'once',
    },
  },
  {
    id: 'user-current-session',
    name: 'Alex Developer',
    email: 'freeuser13012026@gmail.com',
    role: 'admin', // Authorized by allowlist
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80',
    interests: ['AI/ML', 'Web Development', 'FinTech'],
    preferredDomains: ['AI/ML', 'Web Development', 'FinTech'],
    preferredTypes: ['hackathon', 'internship', 'research'],
    locationPreference: 'Worldwide',
    skills: ['Python', 'React', 'Go', 'Next.js', 'PyTorch'],
    education: 'Undergraduate Senior in Software Engineering',
    timezone: 'UTC',
    onboarded: true,
    notificationPrefs: {
      emailAlerts: true,
      deadlineThresholds: [7, 3, 1],
      frequency: 'every_3_days',
    },
  },
  {
    id: 'user-pratik-panda',
    name: 'Pratik Panda',
    email: 'pratikpanda2006@gmail.com',
    role: 'admin', // Primary admin
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
    interests: ['AI/ML', 'System Architecture', 'Software Engineering'],
    preferredDomains: ['AI/ML', 'Web Development', 'Cybersecurity'],
    preferredTypes: ['hackathon', 'internship', 'research'],
    locationPreference: 'Global',
    skills: ['Python', 'TypeScript', 'Node.js', 'Distributed Systems'],
    education: 'Founder & Primary Administrator',
    timezone: 'UTC',
    onboarded: true,
    notificationPrefs: {
      emailAlerts: true,
      deadlineThresholds: [7, 3, 1],
      frequency: 'every_3_days',
    },
  },
];

const initialBookmarks: Bookmark[] = [
  {
    id: 'bm-1',
    userId: 'user-demo-1',
    opportunityId: 'hack-01',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bm-2',
    userId: 'user-demo-1',
    opportunityId: 'intern-01',
    createdAt: new Date().toISOString(),
  },
];

const initialReminders: Reminder[] = [
  {
    id: 'rem-1',
    userId: 'user-demo-1',
    opportunityId: 'hack-01',
    deadline: '2026-09-18',
    daysBefore: 3,
    frequency: 'every_3_days',
    preferredTime: '20:00',
    timezone: 'America/Los_Angeles',
    active: true,
    lastSentAt: '2026-09-11T20:00:00Z',
    createdAt: '2026-09-10T12:00:00Z',
  },
];

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-demo-1',
    opportunityId: 'hack-01',
    opportunityName: 'HackMIT 2026',
    opportunityCategory: 'hackathon',
    title: 'Hackathon Deadline Approaching',
    message: 'HackMIT 2026 registration closes in 4 days. Complete your application team submission.',
    type: 'deadline_warning',
    read: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'user-demo-1',
    opportunityId: 'intern-01',
    opportunityName: 'AI Research Scientist Intern - Frontier Reasoning',
    opportunityCategory: 'internship',
    title: 'Reminder: DeepMind Application',
    message: 'Scheduled reminder: Google DeepMind applications close on September 20. Don’t forget to attach your GitHub and research papers.',
    type: 'reminder',
    read: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
];

class Store {
  private data: DatabaseSchema;
  private admins: AdminRecord[] = [];
  private adminRequests: AdminAccessRequest[] = [];

  constructor() {
    this.data = {
      opportunities: initialOpportunities,
      users: initialUsers,
      bookmarks: initialBookmarks,
      reminders: initialReminders,
      notifications: initialNotifications,
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          opportunities: parsed.opportunities || initialOpportunities,
          users: parsed.users || initialUsers,
          bookmarks: parsed.bookmarks || initialBookmarks,
          reminders: parsed.reminders || initialReminders,
          notifications: parsed.notifications || initialNotifications,
        };
        // Ensure new initialOpportunities (e.g. pending review queue items) exist
        for (const initOp of initialOpportunities) {
          if (!this.data.opportunities.some((o) => o.id === initOp.id)) {
            this.data.opportunities.push(initOp);
          }
        }
        // Ensure initial users like Pratik Panda exist in DB
        for (const initU of initialUsers) {
          if (!this.data.users.some((u) => u.email.toLowerCase() === initU.email.toLowerCase())) {
            this.data.users.push(initU);
          }
        }
        this.save();
      } else {
        this.save();
      }

      // Load persistent Admin records and access requests
      this.loadAdmins();
      this.loadAdminRequests();
    } catch (err) {
      console.warn('Could not read persistent DB file, using in-memory state:', err);
      this.loadAdmins();
      this.loadAdminRequests();
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Could not save DB file:', err);
    }
  }

  // --- OPPORTUNITY METHODS ---
  public getOpportunities(filter?: {
    category?: string;
    search?: string;
    domain?: string;
    mode?: string;
    status?: string;
    geography?: string;
    includePending?: boolean;
  }): Opportunity[] {
    let list = [...this.data.opportunities];

    // Status / expiry check refresh on retrieval
    const now = new Date();
    list = list.map((op) => {
      const deadlineDate = new Date(op.deadline + 'T23:59:59Z');
      const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let calculatedStatus: Opportunity['status'] = op.status;
      if (diffDays < 0) {
        calculatedStatus = 'closed';
      } else if (diffDays <= 3) {
        calculatedStatus = 'closing_soon';
      } else if (op.status !== 'archived') {
        calculatedStatus = 'open';
      }
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
      list = list.filter((op) =>
        op.domains.some((d) => d.toLowerCase() === filter.domain?.toLowerCase())
      );
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

  public getOpportunityById(id: string): Opportunity | undefined {
    return this.data.opportunities.find((op) => op.id === id);
  }

  public createOpportunity(op: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'bookmarksCount'>): Opportunity {
    const newOp: Opportunity = {
      ...op,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      bookmarksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.opportunities.unshift(newOp);
    this.save();
    return newOp;
  }

  public updateOpportunity(id: string, updates: Partial<Opportunity>): Opportunity | null {
    const idx = this.data.opportunities.findIndex((op) => op.id === id);
    if (idx === -1) return null;
    this.data.opportunities[idx] = {
      ...this.data.opportunities[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.opportunities[idx];
  }

  public deleteOpportunity(id: string, soft: boolean = true): boolean {
    const idx = this.data.opportunities.findIndex((op) => op.id === id);
    if (idx === -1) return false;
    if (soft) {
      this.data.opportunities[idx].status = 'archived';
    } else {
      this.data.opportunities.splice(idx, 1);
    }
    this.save();
    return true;
  }

  // --- REVIEW QUEUE (AI Discovered) ---
  public getReviewQueue(): Opportunity[] {
    return this.data.opportunities.filter((op) => op.verificationStatus === 'pending');
  }

  public approveOpportunity(id: string, updates?: Partial<Opportunity>): Opportunity | null {
    return this.updateOpportunity(id, {
      ...updates,
      verificationStatus: 'verified',
      status: 'open',
    });
  }

  public rejectOpportunity(id: string): Opportunity | null {
    return this.updateOpportunity(id, {
      verificationStatus: 'rejected',
      status: 'archived',
    });
  }

  // --- USER & AUTH METHODS ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: {
    name: string;
    email: string;
    requestedRole: 'user' | 'admin';
  }): { user: User; isAdminApproved: boolean } {
    const normalizedEmail = userData.email.toLowerCase().trim();
    // Verify allowlist server-side
    const isAuthorizedAdmin = ADMIN_ALLOWLIST.includes(normalizedEmail);
    const assignedRole = userData.requestedRole === 'admin' && isAuthorizedAdmin ? 'admin' : 'user';

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: normalizedEmail,
      role: assignedRole,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80`,
      interests: ['AI/ML', 'Software Development'],
      preferredDomains: ['AI/ML', 'Web Development'],
      preferredTypes: ['hackathon', 'internship', 'research'],
      skills: ['Python', 'JavaScript'],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      onboarded: false,
      notificationPrefs: {
        emailAlerts: true,
        deadlineThresholds: [7, 3, 1],
        frequency: 'every_3_days',
      },
    };

    this.data.users.push(newUser);
    this.save();
    return { user: newUser, isAdminApproved: assignedRole === 'admin' };
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- BOOKMARKS ---
  public getBookmarks(userId: string): Opportunity[] {
    const bmIds = this.data.bookmarks
      .filter((b) => b.userId === userId)
      .map((b) => b.opportunityId);
    return this.data.opportunities.filter((op) => bmIds.includes(op.id));
  }

  public isBookmarked(userId: string, opportunityId: string): boolean {
    return this.data.bookmarks.some(
      (b) => b.userId === userId && b.opportunityId === opportunityId
    );
  }

  public toggleBookmark(userId: string, opportunityId: string): { bookmarked: boolean; count: number } {
    const idx = this.data.bookmarks.findIndex(
      (b) => b.userId === userId && b.opportunityId === opportunityId
    );
    const op = this.data.opportunities.find((o) => o.id === opportunityId);

    if (idx >= 0) {
      this.data.bookmarks.splice(idx, 1);
      if (op && op.bookmarksCount > 0) op.bookmarksCount--;
      this.save();
      return { bookmarked: false, count: op ? op.bookmarksCount : 0 };
    } else {
      this.data.bookmarks.push({
        id: `bm-${Date.now()}`,
        userId,
        opportunityId,
        createdAt: new Date().toISOString(),
      });
      if (op) op.bookmarksCount++;
      this.save();
      return { bookmarked: true, count: op ? op.bookmarksCount : 0 };
    }
  }

  // --- REMINDERS ---
  public getReminders(userId: string): (Reminder & { opportunity?: Opportunity })[] {
    return this.data.reminders
      .filter((r) => r.userId === userId && r.active)
      .map((r) => ({
        ...r,
        opportunity: this.data.opportunities.find((o) => o.id === r.opportunityId),
      }));
  }

  public createReminder(reminder: Omit<Reminder, 'id' | 'createdAt' | 'active'>): Reminder {
    // Check if one already exists for this user + opportunity
    const existing = this.data.reminders.find(
      (r) => r.userId === reminder.userId && r.opportunityId === reminder.opportunityId
    );
    if (existing) {
      existing.daysBefore = reminder.daysBefore;
      existing.frequency = reminder.frequency;
      existing.preferredTime = reminder.preferredTime;
      existing.timezone = reminder.timezone;
      existing.active = true;
      this.save();
      return existing;
    }

    const newReminder: Reminder = {
      ...reminder,
      id: `rem-${Date.now()}`,
      active: true,
      createdAt: new Date().toISOString(),
    };
    this.data.reminders.push(newReminder);
    this.save();
    return newReminder;
  }

  public deleteReminder(id: string): boolean {
    const idx = this.data.reminders.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.data.reminders.splice(idx, 1);
    this.save();
    return true;
  }

  // --- NOTIFICATIONS ---
  public createNotification(data: Omit<NotificationItem, 'id' | 'createdAt'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  public getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public markNotificationRead(id: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId: string): void {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }

  public dismissNotification(id: string): boolean {
    const idx = this.data.notifications.findIndex((n) => n.id === id);
    if (idx >= 0) {
      this.data.notifications.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- SCHEDULED CRON PROCESSORS ---
  public processReminders(): { processed: number; notificationsCreated: number } {
    const now = new Date();
    let notificationsCreated = 0;
    let processed = 0;

    for (const rem of this.data.reminders) {
      if (!rem.active) continue;
      processed++;

      const op = this.data.opportunities.find((o) => o.id === rem.opportunityId);
      if (!op || op.status === 'closed' || op.status === 'archived') {
        rem.active = false;
        continue;
      }

      const deadlineDate = new Date(op.deadline + 'T23:59:59Z');
      const diffMs = deadlineDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // If deadline has passed, stop reminders
      if (diffDays < 0) {
        rem.active = false;
        continue;
      }

      // Check frequency rules:
      let shouldSend = false;
      const lastSent = rem.lastSentAt ? new Date(rem.lastSentAt) : null;
      const daysSinceLastSent = lastSent
        ? (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24)
        : 999;

      if (rem.frequency === 'every_3_days') {
        // Send every 3 days until deadline
        if (daysSinceLastSent >= 3) {
          shouldSend = true;
        }
      } else if (rem.frequency === 'once') {
        // Send when within daysBefore threshold and not yet sent
        if (!rem.lastSentAt && diffDays <= rem.daysBefore) {
          shouldSend = true;
        }
      } else {
        // Custom: threshold matches
        if (diffDays <= rem.daysBefore && daysSinceLastSent >= 1) {
          shouldSend = true;
        }
      }

      if (shouldSend) {
        const notif: NotificationItem = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          userId: rem.userId,
          opportunityId: op.id,
          opportunityName: op.name,
          opportunityCategory: op.category,
          title: `Upcoming Deadline: ${op.name}`,
          message: `${op.name} (${op.organization}) closes in ${diffDays} day${diffDays === 1 ? '' : 's'}. Don't miss the submission cutoff!`,
          type: 'reminder',
          read: false,
          createdAt: now.toISOString(),
        };
        this.data.notifications.unshift(notif);
        rem.lastSentAt = now.toISOString();
        notificationsCreated++;
      }
    }

    this.save();
    return { processed, notificationsCreated };
  }

  public checkExpiry(): { expiredCount: number } {
    const now = new Date();
    let expiredCount = 0;

    for (const op of this.data.opportunities) {
      const deadlineDate = new Date(op.deadline + 'T23:59:59Z');
      if (deadlineDate.getTime() < now.getTime() && op.status !== 'closed' && op.status !== 'archived') {
        op.status = 'closed';
        expiredCount++;

        // Deactivate active reminders for this opportunity
        for (const rem of this.data.reminders) {
          if (rem.opportunityId === op.id) {
            rem.active = false;
          }
        }
      }
    }

    if (expiredCount > 0) {
      this.save();
    }
    return { expiredCount };
  }

  // --- AI DISCOVERY PIPELINE (GEMINI INTEGRATION) ---
  public async runAIDiscovery(category?: string): Promise<{
    discoveredCount: number;
    duplicatesSkipped: number;
    items: Opportunity[];
  }> {
    const cat = category || 'all';
    let discoveredItems: any[] = [];
    let duplicatesSkipped = 0;

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });

        const prompt = `You are the automated opportunity discovery engine for Nexup, an elite student opportunity intelligence platform.
Find 3 to 4 realistic, high-quality upcoming opportunities for university students.
Requested category: ${cat === 'all' ? 'a balanced mix of hackathon, internship, and research' : cat}.
Current date context: September 2026.
Deadlines must be in late 2026 or early 2027 (e.g. October 2026 to January 2027).

Return a JSON array of objects adhering to this schema:
- name: string
- category: "hackathon" | "internship" | "research"
- organization: string
- description: string (2-3 sentences explaining the challenge/role/fellowship)
- officialUrl: string
- registrationUrl: string
- startDate: string (YYYY-MM-DD)
- endDate: string (YYYY-MM-DD)
- deadline: string (YYYY-MM-DD)
- location: string
- mode: "online" | "offline" | "hybrid"
- geography: "international" | "national" | "regional" | "university"
- domains: array of strings (e.g. ["AI/ML", "Web Development", "Robotics", "FinTech", "Cybersecurity", "Research"])
- skills: array of strings
- eligibility: string
- teamSize: string (if hackathon)
- prizePool: string (if hackathon)
- role: string (if internship)
- duration: string (if internship)
- stipend: string (if internship)
- professor: string (if research)
- institution: string (if research)
- researchArea: string (if research)
- funding: string (if research)
- confidence: number between 0.85 and 0.98`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  organization: { type: Type.STRING },
                  description: { type: Type.STRING },
                  officialUrl: { type: Type.STRING },
                  registrationUrl: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  location: { type: Type.STRING },
                  mode: { type: Type.STRING },
                  geography: { type: Type.STRING },
                  domains: { type: Type.ARRAY, items: { type: Type.STRING } },
                  skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  eligibility: { type: Type.STRING },
                  teamSize: { type: Type.STRING },
                  prizePool: { type: Type.STRING },
                  role: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  stipend: { type: Type.STRING },
                  professor: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  researchArea: { type: Type.STRING },
                  funding: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                },
                required: ['name', 'category', 'organization', 'deadline', 'officialUrl', 'description'],
              },
            },
          },
        });

        if (response.text) {
          discoveredItems = JSON.parse(response.text);
        }
      } catch (err) {
        console.error('Gemini discovery failed or key not available, using high-fidelity fallback discovery:', err);
      }
    }

    // High fidelity fallback discovery if Gemini returned empty or was unavailable
    if (!discoveredItems || discoveredItems.length === 0) {
      discoveredItems = [
        {
          name: 'Anthropic Claude Agentic Hackathon 2026',
          category: 'hackathon',
          organization: 'Anthropic AI & Lab49',
          description: 'Build robust, tool-using computer-use agents that interact with APIs, web browsers, and enterprise databases. Focused on safety, alignment, and evaluation frameworks.',
          officialUrl: 'https://anthropic.com/hackathons/agentic-2026',
          registrationUrl: 'https://anthropic.com/hackathons/agentic-2026/register',
          startDate: '2026-11-05',
          endDate: '2026-11-07',
          deadline: '2026-10-24',
          location: 'San Francisco, CA & Online Stream',
          mode: 'hybrid',
          geography: 'international',
          domains: ['AI/ML', 'Software Development', 'Cybersecurity'],
          skills: ['Python', 'TypeScript', 'Claude API', 'Tool Calling'],
          eligibility: 'Open to university students and independent researchers worldwide.',
          teamSize: '1-4 Members',
          prizePool: '$85,000 in API Credits & Cash',
          confidence: 0.96,
        },
        {
          name: 'Distributed Cloud Storage Engineering Intern',
          category: 'internship',
          organization: 'Cloudflare',
          description: 'Scale R2 object storage and Workers KV caching systems running on thousands of edge points of presence. Write high-concurrency Rust services with zero allocation overhead.',
          officialUrl: 'https://www.cloudflare.com/careers/university',
          registrationUrl: 'https://www.cloudflare.com/careers/jobs/intern-r2',
          startDate: '2027-05-15',
          endDate: '2027-08-15',
          deadline: '2026-10-28',
          location: 'San Francisco, CA / London / Remote',
          mode: 'hybrid',
          geography: 'international',
          domains: ['Software Development', 'Cybersecurity', 'Web Development'],
          skills: ['Rust', 'Go', 'Distributed Systems', 'HTTP/3', 'Linux'],
          eligibility: 'Undergraduates or Master’s students graduating between Dec 2026 and June 2028.',
          role: 'Systems Software Engineer Intern',
          duration: '12 Weeks',
          stipend: '$8,400/month + Full Medical & Remote Tech Allowance',
          paidType: 'paid',
          confidence: 0.94,
        },
        {
          name: 'Autonomous Drone Swarm Perception Research',
          category: 'research',
          organization: 'ETH Zürich Autonomous Systems Lab (ASL)',
          description: 'Investigate collaborative multi-agent SLAM and visual-inertial state estimation for micro-aerial drone swarms navigating GPS-denied alpine tunnel networks.',
          officialUrl: 'https://asl.ethz.ch/research/summer-research',
          registrationUrl: 'https://asl.ethz.ch/apply-student-research',
          startDate: '2027-03-01',
          endDate: '2027-08-31',
          deadline: '2026-11-05',
          location: 'Zürich, Switzerland',
          mode: 'offline',
          geography: 'international',
          domains: ['Research', 'Robotics', 'AI/ML'],
          skills: ['ROS 2', 'C++', 'Visual Inertial Odometry', 'Nonlinear Optimization'],
          eligibility: 'Enrolled Bachelor or Master students in Robotics, Mechanical, or Electrical Engineering.',
          professor: 'Prof. Roland Siegwart',
          institution: 'ETH Zürich',
          researchArea: 'Multi-UAV Collaborative Perception in Extreme Environments',
          funding: 'CHF 2,200/month research scholarship + Swiss Rail Pass',
          positionType: 'Fellowship',
          confidence: 0.95,
        },
      ];
    }

    const newOpportunities: Opportunity[] = [];

    for (const item of discoveredItems) {
      // Duplicate detection against existing URLs and title+org
      const isDuplicate = this.data.opportunities.some(
        (existing) =>
          existing.officialUrl.toLowerCase().replace(/\/$/, '') === item.officialUrl.toLowerCase().replace(/\/$/, '') ||
          (existing.name.toLowerCase() === item.name.toLowerCase() &&
            existing.organization.toLowerCase() === item.organization.toLowerCase())
      );

      if (isDuplicate) {
        duplicatesSkipped++;
        continue;
      }

      const newOp: Opportunity = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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
        verificationStatus: 'pending', // Awaiting admin review!
        source: 'Nexup AI Discovery Pipeline (Gemini 3.8)',
        confidence: item.confidence || 0.92,
        bookmarksCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
      };

      this.data.opportunities.unshift(newOp);
      newOpportunities.push(newOp);
    }

    this.save();
    return {
      discoveredCount: newOpportunities.length,
      duplicatesSkipped,
      items: newOpportunities,
    };
  }

  // --- AI ELIGIBILITY CHECKER ---
  public async checkEligibility(opportunityId: string, userProfile: {
    skills: string[];
    education?: string;
    interests: string[];
    experienceLevel?: string;
  }): Promise<EligibilityResult> {
    const op = this.getOpportunityById(opportunityId);
    if (!op) {
      throw new Error('Opportunity not found');
    }

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });

        const prompt = `You are Nexup's AI Student Opportunity Advisor.
Analyze how well this student fits the specified opportunity. Provide a realistic, encouraging evaluation.

OPPORTUNITY:
Name: ${op.name}
Category: ${op.category}
Organization: ${op.organization}
Eligibility Requirements: ${op.eligibility}
Target Skills: ${op.skills.join(', ')}
Domains: ${op.domains.join(', ')}
Description: ${op.description}

STUDENT PROFILE:
Skills: ${userProfile.skills.join(', ') || 'Not specified'}
Education: ${userProfile.education || 'Undergraduate student'}
Interests: ${userProfile.interests.join(', ') || 'Software, AI'}
Experience: ${userProfile.experienceLevel || 'Intermediate'}

Return structured JSON with:
- score: integer between 0 and 100 representing readiness match
- verdict: "High Match" | "Moderate Match" | "Needs Preparation" | "Ineligible"
- summary: 2 concise sentences outlining the match
- strengths: array of 2-3 matched skills or qualifying attributes
- gaps: array of 1-3 missing skills or prerequisite steps
- recommendations: array of 2-3 actionable advice steps to boost chances`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                verdict: { type: Type.STRING },
                summary: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['score', 'verdict', 'summary', 'strengths', 'gaps', 'recommendations'],
            },
          },
        });

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
        console.error('Gemini eligibility analysis error, using algorithmic fallback:', err);
      }
    }

    // Algorithmic fallback
    const matchedSkills = op.skills.filter((s) =>
      userProfile.skills.some((us) => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
    );
    const missingSkills = op.skills.filter((s) => !matchedSkills.includes(s));
    const ratio = op.skills.length > 0 ? matchedSkills.length / op.skills.length : 0.8;
    const score = Math.round(55 + ratio * 40);

    let verdict: EligibilityResult['verdict'] = 'Moderate Match';
    if (score >= 82) verdict = 'High Match';
    else if (score <= 50) verdict = 'Needs Preparation';

    return {
      score,
      verdict,
      summary: `You match ${matchedSkills.length} key skills required by ${op.organization}. Your academic background aligns well with the general eligibility criteria.`,
      strengths: matchedSkills.length > 0 ? matchedSkills : ['Strong foundational STEM background', 'Relevant domain enthusiasm'],
      gaps: missingSkills.length > 0 ? missingSkills.slice(0, 3) : ['Advanced project portfolio pieces'],
      recommendations: [
        'Highlight your hands-on projects demonstrating the matched skills on GitHub.',
        `Review the official prerequisites on ${op.organization}'s application page before submitting.`,
        'Tailor your resume bullets to mention specific technologies requested in the listing.'
      ],
    };
  }

  // ==========================================
  // --- ADMIN MANAGEMENT & ACCESS WORKFLOW ---
  // ==========================================

  private loadAdmins() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(ADMINS_FILE)) {
        const raw = fs.readFileSync(ADMINS_FILE, 'utf-8');
        this.admins = JSON.parse(raw);
      } else {
        this.admins = [...DEFAULT_PRIMARY_ADMINS];
        this.saveAdmins();
      }

      // Guarantee primary admins always exist in admins.json
      let modified = false;
      for (const primary of DEFAULT_PRIMARY_ADMINS) {
        const existingIdx = this.admins.findIndex(
          (a) => a.email.toLowerCase() === primary.email.toLowerCase()
        );
        if (existingIdx === -1) {
          this.admins.push(primary);
          modified = true;
        } else {
          if (!this.admins[existingIdx].isPrimary) {
            this.admins[existingIdx].isPrimary = true;
            modified = true;
          }
        }
      }
      if (modified) {
        this.saveAdmins();
      }
    } catch (err) {
      console.warn('Could not read admins.json file, using default primary admins:', err);
      this.admins = [...DEFAULT_PRIMARY_ADMINS];
    }
  }

  public saveAdmins() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(ADMINS_FILE, JSON.stringify(this.admins, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save admins.json:', err);
    }
  }

  private loadAdminRequests() {
    try {
      if (fs.existsSync(ADMIN_REQUESTS_FILE)) {
        const raw = fs.readFileSync(ADMIN_REQUESTS_FILE, 'utf-8');
        this.adminRequests = JSON.parse(raw);
      } else {
        this.adminRequests = [];
      }
      this.cleanExpiredRequests();
    } catch (err) {
      this.adminRequests = [];
    }
  }

  public saveAdminRequests() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(ADMIN_REQUESTS_FILE, JSON.stringify(this.adminRequests, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save admin_requests.json:', err);
    }
  }

  public cleanExpiredRequests() {
    const now = Date.now();
    let changed = false;
    for (const req of this.adminRequests) {
      if (req.status === 'pending' && new Date(req.expiresAt).getTime() <= now) {
        req.status = 'expired';
        changed = true;
      }
    }
    if (changed) {
      this.saveAdminRequests();
    }
  }

  public getAdmins(): AdminRecord[] {
    return [...this.admins];
  }

  public getAdminByEmail(email: string): AdminRecord | undefined {
    const normalized = email.toLowerCase().trim();
    return this.admins.find((a) => a.email.toLowerCase() === normalized);
  }

  public isEmailAdmin(email: string): boolean {
    const normalized = email.toLowerCase().trim();
    return this.admins.some((a) => a.email.toLowerCase() === normalized);
  }

  public isPrimaryAdmin(email: string): boolean {
    const normalized = email.toLowerCase().trim();
    if (PRIMARY_ADMIN_EMAILS.includes(normalized)) return true;
    const admin = this.getAdminByEmail(normalized);
    return !!admin?.isPrimary;
  }

  public validateAdmin(email: string, password: string): { valid: boolean; admin?: AdminRecord; reason?: string } {
    const normalized = email.toLowerCase().trim();
    const admin = this.getAdminByEmail(normalized);
    if (!admin) {
      return { valid: false, reason: 'not_in_admin_list' };
    }
    if (admin.password !== password) {
      return { valid: false, reason: 'incorrect_password' };
    }
    return { valid: true, admin };
  }

  public addAdmin(data: {
    email: string;
    password?: string;
    name?: string;
    addedBy?: string;
  }): { success: boolean; admin?: AdminRecord; error?: string } {
    const normalized = data.email.toLowerCase().trim();
    if (!normalized || !normalized.includes('@')) {
      return { success: false, error: 'A valid email address is required' };
    }

    if (this.isEmailAdmin(normalized)) {
      return { success: false, error: 'An administrator with this email is already registered' };
    }

    const isPrimary = PRIMARY_ADMIN_EMAILS.includes(normalized);
    const newAdmin: AdminRecord = {
      email: normalized,
      password: data.password || 'admin@2026',
      name: data.name || normalized.split('@')[0],
      isPrimary,
      addedBy: data.addedBy || 'Primary Administrator',
      addedAt: new Date().toISOString(),
    };

    this.admins.push(newAdmin);
    this.saveAdmins();

    // Ensure User entry exists and has admin role
    let user = this.getUserByEmail(normalized);
    if (!user) {
      const created = this.createUser({
        name: newAdmin.name,
        email: normalized,
        requestedRole: 'admin',
      });
      user = created.user;
    } else if (user.role !== 'admin') {
      this.updateUser(user.id, { role: 'admin' });
    }

    return { success: true, admin: newAdmin };
  }

  public updateAdminPassword(email: string, newPassword: string): { success: boolean; error?: string } {
    const normalized = email.toLowerCase().trim();
    const admin = this.getAdminByEmail(normalized);
    if (!admin) {
      return { success: false, error: 'Administrator not found in records' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long' };
    }

    admin.password = newPassword;
    this.saveAdmins();
    return { success: true };
  }

  public removeAdmin(email: string): { success: boolean; error?: string } {
    const normalized = email.toLowerCase().trim();
    if (PRIMARY_ADMIN_EMAILS.includes(normalized)) {
      return { success: false, error: 'Primary administrators (pratikpanda2006@gmail.com & freeuser13012026@gmail.com) cannot be removed' };
    }

    const idx = this.admins.findIndex((a) => a.email.toLowerCase() === normalized);
    if (idx === -1) {
      return { success: false, error: 'Administrator not found' };
    }

    this.admins.splice(idx, 1);
    this.saveAdmins();

    // Demote user role in DB
    const user = this.getUserByEmail(normalized);
    if (user) {
      this.updateUser(user.id, { role: 'user' });
    }

    return { success: true };
  }

  public createAdminAccessRequest(email: string, name?: string): AdminAccessRequest {
    this.cleanExpiredRequests();
    const normalized = email.toLowerCase().trim();

    // Check if there is already an active pending request
    const existing = this.adminRequests.find(
      (r) => r.email.toLowerCase() === normalized && r.status === 'pending'
    );
    if (existing) {
      return existing;
    }

    const now = new Date();
    // 10 minutes timeout window
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const newReq: AdminAccessRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: normalized,
      name: name || normalized.split('@')[0],
      requestedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'pending',
    };

    this.adminRequests.unshift(newReq);
    this.saveAdminRequests();

    // Create system notification for primary admin freeuser13012026@gmail.com & pratikpanda2006@gmail.com
    const primaryUsers = this.data.users.filter((u) =>
      PRIMARY_ADMIN_EMAILS.includes(u.email.toLowerCase())
    );
    for (const pUser of primaryUsers) {
      this.createNotification({
        userId: pUser.id,
        title: 'New Admin Permission Request',
        message: `${newReq.email} requested admin mode access. Please review within 10 minutes.`,
        type: 'system',
        read: false,
      });
    }

    return newReq;
  }

  public getAdminAccessRequests(): AdminAccessRequest[] {
    this.cleanExpiredRequests();
    return [...this.adminRequests];
  }

  public getAdminAccessRequestById(id: string): AdminAccessRequest | undefined {
    this.cleanExpiredRequests();
    return this.adminRequests.find((r) => r.id === id);
  }

  public getAdminAccessRequestByEmail(email: string): AdminAccessRequest | undefined {
    this.cleanExpiredRequests();
    const normalized = email.toLowerCase().trim();
    return this.adminRequests.find(
      (r) => r.email.toLowerCase() === normalized && (r.status === 'pending' || r.status === 'rejected' || r.status === 'accepted')
    );
  }

  public acceptAdminAccessRequest(id: string, reviewedBy: string): { success: boolean; admin?: AdminRecord; error?: string } {
    this.cleanExpiredRequests();
    const req = this.adminRequests.find((r) => r.id === id);
    if (!req) {
      return { success: false, error: 'Admin permission request not found' };
    }
    if (req.status === 'expired') {
      return { success: false, error: 'Request has expired (10-minute window passed)' };
    }

    req.status = 'accepted';
    req.reviewedBy = reviewedBy;
    req.reviewedAt = new Date().toISOString();
    this.saveAdminRequests();

    // Append to admins.json with default password 'admin@2026'
    const addResult = this.addAdmin({
      email: req.email,
      password: 'admin@2026',
      name: req.name || req.email.split('@')[0],
      addedBy: reviewedBy || 'freeuser13012026@gmail.com',
    });

    return { success: true, admin: addResult.admin };
  }

  public rejectAdminAccessRequest(id: string, reviewedBy: string): { success: boolean; error?: string } {
    this.cleanExpiredRequests();
    const req = this.adminRequests.find((r) => r.id === id);
    if (!req) {
      return { success: false, error: 'Admin permission request not found' };
    }

    req.status = 'rejected';
    req.reviewedBy = reviewedBy;
    req.reviewedAt = new Date().toISOString();
    this.saveAdminRequests();

    return { success: true };
  }
}

export const db = new Store();
