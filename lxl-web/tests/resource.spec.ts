import { expect, test } from '@playwright/test';

test('decorated data label visibilty is correct after page navigations', async ({ page }) => {
	// TODO: We should probably mock the required requests but something similar to https://github.com/markjaquith/sveltekit-playwright-fetch-mock would be needed to mock the server-side fetches.
	await page.goto('/6hzmwhl84lm2v7ks');
	await expect(page.getByText('Medverkan och funktion')).toBeHidden();
	await page.getByText('Cyrén, Karin, 1984-').first().click();
	await expect(page.getByText('Beskrivning')).toBeVisible();
});

test('decorated data in holdings modal is not duplicated while closing modal', async ({ page }) => {
	await page.goto('/6hzmwhl84lm2v7ks');
	await page.getByTestId('holding-link').first().click();
	await expect(page.locator('dialog [data-type="Instance"]')).toHaveCount(1);
	await page.keyboard.press('Escape');
	await page.waitForTimeout(10);
	expect(page.locator('dialog [data-type="Instance"]')).toHaveCount(1);
	await page.getByTestId('modal').waitFor({ state: 'hidden' });
	await expect(page.getByTestId('modal')).toBeHidden();
});
