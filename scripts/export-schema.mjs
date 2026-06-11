/**
 * Export the current public schema from the production Supabase project.
 * Usage: node scripts/export-schema.mjs
 * Output: supabase/schema.sql
 */
import https from 'https';
import fs from 'fs';

const TOKEN = 'sbp_e9324a69fde7de9535c9e79e202217471409128b';
const REF = 'ielsqkzxdqnhdeqmblra'; // Production (Singapore)

function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const opts = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${REF}/database/query`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ raw: d.substring(0, 500) }); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Get all table definitions via information_schema
const tables = await runSQL(`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`);
const tableNames = Array.isArray(tables) ? tables.map(t => t.tablename) : [];

let schema = `-- ============================================================
-- Optimaz — Full Production Schema
-- Project: ielsqkzxdqnhdeqmblra (Singapore, ap-southeast-1)
-- Generated: ${new Date().toISOString()}
-- !! This file reflects the live schema. Do not edit manually.
-- !! Use migrations in supabase/migrations/ for changes.
-- ============================================================

`;

for (const table of tableNames) {
  process.stdout.write(`Exporting ${table}...`);

  // Get columns
  const cols = await runSQL(`
    SELECT column_name, data_type, udt_name, character_maximum_length,
           is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = '${table}'
    ORDER BY ordinal_position
  `);

  if (!Array.isArray(cols)) { console.log(' SKIP'); continue; }

  schema += `-- Table: ${table}\n`;
  schema += `CREATE TABLE IF NOT EXISTS public.${table} (\n`;

  const colDefs = cols.map(col => {
    let type = col.udt_name;
    // Map common types
    const typeMap = {
      'uuid': 'uuid', 'text': 'text', 'varchar': `varchar(${col.character_maximum_length || ''})`,
      'bool': 'boolean', 'int4': 'integer', 'int8': 'bigint', 'float8': 'double precision',
      'timestamptz': 'timestamptz', 'jsonb': 'jsonb', 'json': 'json',
      '_text': 'text[]', '_varchar': 'text[]',
    };
    type = typeMap[col.udt_name] || col.data_type;
    
    let def = `  ${col.column_name} ${type}`;
    if (col.is_nullable === 'NO') def += ' NOT NULL';
    if (col.column_default) def += ` DEFAULT ${col.column_default}`;
    return def;
  });

  schema += colDefs.join(',\n');
  schema += '\n);\n\n';

  // RLS
  schema += `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;\n\n`;

  // Policies
  const policies = await runSQL(`
    SELECT policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = '${table}'
    ORDER BY cmd, policyname
  `);

  if (Array.isArray(policies) && policies.length > 0) {
    for (const p of policies) {
      if (p.cmd === 'ALL') {
        schema += `CREATE POLICY "${p.policyname}" ON public.${table} FOR ALL USING (${p.qual});\n`;
      } else if (p.cmd === 'SELECT' || p.cmd === 'DELETE' || p.cmd === 'UPDATE') {
        schema += `CREATE POLICY "${p.policyname}" ON public.${table} FOR ${p.cmd} USING (${p.qual});\n`;
      } else if (p.cmd === 'INSERT') {
        schema += `CREATE POLICY "${p.policyname}" ON public.${table} FOR INSERT${p.with_check ? ` WITH CHECK (${p.with_check})` : ''};\n`;
      }
    }
    schema += '\n';
  }

  console.log(` ${cols.length} cols, ${Array.isArray(policies) ? policies.length : 0} policies`);
}

// Grants
schema += `-- ============================================================
-- Grants
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON public.pricing_waitlist TO anon;
GRANT INSERT ON public.app_errors TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO authenticated;
`;

const outPath = '/DATA/Storage/workspace/TaskFlow/supabase/schema.sql';
fs.writeFileSync(outPath, schema);
console.log(`\nSchema saved to supabase/schema.sql (${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
