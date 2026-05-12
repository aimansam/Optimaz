import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.SMOKE_BASE_URL ?? 'https://task-flow-ashy-nu.vercel.app';
const authStatePath = process.env.SMOKE_AUTH_STATE ?? 'tests/.auth/user.json';

mkdirSync(dirname(authStatePath), { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();

console.log(`Opening ${baseURL}/auth/login`);
console.log('Sign in with Google in the opened browser. Auth state will be saved after the dashboard loads.');

try {
  await page.goto(new URL('/auth/login', baseURL).toString());
  await page.waitForURL(/\/dashboard/, { timeout: 300_000 });
  await page.context().storageState({ path: authStatePath });
  console.log(`Saved authenticated smoke state to ${authStatePath}`);
} finally {
  await browser.close();
}
