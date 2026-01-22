import { expect, test } from '@playwright/test';

let articleIds: string[] = [];

test.beforeAll(async ({ browser }) => {
	const page = await browser.newPage();
	await page.goto('/find?_q=f&_offset=0&_limit=40');
	articleIds = await page
		.getByRole('main')
		.getByRole('article')
		.evaluateAll((elements) =>
			elements
				.map((element) => element.getAttribute('id'))
				.filter((item) => typeof item === 'string')
		);
});

test('navigation between results works', async ({ page }) => {
	await page.goto('/find?_q=f&_offset=0&_limit=20');
	await page.getByRole('main').getByRole('article').getByRole('link').first().click();
	await expect(page).toHaveURL(`${articleIds[0]}?_q=f`);
	await page.getByRole('main').getByRole('link').getByText('Nästa').click();
	await expect(page, 'button for navigating to next result works').toHaveURL(
		`${articleIds[1]}?_q=f`
	);
	await page.getByRole('main').getByRole('link').getByText('Föregående').click();
	await expect(page, 'button for navigating to previous result works').toHaveURL(
		`${articleIds[0]}?_q=f`
	);
	await page.getByRole('main').getByRole('link').getByText('Visa i träfflista').click();
	await expect(page, 'button for navigating to search results works').toHaveURL(
		`/find?_q=f&_limit=20#${articleIds[0]}`
	);
	await page.getByRole('main').getByRole('article').nth(19).getByRole('link').first().click();
	await expect(page).toHaveURL(`${articleIds[19]}?_q=f`);
	await page.getByRole('main').getByRole('link').getByText('Nästa').click();
	await expect(page, 'navigating to result on next search results works').toHaveURL(
		`${articleIds[20]}?_q=f`
	);
	await page.getByRole('main').getByRole('link').getByText('Nästa').click();
	await expect(page, 'navigating to result on next search results works').toHaveURL(
		`${articleIds[21]}?_q=f`
	);
	await page.getByRole('main').getByRole('link').getByText('Visa i träfflista').click();
	await expect(
		page,
		'button for navigating to search results works when navigating to result which is part of other search results'
	).toHaveURL(`/find?_q=f&_offset=20&_limit=20#${articleIds[21]}`);
	await page.getByRole('main').getByRole('article').getByRole('link').first().click();
	await expect(page).toHaveURL(`${articleIds[20]}?_q=f`);
	await page.getByRole('main').getByRole('link').getByText('Föregående').click();
	await expect(page, 'navigating to result on previous search results works').toHaveURL(
		`${articleIds[19]}?_q=f`
	);
	await page.getByRole('main').getByRole('link').getByText('Visa i träfflista').click();
	await expect(
		page,
		'button for navigating to search results works when navigating to result which is part of other search results'
	).toHaveURL(`/find?_q=f&_limit=20#${articleIds[19]}`);
});

test('navigation between results also works when changing _limit value', async ({ page }) => {
	await page.goto('/find?_q=f&_limit=2');
	await page.waitForURL('/find?_q=f&_limit=2');
	await page.getByRole('link').getByText('6', { exact: true }).click();
	await expect(page).toHaveURL('/find?_q=f&_limit=2&_offset=10');
	await page.getByRole('main').getByRole('article').getByRole('link').first().click();
	await expect(page).toHaveURL(`${articleIds[10]}?_q=f`);
	await page.getByRole('main').getByRole('link').getByText('Föregående').click();
	await expect(page).toHaveURL(`${articleIds[9]}?_q=f`);
	await page.getByRole('main').getByRole('link').getByText('Visa i träfflista').click();
	await expect(page).toHaveURL(`/find?_q=f&_offset=8&_limit=2#${articleIds[9]}`);
});

test('resource is highlighted when navigating to search results', async ({ page }) => {
	await page.goto('/find?_q=f&_limit=20');
	await page.getByRole('main').getByRole('article').nth(3).getByRole('link').first().click();
	await expect(page).toHaveURL(`${articleIds[3]}?_q=f`);
	await page.getByRole('main').getByRole('link').getByText('Visa i träfflista').click();
	await expect(page, 'url has resource id as hash').toHaveURL(
		`/find?_q=f&_limit=20#${articleIds[3]}`
	);
	await expect(
		page.getByRole('article').nth(3),
		'resource has aria-current attribute'
	).toHaveAttribute('aria-current', 'true');
	// Click the top left corner
	await page.getByRole('main').click({ position: { x: 0, y: 0 }, force: true });
	await expect(
		page.getByRole('article').nth(3),
		'aria-current is dismissable by clicking anywhere'
	).not.toHaveAttribute('aria-current', 'true');
	await page.getByRole('main').getByRole('article').nth(3).getByRole('link').first().click();
	await expect(page).toHaveURL(`${articleIds[3]}?_q=f`);
	await page.goBack();
	await expect(page).toHaveURL(`/find?_q=f&_limit=20#${articleIds[3]}`);
	await expect(
		page.getByRole('article').nth(3),
		'aria-current is still dismissed if navigating back to page'
	).not.toHaveAttribute('aria-current', 'true');
	await page.reload();
	await expect(
		page.getByRole('article').nth(3),
		'resource has aria-current value if page is reloaded (and hash includes resource id)'
	).toHaveAttribute('aria-current', 'true');
});
