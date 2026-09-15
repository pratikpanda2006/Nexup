// Run once: npx tsx server/seed.ts
// Loads your existing initialOpportunities + demo users + primary admins into Supabase.
// Safe to re-run — it skips rows that already exist.

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { initialOpportunities } from './seedData';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const initialUsers = [
  {
    id: 'user-demo-1', name: 'Alex Rivera', email: 'student@nexup.io', role: 'user',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
    interests: ['AI/ML', 'Robotics', 'Web Development'],
    preferred_domains: ['AI/ML', 'Robotics', 'Web Development'],
    preferred_types: ['hackathon', 'internship', 'research'],
    location_preference: 'Remote & California',
    skills: ['Python', 'TypeScript', 'PyTorch', 'React', 'Docker'],
    education: 'Junior in Computer Science & AI', timezone: 'America/Los_Angeles', onboarded: true,
    notification_prefs: { emailAlerts: true, deadlineThresholds: [7, 3, 1], frequency: 'every_3_days' },
  },
  {
    id: 'admin-demo-1', name: 'Dr. Sarah Chen', email: 'admin@nexup.io', role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&auto=format&fit=crop&q=80',
    interests: ['Research', 'AI/ML', 'Higher Education'],
    preferred_domains: ['Research', 'AI/ML', 'Software Development'],
    preferred_types: ['research', 'hackathon', 'internship'],
    location_preference: 'Global',
    skills: ['Machine Learning', 'Research Grant Review', 'Python'],
    education: 'Ph.D. in Computer Science', timezone: 'America/New_York', onboarded: true,
    notification_prefs: { emailAlerts: true, deadlineThresholds: [7, 3], frequency: 'once' },
  },
  {
    id: 'user-current-session', name: 'Alex Developer', email: 'freeuser13012026@gmail.com', role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80',
    interests: ['AI/ML', 'Web Development', 'FinTech'],
    preferred_domains: ['AI/ML', 'Web Development', 'FinTech'],
    preferred_types: ['hackathon', 'internship', 'research'],
    location_preference: 'Worldwide',
    skills: ['Python', 'React', 'Go', 'Next.js', 'PyTorch'],
    education: 'Undergraduate Senior in Software Engineering', timezone: 'UTC', onboarded: true,
    notification_prefs: { emailAlerts: true, deadlineThresholds: [7, 3, 1], frequency: 'every_3_days' },
  },
  {
    id: 'user-pratik-panda', name: 'Pratik Panda', email: 'pratikpanda2006@gmail.com', role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
    interests: ['AI/ML', 'System Architecture', 'Software Engineering'],
    preferred_domains: ['AI/ML', 'Web Development', 'Cybersecurity'],
    preferred_types: ['hackathon', 'internship', 'research'],
    location_preference: 'Global',
    skills: ['Python', 'TypeScript', 'Node.js', 'Distributed Systems'],
    education: 'Founder & Primary Administrator', timezone: 'UTC', onboarded: true,
    notification_prefs: { emailAlerts: true, deadlineThresholds: [7, 3, 1], frequency: 'every_3_days' },
  },
];

const primaryAdmins = [
  { email: 'pratikpanda2006@gmail.com', password: 'admin@2026', name: 'Pratik Panda', is_primary: true, added_by: 'System (Primary)', added_at: '2026-09-14T00:00:00.000Z' },
  { email: 'freeuser13012026@gmail.com', password: 'admin@2026', name: 'Primary Admin', is_primary: true, added_by: 'System (Primary)', added_at: '2026-09-14T00:00:00.000Z' },
];

function opportunityToRow(op: any) {
  return {
    id: op.id, category: op.category, name: op.name, organization: op.organization,
    logo_url: op.logoUrl, description: op.description, official_url: op.officialUrl,
    registration_url: op.registrationUrl, start_date: op.startDate, end_date: op.endDate,
    deadline: op.deadline, location: op.location, mode: op.mode, geography: op.geography,
    domains: op.domains, skills: op.skills, eligibility: op.eligibility, status: op.status,
    verification_status: op.verificationStatus, source: op.source, confidence: op.confidence,
    bookmarks_count: op.bookmarksCount || 0, created_at: op.createdAt || new Date().toISOString(),
    updated_at: op.updatedAt || new Date().toISOString(), team_size: op.teamSize, prize_pool: op.prizePool,
    competition_type: op.competitionType, role: op.role, duration: op.duration, stipend: op.stipend,
    paid_type: op.paidType, professor: op.professor, institution: op.institution,
    research_area: op.researchArea, funding: op.funding, position_type: op.positionType,
  };
}

async function seed() {
  console.log(`Seeding ${initialOpportunities.length} opportunities...`);
  for (const op of initialOpportunities) {
    const { error } = await supabase.from('opportunities').upsert(opportunityToRow(op), { onConflict: 'id' });
    if (error) console.error(`Failed to seed opportunity ${op.id}:`, error.message);
  }

  console.log(`Seeding ${initialUsers.length} demo users...`);
  for (const u of initialUsers) {
    const { error } = await supabase.from('users').upsert(u, { onConflict: 'id' });
    if (error) console.error(`Failed to seed user ${u.email}:`, error.message);
  }

  console.log(`Seeding ${primaryAdmins.length} primary admins...`);
  for (const a of primaryAdmins) {
    const { error } = await supabase.from('admins').upsert(a, { onConflict: 'email' });
    if (error) console.error(`Failed to seed admin ${a.email}:`, error.message);
  }

  console.log('Seed complete.');
}

seed().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });