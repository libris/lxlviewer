import { expect, test } from '@playwright/test';

test('decorated data label visibilty is correct after page navigations', async ({ page }) => {
	// TODO: We should probably mock the required requests but something similar to https://github.com/markjaquith/sveltekit-playwright-fetch-mock would be needed to mock the server-side fetches.
	await page.goto('/6hzmwhl84lm2v7ks');
	await expect(page.getByText('Medverkan och funktion')).toBeHidden();
	await page.getByText('Cyrén, Karin, 1984-').first().click();
	await expect(page.getByText('Beskrivning')).toBeVisible();
});
