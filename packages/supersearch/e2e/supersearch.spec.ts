import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('submits closest form on enter key press', async ({ page }) => {
  await page.locator('form').getByRole('textbox').locator('div').fill('hello world')
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/find?q=hello+world')
});