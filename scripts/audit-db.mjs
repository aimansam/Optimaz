import https from 'https';

const TOKEN = 'sbp_e9324a69fde7de9535c9e79e202217471409128b';
const PROJECTS = [
  { name: 'PRODUCTION (Singapore)', ref: 'ielsqkzxdqnhdeqmblra' },
  { name: 'DEV', ref: 'tikxjczmegyltzwymmra' },
];

function runSQL(ref, sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const opts = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${ref}/database/query`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ raw: d.substring(0, 200) }); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

for (const proj of PROJECTS) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`PROJECT: ${proj.name} (${proj.ref})`);
  console.log('='.repeat(60));

  // 1. Tables
  const tables = await runSQL(proj.ref, `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`);
  const tableNames = Array.isArray(tables) ? tables.map(t => t.tablename) : [];
  console.log(`\nTables (${tableNames.length}): ${tableNames.join(', ')}`);

  // 2. Table grants
  const grants = await runSQL(proj.ref, `
    SELECT grantee, table_name, string_agg(privilege_type, ',' ORDER BY privilege_type) as privs
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public' AND grantee IN ('anon','authenticated')
    GROUP BY grantee, table_name ORDER BY table_name, grantee
  `);
  console.log('\n--- GRANTS ---');
  if (Array.isArray(grants)) {
    for (const t of tableNames) {
      const auth = grants.find(g => g.table_name === t && g.grantee === 'authenticated');
      const anon = grants.find(g => g.table_name === t && g.grantee === 'anon');
      const authOk = auth?.privs?.includes('SELECT') && auth?.privs?.includes('INSERT') ? '✅' : '❌';
      const anonOk = anon?.privs?.includes('SELECT') ? '✅' : '❌';
      console.log(`  ${t}: auth ${authOk} [${auth?.privs || 'NONE'}]  anon ${anonOk} [${anon?.privs || 'NONE'}]`);
    }
  }

  // 3. RLS policies
  const policies = await runSQL(proj.ref, `
    SELECT tablename, policyname, cmd
    FROM pg_policies WHERE schemaname='public' ORDER BY tablename, cmd
  `);
  console.log('\n--- RLS POLICIES ---');
  if (Array.isArray(policies)) {
    for (const t of tableNames) {
      const tPolicies = policies.filter(p => p.tablename === t);
      const cmds = tPolicies.map(p => p.cmd).join(',');
      const hasSelect = cmds.includes('SELECT');
      const hasInsert = cmds.includes('INSERT');
      const icon = (hasSelect && hasInsert) ? '✅' : (tPolicies.length > 0 ? '⚠️' : '❌');
      console.log(`  ${icon} ${t}: ${tPolicies.length} policies [${cmds || 'NONE'}]`);
    }
  }

  // 4. Tables missing from policies
  const policyTables = Array.isArray(policies) ? [...new Set(policies.map(p => p.tablename))] : [];
  const missingPolicies = tableNames.filter(t => !policyTables.includes(t));
  if (missingPolicies.length > 0) {
    console.log(`\n❌ TABLES MISSING POLICIES: ${missingPolicies.join(', ')}`);
  } else {
    console.log('\n✅ All tables have RLS policies');
  }

  // 5. pricing_waitlist — anon needs INSERT (public signup form)
  const pwInsert = await runSQL(proj.ref, `
    SELECT count(*) as n FROM information_schema.role_table_grants
    WHERE table_schema='public' AND table_name='pricing_waitlist' AND grantee='anon' AND privilege_type='INSERT'
  `);
  const pwOk = Array.isArray(pwInsert) ? parseInt(pwInsert[0].n) > 0 : false;
  console.log(`\n${pwOk ? '✅' : '❌'} pricing_waitlist: anon INSERT ${pwOk ? 'granted' : 'MISSING (public form needs this)'}`);

  // 6. app_errors — anon needs INSERT (error monitoring without auth)
  const aeInsert = await runSQL(proj.ref, `
    SELECT count(*) as n FROM information_schema.role_table_grants
    WHERE table_schema='public' AND table_name='app_errors' AND grantee='anon' AND privilege_type='INSERT'
  `);
  const aeOk = Array.isArray(aeInsert) ? parseInt(aeInsert[0].n) > 0 : false;
  console.log(`${aeOk ? '✅' : '❌'} app_errors: anon INSERT ${aeOk ? 'granted' : 'MISSING (error monitoring needs this)'}`);
}

console.log('\nAudit complete.');
