/**
 * Seed script for a given user account.
 *
 * Usage:
 *   node scripts/seed-user.mjs <email-or-user-id>
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local
 * (or from the process environment if already set).
 *
 * Example:
 *   node scripts/seed-user.mjs aimansammrsm@gmail.com
 *   node scripts/seed-user.mjs b7465c9e-6fff-48aa-9c4a-e068cffb9cce
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ───────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(__dirname, '../.env.local');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment or .env.local');
  process.exit(1);
}

// ── Resolve user ID from argument ─────────────────────────────
const arg = process.argv[2];
if (!arg) {
  console.error('❌ Usage: node scripts/seed-user.mjs <email-or-user-id>');
  process.exit(1);
}

// Try to resolve email → user ID via admin API
async function resolveUserId(emailOrId) {
  // If it looks like a UUID, use it directly
  if (/^[0-9a-f-]{36}$/.test(emailOrId)) return emailOrId;

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(emailOrId)}`, {
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
  });
  const data = await res.json();
  const user = data?.users?.find(u => u.email === emailOrId);
  if (!user) throw new Error(`No user found with email: ${emailOrId}`);
  return user.id;
}

const USER_ID = await resolveUserId(arg);
console.log(`👤 Seeding user: ${arg} (${USER_ID})`);

const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'apikey': SERVICE_ROLE_KEY,
  'Prefer': 'return=representation',
};

async function post(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(rows),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`POST ${table} failed: ${JSON.stringify(data)}`);
  return data;
}

// ── Date helpers ──────────────────────────────────────────────
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function daysAgo(n) {
  return daysFromNow(-n);
}

const today = daysFromNow(0);

// ─────────────────────────────────────────────────────────────
async function seed() {
  console.log('🌱 Seeding user:', USER_ID);

  // ── PROJECTS ─────────────────────────────────────────────
  console.log('📁 Creating projects...');
  const projects = await post('projects', [
    { user_id: USER_ID, name: 'Web App Redesign',        color: '#6366f1', description: 'Full redesign of the main product UI/UX' },
    { user_id: USER_ID, name: 'Marketing Campaign Q3',   color: '#a855f7', description: 'Q3 digital marketing push and content calendar' },
    { user_id: USER_ID, name: 'Personal Finance',        color: '#22c55e', description: 'Budgeting, savings targets and investment research' },
    { user_id: USER_ID, name: 'Health & Wellness',       color: '#ef4444', description: 'Fitness goals, meal planning and sleep tracking' },
    { user_id: USER_ID, name: 'Learning & Dev',          color: '#f97316', description: 'Courses, certifications and skill building' },
  ]);
  const [pWebApp, pMarketing, pFinance, pHealth, pLearning] = projects;
  console.log(`  ✅ Created ${projects.length} projects`);

  // ── GOALS ─────────────────────────────────────────────────
  console.log('🎯 Creating goals...');
  const goals = await post('goals', [
    { user_id: USER_ID, title: 'Launch MVP by Q3 2026',        color: '#6366f1', description: 'Ship the core product to first 100 users', due_date: '2026-09-30' },
    { user_id: USER_ID, title: 'Lose 10kg by December 2026',   color: '#ef4444', description: 'Consistent diet and exercise routine',      due_date: '2026-12-31' },
    { user_id: USER_ID, title: 'Read 24 books this year',      color: '#0ea5e9', description: '2 books per month across all genres',        due_date: '2026-12-31' },
    { user_id: USER_ID, title: 'Save RM 20k emergency fund',   color: '#22c55e', description: '6-month living expense buffer',              due_date: '2026-12-31' },
    { user_id: USER_ID, title: 'Complete AWS certification',   color: '#f97316', description: 'Pass AWS Solutions Architect Associate',     due_date: '2026-10-15' },
    { user_id: USER_ID, title: 'Build in public — 30 posts',   color: '#a855f7', description: 'Share progress updates on LinkedIn/X',      due_date: '2026-09-01' },
  ]);
  const [gMVP, gHealth, gReading, gFinance, gAWS, gBuildPublic] = goals;
  console.log(`  ✅ Created ${goals.length} goals`);

  // ── TASKS ─────────────────────────────────────────────────
  // Supabase bulk insert requires ALL objects to have the same keys.
  // Use t() helper to normalize every row.
  const now = new Date().toISOString();

  function t({ title, priority, status, due_date, project_id, goal_id, position, notes, completed_at, is_recurring, recurrence_rule }) {
    return {
      user_id: USER_ID,
      title,
      priority,
      status,
      due_date: due_date ?? null,
      project_id: project_id ?? null,
      goal_id: goal_id ?? null,
      position,
      notes: notes ?? null,
      completed_at: completed_at ?? null,
      is_recurring: is_recurring ?? false,
      recurrence_rule: recurrence_rule ?? null,
    };
  }

  console.log('✅ Creating tasks...');
  const tasks = await post('tasks', [
    // ── Today ──
    t({ title: 'Review landing page copy',            priority: 'urgent', status: 'todo',        due_date: today,            project_id: pWebApp.id,    goal_id: gMVP.id,         position: 1000,  notes: 'Focus on the hero section and CTA buttons' }),
    t({ title: 'Set up Google Analytics 4',           priority: 'high',   status: 'in_progress', due_date: today,            project_id: pMarketing.id, goal_id: null,            position: 2000,  notes: 'Install GA4 tag and configure conversion events' }),
    t({ title: 'Morning workout — 5km run',           priority: 'medium', status: 'done',        due_date: today,            project_id: pHealth.id,    goal_id: gHealth.id,      position: 3000,  completed_at: now }),
    t({ title: 'Update monthly budget spreadsheet',   priority: 'high',   status: 'done',        due_date: today,            project_id: pFinance.id,   goal_id: gFinance.id,     position: 4000,  completed_at: now }),
    t({ title: 'Prepare AWS practice exam set 3',     priority: 'urgent', status: 'todo',        due_date: today,            project_id: pLearning.id,  goal_id: gAWS.id,         position: 5000 }),

    // ── Overdue ──
    t({ title: 'Fix auth redirect bug on mobile',             priority: 'urgent', status: 'todo', due_date: daysAgo(2), project_id: pWebApp.id,    goal_id: gMVP.id,         position: 6000, notes: 'Users get stuck on /auth/callback on iOS Safari' }),
    t({ title: 'Write LinkedIn post about product update',    priority: 'medium', status: 'todo', due_date: daysAgo(1), project_id: pMarketing.id, goal_id: gBuildPublic.id, position: 7000 }),

    // ── This week ──
    t({ title: 'Design onboarding email sequence',    priority: 'high',   status: 'todo',        due_date: daysFromNow(2),  project_id: pMarketing.id, goal_id: gMVP.id,         position: 8000,  notes: '5-email drip — welcome, value, spotlight, proof, ask' }),
    t({ title: 'Finish reading "The Mom Test"',       priority: 'low',    status: 'in_progress', due_date: daysFromNow(3),  project_id: null,          goal_id: gReading.id,     position: 9000 }),
    t({ title: 'Set up Stripe subscription billing',  priority: 'urgent', status: 'todo',        due_date: daysFromNow(4),  project_id: pWebApp.id,    goal_id: gMVP.id,         position: 10000, notes: 'Monthly + annual plans, webhook for subscription events' }),
    t({ title: 'Meal prep for the week',              priority: 'medium', status: 'todo',        due_date: daysFromNow(1),  project_id: pHealth.id,    goal_id: gHealth.id,      position: 11000, notes: 'Chicken rice bowls x5, salad containers, protein shakes' }),
    t({ title: 'Transfer RM 500 to savings account',  priority: 'high',   status: 'todo',        due_date: daysFromNow(2),  project_id: pFinance.id,   goal_id: gFinance.id,     position: 12000 }),

    // ── Next 2 weeks ──
    t({ title: 'Record product demo video',           priority: 'high',   status: 'todo',        due_date: daysFromNow(7),  project_id: pMarketing.id, goal_id: gMVP.id,         position: 13000, notes: '3-5 min walkthrough for waitlist page' }),
    t({ title: 'Complete AWS cloudformation module',  priority: 'medium', status: 'todo',        due_date: daysFromNow(8),  project_id: pLearning.id,  goal_id: gAWS.id,         position: 14000 }),
    t({ title: 'Redesign pricing page',               priority: 'high',   status: 'todo',        due_date: daysFromNow(10), project_id: pWebApp.id,    goal_id: gMVP.id,         position: 15000 }),
    t({ title: 'Reach out to 5 potential beta users', priority: 'urgent', status: 'todo',        due_date: daysFromNow(5),  project_id: null,          goal_id: gBuildPublic.id, position: 16000, notes: 'Target indie hackers on X and Product Hunt' }),
    t({ title: 'Book annual health screening',        priority: 'low',    status: 'todo',        due_date: daysFromNow(14), project_id: pHealth.id,    goal_id: null,            position: 17000 }),

    // ── No due date ──
    t({ title: 'Research competitor pricing models',  priority: 'medium', status: 'todo', due_date: null, project_id: pMarketing.id, goal_id: null, position: 18000 }),
    t({ title: 'Set up error monitoring',             priority: 'low',    status: 'todo', due_date: null, project_id: pWebApp.id,    goal_id: null, position: 19000 }),
    t({ title: 'Write personal mission statement',    priority: 'low',    status: 'todo', due_date: null, project_id: null,          goal_id: null, position: 20000 }),

    // ── Recurring ──
    t({ title: 'Daily standup notes',           priority: 'medium', status: 'todo', due_date: today,           project_id: null, goal_id: null, position: 21000, is_recurring: true, recurrence_rule: 'daily' }),
    t({ title: 'Weekly review — goals & tasks', priority: 'high',   status: 'todo', due_date: daysFromNow(0),  project_id: null, goal_id: null, position: 22000, is_recurring: true, recurrence_rule: 'weekly' }),
  ]);
  console.log(`  ✅ Created ${tasks.length} tasks`);

  // ── SUBTASKS ──────────────────────────────────────────────
  console.log('📋 Creating subtasks...');
  const stripeTask = tasks.find(t => t.title === 'Set up Stripe subscription billing');
  const landingTask = tasks.find(t => t.title === 'Review landing page copy');
  const emailTask = tasks.find(t => t.title === 'Design onboarding email sequence');

  const subtasks = [];

  if (stripeTask) {
    subtasks.push(
      { task_id: stripeTask.id, user_id: USER_ID, title: 'Create products in Stripe dashboard', completed: true, position: 1000 },
      { task_id: stripeTask.id, user_id: USER_ID, title: 'Integrate Stripe checkout session', completed: false, position: 2000 },
      { task_id: stripeTask.id, user_id: USER_ID, title: 'Handle webhook events', completed: false, position: 3000 },
      { task_id: stripeTask.id, user_id: USER_ID, title: 'Test with Stripe test cards', completed: false, position: 4000 },
    );
  }
  if (landingTask) {
    subtasks.push(
      { task_id: landingTask.id, user_id: USER_ID, title: 'Hero headline & subtext', completed: true, position: 1000 },
      { task_id: landingTask.id, user_id: USER_ID, title: 'Feature section copy', completed: false, position: 2000 },
      { task_id: landingTask.id, user_id: USER_ID, title: 'CTA button text', completed: false, position: 3000 },
    );
  }
  if (emailTask) {
    subtasks.push(
      { task_id: emailTask.id, user_id: USER_ID, title: 'Email 1: Welcome', completed: false, position: 1000 },
      { task_id: emailTask.id, user_id: USER_ID, title: 'Email 2: First value tip', completed: false, position: 2000 },
      { task_id: emailTask.id, user_id: USER_ID, title: 'Email 3: Feature spotlight', completed: false, position: 3000 },
      { task_id: emailTask.id, user_id: USER_ID, title: 'Email 4: Social proof', completed: false, position: 4000 },
      { task_id: emailTask.id, user_id: USER_ID, title: 'Email 5: CTA ask', completed: false, position: 5000 },
    );
  }

  if (subtasks.length > 0) {
    await post('subtasks', subtasks);
    console.log(`  ✅ Created ${subtasks.length} subtasks`);
  }

  console.log('\n🎉 Seed complete!');
  console.log(`   Projects: ${projects.length}`);
  console.log(`   Goals:    ${goals.length}`);
  console.log(`   Tasks:    ${tasks.length}`);
  console.log(`   Subtasks: ${subtasks.length}`);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
