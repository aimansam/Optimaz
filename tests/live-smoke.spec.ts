import { expect, test } from '@playwright/test';

const authState = process.env.SMOKE_AUTH_STATE;

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
  });

  test('monitoring endpoint validates payloads', async ({ request }) => {
    const response = await request.post('/api/monitoring/errors', {
      data: {},
    });

    expect([400, 405]).toContain(response.status());
  });
});

test.describe('authenticated live smoke', () => {
  test.skip(!authState, 'Set SMOKE_AUTH_STATE=tests/.auth/user.json to run authenticated live smoke tests.');
  test.use({ storageState: authState });

  test('core app pages render for signed-in users', async ({ page }) => {
    await page.goto('/dashboard?smoke=1');
    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Task' })).toBeVisible();

    await page.goto('/projects?smoke=1');
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Project' })).toBeVisible();

    await page.goto('/goals?smoke=1');
    await expect(page.getByRole('heading', { name: 'Goals' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Goal' })).toBeVisible();

    await page.goto('/kanban?smoke=1');
    await expect(page.getByRole('heading', { name: 'Kanban' })).toBeVisible();
    await expect(page.getByText('To Do')).toBeVisible();
    await expect(page.getByText('In Progress')).toBeVisible();
    await expect(page.getByText('Done')).toBeVisible();

    await page.goto('/settings?smoke=1');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
    await expect(page.getByText('Export your data')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('notification center opens from the header', async ({ page }) => {
    await page.goto('/dashboard?smoke=notifications');

    await page.getByRole('button', { name: 'Notifications' }).click();
    await expect(page.getByText('Task alerts and recent progress')).toBeVisible();
  });

  test('feedback dialog opens from the header', async ({ page }) => {
    await page.goto('/dashboard?smoke=feedback');

    await page.getByRole('button', { name: 'Send feedback' }).click();
    await expect(page.getByRole('heading', { name: 'Send feedback' })).toBeVisible();
    await expect(page.getByLabel('Category')).toBeVisible();
    await expect(page.getByLabel('Message')).toBeVisible();
  });
});
