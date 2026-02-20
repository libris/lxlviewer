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
	await expect(page.getByRole('heading', { name: 'Sök på alla svenska bibliotek' })).toBeVisible();
});

test('index page shows featured searches', async ({ page }) => {
	await expect(page).toHaveURL('/');
	await page.waitForLoadState('networkidle');

	await expect(page.getByLabel('Ny skönlitteratur på svenska').getByRole('listitem')).toHaveCount(
		20,
		{
			timeout: 10000
		}
	);
	await page.getByLabel('Böcker om att börja skolan').scrollIntoViewIfNeeded();
	await expect(page.getByLabel('Böcker om att börja skolan').getByRole('listitem')).toHaveCount(
		11,
		{
			timeout: 10000
		}
	);
});

test('can change the language', async ({ page }) => {
	await page.getByTestId('change-lang').click();
	await expect(page).toHaveURL('/en');
});

test('index page has a search input', async ({ page }) => {
	await expect(page.getByTestId('supersearch').getByRole('combobox')).toBeVisible();
});

test('can perform a search', async ({ page }) => {
	await page.getByTestId('supersearch').getByRole('combobox').fill('*');
	await page.keyboard.press('Enter');
	await page.waitForLoadState('networkidle');
	await expect(page).toHaveURL(/\/find/);
});

test('url is populated with correct searchparams', async ({ page }) => {
	await page.getByTestId('supersearch').getByRole('combobox').fill('somephrase');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/_q=somephrase&_limit=20&_offset=0&_sort=&_spell=true/);
});
