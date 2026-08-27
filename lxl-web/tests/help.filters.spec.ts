import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
	await page.goto('/help/filters');
});

test('should not have any detectable a11y issues', async ({ page }) => {
	const accessibilityScanResults = await new AxeBuilder({ page })
		.exclude('[role="combobox"][aria-placeholder]') // aria-placeholder issue in supersearch is a false alarm (see https://github.com/w3c/aria/issues/2689)
		.analyze();
	await expect.soft(accessibilityScanResults.violations).toEqual([]);
});

test('qualifier keys can be added from filter list', async ({ page }) => {
	await page.getByRole('main').getByRole('button').getByText('Ingår i bibliografi').click();
	await page.waitForResponse(
		(res) => res.url().includes('/supersearch?_q=') && res.status() === 200
	);
	await expect(page.getByRole('combobox').first()).toContainText('Ingår i bibliografi');
	await expect(page.getByRole('combobox').last()).toContainText('Ingår i bibliografi');
	await page.keyboard.press('Escape');
	await page.getByRole('main').getByRole('button').getByText('Bibliotek').first().click();
	await page.waitForResponse(
		(res) => res.url().includes('/supersearch?_q=') && res.status() === 200
	);
	await expect(page.getByRole('combobox').first()).toContainText('Bibliotek');
});
