import { test, expect } from '@playwright/test';

const offline = page => page.route('**/api/scan', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ detail: 'Unavailable for offline test' }) }));
const noOverflow = async page => expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

test('first screen, input validation, and help keyboard controls', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Message checker', exact: true })).toBeVisible();
  await page.screenshot({ path: `.taste-skill/playwright/${testInfo.project.name}-initial.png`, fullPage: true });
  await noOverflow(page);
  await page.getByRole('button', { name: 'Analyze message' }).click();
  await expect(page.getByRole('alert')).toContainText('at least 5 characters');
  await expect(page.getByRole('textbox')).toBeFocused();
  await page.getByRole('button', { name: 'How it works', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Got it' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close help' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('offline high-risk scan, guidance, report, and reset', async ({ page }, testInfo) => {
  await offline(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Bank impersonation' }).click();
  await expect(page.getByRole('textbox')).toContainText('URGENT');
  await page.getByRole('button', { name: 'Analyze message' }).click();
  const meter = page.getByRole('meter');
  await expect(meter).toHaveAttribute('aria-valuenow', '65');
  await expect(page.getByText('High scam risk', { exact: true })).toBeVisible();
  await expect(page.getByText(/Offline preview ·/)).toBeVisible();
  await page.getByText('What should I do next?', { exact: true }).click();
  await expect(page.getByText('Keep passwords, OTPs and payment PINs private.', { exact: true })).toBeVisible();
  await noOverflow(page);
  await page.screenshot({ path: `.taste-skill/playwright/${testInfo.project.name}-high-risk.png`, fullPage: true });
  await page.getByRole('button', { name: 'Open detailed report' }).click();
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await page.getByRole('button', { name: 'Fraudora home' }).click();
  await expect(page.getByRole('textbox')).toHaveValue('');
  await expect(page.getByRole('meter')).toHaveCount(0);
});

test('offline benign scan and input edits invalidate old results', async ({ page }) => {
  await offline(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Everyday message' }).click();
  await page.getByRole('button', { name: 'Analyze message' }).click();
  await expect(page.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
  await expect(page.getByText('Low detected risk', { exact: true }).first()).toBeVisible();
  await page.getByRole('textbox').fill('A different message to check');
  await expect(page.getByRole('meter')).toHaveCount(0);
});

test('API response, loading state, submitted text, and server validation error', async ({ page }) => {
  let submitted;
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/api/scan', async route => {
    submitted = route.request().postDataJSON().message;
    await gate;
    await route.fulfill({ json: {
      id: 'browser-test', message: submitted, score: 40, level: 'suspicious',
      summary: 'A request for payment needs independent verification.',
      findings: [{ rule_id: 'test-payment', label: 'Payment requested', why: 'A fee is requested.', points: 40, severity: 'medium' }],
      next_steps: ['Verify the sender independently.'], engine: { ai_used: false },
    } });
  });
  await page.goto('/');
  await page.getByRole('textbox').fill('Please pay a fee to release the package.');
  await page.getByRole('button', { name: 'Analyze message' }).click();
  await expect(page.getByRole('button', { name: 'Checking message…' })).toBeDisabled();
  await expect(page.getByRole('textbox')).toBeDisabled();
  release();
  await expect(page.getByRole('meter')).toHaveAttribute('aria-valuenow', '40');
  expect(submitted).toBe('Please pay a fee to release the package.');
  await expect(page.getByText('Worth a closer look', { exact: true })).toBeVisible();
  await expect(page.getByText('Offline preview ·', { exact: false })).toHaveCount(0);
  await page.unroute('**/api/scan');
  await page.route('**/api/scan', route => route.fulfill({ status: 422, json: { detail: 'Message rejected by validation.' } }));
  await page.getByRole('button', { name: 'Analyze message' }).click();
  await expect(page.getByRole('alert')).toContainText('Message rejected by validation.');
  await expect(page.getByRole('meter')).toHaveCount(0);
});
