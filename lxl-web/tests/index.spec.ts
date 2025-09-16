import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('should not have any detectable a11y issues', async ({ page }) => {
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	await expect.soft(accessibilityScanResults.violations).toEqual([]);
});

test('index page has expected h1', async ({ page }) => {
	await expect(page.getByRole('heading', { name: 'Välkommen till öppen beta!' })).toBeVisible();
});

test('can change the language', async ({ page }) => {
	await page.getByTestId('current-lang').click();
	await expect(page).toHaveURL('/en');
});

test('index page has a search input', async ({ page }) => {
	await expect(page.getByTestId('main-search').getByRole('combobox')).toBeVisible();
});

test('can perform a search', async ({ page }) => {
	await page.getByTestId('main-search').getByRole('combobox').fill('*');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/find/);
});

test('url is populated with correct searchparams', async ({ page }) => {
	await page.getByTestId('main-search').getByRole('combobox').fill('somephrase');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/_q=somephrase&_limit=20&_offset=0&_sort=&_spell=true/);
});
