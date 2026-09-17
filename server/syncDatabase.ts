import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { initialOpportunities } from './seedData';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

function opportunityToRow(op: any) {
  return {
    id: op.id,
    category: op.category,
    name: op.name,
    organization: op.organization,
    logo_url: op.logoUrl,
    description: op.description,
    official_url: op.officialUrl,
    registration_url: op.registrationUrl,
    start_date: op.startDate,
    end_date: op.endDate,
    deadline: op.deadline,
    location: op.location,
    mode: op.mode,
    geography: op.geography,
    domains: op.domains,
    skills: op.skills,
    eligibility: op.eligibility,
    status: op.status,
    verification_status: op.verificationStatus,
    source: op.source,
    confidence: op.confidence,
    bookmarks_count: op.bookmarksCount || 0,
    created_at: op.createdAt || new Date().toISOString(),
    updated_at: op.updatedAt || new Date().toISOString(),
    team_size: op.teamSize,
    prize_pool: op.prizePool,
    competition_type: op.competitionType,
    role: op.role,
    duration: op.duration,
    stipend: op.stipend,
    paid_type: op.paidType,
    professor: op.professor,
    institution: op.institution,
    research_area: op.researchArea,
    funding: op.funding,
    position_type: op.positionType || op.programType,
  };
}

async function sync() {
  console.log('--- SYNCING OPPORTUNITIES IN SUPABASE ---');

  // Insert new opportunities
  console.log(`Inserting ${initialOpportunities.length} new curated opportunities...`);
  const rows = initialOpportunities.map(opportunityToRow);

  for (let i = 0; i < rows.length; i += 10) {
    const chunk = rows.slice(i, i + 10);
    const { error: insError } = await supabase.from('opportunities').insert(chunk);
    if (insError) {
      console.error(`Error inserting chunk ${i}-${i + chunk.length}:`, insError.message);
    } else {
      console.log(`Inserted batch ${i + 1} to ${i + chunk.length}`);
    }
  }

  // Verify category counts
  const { data: allOps, error: fetchErr } = await supabase.from('opportunities').select('id, category, name');
  if (fetchErr) {
    console.error('Error fetching back synced opportunities:', fetchErr.message);
  } else {
    console.log(`\n=== SYNC COMPLETE! Total opportunities in DB: ${allOps?.length} ===`);
    const counts: Record<string, number> = {};
    for (const op of allOps || []) {
      counts[op.category] = (counts[op.category] || 0) + 1;
    }
    console.log('Breakdown by category:', counts);
  }
}

sync()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Sync failed:', err);
    process.exit(1);
  });
