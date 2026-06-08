/**
 * migrate-dev.mjs
 * Runs all Supabase migrations against the dev database.
 *
 * Usage:
 *   node scripts/migrate-dev.mjs
 *
 * Requires:
 *   - .env.development.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   - DEV_DB_PASSWORD environment variable (or set it inline below)
 *     Get it from: Supabase Dashboard → Settings → Database → Database password
 *
 * Example:
 *   DEV_DB_PASSWORD=your_password node scripts/migrate-dev.mjs
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load .env.development.local
function loadEnv(file) {
  try {
    const content = readFileSync(join(ROOT, file), 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      process.env[key] = process.env[key] ?? val;
    }
  } catch {
    // file not found — skip
  }
}

loadEnv('.env.development.local');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DB_PASSWORD = process.env.DEV_DB_PASSWORD;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.development.local');
  process.exit(1);
}

if (!DB_PASSWORD) {
  console.error('❌  Missing DEV_DB_PASSWORD environment variable.');
  console.error('   Get it from: Supabase Dashboard → Settings → Database → Database password');
  console.error('   Run as: DEV_DB_PASSWORD=yourpassword node scripts/migrate-dev.mjs');
  process.exit(1);
}

// Derive project ref from URL: https://[ref].supabase.co
const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
// Direct connection (port 5432) — works from local machine
const DB_URL = `postgresql://postgres:${DB_PASSWORD}@db.${projectRef}.supabase.co:5432/postgres`;

// Collect SQL files: schema + migrations in order
const migrationsDir = join(ROOT, 'supabase', 'migrations');
const schemaFile = join(ROOT, 'supabase', 'schema.sql');

const migrationFiles = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort()
  .map(f => join(migrationsDir, f));

const allFiles = [schemaFile, ...migrationFiles];

console.log(`🚀  Running ${allFiles.length} SQL file(s) against dev Supabase (${projectRef})...\n`);

for (const file of allFiles) {
  const name = file.replace(ROOT, '').replace(/^\//, '');
  try {
    execSync(`PGPASSWORD="${DB_PASSWORD}" psql "${DB_URL}" -f "${file}" 2>&1`, { stdio: 'pipe' });
    console.log(`  ✅  ${name}`);
  } catch (err) {
    const output = err.stdout?.toString() || err.message;
    // Ignore "already exists" errors (idempotent)
    if (output.includes('already exists') || output.includes('duplicate')) {
      console.log(`  ⚠️   ${name} (skipped — already exists)`);
    } else {
      console.error(`  ❌  ${name}`);
      console.error(output);
    }
  }
}

console.log('\n✅  Migration complete!');
