import { expect, test } from '@playwright/test';

test('decorated data label visibilty is correct after page navigations', async ({ page }) => {
	// TODO: We should probably mock the required requests but something similar to https://github.com/markjaquith/sveltekit-playwright-fetch-mock would be needed to mock the server-side fetches.
	await page.goto('/h08ndxddfg5v2pjf');
	await expect(page.getByText('Medverkan och funktion')).toBeHidden();
	await page.getByText('Khemiri, Jonas Hassen, 1978-').first().click();
	await expect(page.getByText('Språk')).toBeVisible();
});

test('initially opened holdings modals are closable', async ({ page }) => {
	await page.goto('/h08ndxddfg5v2pjf?holdings=Electronic');
	await page.getByTestId('close-modal').first().click();
	await expect(page).toHaveURL('/h08ndxddfg5v2pjf');
	await expect(page.getByTestId('modal')).toBeHidden();
	await page.getByTestId('holding-link').first().click();
	await expect(page.getByTestId('modal')).toBeVisible();
	await expect(page).toHaveURL('/h08ndxddfg5v2pjf?holdings=Electronic');
});

test('decorated data in holdings modal is not duplicated while closing modal', async ({ page }) => {
	await page.goto('/h08ndxddfg5v2pjf');
	await page.getByTestId('holding-link').first().click();
	await expect(page.locator('dialog [data-type="Text"]')).toHaveCount(1);
	await page.keyboard.press('Escape');
	await page.waitForTimeout(10);
	expect(page.locator('dialog [data-type="Text"]')).toHaveCount(1);
	await page.getByTestId('modal').waitFor({ state: 'hidden' });
	await expect(page.getByTestId('modal')).toBeHidden();
});
