import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
	await page.goto('/find?_q=f&_limit=20&_offset=0&_sort=&_i=f');
});

test('should not have any detectable a11y issues', async ({ page }) => {
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect.soft(accessibilityScanResults.violations).toEqual([]);
});

test('page displays the site header', async ({ page }) => {
	await expect(page.getByRole('banner')).toBeVisible();
});

test('page has a search input', async ({ page }) => {
	await expect(page.getByTestId('main-search')).toBeVisible();
});

test('can change the language', async ({ page }) => {
	await page.getByTestId('current-lang').click();
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
	await expect(page.getByTestId('facet-list').first()).toBeHidden();
	await page.getByTestId('facet-toggle').first().click();
	await expect(page.getByTestId('facet-list').first()).toBeVisible();
	await page.getByTestId('facet-toggle').first().click();
	await expect(page.getByTestId('facet-list').first()).toBeHidden();
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
