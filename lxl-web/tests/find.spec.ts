import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
	await page.goto('/find?q=*&%40type=Work&_limit=10');
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
	const menu = page.getByTestId('lang-picker-menu');
	await menu.getByRole('link', { name: 'English' }).click();
	await expect(page).toHaveURL(/\/en\/find/);
});

test('displays 10 search cards on a page', async ({ page }) => {
	await expect(page.getByTestId('search-card')).toHaveCount(10);
});

test('search card heading contains a link', async ({ page }) => {
	await expect(page.getByTestId('search-card-heading').first()).toHaveAttribute('href');
});

test('has a facet panel', async ({ page }) => {
	await expect(page.getByLabel('Filter').getByRole('list')).toBeVisible();
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
	await expect(page).not.toHaveURL(/_offset=10/);
	await page.getByTestId('pagination').getByLabel('Nästa sida').click();
	await expect(page).toHaveURL(/_offset=10/);
	await page.getByTestId('pagination').getByLabel('Föregående sida').click();
	await expect(page).toHaveURL(/_offset=0/);
});
