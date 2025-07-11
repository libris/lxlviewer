import { expect, test, devices } from '@playwright/test';

test('decorated data label visibilty is correct after page navigations', async ({ page }) => {
	// TODO: We should probably mock the required requests but something similar to https://github.com/markjaquith/sveltekit-playwright-fetch-mock would be needed to mock the server-side fetches.
	await page.goto('/h08ndxddfg5v2pjf');
	await expect(page.getByText('Medverkan och funktion')).toBeHidden();
	await page.getByText('Jonas Hassen Khemiri, 1978-').first().click();
	await expect(page.getByRole('article').getByText('Språk')).toBeVisible();
});

test('initially opened holdings modals are closable', async ({ page }) => {
	await page.goto('/h08ndxddfg5v2pjf?holdings=Electronic');
	await page.getByTestId('close-modal').first().click();
	await expect(page).toHaveURL('/h08ndxddfg5v2pjf');
	await expect(page.getByTestId('modal')).toBeHidden();
	await page.getByTestId('holding-link').first().click();
	await expect(page.getByTestId('modal')).toBeVisible();
	await expect(page).toHaveURL(new RegExp(/h08ndxddfg5v2pjf\?holdings=\w+/));
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

test('table of contents', async ({ page }) => {
	await page.goto('/khwz18234vvmvn7');
	await expect(page.getByTestId('toc')).toBeVisible();
	await expect(page.getByTestId('toc-mobile')).not.toBeVisible();
	await expect(
		page.getByTestId('toc').locator('a[aria-current]'),
		'first visible link is shown as active'
	).toHaveText('Inledning');
	await page.getByTestId('toc').locator('a:not([aria-current])').first().click();
	await expect(
		page.getByTestId('toc').locator('a[aria-current]'),
		'active link is changed when clicking on link'
	).toHaveText('Förekomster');
	await page.evaluate(() => window.scrollTo(0, 0));
	await expect(
		page.getByTestId('toc').locator('a[aria-current]'),
		'active link is changed when scrolling'
	).toHaveText('Inledning');
	await page.setViewportSize(devices['iPhone X'].viewport);
	await expect(page.getByTestId('toc')).not.toBeVisible();
	await expect(page.getByTestId('toc-mobile')).toBeVisible();
	await expect(page.getByTestId('toc-mobile').locator('a').first()).not.toBeVisible();
	await page.getByTestId('toc-mobile').locator('label').click();
	await expect(
		page.getByTestId('toc-mobile').locator('a').first(),
		'mobile table of contents is visible after clicking on toggle'
	).toHaveText('Inledning');
	await page.getByTestId('toc-mobile').locator('a').nth(1).click();
	await expect(page.locator('#top')).not.toBeInViewport({ ratio: 0.1 });
	await expect(
		page.locator('#occurrences'),
		'links in mobile table of contents works'
	).toBeInViewport();
	await page.getByTestId('toc-mobile').locator('label input[type="checkbox"]').focus();
	await page.keyboard.press('Enter');
	await expect(page.getByTestId('toc-mobile').locator('a').first()).not.toBeVisible();
	await page.keyboard.press('Enter');
	await expect(
		page.getByTestId('toc-mobile').locator('a').first(),
		'enter keypress toggles table of contents while focused on toggle'
	).toBeVisible();
	await page.goto('/h08ndxddfg5v2pjf');
	await expect(
		page.getByTestId('toc'),
		'table of contents is hidden if there are no items to show'
	).not.toBeVisible();
	await expect(page.getByTestId('toc-mobile')).not.toBeVisible();
});
