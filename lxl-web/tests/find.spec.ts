import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { DEFAULT_FACETS_EXPANDED } from '$lib/constants/facets';

test.beforeEach(async ({ page }) => {
	await page.goto('/find?_q=f&_limit=20&_offset=0&_sort=&_i=f');
});

test('should not have any detectable a11y issues', async ({ page }) => {
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	await expect.soft(accessibilityScanResults.violations).toEqual([]);
});

test('page displays the site header', async ({ page }) => {
	await expect(page.getByRole('banner')).toBeVisible();
});

test('page has a search input', async ({ page }) => {
	await expect(page.getByTestId('supersearch').nth(0)).toBeVisible();
});

test('can change the language', async ({ page }) => {
	await page.getByTestId('change-lang').click();
	await expect(page).toHaveURL(/\/en\/find/);
});

test('displays 20 search cards on a page', async ({ page }) => {
	await expect(page.getByTestId('search-card')).toHaveCount(20);
});

test('search card contains a link', async ({ page }) => {
	await expect(page.getByTestId('search-card').first().getByRole('link').first()).toHaveAttribute(
		'href'
	);
});

test('displays facets', async ({ page }) => {
	await expect(page.getByTestId('facets')).toBeVisible();
});

test('facet groups can toggle', async ({ page }) => {
	await expect(page.getByTestId('facet-list').first()).toBeVisible();
	await page.getByTestId('facet-toggle').first().click();
	await expect(page.getByTestId('facet-list').first()).toBeHidden();
	await page.getByTestId('facet-toggle').first().click();
	await expect(page.getByTestId('facet-list').first()).toBeVisible();
});

test('opening and sorting the facet sets a cookie', async ({ page, context }) => {
	const beforeCookies = await context.cookies();
	await expect(beforeCookies).toEqual([]);
	await page.waitForLoadState('networkidle');
	await page.locator('summary').filter({ hasText: 'Språk' }).click();
	await page.getByTestId('facet-sort-language').selectOption('alpha.asc');
	const afterCookies = await context.cookies();
	await expect(afterCookies[0].name).toEqual('userSettings');
	await expect(afterCookies[0].value).toEqual(
		'{%22leadingPane%22:{%22open%22:true}%2C%22facetExpanded%22:{%22language%22:%22OPEN%22}%2C%22facetSort%22:{%22language%22:%22alpha.asc%22}}'
	);
});

test('facet opened/closed state is preserved', async ({ page, context }) => {
	const beforeCookies = await context.cookies();
	await expect(beforeCookies).toEqual([]);

	const firstClosed = DEFAULT_FACETS_EXPANDED;

	await expect(page.getByTestId('facet-list').first()).toBeVisible();
	await expect(page.getByTestId('facet-list').nth(firstClosed)).toBeHidden();

	await page.getByTestId('facet-toggle').first().click();
	await page.getByTestId('facet-toggle').nth(firstClosed).click();

	await expect(page.getByTestId('facet-list').first()).toBeHidden();
	await expect(page.getByTestId('facet-list').nth(firstClosed)).toBeVisible();

	await page.goto('/find?_q=f&_limit=20&_offset=0&_sort=&_i=f');
	await page.waitForURL('/find?_q=f&_limit=20&_offset=0&_sort=&_i=f');
	await expect(page.getByTestId('facet-list').first()).toBeHidden();
	await expect(page.getByTestId('facet-list').nth(firstClosed)).toBeVisible();
});

test('myLibraries filter is visible (when not active)', async ({ page }) => {
	await expect(page.getByText('Avgränsa till mina bibliotek')).toBeVisible();
});

test('select myLibraries filter adds filter alias to url', async ({ page }) => {
	await expect(page).not.toHaveURL(/alias-myLibraries/);
	await page.getByText('Avgränsa till mina bibliotek').click();
	await expect(page).toHaveURL(/alias-myLibraries/);
});

test('myLibraries without favourite libraries shows a message', async ({ page }) => {
	await expect(page.getByTestId('my-libraries-warning')).not.toBeVisible();
	await page.getByText('Avgränsa till mina bibliotek').click();
	await expect(page.getByTestId('my-libraries-warning')).toBeVisible();
});

test('user sorting is persisted after navigating', async ({ page }) => {
	await page.locator('summary').filter({ hasText: 'Språk' }).click();
	const langFacetSort = await page.getByTestId('facet-sort-language');
	await expect(langFacetSort).toHaveValue('hits.desc');
	await langFacetSort.selectOption('alpha.asc');
	await page.goto('/find?_q=a&_limit=20&_offset=0&_sort=&_i=f');
	await page.waitForLoadState('networkidle');

	await page.locator('summary').filter({ hasText: 'Språk' }).click();
	const langFacetSortNew = await page.getByTestId('facet-sort-language');
	await expect(langFacetSortNew).toHaveValue('alpha.asc');
});

test('displays hits info', async ({ page }) => {
	await expect(page.getByTestId('result-info')).toBeVisible();
});

test('has a sort select', async ({ page }) => {
	await expect(page.getByTestId('sort-select')).toBeVisible();
});

test('sorting changes the sort param', async ({ page }) => {
	await page.getByTestId('sort-select').locator('select').selectOption('_sortKeyByLang.sv');
	await expect(page).toHaveURL(/_sort=_sortKeyByLang.sv/);
});

test('has pagination', async ({ page }) => {
	await expect(page.getByTestId('pagination')).toBeVisible();
});

test('can paginate to next and previous', async ({ page }) => {
	await expect(page).not.toHaveURL(/_offset=20/);
	await page.getByTestId('pagination').getByLabel('Nästa sida').click();
	await expect(page).toHaveURL(/_offset=20/);
	await page.getByTestId('pagination').getByLabel('Föregående sida').click();
	await expect(page).not.toHaveURL(/_offset=/);
});
