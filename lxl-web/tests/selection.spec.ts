import { expect, test, type Page } from '@playwright/test';

const SEARCH_URL = '/find?_q=vinter&_limit=20&_offset=0&_sort=&_spell=true&_cursor=6';

const selectionModeSwitch = (page: Page) => page.getByRole('switch', { name: 'Välj flera' });
const selectionIndicator = (page: Page) => page.getByTestId('toggle-trailing-pane-btn');
const trailingPane = (page: Page) => page.locator('aside#trailing-pane');
const searchCards = (page: Page) => page.getByTestId('search-card');
const selectAllCheckbox = (page: Page) => page.locator('#select-all-page-results');
const hideTrailingPaneButton = (page: Page) => page.locator('#collapse-trailing-pane-btn');
const resourceAddButton = (page: Page) => page.getByRole('switch', { name: 'Lägg till i urval' });

async function gotoSearchResults(page: Page) {
	await page.goto(SEARCH_URL);
}

async function enableSelectionMode(page: Page) {
	const toggle = selectionModeSwitch(page);

	if ((await toggle.getAttribute('aria-checked')) !== 'true') {
		await toggle.click();
	}
}

async function expectSelectionCount(page: Page, count: number) {
	await expect(selectionIndicator(page)).toHaveText(`${count}`);
}

test('Search result page has a selection mode toggle', async ({ page }) => {
	await gotoSearchResults(page);
	await expect(selectionModeSwitch(page)).toBeVisible();
});

test('No selection checkboxes when not in selection mode', async ({ page }) => {
	await gotoSearchResults(page);
	const checkboxes = searchCards(page).getByRole('checkbox');
	await expect(checkboxes).toHaveCount(0);
});

test('No selection indicator when not in selection mode', async ({ page }) => {
	await gotoSearchResults(page);
	await expect(selectionIndicator(page)).not.toBeVisible();
});

test('Selection mode reveals checkboxes for selecting a resource', async ({ page }) => {
	await gotoSearchResults(page);
	await enableSelectionMode(page);

	const checkboxes = searchCards(page).getByRole('checkbox');

	await expect(checkboxes).toHaveCount(20);
	await expect(checkboxes.first()).toBeVisible();
});

test('Selection mode reveals checkbox for selecting all hits on page', async ({ page }) => {
	await gotoSearchResults(page);
	await enableSelectionMode(page);

	await expect(selectAllCheckbox(page)).toBeVisible();
});

test('Toggle selection mode sets a cookie', async ({ page, context }) => {
	await gotoSearchResults(page);
	const beforeCookies = await context.cookies();
	expect(beforeCookies).toEqual([]);

	await enableSelectionMode(page);

	const afterCookies = await context.cookies();
	const firstCookie = afterCookies[0];
	expect(firstCookie.name).toEqual('userSettings');
	const userSettings = JSON.parse(decodeURIComponent(firstCookie.value));

	expect(userSettings).toMatchObject({ selectableResults: true });
});

test('Selection mode reveals (disabled) selection indicator btn', async ({ page }) => {
	await gotoSearchResults(page);
	await enableSelectionMode(page);

	await expect(selectionIndicator(page)).toBeVisible();
	await expect(selectionIndicator(page)).toBeDisabled();
});

test('First selection brings up the trailing panel', async ({ page }) => {
	await gotoSearchResults(page);
	await enableSelectionMode(page);

	const indicator = selectionIndicator(page);

	await expect(indicator).toBeDisabled();
	await expect(trailingPane(page)).not.toBeVisible();
	await searchCards(page).first().getByRole('checkbox').check();
	await expect(trailingPane(page)).toBeVisible();
	await expect(selectionIndicator(page)).not.toBeAttached();
});

test('Closing panel reveals indicator / clicking indicator reveals panel', async ({ page }) => {
	await gotoSearchResults(page);
	await enableSelectionMode(page);

	await searchCards(page).first().getByRole('checkbox').check();
	await expect(trailingPane(page)).toBeVisible();
	await hideTrailingPaneButton(page).click();

	await expect(trailingPane(page)).not.toBeVisible();
	await expect(selectionIndicator(page)).toBeVisible();
	await expectSelectionCount(page, 1);

	await selectionIndicator(page).click();
	await expect(trailingPane(page)).toBeVisible();
});

test('A selection changes selection indication', async ({ page }) => {
	await gotoSearchResults(page);
	await enableSelectionMode(page);

	const indicator = selectionIndicator(page);

	await expect(indicator).toBeDisabled();
	await searchCards(page).first().getByRole('checkbox').check();
	await hideTrailingPaneButton(page).click();

	await expect(indicator).toBeEnabled();
	await expectSelectionCount(page, 1);
	await searchCards(page).nth(1).getByRole('checkbox').check();
	await expectSelectionCount(page, 2);
	await searchCards(page).nth(2).getByRole('checkbox').check();
	await expectSelectionCount(page, 3);
	await searchCards(page).first().getByRole('checkbox').uncheck();
	await expectSelectionCount(page, 2);
});

test('Selection interface displays the citations', async ({ page }) => {
	await gotoSearchResults(page);
	await enableSelectionMode(page);

	await searchCards(page).first().getByRole('checkbox').check();
	await expect(trailingPane(page)).toBeVisible();
	await expect(page.locator('#trailing-pane article.citation')).toBeVisible();
});

test('Selection interface displays the selections', async ({ page }) => {
	await gotoSearchResults(page);
	await enableSelectionMode(page);

	await searchCards(page).nth(1).getByRole('checkbox').check();
	await searchCards(page).nth(2).getByRole('checkbox').check();

	await expect(page.getByRole('tab', { name: 'Redigera urval' })).toBeVisible();
	await page.getByRole('tab', { name: 'Redigera urval' }).click();

	const selections = page.locator('#trailing-pane .search-card');
	await expect(selections).toHaveCount(2);
});

test('Selection can be deselected from the interface', async ({ page }) => {
	await gotoSearchResults(page);
	await enableSelectionMode(page);

	await searchCards(page).nth(1).getByRole('checkbox').check();
	await searchCards(page).nth(2).getByRole('checkbox').check();

	await expect(page.getByRole('tab', { name: 'Redigera urval' })).toBeVisible();
	await page.getByRole('tab', { name: 'Redigera urval' }).click();

	const firstCheckbox = page.locator('#trailing-pane .search-card').getByRole('checkbox').first();

	await firstCheckbox.click();

	await hideTrailingPaneButton(page).click();
	await expectSelectionCount(page, 1);
});

test('Selection can be cleared from the interface', async ({ page }) => {
	await gotoSearchResults(page);
	await enableSelectionMode(page);

	await searchCards(page).nth(1).getByRole('checkbox').check();
	await searchCards(page).nth(2).getByRole('checkbox').check();

	await expect(page.getByRole('tab', { name: 'Redigera urval' })).toBeVisible();
	await page.getByRole('tab', { name: 'Redigera urval' }).click();

	const clearBtn = page.getByRole('button', { name: 'Rensa urval' });
	await expect(clearBtn).toBeVisible();

	await clearBtn.click();

	await expect(trailingPane(page)).not.toBeVisible();
	await expect(selectionIndicator(page)).toBeVisible();
	await expect(selectionIndicator(page)).toBeDisabled();
	await expectSelectionCount(page, 0);
});

test('Selection all checkbox selects all hits on page', async ({ page }) => {
	await gotoSearchResults(page);
	await enableSelectionMode(page);

	const numHits = await searchCards(page).count();
	await selectAllCheckbox(page).check();

	await hideTrailingPaneButton(page).click();
	await expectSelectionCount(page, numHits);
});

test('Resource page has the indicator button when selection mode is on', async ({ page }) => {
	await gotoSearchResults(page);
	await enableSelectionMode(page);
	await searchCards(page).first().getByRole('link').first().click();
	await page.waitForLoadState('networkidle');

	await expect(selectionIndicator(page).nth(1)).toBeVisible();
});

test('Resource page has an "add" button when selection mode is on', async ({ page }) => {
	await gotoSearchResults(page);
	await enableSelectionMode(page);
	await searchCards(page).first().getByRole('link').first().click();
	await page.waitForLoadState('networkidle');

	await expect(resourceAddButton(page)).toBeVisible();
});

// test('Selecting a work displays a warning', async ({ page }) => {
// 	TODO
// });

// test('Exceeding the limit displays a warning', async ({ page }) => {
// 	TODO
// });

test('Selection survives navigation from search results to a resource page', async ({ page }) => {
	await gotoSearchResults(page);
	await enableSelectionMode(page);

	await searchCards(page).nth(1).getByRole('checkbox').check();
	await searchCards(page).nth(2).getByRole('checkbox').check();
	await hideTrailingPaneButton(page).click();

	await searchCards(page).first().getByRole('link').first().click();
	await page.waitForLoadState('networkidle');

	await expect(selectionIndicator(page).nth(1)).toBeVisible();
	await expect(selectionIndicator(page).nth(1)).toHaveText(`${2}`);
});
