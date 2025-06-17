// test implentation of supersearch in lxlweb
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('click input expands dialog', async ({ page }) => {
	const dialog = await page.locator('#supersearch-dialog');
	await expect(dialog).not.toHaveAttribute('open');
	await page.getByTestId('main-search').click();
	await expect(dialog).toHaveAttribute('open');
});

test('type & enter performs search', async ({ page }) => {
	await page.getByRole('combobox').fill('hej');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/find?_q=hej&_limit=20&_offset=0&_sort=&_spell=true');
});

test('expanded content shows persistant items and results', async ({ page }) => {
	await page.getByTestId('main-search').click();
	await expect(page.getByText('Lägg till filter')).toBeVisible();
	await expect(
		page.getByRole('rowgroup').getByRole('button'),
		'persistent items are shown on empty input'
	).not.toHaveCount(0);
	await page.getByRole('dialog').getByRole('combobox').fill('hej');
	await expect(
		page.getByRole('rowgroup').getByRole('button'),
		'persistent items are shown after searching'
	).not.toHaveCount(0);
	await expect(await page.locator('.suggestion'), 'search results are shown').toHaveCount(5);
});

test('navigate to suggested resource using keyboard', async ({ page }) => {
	await page.getByRole('combobox').fill('a');
	await expect(await page.locator('.suggestion')).toHaveCount(5);
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');
	await expect(page.locator('.resource-page')).toBeVisible();
	await expect(
		page.locator('.supersearch-combobox .cm-focused'),
		'input loses focus when navigatiing'
	).not.toBeVisible();
});
