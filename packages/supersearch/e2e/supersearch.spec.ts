import { test, expect, devices } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('prevents new line characters (e.g. when pasting multi-lined text)', async ({
	page,
	context
}) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.getByRole('combobox').click();
	await page.evaluate(() =>
		navigator.clipboard.writeText(`One
two
three`)
	);
	await page.keyboard.press(`ControlOrMeta+v`);
	await expect(page.getByRole('dialog').getByRole('combobox')).toHaveText('One two three');
});

test('expanded search is closable', async ({ page }) => {
	await page.getByRole('combobox').click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog'), 'by pressing the Escape key').not.toBeVisible();
	await page.getByRole('combobox').click();
	await page.mouse.click(0, 0);
	await expect(page.getByRole('dialog'), 'by clicking outside').not.toBeVisible();
	await page.setViewportSize(devices['iPhone X'].viewport);
	await page.getByRole('combobox').click();
	await page.locator('[aria-label="Close"]').click();
	await expect(page.getByRole('dialog'), 'by pressing close action').not.toBeVisible();
});

test('expanded search is togglable using keyboard shortcut', async ({ page }) => {
	await page.getByRole('combobox').press('Tab');
	await page.keyboard.press('ControlOrMeta+k');
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.keyboard.press('ControlOrMeta+k');
	await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('supports keyboard navigation between rows and columns/cells', async ({ page }) => {
	await page.getByRole('combobox').click();
	const comboboxElement = page.getByRole('dialog').getByRole('combobox');
	await expect(comboboxElement, 'no item cell is focused initially').not.toHaveAttribute(
		'aria-activedescendant',
		/.+/
	);
	await page.getByRole('dialog').getByRole('combobox').fill('a');
	await expect(page.getByTestId('result-item')).toHaveCount(10);

	await page.keyboard.press('Tab');
	await expect(
		page.getByRole('dialog').getByRole('combobox'),
		'items on input row are focusable using tab'
	).toHaveAttribute('aria-activedescendant', 'supersearch-item-0x1');
	await page.keyboard.press('Tab');

	await expect(page.getByRole('dialog').getByRole('combobox')).toHaveAttribute(
		'aria-activedescendant',
		'supersearch-item-0x2'
	);
	await page.keyboard.press('Tab');
	await expect(page.getByRole('dialog').getByRole('combobox')).toHaveAttribute(
		'aria-activedescendant',
		'supersearch-item-1x0'
	);
	await page.keyboard.press('Shift+Tab');
	await expect(page.getByRole('dialog').getByRole('combobox')).toHaveAttribute(
		'aria-activedescendant',
		'supersearch-item-0x2'
	);
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Shift+Tab');
	await expect(page.getByRole('dialog').getByRole('combobox')).toHaveAttribute(
		'aria-activedescendant',
		'supersearch-item-0x1'
	);
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await expect(comboboxElement).toHaveAttribute('aria-activedescendant', 'supersearch-item-3x0');
	await expect(page.locator('#supersearch-item-3x0')).toHaveClass(/focused-cell/);
	await page.keyboard.press('ArrowRight');
	await expect(comboboxElement).toHaveAttribute('aria-activedescendant', 'supersearch-item-3x1');
	await page.keyboard.press('ArrowLeft');
	await expect(comboboxElement).toHaveAttribute('aria-activedescendant', 'supersearch-item-3x0');
	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('ArrowRight');
	await expect(comboboxElement).toHaveAttribute('aria-activedescendant', 'supersearch-item-3x2');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await expect(
		comboboxElement,
		`selects closest cell if latest column isn't available on new row`
	).toHaveAttribute('aria-activedescendant', 'supersearch-item-5x1');
	await page.getByRole('dialog').getByRole('combobox').fill('ab');
	await expect(
		comboboxElement,
		'focused cell is reset if user updates value in combobox'
	).not.toHaveAttribute('aria-activedescendant', /.+/);
	await page.keyboard.press('Tab');
	await expect(page.locator('#supersearch-item-0x1')).toHaveClass(/focused-cell/);
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await expect(page.locator('#supersearch-item-3x0')).toHaveClass(/focused-cell/);
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Shift+Tab');
	await page.keyboard.press('Shift+Tab');
	await expect(comboboxElement).toHaveAttribute('aria-activedescendant', 'supersearch-item-0x1');
	await expect(
		page.locator('#supersearch-item-0x1'),
		'hidden items cannot receive focus'
	).toHaveClass(/focused-cell/);
	await page.setViewportSize(devices['iPhone X'].viewport);
	await page.keyboard.press('Shift+Tab');
	await expect(comboboxElement).toHaveAttribute('aria-activedescendant', 'supersearch-item-0x0');
	await expect(page.locator('#supersearch-item-0x0')).toHaveClass(/focused-cell/);
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
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');

	await expect(
		page.locator('#supersearch-item-10x2'),
		'ensure focus is kept inside result items when tabbing on last row'
	).toHaveClass(/focused-cell/);
	await page.keyboard.press('ArrowDown');
	await expect(
		page.locator('#supersearch-item-10x2'),
		'focus is kept on last item when reaching the end of the grid'
	).toHaveClass(/focused-cell/);
	await page.getByRole('dialog').getByRole('combobox').press('Escape');
	await page.getByRole('combobox').click();
	await expect(comboboxElement).not.toHaveAttribute('aria-activedescendant', /.+/);

	await page.getByRole('dialog').getByRole('combobox').press('Escape');
	await page.getByTestId('use-looping-arrow-key-navigation').check();
	await page.getByRole('combobox').fill('a');
	await expect(page.getByTestId('result-item')).toHaveCount(10);
	await page.keyboard.press('ArrowUp');
	await expect(
		comboboxElement,
		'user can jump from first row to last by pressing arrow up if useLoopingArrowKeyNavigation is enabled'
	).toHaveAttribute('aria-activedescendant', 'supersearch-item-10x0');
	await page.keyboard.press('ArrowDown');
	await expect(
		comboboxElement,
		'user can jump from last row to first by pressing arrow down if useLoopingArrowKeyNavigation is enabled'
	).not.toHaveAttribute('aria-activedescendant', /.+/);
	await page.keyboard.press('ArrowDown');
	await expect(comboboxElement).toHaveAttribute('aria-activedescendant', 'supersearch-item-1x0');
});

test('user can toggle expanded search using alt key + arrow up or down (without moving cursor) ', async ({
	page
}) => {
	await page.getByRole('combobox').click();
	await page.getByRole('dialog').getByRole('combobox').fill('abc');
	await expect(page.getByTestId('result-item')).toHaveCount(10);
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('Alt+ArrowUp');
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await page.keyboard.press('Alt+ArrowDown');
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByRole('dialog').getByRole('combobox').pressSequentially('x');
	await expect(page.getByRole('dialog').getByRole('combobox')).toHaveText('abxc');
});

test('syncs collapsed and expanded editor views', async ({ context, page }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.getByRole('combobox').click();
	await page.getByRole('dialog').getByRole('combobox').fill('Hello world');
	await expect(await page.getByRole('dialog').getByRole('combobox')).toHaveText('Hello world');
	await page.getByRole('dialog').getByRole('combobox').selectText();
	await page.getByRole('dialog').getByRole('combobox').press('Escape');
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await expect
		.poll(() => page.evaluate(() => window.getSelection()?.toString()))
		.toBe('Hello world');
});

/**
 * Temporarily disable test which breaks on CI for some odd reason (but works on localhost)... :(
 * We need to investigate why...
 */

/*
test('arrow key cursor handling (depending on supersearch state)', async ({ page }) => {
	await page.getByRole('combobox').click();
	await page.getByRole('dialog').getByRole('combobox').fill('Hola');
	await page.keyboard.press('ArrowUp');
	await page.getByRole('dialog').getByRole('combobox').pressSequentially('!');
	await expect(
		await page.getByRole('dialog').getByRole('combobox'),
		'prevents cursor movement by arrow up key if expanded search'
	).toHaveText('Hola!');
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowLeft');
	await page.getByRole('dialog').getByRole('combobox').pressSequentially('¡');
	await expect(await page.getByRole('dialog').getByRole('combobox')).toHaveText('¡Hola!');
	await page.keyboard.press('ArrowDown');
	await page.getByRole('dialog').getByRole('combobox').pressSequentially('A');
	await expect(
		page.getByTestId('result-item').first(),
		'prevents cursor movement by arrow down key if expanded search'
	).toContainText('Heading 1 for "¡AHola!"'); // await delayed results
	await page.getByRole('dialog').getByRole('combobox').press('ArrowDown');
	await page.getByRole('dialog').getByRole('combobox').press('ArrowDown');
	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('ArrowRight');
	await page.getByRole('dialog').getByRole('combobox').pressSequentially('B');
	await expect(
		page.getByTestId('result-item').first(),
		'prevents cursor movement by arrow right key if there are more than one column/cell on current row'
	).toContainText('Heading 1 for "¡ABHola!"');
	await page.keyboard.press('ArrowLeft');
	await page.getByRole('dialog').getByRole('combobox').pressSequentially('C');
	await expect(
		page.getByTestId('result-item').first(),
		'prevents cursor movement by arrow left key if there are more than one column/cell on current row'
	).toContainText('Heading 1 for "¡ABCHola!"');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowUp');
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('Delete');
	await page.keyboard.press('Delete');
	await page.keyboard.press('Delete');
	await page.keyboard.press('Delete');
	await expect(page.getByTestId('result-item').first()).toContainText('Heading 1 for "Hola!"');
	await page.keyboard.press('Escape');
	await page.keyboard.press('ArrowDown');
	await page.getByRole('combobox').pressSequentially('!');
	await expect(
		await page.getByRole('dialog').getByRole('combobox'),
		'arrow down triggers cursor movement if search is collapsed'
	).toHaveText('Hola!!');
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await page.getByRole('combobox').press('ArrowRight');
	await page.getByRole('combobox').press('ArrowUp');
	await page.getByRole('combobox').pressSequentially('¡');
	await expect(
		await page.getByRole('dialog').getByRole('combobox'),
		'arrow up triggers cursor movement if search is collapsed'
	).toHaveText('¡Hola!!');
});
*/

test('fires click events on focused cells', async ({ page }) => {
	await page.getByRole('combobox').fill('a');
	await expect(page.locator('#supersearch-item-1x0')).toBeVisible();
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/test1#supersearch-item-1x0');
});

test('transforms fetched data using transformFn', async ({ page }) => {
	await page.getByRole('combobox').click();
	await page.getByRole('dialog').getByRole('combobox').fill('Hello');
	await expect(
		page.getByTestId('result-item').first(),
		'to tranform data using transformFn if available'
	).toContainText('Heading 1');
});

test('fetches and displays paginated results', async ({ page }) => {
	await page.getByRole('combobox').click();
	await page.getByRole('dialog').getByRole('combobox').fill('Hello');
	await expect(page.getByTestId('result-item')).toHaveCount(10);
	await page.locator('.supersearch-show-more').click(); // show more button will probably be removed in favour of automatic fetching when the user scrolls to the end
	await expect(page.getByTestId('result-item')).toHaveCount(20);
	await page.locator('.supersearch-show-more').click();
	await expect(page.getByTestId('result-item')).toHaveCount(30);
	await expect(page.locator('.supersearch-show-more')).not.toBeAttached();
});

test('submits form when pressing submit action', async ({ page }) => {
	await page.locator('[type=submit]').first().click();
	await expect(page, 'submit action should only be triggered if there is a value').toHaveURL('/');
	await page.getByRole('combobox').fill('hello world');
	await page.getByRole('dialog').locator('[type=submit]').click();
	await expect(page).toHaveURL('/test1?q=hello+world');
});

test('submits form on enter key press (if no result item is selected)', async ({ page }) => {
	await page.getByRole('combobox').fill('hello world');
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.keyboard.press('Escape');
	await page.keyboard.press('Enter');
	await expect(page, 'submits closest form').toHaveURL('/test1?q=hello+world');
	await page.goBack();
	await page.getByTestId('use-form-attribute').check();
	await page.getByRole('combobox').fill('hello world');
	await page.keyboard.press('Escape');
	await page.keyboard.press('Enter');
	await expect(page, 'submits form specified form attribute').toHaveURL('/test2?q=hello+world');
});

test('clears input form when pressing clear action', async ({ page }) => {
	await page.getByRole('combobox').click();
	await page.getByRole('dialog').getByRole('combobox').fill('Hello world');
	await expect(await page.getByRole('dialog').getByRole('combobox')).toHaveText('Hello world');
	await page.getByRole('dialog').locator('[type=reset]').click();
	await expect(page.getByRole('dialog').locator('[type=reset]')).not.toBeVisible();
	await expect(await page.getByRole('dialog').getByRole('combobox')).toHaveText('Search');
});

test('allows custom expanded content', async ({ page }) => {
	await page.getByTestId('use-custom-expanded-content').check();
	await page.getByRole('combobox').click();
	await expect(page.getByTestId('persistent-item')).toHaveCount(2);
	await expect(page.getByTestId('result-item')).toHaveCount(0);
	await page.getByRole('dialog').getByRole('combobox').fill('a');
	await expect(page.getByTestId('persistent-item')).toHaveCount(2);
	await expect(page.getByTestId('result-item')).toHaveCount(10);
});

test('supports custom loading indicator snippet', async ({ page }) => {
	await page.getByRole('combobox').fill('hello world');
	await expect(async () =>
		expect(page.getByTestId('loading-indicator')).toHaveText('Loading...')
	).toPass();
	await expect(page.getByTestId('loading-indicator')).not.toBeVisible();
});

test('exports isLoading and hasResults as bindable props (should be treated as readonly)', async ({
	page
}) => {
	await page.getByRole('combobox').fill('hello world');
	await expect(async () =>
		expect(page.getByTestId('is-loading-bind')).toHaveText('is loading: true')
	).toPass();
	await expect(page.getByTestId('is-loading-bind')).toHaveText('is loading: false');
	await expect(page.getByTestId('has-data-bind')).toHaveText('has data: true');
});
