import { devices, expect, test } from '@playwright/test';
test.use({ ...devices['iPhone 13'] });

test('can toggle filters and show facets and mapping', async ({ page }) => {
	await page.goto('/find?_q=språk%3A"lang%3Aswe"+sommar');
	const filterButton = await page.getByRole('link', { name: 'Sökfilter' });
	await expect(filterButton).toBeVisible;
	await filterButton.click();
	await expect(page.getByTestId('modal')).toBeVisible();
	await expect(page.getByTestId('modal').getByTestId('facets')).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Valda filter' })).toBeVisible();
});

test('mapping displays the correct search query', async ({ page }) => {
	await page.goto('/find?_q=språk%3A"lang%3Aswe"+sommar');
	await page.getByRole('link', { name: 'Sökfilter' }).click();
	const mapping = page.getByRole('navigation', { name: 'Valda filter' });
	await expect(mapping).toHaveText('and Språk : Svenska and Fritextsökning : sommar Rensa', {
		ignoreCase: true
	});
});

test('mapping displays the correct search query 2', async ({ page }) => {
	await page.goto(
		'/find?_q=%28contribution:*+OR+%28category:"https://id.kb.se/term/ktg/Literature"+NOT+titel:"pirater"%29%29+existsImage'
	);
	await page.getByRole('link', { name: 'Sökfilter' }).click();
	const mapping = await page.getByRole('navigation', { name: 'Valda filter' });
	const innerText =
		'and or Medverkan och funktion ∃ or and Kategori : Litteratur and not Titel : "pirater" and Har omslags-/miniatyrbild Rensa';
	await expect(mapping).toHaveText(innerText, { ignoreCase: true });
});

test('mapping displays the correct search query 3', async ({ page }) => {
	await page.goto(
		'/find?_q=titel%3A"pippi+långstrump"+%28+SPRÅK%3A"lang%3Aeng"+OR++språk%3A"lang%3Afre"+NOT+språk%3Atyska%29+AND+lindgren&_limit=20'
	);
	await page.getByRole('link', { name: 'Sökfilter' }).click();
	const mapping = page.getByRole('navigation', { name: 'Valda filter' });
	const mappingText =
		'and Titel : "pippi långstrump" and or Språk : Engelska or and Språk : Franska and not Språk : tyska and Fritextsökning : lindgren Rensa';
	await expect(mapping).toHaveText(mappingText, { ignoreCase: true });
});

test('mapping pill can be removed', async ({ page }) => {
	await page.goto('/find?_q=språk%3A"lang%3Aswe"+sommar');
	await page.getByRole('link', { name: 'Sökfilter' }).click();
	page
		.getByRole('navigation', { name: 'Valda filter' })
		.getByRole('link', { name: 'Ta bort filter' })
		.first()
		.click();
	await expect(page).toHaveURL('/find?_q=sommar');
});

test('mapping pill can be removed and preserves lang', async ({ page }) => {
	await page.goto('/en/find?_q=språk%3A"lang%3Aswe"+sommar');
	await page.getByRole('link', { name: 'Filters' }).click();
	page
		.getByRole('navigation', { name: 'Selected filters' })
		.getByRole('link', { name: 'Remove filter' })
		.first()
		.click();
	await expect(page).toHaveURL('/en/find?_q=sommar');
});

test('mapping does not show the wildcard search', async ({ page }) => {
	await page.goto('/find?_q=*');
	await page.getByRole('link', { name: 'Sökfilter' }).click();
	const mapping = page.getByRole('navigation', { name: 'Valda filter' });
	await expect(mapping).not.toBeVisible();
});
