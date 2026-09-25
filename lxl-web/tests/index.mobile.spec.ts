import { devices, expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({ ...devices['iPhone 13'] });

test('should not have any detectable a11y issues', async ({ page }) => {
	await page.goto('/h08ndxddfg5v2pjf');
	const accessibilityScanResults = await new AxeBuilder({ page })
		.exclude('[role="combobox"][aria-placeholder]') // aria-placeholder issue in supersearch is a false alarm (see https://github.com/w3c/aria/issues/2689)
		.disableRules([
			'link-in-text-block' // enable when link underline fixed
		])
		.analyze();
	expect.soft(accessibilityScanResults.violations).toEqual([]);
});

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('index page has a search input', async ({ page }) => {
	await expect(page.getByTestId('supersearch').getByRole('combobox')).toBeVisible();
});

test('search input has visible outline on focus', async ({ page }) => {
	const supersearch = page.getByTestId('supersearch');
	const input = supersearch.getByRole('combobox');
	await input.focus();
	await expect(input).toBeFocused();

	const focusElement = supersearch.locator('.supersearch-input').first();
	await expect(focusElement).toHaveCSS('outline-style', 'solid');
	await expect(focusElement).toHaveCSS('outline-width', '2px');
});
