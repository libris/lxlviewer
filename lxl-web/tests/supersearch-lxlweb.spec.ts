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

test('start content shown on empty input', async ({ page }) => {
	await page.getByTestId('main-search').click();
	await expect(page.getByText('Bygg och förfina din sökning')).toBeVisible();
});

test('8 suggestions shown after typing', async ({ page }) => {
	await page.getByRole('combobox').fill('hej');
	await expect(page.getByText('Bygg och förfina din sökning')).not.toBeVisible();
	await expect(await page.locator('.suggestion')).toHaveCount(8);
});

test('navigate to suggested resource using keyboard', async ({ page }) => {
	await page.getByRole('combobox').fill('a');
	await expect(await page.locator('.suggestion')).toHaveCount(8);
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');
	await expect(page.locator('.resource-page')).toBeVisible();
});

test('input loses focus when navigating', async ({ page }) => {
	await page.getByRole('combobox').fill('a');
	await expect(await page.locator('.supersearch-combobox .cm-focused')).toBeVisible();
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');
	await expect(await page.locator('.supersearch-combobox .cm-focused')).not.toBeVisible();
});
