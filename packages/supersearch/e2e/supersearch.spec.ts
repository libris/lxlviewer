import { test, expect, devices } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('prevents new line characters (e.g. when pasting multi-lined text)', async ({
	page,
	context
}) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.getByTestId('test1').getByRole('combobox').first().click();
	await page.evaluate(() =>
		navigator.clipboard.writeText(`One
two
three`)
	);
	await page.keyboard.press(`ControlOrMeta+v`);
	await expect(page.getByTestId('test1').getByRole('combobox').first()).toHaveText('One two three');
});

test('expanded search is closable', async ({ page }) => {
	await page.getByTestId('test1').getByRole('combobox').click();
	await expect(page.getByTestId('test1').getByRole('dialog').first()).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(
		page.getByTestId('test1').getByRole('dialog').first(),
		'by pressing the Escape key'
	).not.toBeVisible();
	await page.getByTestId('test1').getByRole('combobox').click();
	await page.mouse.click(0, 0);
	await expect(
		page.getByTestId('test1').getByRole('dialog').first(),
		'by clicking outside'
	).not.toBeVisible();
	await page.setViewportSize(devices['iPhone X'].viewport);
	await page.getByTestId('test1').getByRole('combobox').click();
	await page.locator('[aria-label="Close"]').click();
	await expect(
		page.getByTestId('test1').getByRole('dialog').first(),
		'by pressing close action'
	).not.toBeVisible();
});

test('expanded search is togglable using keyboard shortcut', async ({ page }) => {
	await page.getByTestId('test1').getByRole('combobox').first().press('Tab');
	await page.keyboard.press('ControlOrMeta+k');
	await expect(page.getByTestId('test1').getByRole('dialog').first()).toBeVisible();
	await page.keyboard.press('ControlOrMeta+k');
	await expect(page.getByTestId('test1').getByRole('dialog').first()).not.toBeVisible();
});

test('supports keyboard navigation between rows and columns/cells', async ({ page }) => {
	await page.getByTestId('test1').getByRole('combobox').first().fill('a');
	const comboboxElement = page.getByTestId('test1').getByRole('dialog').getByRole('combobox');
	await expect(
		comboboxElement,
		'first row and cell is selected by default (if defaultRow is set to 0)'
	).toHaveAttribute('aria-activedescendant', 'supersearch-item-0x0');
	await expect(page.locator('#supersearch-item-0x0')).toHaveClass(/focused-cell/);
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await expect(comboboxElement).toHaveAttribute('aria-activedescendant', 'supersearch-item-2x0');
	await expect(page.locator('#supersearch-item-2x0')).toHaveClass(/focused-cell/);
	await page.keyboard.press('ArrowRight');
	await expect(comboboxElement).toHaveAttribute('aria-activedescendant', 'supersearch-item-2x1');
	await page.keyboard.press('ArrowLeft');
	await expect(comboboxElement).toHaveAttribute('aria-activedescendant', 'supersearch-item-2x0');
	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('ArrowRight');
	await expect(comboboxElement).toHaveAttribute('aria-activedescendant', 'supersearch-item-2x2');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await expect(
		comboboxElement,
		`selects closest cell if latest column isn't available on new row`
	).toHaveAttribute('aria-activedescendant', 'supersearch-item-4x1');
	await page.getByTestId('test1').getByRole('combobox').first().fill('ab');
	await expect(
		comboboxElement,
		'focused cell is reset if user updates value in combobox'
	).toHaveAttribute('aria-activedescendant', 'supersearch-item-0x0');
	await expect(page.locator('#supersearch-item-0x0')).toHaveClass(/focused-cell/);
	await page.keyboard.press('Tab');
	await expect(page.locator('#supersearch-item-1x0')).toHaveClass(/focused-cell/);
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await expect(page.locator('#supersearch-item-2x1')).toHaveClass(/focused-cell/);
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Shift+Tab');
	await expect(
		page.locator('#supersearch-item-0x0'),
		'ensure focus is kept inside result items when shift-tabbing on first row'
	).toHaveClass(/focused-cell/);
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await expect(
		page.locator('#supersearch-item-10x2'),
		'ensure focus is kept inside result items when tabbing on last row'
	).toHaveClass(/focused-cell/);
	await page.getByTestId('test1').getByRole('dialog').getByRole('combobox').press('Escape');
	await page.getByTestId('test1').getByRole('combobox').first().click();
	await expect(page.locator('#supersearch-item-0x0')).toHaveClass(/focused-cell/);
});

test('syncs collapsed and expanded editor views', async ({ page }) => {
	await page.getByTestId('test1').getByRole('combobox').first().click();
	await page.getByTestId('test1').getByRole('dialog').getByRole('combobox').fill('Hello world');
	await page.getByTestId('test1').getByRole('dialog').getByRole('combobox').selectText();
	await page.getByTestId('test1').getByRole('dialog').getByRole('combobox').press('Escape');
	await expect(
		await page.getByTestId('test1').getByRole('combobox').first(),
		'contents should be synced'
	).toHaveText('Hello world');
	expect(
		await page.evaluate(() => window.getSelection()?.toString()),
		'text selection should be synced'
	).toBe('Hello world');
});

test('fires click events on focused cells', async ({ page }) => {
	await page.getByTestId('test1').getByRole('combobox').first().fill('a');
	await expect(page.locator('#supersearch-item-1x0')).toBeVisible();
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/test1#supersearch-item-1x0');
});

test('fetches and displays paginated results', async ({ page }) => {
	await page.getByTestId('test1').getByRole('combobox').first().click();
	await page.getByTestId('test1').getByRole('dialog').getByRole('combobox').fill('Hello');
	await expect(page.getByTestId('result-item').first()).toContainText('Heading 1');
	await expect(page.getByTestId('result-item')).toHaveCount(10);
	await page.locator('.supersearch-show-more').click(); // show more button will probably be removed in favour of automatic fetching when the user scrolls to the end
	await expect(page.getByTestId('result-item')).toHaveCount(20);
	await page.locator('.supersearch-show-more').click();
	await expect(page.getByTestId('result-item')).toHaveCount(30);
	await expect(page.locator('.supersearch-show-more')).not.toBeAttached();
	await expect(
		page.getByTestId('result-item').first(),
		'to tranform data using transformFn if available'
	).toHaveText('Heading 1 for "Hello"');
});

test('submits form identified by form attribute on enter key press (if no result item is selected)', async ({
	page
}) => {
	await page.getByTestId('test2').getByRole('combobox').first().fill('hello world');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/test2?q=hello+world');
});

test('submits form when pressing submit action', async ({ page }) => {
	await page.getByTestId('test1').locator('[type=submit]').first().click();
	await expect(page, 'submit action should only be triggered if there is a value').toHaveURL('/');
	await page.getByTestId('test1').getByRole('combobox').first().fill('hello world');
	await page.getByTestId('test1').getByRole('dialog').first().locator('[type=submit]').click();
	await expect(page).toHaveURL('/test1?q=hello+world');
});

test('clears input form when pressing clear action', async ({ page }) => {
	await page.getByTestId('test1').getByRole('combobox').first().click();
	await page.getByTestId('test1').getByRole('dialog').getByRole('combobox').fill('Hello world');
	await expect(await page.getByTestId('test1').getByRole('combobox').first()).toHaveText(
		'Hello world'
	);
	await page.getByTestId('test1').getByRole('dialog').locator('[type=reset]').click();
	await expect(
		page.getByTestId('test1').getByRole('dialog').locator('[type=reset]')
	).not.toBeVisible();
	await expect(await page.getByTestId('test1').getByRole('combobox').first()).toHaveText('Search');
});

test('has support for persistent items', async ({ page }) => {
	await page.getByTestId('test1').getByRole('combobox').first().click();
	await expect(page.getByTestId('persistent-item')).toBeVisible();
	await page.getByTestId('test1').getByRole('dialog').getByRole('combobox').fill('Hello world');
	await expect(page.getByTestId('persistent-item')).toBeVisible();
});
