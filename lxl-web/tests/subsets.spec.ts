import { expect, test } from '@playwright/test';

test('A subset filter can display on any page', async ({ page }) => {
	await page.goto('/help?_r=itemHeldBy%3A"sigel%3AArkm"');
	await expect(page.locator('.subset-container').getByText('ArkDes')).toBeVisible();
});

test('The search placeholder is replaced when using a subset', async ({ page }) => {
	await page.goto('my-pages?_r=itemHeldBy%3A"sigel%3AArkm"');
	await expect(page.getByRole('combobox', { name: 'Sök' }).getByText('ArkDes')).toBeVisible();
});

test('_r param is preserved when navigating around the app', async ({ page }) => {
	await page.goto('/find?_q=f&_offset=0&_limit=20&_r=itemHeldBy%3A"sigel%3AArkm"');
	await page.getByRole('main').getByRole('article').getByRole('link').first().click();
	await expect(page).toHaveURL(/_r=itemHeldBy%3A%22sigel%3AArkm%22/);
	await page.getByRole('main').getByRole('link').getByText('Nästa').click();
	await expect(page).toHaveURL(/_r=itemHeldBy%3A%22sigel%3AArkm%22/);
	await page.getByRole('main').getByRole('link').getByText('Visa i träfflista').click();
	await expect(page).toHaveURL(/_r=itemHeldBy%3A%22sigel%3AArkm%22/);
	await page.getByRole('link', { name: 'Sparat' }).click();
	await expect(page).toHaveURL(/my-pages\?_r=itemHeldBy%3A%22sigel%3AArkm%22/);
});

test('A subset filter can be removed', async ({ page }) => {
	await page.goto('/find?_q=&_r=hej');
	await page.locator('.subset-container').getByRole('link', { name: 'Ta bort filter' }).click();
	await expect(page).toHaveURL('/find?_q=&_r=');
});

test('A subset filter can be removed and preserves lang', async ({ page }) => {
	await page.goto('/en/find?_q=&_r=hej');
	await page.locator('.subset-container').getByRole('link', { name: 'Remove filter' }).click();
	await expect(page).toHaveURL('/en/find?_q=&_r=');
});
