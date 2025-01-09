import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('prevents new line characters (e.g. when pasting multi-lined text)', async ({
	page,
	context
}) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.locator('[data-test-id="test1"]').getByRole('combobox').first().click();
	await page.evaluate(() =>
		navigator.clipboard.writeText(`One
two
three`)
	);
	await page.keyboard.press(`ControlOrMeta+v`);
	await expect(page.locator('[data-test-id="test1"]').getByRole('combobox').first()).toHaveText(
		'One two three'
	);
});

test('expanded search is closable', async ({ page }) => {
	await page.locator('[data-test-id="test1"]').getByRole('combobox').click();
	await expect(page.locator('[data-test-id="test1"]').getByRole('dialog').first()).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(
		page.locator('[data-test-id="test1"]').getByRole('dialog').first(),
		'by pressing the Escape key'
	).not.toBeVisible();
	await page.locator('[data-test-id="test1"]').getByRole('combobox').click();
	await page.mouse.click(0, 0);
	await expect(
		page.locator('[data-test-id="test1"]').getByRole('dialog').first(),
		'by clicking outside'
	).not.toBeVisible();
});

test('expanded search is togglable using keyboard shortcut', async ({ page }) => {
	await page.locator('[data-test-id="test1"]').getByRole('combobox').first().press('Tab');
	await expect(page.locator('[data-test-id="test2"]').getByRole('combobox').first()).toBeFocused();
	await page.keyboard.press('ControlOrMeta+k');
	await expect(page.locator('[data-test-id="test1"]').getByRole('dialog').first()).toBeVisible();
	await page.keyboard.press('ControlOrMeta+k');
	await expect(
		page.locator('[data-test-id="test1"]').getByRole('dialog').first()
	).not.toBeVisible();
});

test('supports keyboard navigation between rows and columns/cells', async ({ page }) => {
	await page.locator('[data-test-id="test1"]').getByRole('combobox').first().fill('a');
	const comboboxElement = page
		.locator('[data-test-id="test1"]')
		.getByRole('dialog')
		.getByRole('combobox');
	await expect(
		comboboxElement,
		'first row and cell is selected by default (if defaultRow is set to 0)'
	).toHaveAttribute('aria-activedescendant', 'supersearch-result-item-0x0');
	await expect(page.locator('#supersearch-result-item-0x0')).toHaveClass(/focused-cell/);
	await page.keyboard.press('ArrowDown');
	await expect(comboboxElement).toHaveAttribute(
		'aria-activedescendant',
		'supersearch-result-item-1x0'
	);
	await expect(page.locator('#supersearch-result-item-1x0')).toHaveClass(/focused-cell/);
	await page.keyboard.press('ArrowRight');
	await expect(comboboxElement).toHaveAttribute(
		'aria-activedescendant',
		'supersearch-result-item-1x1'
	);
	await page.keyboard.press('ArrowLeft');
	await expect(comboboxElement).toHaveAttribute(
		'aria-activedescendant',
		'supersearch-result-item-1x0'
	);
	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('ArrowRight');
	await expect(comboboxElement).toHaveAttribute(
		'aria-activedescendant',
		'supersearch-result-item-1x2'
	);
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await expect(
		comboboxElement,
		`selects closest cell if latest column isn't available on new row`
	).toHaveAttribute('aria-activedescendant', 'supersearch-result-item-3x1');
	await page.locator('[data-test-id="test1"]').getByRole('combobox').first().fill('ab');
	await expect(
		comboboxElement,
		'focused cell is reset if user updates value in combobox'
	).toHaveAttribute('aria-activedescendant', 'supersearch-result-item-0x0');
	await expect(page.locator('#supersearch-result-item-0x0')).toHaveClass(/focused-cell/);
	await page.keyboard.press('Tab');
	await expect(page.locator('#supersearch-result-item-1x0')).toHaveClass(/focused-cell/);
	await page.keyboard.press('Tab');
	await expect(page.locator('#supersearch-result-item-1x1')).toHaveClass(/focused-cell/);
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Shift+Tab');
	await expect(
		page.locator('#supersearch-result-item-0x0'),
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
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await expect(
		page.locator('#supersearch-result-item-9x2'),
		'ensure focus is kept inside result items when tabbing on last row'
	).toHaveClass(/focused-cell/);
	await page
		.locator('[data-test-id="test1"]')
		.getByRole('dialog')
		.getByRole('combobox')
		.press('Escape');
	await page.locator('[data-test-id="test1"]').getByRole('combobox').first().click();
	await expect(page.locator('#supersearch-result-item-0x0')).toHaveClass(/focused-cell/);
});

test('syncs collapsed and expanded editor views', async ({ page }) => {
	await page.locator('[data-test-id="test1"]').getByRole('combobox').first().click();
	await page
		.locator('[data-test-id="test1"]')
		.getByRole('dialog')
		.getByRole('combobox')
		.fill('Hello world');
	await page
		.locator('[data-test-id="test1"]')
		.getByRole('dialog')
		.getByRole('combobox')
		.selectText();
	await page
		.locator('[data-test-id="test1"]')
		.getByRole('dialog')
		.getByRole('combobox')
		.press('Escape');
	await expect(
		await page.locator('[data-test-id="test1"]').getByRole('combobox').first(),
		'contents should be synced'
	).toHaveText('Hello world');
	expect(
		await page.evaluate(() => window.getSelection()?.toString()),
		'text selection should be synced'
	).toBe('Hello world');
});

test('fires click events on focused cells', async ({ page }) => {
	await page.locator('[data-test-id="test1"]').getByRole('combobox').first().fill('a');
	await expect(page.locator('#supersearch-result-item-0x0')).toHaveClass(/focused-cell/);
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/test1#supersearch-result-item-1x0');
});

test('fetches and displays paginated results', async ({ page }) => {
	await page.locator('[data-test-id="test1"]').getByRole('combobox').first().click();
	await page
		.locator('[data-test-id="test1"]')
		.getByRole('dialog')
		.getByRole('combobox')
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

test('submits form identified by form attribute on enter key press (if no result item is selected)', async ({
	page
}) => {
	await page.locator('[data-test-id="test2"]').getByRole('combobox').first().fill('hello world');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/test2?q=hello+world');
});
