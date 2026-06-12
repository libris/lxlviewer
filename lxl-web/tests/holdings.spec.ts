import { expect, test } from '@playwright/test';

// using /fxqqg6xr2062ndl since this test post _should_ be stable in terms of holdings

test('Holdings panel displays a card', async ({ page }) => {
	await page.goto('/fxqqg6xr2062ndl?holdings=PhysicalResource');
	await expect(page.locator('dialog [data-testid="search-card"]')).toBeVisible();
});

test('Holdings panel has a search', async ({ page }) => {
	await page.goto('/fxqqg6xr2062ndl?holdings=PhysicalResource');
	await expect(page.locator('dialog input[type="search"]')).toBeVisible();
});

test('Holdings panel has a toggle near me', async ({ page }) => {
	await page.goto('/fxqqg6xr2062ndl?holdings=PhysicalResource');
	await expect(page.locator('dialog button[role="switch"]')).toBeVisible();
});

test('Holdings panel hightlights refined libraries', async ({ page }) => {
	await page.goto(
		'/fxqqg6xr2062ndl?_q=library%3A"libris%3Alibrary%2Forg%2FKB"&holdings=PhysicalResource'
	);
	const specialSections = page.locator('dialog .special-section');

	// refined section
	const refinedSection = specialSections.getByText('Avgränsade bibliotek');
	await expect(refinedSection).toBeVisible();

	// no favourite libraries section
	const favLibrariesSection = specialSections.getByText('Favoritbibliotek');
	await expect(favLibrariesSection).not.toBeAttached();

	// org grouping label
	const holdingsOrgLabel = specialSections
		.getByTestId('holdings-org-label')
		.getByText('Kungliga biblioteket');
	await expect(holdingsOrgLabel).toBeVisible();

	// 1 holding library
	const members = specialSections.filter({ hasText: 'Avgränsade bibliotek' }).locator('.holder');
	await expect(members).toHaveCount(1);
});

test('Holdings panel highlights favourite libraries', async ({ page }) => {
	await page.goto('/?favouriteLibraries=org/KB');
	await page.goto('/fxqqg6xr2062ndl?holdings=PhysicalResource');
	const specialSections = page.locator('dialog .special-section');

	// favourite libraries section
	const favLibrariesSection = specialSections.getByText('Favoritbibliotek');
	await expect(favLibrariesSection).toBeVisible();

	// no refined section
	const refinedSection = specialSections.getByText('Avgränsade bibliotek');
	await expect(refinedSection).not.toBeAttached();

	// org grouping label
	const holdingsOrgLabel = specialSections
		.getByTestId('holdings-org-label')
		.getByText('Kungliga biblioteket');
	await expect(holdingsOrgLabel).toBeVisible();

	// 1 holding library
	const members = specialSections.filter({ hasText: 'Favoritbibliotek' }).locator('.holder');
	await expect(members).toHaveCount(1);
});

test('Holdings panel can highlight both favourite and refined libraries', async ({ page }) => {
	await page.goto('/?favouriteLibraries=org/KB');
	await page.goto(
		'/fxqqg6xr2062ndl?_q=library%3A"libris%3Alibrary%2Forg%2FKB"&holdings=PhysicalResource'
	);
	const specialSections = page.locator('dialog .special-section');

	//refined section
	const refinedSection = specialSections.getByText('Avgränsade bibliotek');
	await expect(refinedSection).toBeVisible();

	// favourite libraries section
	const favLibrariesSection = specialSections.getByText('Favoritbibliotek');
	await expect(favLibrariesSection).toBeVisible();
});
