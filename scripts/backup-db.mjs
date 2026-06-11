/**
 * Backup the production Supabase database schema + row counts.
 * Usage: SUPABASE_ACCESS_TOKEN=<token> node scripts/backup-db.mjs
 *        Or with .env.local: node --env-file=.env.local scripts/backup-db.mjs
 * Output: supabase/backup/backup-<timestamp>.json
 *
 * Note: supabase/backup/ is gitignored — backups are stored locally only.
 * In CI (GitHub Actions), the backup is uploaded as a workflow artifact.
 */
import https from 'https';
import fs from 'fs';
import path from 'path';

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) {
  console.error('❌ Missing SUPABASE_ACCESS_TOKEN env var.');
  console.error('   Add it to .env.local or export it before running.');
  process.exit(1);
}

const PROJECTS = [
  { name: 'PRODUCTION', ref: 'ielsqkzxdqnhdeqmblra', region: 'Singapore (ap-southeast-1)' },
  { name: 'DEV',        ref: 'tikxjczmegyltzwymmra', region: 'Dev' },
];

function apiRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.supabase.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function runSQL(ref, sql) {
  return apiRequest(`/v1/projects/${ref}/database/query`, 'POST', { query: sql });
}

async function backupProject(proj) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📦 Backing up: ${proj.name} (${proj.ref}) — ${proj.region}`);
  console.log('─'.repeat(60));

  const result = {
    project: proj.name,
    ref: proj.ref,
    region: proj.region,
    timestamp: new Date().toISOString(),
    tables: {},
    summary: { tableCount: 0, totalRows: 0, errors: [] },
  };

  // 1. Get all public tables
  const tablesRes = await runSQL(proj.ref,
    `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
  );
  if (!Array.isArray(tablesRes.data)) {
    result.summary.errors.push(`Failed to list tables: ${JSON.stringify(tablesRes.data).substring(0, 200)}`);
    return result;
  }
  const tableNames = tablesRes.data.map(t => t.tablename);
  result.summary.tableCount = tableNames.length;
  console.log(`   Tables: ${tableNames.join(', ')}`);

  // 2. For each table: get columns + row count
  for (const table of tableNames) {
    process.stdout.write(`   ${table}: `);

    // Columns
    const colsRes = await runSQL(proj.ref, `
      SELECT column_name, data_type, udt_name, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = '${table}'
      ORDER BY ordinal_position
    `);

    // Row count
    const countRes = await runSQL(proj.ref,
      `SELECT COUNT(*)::int AS n FROM public."${table}"`
    );

    const columns = Array.isArray(colsRes.data) ? colsRes.data : [];
    const rowCount = Array.isArray(countRes.data) ? (countRes.data[0]?.n ?? '?') : '?';

    result.tables[table] = { columns, rowCount };
    result.summary.totalRows += typeof rowCount === 'number' ? rowCount : 0;

    console.log(`${columns.length} cols, ${rowCount} rows`);
  }

  // 3. Get RLS policies
  const policiesRes = await runSQL(proj.ref, `
    SELECT tablename, policyname, cmd, qual, with_check, roles
    FROM pg_policies WHERE schemaname='public' ORDER BY tablename, cmd, policyname
  `);
  result.policies = Array.isArray(policiesRes.data) ? policiesRes.data : [];

  // 4. Get grants
  const grantsRes = await runSQL(proj.ref, `
    SELECT grantee, table_name, string_agg(privilege_type, ',' ORDER BY privilege_type) AS privs
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public' AND grantee IN ('anon','authenticated')
    GROUP BY grantee, table_name ORDER BY table_name, grantee
  `);
  result.grants = Array.isArray(grantsRes.data) ? grantsRes.data : [];

  // 5. Get migrations applied (if the table exists)
  const migrationsRes = await runSQL(proj.ref,
    `SELECT version, name, inserted_at FROM supabase_migrations.schema_migrations ORDER BY inserted_at DESC LIMIT 50`
  );
  result.migrations = Array.isArray(migrationsRes.data) ? migrationsRes.data : [];

  console.log(`\n   ✅ ${result.summary.tableCount} tables, ${result.summary.totalRows} total rows`);
  return result;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
const outDir = path.join(process.cwd(), 'supabase', 'backup');
fs.mkdirSync(outDir, { recursive: true });

const backup = {
  generatedAt: new Date().toISOString(),
  generatedBy: 'scripts/backup-db.mjs',
  projects: [],
};

for (const proj of PROJECTS) {
  const result = await backupProject(proj);
  backup.projects.push(result);
}

const outFile = path.join(outDir, `backup-${timestamp}.json`);
fs.writeFileSync(outFile, JSON.stringify(backup, null, 2));

const sizeKB = Math.round(fs.statSync(outFile).size / 1024);
console.log(`\n${'═'.repeat(60)}`);
console.log(`✅ Backup complete → supabase/backup/backup-${timestamp}.json (${sizeKB} KB)`);
console.log('   (This file is gitignored — stored locally / uploaded as CI artifact)');

// Summary table
for (const p of backup.projects) {
  console.log(`\n   ${p.project}: ${p.summary.tableCount} tables, ${p.summary.totalRows} rows`);
  if (p.summary.errors.length) {
    for (const e of p.summary.errors) console.error(`   ❌ ${e}`);
  }
}
