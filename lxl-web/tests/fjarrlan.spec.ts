import { expect, test } from '@playwright/test';

test('Instance page does not show fjärrlån components by default', async ({ page }) => {
	await page.goto('/z7p0lb61wvsdl3x7');
	await expect(page.getByRole('link', { name: 'Fjärrlån', exact: true })).not.toBeAttached();
	await expect(page.getByRole('link', { name: 'Beställ' })).not.toBeAttached();
});

test('Instance page shows fjärrlån components when cookie is set', async ({ page, baseURL }) => {
	await page.context().addCookies([
		{
			name: 'LIBRIS_SESSION',
			value: '1234',
			url: baseURL
		}
	]);

	await page.goto('/z7p0lb61wvsdl3x7');
	await expect(page.getByRole('link', { name: 'Fjärrlån', exact: true })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Beställ' })).toBeVisible();
});

test('Work page does not show request button', async ({ page, baseURL }) => {
	await page.context().addCookies([
		{
			name: 'LIBRIS_SESSION',
			value: '1234',
			url: baseURL
		}
	]);

	await page.goto('/h08ndxddfg5v2pjf');
	await expect(page.getByRole('link', { name: 'Fjärrlån', exact: true })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Beställ' })).not.toBeAttached();
});
