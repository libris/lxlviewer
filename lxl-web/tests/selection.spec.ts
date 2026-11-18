import { expect, test, type Page } from '@playwright/test';

const SEARCH_URL = '/find?_q=vinter&_limit=20&_offset=0&_sort=&_spell=true&_cursor=6';

const RESOURCE_URL = '/h08ndxddfg5v2pjf';

const selectionModeSwitch = (page: Page) => page.getByRole('switch', { name: 'Välj flera' });

const selectionIndicator = (page: Page) => page.getByTestId('toggle-trailing-pane-btn');

const trailingPane = (page: Page) => page.locator('aside#trailing-pane');

const searchCards = (page: Page) => page.getByTestId('search-card');

const selectAllCheckbox = (page: Page) => page.locator('#select-all-page-results');

const hideTrailingPaneButton = (page: Page) => page.getByRole('button', { name: 'Dölj sidopanel' });

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
	await expect(selectionIndicator(page)).toContainText(new RegExp(`^${count} valda$`));
}

test.describe('Selection interface', () => {
	test('Search result page has a selection mode toggle', async ({ page }) => {
		await gotoSearchResults(page);

		await expect(selectionModeSwitch(page)).toBeVisible();
	});

	test('Selection mode reveals checkboxes for selecting a hit', async ({ page }) => {
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

	// test('Toggle selection mode sets a cookie', async ({ page, context }) => {
	// 	await gotoSearchResults(page);
	// 	await enableSelectionMode(page);

	// 	const cookies = await context.cookies();

	// 	// TODO: Assert the expected cookie name and value.
	// });

	test('Selection mode reveals selection indicator btn', async ({ page }) => {
		await gotoSearchResults(page);
		await enableSelectionMode(page);

		await expect(selectionIndicator(page)).toBeVisible();
		await expect(selectionIndicator(page)).toBeDisabled();
	});

	test('A selection changes selection indication', async ({ page }) => {
		await gotoSearchResults(page);
		await enableSelectionMode(page);

		const indicator = selectionIndicator(page);

		await expect(indicator).toBeDisabled();

		await searchCards(page).first().getByRole('checkbox').check();

		await expect(indicator).toBeEnabled();
		await expectSelectionCount(page, 1);

		await searchCards(page).nth(1).getByRole('checkbox').check();

		await expectSelectionCount(page, 2);
	});

	test('Selection indicator btn triggers the trailing pane', async ({ page }) => {
		await gotoSearchResults(page);
		await enableSelectionMode(page);

		await searchCards(page).first().getByRole('checkbox').check();

		await selectionIndicator(page).click();

		await expect(trailingPane(page)).toBeVisible();
		await expect(selectionIndicator(page)).not.toBeAttached();
	});

	test('Closing the trailing pane restores the selection indicator', async ({ page }) => {
		await gotoSearchResults(page);
		await enableSelectionMode(page);

		await searchCards(page).first().getByRole('checkbox').check();

		await selectionIndicator(page).click();

		await expect(trailingPane(page)).toBeVisible();

		await hideTrailingPaneButton(page).click();

		await expect(trailingPane(page)).not.toBeVisible();
		await expect(selectionIndicator(page)).toBeVisible();
		await expectSelectionCount(page, 1);
	});

	test('Selection indication is retained when closing and reopening the trailing pane', async ({
		page
	}) => {
		await gotoSearchResults(page);
		await enableSelectionMode(page);

		await searchCards(page).first().getByRole('checkbox').check();

		await selectionIndicator(page).click();

		await expect(trailingPane(page)).toBeVisible();

		await hideTrailingPaneButton(page).click();

		await expect(selectionIndicator(page)).toBeVisible();
		await expectSelectionCount(page, 1);

		await selectionIndicator(page).click();

		await expect(trailingPane(page)).toBeVisible();

		// TODO: Assert the selection count indication inside the panel.
	});

	// test('Selection interface displays the citations', async ({ page }) => {
	// 	// TODO: Add selectors and expected citation content.
	// });

	// test('Selection interface displays the selections', async ({ page }) => {
	// 	// TODO: Add selectors for the selected works.
	// });

	// test('Selection can be deselected from the interface', async ({ page }) => {
	// 	// TODO: Add selector for removing an individual selection.
	// 	// Verify that the indicator count decreases.
	// });

	// test('Selection can be cleared from the interface', async ({ page }) => {
	// 	// TODO: Add selector for clearing all selections.
	// 	// Verify that the indicator count returns to zero.
	// });

	test('Resource page has the indicator button when selection mode is on', async ({ page }) => {
		await page.goto(RESOURCE_URL);

		await expect(selectionIndicator(page)).toBeVisible();
	});

	test('Resource page has an "add" button when selection mode is on', async ({ page }) => {
		await page.goto(RESOURCE_URL);

		await expect(resourceAddButton(page)).toBeVisible();
	});

	// test('Selecting a work displays a warning', async ({ page }) => {
	// 	// TODO: Select a work with multiple editions.
	// 	// Assert the expected warning.
	// });

	// test('Exceeding the limit displays a warning', async ({ page }) => {
	// 	// TODO: Select the maximum number of allowed works.
	// 	// Attempt to select one additional work.
	// 	// Assert the expected warning.
	// });

	test('Selection mode survives navigation from search results to a resource page', async ({
		page
	}) => {
		await gotoSearchResults(page);
		await enableSelectionMode(page);

		await searchCards(page).first().getByRole('link').first().click();

		await expect(resourceAddButton(page)).toBeVisible();
		await expect(selectionIndicator(page)).toBeVisible();
	});

	test('Selection made on resource page persists when navigating to another resource page', async ({
		page
	}) => {
		await page.goto(RESOURCE_URL);

		await expect(resourceAddButton(page)).toBeVisible();
		await resourceAddButton(page).click();

		const indicator = selectionIndicator(page);

		await expect(indicator).toBeEnabled();

		// const initialCount = await indicator.innerText();

		// TODO: Replace with a reliable locator for a link to another resource page.
		// Navigate to another resource and verify that the indicator count is unchanged.
	});
});
