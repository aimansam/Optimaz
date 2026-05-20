import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const authState = process.env.SMOKE_AUTH_STATE;
const hasAuthState = Boolean(authState && existsSync(authState));

async function expectSignedInPage(page: Page, path: string, heading: string) {
  await page.goto(`${path}?smoke=1`);

  if (page.url().includes('/auth/login')) {
    throw new Error('Authenticated smoke state is missing or expired. Re-run npm run test:smoke:auth-state, then retry with SMOKE_AUTH_STATE=tests/.auth/user.json.');
  }

  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
}

test.describe('public live smoke', () => {
  test('login page exposes Google sign-in only', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page.getByRole('heading', { name: 'TaskFlow' })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /github/i })).toHaveCount(0);
  });

  test('protected app route redirects anonymous users to login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('PWA assets are available', async ({ request }) => {
    const manifest = await request.get('/manifest.json');
    const serviceWorker = await request.get('/sw.js');

    expect(manifest.ok()).toBe(true);
    expect(serviceWorker.ok()).toBe(true);
    expect(manifest.headers()['content-type']).toMatch(/application\/manifest\+json|application\/json/);
  });

  test('legal pages are public', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();

    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();

    await page.goto('/pricing');
    if (page.url().includes('/auth/login')) {
      await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
      return;
    }
    await expect(page.getByRole('heading', { name: 'TaskFlow is free during beta' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Join waitlist' })).toBeVisible();
  });

  test('pricing waitlist validates payloads', async ({ request }) => {
    const response = await request.post('/api/pricing-waitlist', {
      data: {},
    });

    expect([400, 405]).toContain(response.status());
  });

  test('monitoring endpoint validates payloads', async ({ request }) => {
    const response = await request.post('/api/monitoring/errors', {
      data: {},
    });

    expect([400, 405]).toContain(response.status());
  });
});

test.describe('authenticated live smoke', () => {
  test.skip(!hasAuthState, 'Set SMOKE_AUTH_STATE=tests/.auth/user.json after running npm run test:smoke:auth-state.');
  test.use({ storageState: authState });

  test('core app pages render for signed-in users', async ({ page }) => {
    await expectSignedInPage(page, '/dashboard', 'Today');
    await expect(page.getByRole('button', { name: 'Add Task' })).toBeVisible();

    await expectSignedInPage(page, '/projects', 'Projects');
    await expect(page.getByRole('button', { name: 'Add Project' })).toBeVisible();

    await expectSignedInPage(page, '/goals', 'Goals');
    await expect(page.getByRole('button', { name: 'Add Goal' })).toBeVisible();

    await expectSignedInPage(page, '/routines', 'Routines');
    await expect(page.getByRole('button', { name: 'Add routine' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');

    await expectSignedInPage(page, '/calendar', 'Calendar');
    await expect(page.getByRole('button', { name: 'Month' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Week' }).click();
    await expect(page.getByRole('button', { name: 'Week' })).toHaveAttribute('aria-pressed', 'true');

    await expectSignedInPage(page, '/kanban', 'Kanban');
    await expect(page.getByText('To Do')).toBeVisible();
    await expect(page.getByText('In Progress')).toBeVisible();
    await expect(page.getByText('Done')).toBeVisible();

    await expectSignedInPage(page, '/settings', 'Settings');
    await expect(page.getByRole('heading', { name: 'Account settings' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Push Notifications' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('notification center opens from the header', async ({ page }) => {
    await page.goto('/dashboard?smoke=notifications');

    await page.getByRole('button', { name: 'Notifications' }).click();
    await expect(page.getByText('Task alerts and recent progress')).toBeVisible();
  });

  test('kanban filters expose project and quick-view controls', async ({ page }) => {
    await page.goto('/kanban?smoke=filters');

    await page.getByRole('button', { name: 'Show filters' }).click();
    await expect(page.getByLabel('Filter by project or subproject')).toBeVisible();
    await expect(page.getByLabel('Filter by priority')).toBeVisible();
    await expect(page.getByLabel('Done task visibility')).toBeVisible();

    await page.getByRole('button', { name: 'Urgent' }).click();
    await expect(page.getByRole('button', { name: 'Urgent' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('feedback dialog opens from the header', async ({ page }) => {
    await page.goto('/dashboard?smoke=feedback');

    await page.getByRole('button', { name: 'Send feedback' }).click();
    await expect(page.getByRole('heading', { name: 'Send feedback' })).toBeVisible();
    await expect(page.getByLabel('Category')).toBeVisible();
    await expect(page.getByLabel('Message')).toBeVisible();
  });
});
