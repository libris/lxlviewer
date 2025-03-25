import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('404 page', async () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/not-found');
	});
	test('has expected h1', async ({ page }) => {
		await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
	});
	test('should not have any detectable a11y issues', async ({ page }) => {
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
		expect.soft(accessibilityScanResults.violations).toEqual([]);
	});
});

test.describe('English 404 page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/en/not-found');
	});
	test('has expected h1', async ({ page }) => {
		await page.goto('/en/not-found');
		await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
	});
	test('should not have any detectable a11y issues', async ({ page }) => {
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
		expect.soft(accessibilityScanResults.violations).toEqual([]);
	});
});

test.describe('Missing resource page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/5nxb2lhk30q35zdb');
	});
	test('has expected h1', async ({ page }) => {
		await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
	});
	test('should not have any detectable a11y issues', async ({ page }) => {
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
		expect.soft(accessibilityScanResults.violations).toEqual([]);
	});
});

// test.describe('Find page with invalid query', () => {
// 	test.beforeEach(async ({ page }) => {
// 		await page.goto(
// 			'/find?_i=geh&_q=test+unrecognizedproperty:%22https://id.kb.se/language/swe%22&_limit=20'
// 		);
// 	});
// 	test('has expected h1', async ({ page }) => {
// 		await expect(page.getByRole('heading', { name: '400' })).toBeVisible();
// 	});
// 	test('should not have any detectable a11y issues', async ({ page }) => {
// 		const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
// 		expect.soft(accessibilityScanResults.violations).toEqual([]);
// 	});
// });
