import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('submits closest form on enter key press', async ({ page }) => {
	await page
		.locator('[data-test-id="test1"]')
		.getByRole('textbox')
		.locator('div')
		.fill('hello world');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/test1?q=hello+world');
});

test('submits form identified by form attribute on enter key press', async ({ page }) => {
	await page
		.locator('[data-test-id="test2"]')
		.getByRole('textbox')
		.locator('div')
		.fill('hello world');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/test2?q=hello+world');
});
