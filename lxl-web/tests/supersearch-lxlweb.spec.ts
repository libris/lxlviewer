// test implentation of supersearch in lxlweb
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('click input expands dialog', async ({ page }) => {
	const dialog = await page.locator('#supersearch-dialog');
	await expect(dialog).not.toHaveAttribute('open');
	await page.getByTestId('supersearch').click();
	await expect(dialog).toHaveAttribute('open');
});

test('type & enter performs search', async ({ page }) => {
	await page.getByTestId('supersearch').getByRole('combobox').fill('hej');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/find?_q=hej&_limit=20&_offset=0&_sort=&_spell=true');
});

test('expanded content shows persistant items and results', async ({ page }) => {
	await page.getByTestId('supersearch').getByRole('combobox').click();
	await expect(
		await page.getByRole('dialog').getByLabel('Lägg till filter').getByRole('button').count(),
		'persistent items are shown on empty input'
	).toBeGreaterThan(0);
	await expect(
		page.getByRole('dialog').getByLabel('Förslag'),
		'search results are not visible on empty input'
	).toBeHidden();
	await page.getByRole('dialog').getByRole('combobox').fill('hej '); // add space for now until showAddQualifiers is even smarter

	// wait for /supersearch api response before expecting any results
	await page.waitForResponse(
		(res) => res.url().includes('supersearch?_q=hej') && res.status() === 200
	);
	await expect(
		await page.getByRole('dialog').getByLabel('Lägg till filter').getByRole('button').count(),
		'persistent items are also shown after typing'
	).toBeGreaterThan(0);
	await expect(
		page.getByRole('dialog').getByLabel('Förslag').getByRole('link'),
		'search results are shown after typing'
	).toHaveCount(5);
	await page.goto('/find?_limit=20&_offset=0&_q=language%3A"lang%3Aswe"&_sort=&_spell=true');
	await page.getByTestId('supersearch').click();

	await page.waitForResponse(
		(res) => res.url().includes('/supersearch?_q=language') && res.status() === 200
	);
	await expect(
		page.getByRole('dialog').getByLabel('Förslag').getByRole('link'),
		'results are shown if there is an initial query'
	).toHaveCount(5);
	await page.getByRole('dialog').getByLabel('Förslag').getByRole('link').first().click();
	await page.waitForURL(/\/[a-z0-9]{15,}$/); // fnurgel route
	await expect(
		page.getByRole('combobox').locator('.lxl-qualifier-key'),
		'query is kept when navigating from find routes...'
	).toContainText('Språk');
	await expect(page.getByRole('combobox').locator('.lxl-qualifier-value')).toContainText('Svenska');
	await page.getByTestId('home').click(); // click on home link
	await page.waitForURL('/'); // fnurgel route
	await expect(
		page.getByRole('combobox'),
		'...except when navigating to start/index (which should be seen as a reset)'
	).toContainText('Sök titel, upphovsperson, bibliotek, ämnen...');
});

test('navigate to suggested resource using keyboard', async ({ page }) => {
	await page.getByTestId('supersearch').getByRole('combobox').fill('Kallocain');

	await page.waitForResponse(
		(res) => res.url().includes('/supersearch?_q=Kallocain') && res.status() === 200
	);
	await expect(page.getByRole('dialog').getByLabel('Förslag').getByRole('link')).toHaveCount(5);
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');
	await expect(page.getByTestId('resource-page')).toBeVisible();
	await expect(
		page.locator('.supersearch-combobox .cm-focused'),
		'input loses focus when navigating'
	).not.toBeVisible();
});

test('user can jump from first row to bottom by pressing arrow up', async ({ page }) => {
	await page.getByTestId('supersearch').getByRole('combobox').fill('Kallocain');

	await page.waitForResponse(
		(res) => res.url().includes('/supersearch?_q=Kallocain') && res.status() === 200
	);
	await expect(page.getByRole('dialog').getByRole('link')).toHaveCount(5);
	await page.keyboard.press('ArrowUp');
	await page.keyboard.press('ArrowUp');
	await page.keyboard.press('Enter');
	await expect(page.getByTestId('resource-page')).toBeVisible();
});

test('qualifier keys can be added using the user interface', async ({ page }) => {
	await page.getByTestId('supersearch').getByRole('combobox').click();
	await page
		.getByRole('dialog')
		.getByLabel('Lägg till filter')
		.getByRole('button')
		.getByText('Författare/upphov')
		.first()
		.click();
	await expect(
		page.getByRole('dialog').getByLabel('Lägg till filter'),
		'buttons for adding qualifier keys is hidden after selecting one of them'
	).toBeHidden();
	await expect(
		page.getByRole('dialog').getByRole('combobox').locator('.lxl-qualifier')
	).toBeVisible();
	await expect(
		page.getByRole('dialog').getByRole('combobox').locator('.lxl-qualifier'),
		'qualifier value is initially empty but has styling'
	).toContainText('');
	await page.keyboard.press('j');

	await page.waitForResponse(
		(res) => res.url().includes('/supersearch?_q=contributor') && res.status() === 200
	);
	await expect(
		page
			.getByRole('dialog')
			.getByRole('link')
			.filter({ hasText: /Person|Organisation/ }),
		'all suggestions are persons or organizations'
	).toHaveCount(5);
	await expect(page.getByRole('dialog').getByRole('combobox')).toContainText('Författare/upphov');
	await page.getByRole('dialog').getByRole('combobox').pressSequentially('an');

	await page.waitForResponse(
		(res) => res.url().includes('supersearch?_q=contributor%3A%28jan%29') && res.status() === 200
	);
	await expect(
		await page
			.getByRole('dialog')
			.getByRole('link')
			.filter({ hasText: /Person|Organisation/ })
			.filter({ hasText: /jan/i }),
		'all suggestions are persons related to the query "jan"'
	).toHaveCount(5);
	await page.getByRole('dialog').locator('.suggestion').first().getByRole('link').click();
	await page.waitForURL('**/find?**');
	await expect(page.url()).toContain('contributor');
	await expect(
		page.getByRole('combobox').locator('.lxl-qualifier-key').first(),
		'pill with selected qualifier key exists...'
	).toContainText('Författare/upphov');
	await expect(
		page.getByRole('combobox').locator('.lxl-qualifier-value'),
		'...and the value is related to the previous query'
	).toContainText(/jan/i);
	await page.getByTestId('supersearch').getByRole('combobox').click();
	await page
		.getByRole('dialog')
		.getByLabel('Lägg till filter')
		.getByRole('button')
		.getByText('Språk')
		.click();

	await page.keyboard.press('S');
	await page.waitForResponse(
		(res) =>
			res.url().includes('/supersearch?') &&
			res.url().includes('spr%C3%A5k') &&
			res.status() === 200
	);
	await expect(
		page.getByRole('dialog').locator('.suggestion').getByRole('link').filter({ hasText: 'Språk' }),
		'all suggestions are languages'
	).toHaveCount(5);
	await page.getByRole('dialog').getByRole('combobox').pressSequentially('wahili');
	await page.getByRole('dialog').locator('.suggestion').getByRole('link').first().click();
	await page.waitForURL(/spr%C3%A5k/);
	await expect(page.url()).toContain('contributor');
	await expect(page.url(), 'url contains both contributor and language').toContain(
		encodeURIComponent('språk')
	);
	await expect(page.getByRole('combobox').locator('.lxl-qualifier-key').first()).toContainText(
		'Författare/upphov'
	);
	await expect(
		page.getByRole('combobox').locator('.lxl-qualifier-key').last(),
		'pills for both contributor and language exists'
	).toContainText('Språk');
	await page.getByTestId('supersearch').getByRole('combobox').click();
	await page.keyboard.press('Home'); // for PCs
	await page.keyboard.press('Meta+ArrowLeft'); // for mac
	await page.getByRole('dialog').getByRole('combobox').pressSequentially(' ');
	await page.keyboard.press('ArrowLeft');
	await page
		.getByRole('dialog')
		.getByLabel('Lägg till filter')
		.getByRole('button')
		.getByText('Ämne')
		.click();

	await page.keyboard.press('A');
	await page.waitForResponse(
		(res) =>
			res.url().includes('/supersearch?') && res.url().includes('A4mne') && res.status() === 200
	);
	await expect(page.getByRole('dialog').getByRole('link').filter({ hasText: 'ämne' })).toHaveCount(
		5
	);
	await page.getByRole('dialog').locator('.suggestion').getByRole('link').first().click();
	await page.waitForURL(/A4mne/);
	await expect(
		page.getByRole('combobox').locator('.lxl-qualifier-key').first(),
		'qualifier is added in the beginning if the cursor is placed there'
	).toContainText('Ämne');
	await expect(page.getByRole('combobox').locator('.lxl-qualifier-key').nth(1)).toContainText(
		'Författare/upphov'
	);
	await expect(page.getByRole('combobox').locator('.lxl-qualifier-key').last()).toContainText(
		'Språk'
	);
});

test('clear button clears input field', async ({ page }) => {
	await page.getByTestId('supersearch').click();
	await expect(
		page.getByTestId('supersearch').getByLabel('Rensa').last(),
		'Clear button not visible initially'
	).not.toBeVisible();
	await page.getByRole('combobox').last().fill('hello');
	await expect(
		page.getByTestId('supersearch').getByLabel('Rensa').last(),
		'Clear button visible after typing'
	).toBeVisible();
	await page.getByTestId('supersearch').getByLabel('Rensa').last().click();
	await expect(page.getByRole('combobox').last(), 'Clear input after click').toContainText('');
	await page.getByRole('combobox').last().fill('hello');
	await expect(page.getByRole('combobox').last(), 'Can type again after clear').toContainText(
		'hello'
	);
});

test('access filters can be added/removed', async ({ page }) => {
	await page.getByRole('combobox').fill('hej');
	await page.keyboard.press('Enter');
	await page.getByText('Fritt online').click();
	await expect(page, 'user can add access filters').toHaveURL('/find?_q=hej+freeOnline');
	await page.getByLabel('Rensa').first().click();
	await expect(page, 'user can remove access filters by pressing clear icon').toHaveURL(
		'/find?_q=hej+freeOnline'
	);
	await page.getByText('Fritt online').first().click();
	await expect(page).toHaveURL('/find?_q=hej+freeOnline');
	await expect(page.getByRole('combobox').first()).toContainText('hej Fritt online');

	await page.getByTestId('supersearch').click();
	await page.keyboard.press('Backspace');
	await page.keyboard.press('Backspace');
	await expect(
		page.getByRole('dialog').getByRole('combobox'),
		'user can remove access filters by pressing backspace to remove pill'
	).not.toContainText('Fritt online');
	await expect(page.getByRole('dialog').getByRole('combobox')).toContainText('hej');
});
