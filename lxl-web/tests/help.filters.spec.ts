import { expect, test } from '@playwright/test';
// import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
	await page.goto('/help/filters');
});

/*
test('should not have any detectable a11y issues', async ({ page }) => {
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	await expect.soft(accessibilityScanResults.violations).toEqual([]);
});
*/

test('qualifier keys can be added from filter list', async ({ page }) => {
	await page.getByRole('main').getByRole('button').getByText('Bibliografi').click();
	await expect(page.getByRole('combobox').first()).toContainText('Ingår i bibliografi');
	await expect(page.getByRole('combobox').last()).toContainText('Ingår i bibliografi');
	await page.keyboard.press('Escape');
	await page.getByRole('main').getByRole('button').getByText('Biblioteksorganisation').click();
	await expect(page.getByRole('combobox').first()).toContainText('Ingår i bibliografi');
	await expect(page.getByRole('combobox').first()).toContainText(' Biblioteksorganisation');
});
