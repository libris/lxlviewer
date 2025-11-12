import { devices, expect, test } from '@playwright/test';
test.use({ ...devices['iPhone 13'] });

test('can toggle search dialog by clicking the icon button', async ({ page }) => {
	await page.goto('/h08ndxddfg5v2pjf');
	const dialog = page.locator('#supersearch-dialog');
	await expect(dialog).not.toBeVisible();
	await page.locator('button').filter({ hasText: 'Sök' }).click();
	await expect(dialog).toBeVisible();
});
