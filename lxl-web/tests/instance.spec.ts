import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/z7p0lb61wvsdl3x7');
});

test('should not have any detectable a11y issues', async ({ page }) => {
	const accessibilityScanResults = await new AxeBuilder({ page })
		.exclude('[role="combobox"][aria-placeholder]') // aria-placeholder issue in supersearch is a false alarm (see https://github.com/w3c/aria/issues/2689)
		.disableRules([
			'link-in-text-block' // enable when link underline fixed
		])
		.analyze();
	expect.soft(accessibilityScanResults.violations).toEqual([]);
});

test('first heading on page should be h1', async ({ page }) => {
	const firstHeading = page.locator('h1, h2, h3, h4, h5, h6').first();
	await expect(firstHeading).toHaveJSProperty('tagName', 'H1');
});
