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

test('prevents new line characters (e.g. when pasting multi-lined text', async ({
	page,
	context
}) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.locator('[data-test-id="test1"]').getByRole('textbox').first().locator('div').click();
	await page.evaluate(() =>
		navigator.clipboard.writeText(`One
two
three`)
	);
	await page.keyboard.press(`ControlOrMeta+v`);
	await expect(
		page.locator('[data-test-id="test1"]').getByRole('textbox').first().locator('div')
	).toHaveText('One two three');
});

test('syncs collapsed and expanded editor views', async ({ page }) => {
	await page.locator('[data-test-id="test1"]').getByRole('textbox').locator('div').click();
	await page
		.locator('[data-test-id="test1"]')
		.getByRole('dialog')
		.getByRole('textbox')
		.locator('div')
		.fill('Hello world');
	await page
		.locator('[data-test-id="test1"]')
		.getByRole('dialog')
		.getByRole('textbox')
		.selectText();
	await page
		.locator('[data-test-id="test1"]')
		.getByRole('dialog')
		.getByRole('textbox')
		.press('Escape');
	await expect(
		await page.locator('[data-test-id="test1"]').getByRole('textbox').locator('div'),
		'contents should be synced'
	).toHaveText('Hello world');
	expect(
		await page.evaluate(() => window.getSelection()?.toString()),
		'text selection should be synced'
	).toBe('Hello world');
});
