import { expect, test } from '@playwright/test';

test.describe('Zotero support', async () => {
	const id = 'z7p0lb61wvsdl3x7';
	test('A resource page should have a script tag with unapi link', async ({ page }) => {
		await page.goto(`/${id}`);
		const link = page.locator('link[rel="unapi-server"]');
		await expect(link).toHaveAttribute('type', 'application/xml');
		await expect(link).toHaveAttribute('href', '/api/sv/cite');
	});

	test('A resource page should have a <abbr> tag containing the resource id', async ({ page }) => {
		await page.goto(`/${id}`);
		const abbr = page.locator('abbr.unapi-id');
		await expect(abbr).toHaveCount(1);
		await expect(abbr).toHaveAttribute('title', new RegExp(`.+/${id}$`));
	});
});
