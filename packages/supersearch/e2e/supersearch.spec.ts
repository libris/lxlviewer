import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('submits closest form on enter key press', async ({ page }) => {
	await page.locator('form').getByRole('textbox').locator('div').fill('hello world');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/find?q=hello+world');
});

test('prevents new line characters (e.g. when pasting multi-lined text', async ({
	page,
	context
}) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.locator('form').getByRole('textbox').locator('div').click();
	await page.evaluate(() =>
		navigator.clipboard.writeText(`One
two
three`)
	);
	await page.keyboard.press('Meta+v');
	await expect(page.locator('form').getByRole('textbox').locator('div')).toHaveText(
		'One two three'
	);
});
