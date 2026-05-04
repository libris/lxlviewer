import AxeBuilder from '@axe-core/playwright';
import { devices, expect, test } from '@playwright/test';
test.use({ ...devices['iPhone 13'] });

test('should not have any detectable a11y issues', async ({ page }) => {
	await page.goto('/h08ndxddfg5v2pjf');
	const accessibilityScanResults = await new AxeBuilder({ page })
		.exclude('[role="combobox"][aria-placeholder]') // aria-placeholder issue in supersearch is a false alarm (see https://github.com/w3c/aria/issues/2689)
		.analyze();
	expect.soft(accessibilityScanResults.violations).toEqual([]);
});

test('can toggle search dialog by clicking the icon button', async ({ page }) => {
	await page.goto('/h08ndxddfg5v2pjf');
	await page.locator('button').getByLabel('Sök').click();
});
