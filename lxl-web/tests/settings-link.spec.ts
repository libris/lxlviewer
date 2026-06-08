import { expect, type Page, test } from '@playwright/test';

test.describe('Set settings with link', async () => {
	test('Link should set favourite libraries', async ({ browser }) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		await page.goto('/my-pages');

		await setFavourites(page);

		const link = await page.locator('#settings-url').textContent();
		await context.close();

		const context2 = await browser.newContext();
		const page2 = await context2.newPage();

		await page2.goto(link);
		await expect(page2).toHaveURL(/^https?:\/\/[^/]+\/?$/); // start page, no path or params

		await page2.goto('/my-pages');

		await checkFavourites(page2);

		await context2.close();
	});

	test('Link should set favourite libraries, respect _r', async ({ browser }) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		await page.goto('/my-pages?_r=itemHeldByOrg:ARKM');

		await setFavourites(page);

		const link = await page.locator('#settings-url').textContent();

		await context.close();

		const context2 = await browser.newContext();
		const page2 = await context2.newPage();

		await page2.goto(link);
		await expect(page2).toHaveURL(/^https?:\/\/[^/]+\/?\?_r=itemHeldByOrg:ARKM$/); // start page

		await page2.getByRole('link', { name: 'Mina sidor' }).first().click();

		await checkFavourites(page2);

		await context2.close();
	});
});

async function setFavourites(page: Page) {
	await page.locator('#my-libraries-search').fill('bin');
	await page.getByRole('button', { name: 'Lägg till' }).first().click();
	await page.locator('#my-libraries-search').fill('nodi');
	await expect(page.getByText('Ale bibliotek').first()).toBeVisible(); // wait for search result
	await page.getByRole('button', { name: 'Lägg till' }).first().click();

	// two my-libraries-result side-by-side. pick the right = second one
	const selectedLibraries = page.locator('ol.my-libraries-result').nth(1).locator('li');
	await expect(selectedLibraries).toHaveCount(2);
	await expect(selectedLibraries.nth(0)).toContainText('Biblioteken i Norrbotten (BIN)');
	await expect(selectedLibraries.nth(1)).toContainText('Ale bibliotek (Nodi)');
}

async function checkFavourites(page: Page) {
	// now there's only one my-libraries-result to the right
	const selectedLibraries2 = page.locator('ol.my-libraries-result').nth(0).locator('li');
	await expect(selectedLibraries2).toHaveCount(2);
	await expect(selectedLibraries2.nth(0)).toContainText('Biblioteken i Norrbotten (BIN)');
	await expect(selectedLibraries2.nth(1)).toContainText('Ale bibliotek (Nodi)');
}
