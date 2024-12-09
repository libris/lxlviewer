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

test('expanded search is closable', async ({ page }) => {
	await page.locator('[data-test-id="test1"]').getByRole('textbox').locator('div').click();
	await expect(page.locator('[data-test-id="test1"]').getByRole('dialog').first()).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(
		page.locator('[data-test-id="test1"]').getByRole('dialog').first(),
		'by pressing the Escape key'
	).not.toBeVisible();
	await page.locator('[data-test-id="test1"]').getByRole('textbox').locator('div').click();
	await page
		.locator('[data-test-id="test1"]')
		.getByRole('dialog')
		.first()
		.click({ position: { x: 0, y: 0 } });
	await expect(
		page.locator('[data-test-id="test1"]').getByRole('dialog').first(),
		'by clicking outside'
	).not.toBeVisible();
});

test('expanded search is togglable using keyboard shortcut', async ({ page }) => {
	await page.locator('[data-test-id="test1"]').getByRole('textbox').press('Tab');
	await expect(page.locator('[data-test-id="test2"]').getByRole('textbox')).toBeFocused();
	await page.keyboard.press('ControlOrMeta+k');
	await expect(page.locator('[data-test-id="test1"]').getByRole('dialog').first()).toBeVisible();
	await page.keyboard.press('ControlOrMeta+k');
	await expect(
		page.locator('[data-test-id="test1"]').getByRole('dialog').first()
	).not.toBeVisible();
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

test('fetches and displays paginated results', async ({ page }) => {
	await page.locator('[data-test-id="test1"]').getByRole('textbox').locator('div').click();
	await page
		.locator('[data-test-id="test1"]')
		.getByRole('dialog')
		.getByRole('textbox')
		.locator('div')
		.fill('Hello');
	await expect(page.locator('[data-test-id="result-item"]').first()).toContainText('Heading 1');
	await expect(page.locator('[data-test-id="result-item"]')).toHaveCount(10);
	await page.locator('.supersearch-show-more').click(); // show more button will probably be removed in favour of automatic fetching when the user scrolls to the end
	await expect(page.locator('[data-test-id="result-item"]')).toHaveCount(20);
	await page.locator('.supersearch-show-more').click();
	await expect(page.locator('[data-test-id="result-item"]')).toHaveCount(30);
	await expect(page.locator('.supersearch-show-more')).not.toBeAttached();
	await expect(
		page.locator('[data-test-id="result-item"]').first(),
		'to tranform data using transformFn if available'
	).toHaveText('Heading 1 for "Hello"');
});

test('handles keyboard navigation between focusable items', async ({ page }) => {
	await page.locator('[data-test-id="test1"]').getByRole('textbox').click();
	await page.getByRole('dialog').getByRole('textbox').fill('hello world');
	await page.waitForTimeout(500); // timeout is needed for some reason...
	await page.keyboard.press('ArrowDown');
	await expect(
		await page.getByRole('dialog').locator('nav ul').getByRole('button').nth(0)
	).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await expect(
		await page.getByRole('dialog').locator('nav ul').getByRole('button').nth(2)
	).toBeFocused();
	await page.keyboard.press('ArrowUp');
	await expect(
		await page.getByRole('dialog').locator('nav ul').getByRole('button').nth(1)
	).toBeFocused();
	await page.keyboard.press('ArrowUp');
	await page.keyboard.press('ArrowUp');
	await expect(await page.getByRole('dialog').getByRole('textbox')).toBeFocused();
});
