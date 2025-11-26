import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('add the group when typing a qualifierOperator', async ({ page }) => {
	await page.getByRole('combobox').click();
	await page.getByRole('dialog').getByRole('combobox').fill('title:');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('title:()');
});

test('place the cursor inside the group', async ({ page }) => {
	await page.getByRole('combobox').click();
	await page.getByRole('dialog').getByRole('combobox').pressSequentially('titel:pippi');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:(pippi)');
});

test('re-add group when deleting it', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:pippi');
	await page.keyboard.down('Shift');
	for (let i = 0; i < 6; i++) {
		await combo.press('ArrowLeft');
	}
	await page.keyboard.up('Shift');
	await combo.press('Backspace');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:()');
});

test("dont't add a group when typing a qualifierOperator in the middle of a string", async ({
	page
}) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.fill('titelpippi');
	for (let i = 0; i < 5; i++) {
		await combo.press('ArrowLeft');
	}
	await combo.press(':');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:()pippi');
});

test("don't destroy succeeding qualifiers by treating them as a qualifier value ", async ({
	page
}) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi');
	await combo.press('Home');
	await combo.pressSequentially('contributor:');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText(
		'contributor:()title:(pippi)'
	);
});

test('add the group when editing a groupless qualifier value', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.evaluate((el) => {
		const data = new DataTransfer();
		data.setData('text/plain', 'titel:pippi');
		const event = new ClipboardEvent('paste', { clipboardData: data, bubbles: true });
		el.dispatchEvent(event);
	});
	await combo.press('i');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:(pippii)');
});

test("don't insert another group when typing an operator inside a ghost group", async ({
	page
}) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:pippi');
	await combo.press('ArrowLeft');
	await combo.press('ArrowLeft');
	await combo.press(':');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:(pip:pi)');
});

test('does not touch a group created outside of a qualifier', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.fill('hello ()');
	await combo.press('Backspace');
	await combo.press('Backspace');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('hello');
});

test('does not touch another group created inside a qualifier', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:(a OR b)');
	await combo.press('ArrowRight');
	for (let i = 0; i < 7; i++) {
		await combo.press('Backspace');
	}
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:(a)');
});

test('pressing backspace after a group jumps into the group', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:pippi');
	await combo.press('End');
	await combo.press('Backspace');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:(pippi)');
});

test('pressing backspace after a group with text after, do not merge the group', async ({
	page
}) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:pippi långstrump');
	await combo.press('ArrowRight');
	await combo.pressSequentially('astrid');
	for (let i = 0; i < 6; i++) {
		await combo.press('ArrowLeft');
	}
	await combo.press('Backspace');
	await combo.press('Backspace');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText(
		'titel:(pippi långstrum)astrid'
	);
});

test('pressing delete at the end of group jumps forward out of the group instead of destroying it', async ({
	page
}) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:pippi');
	await combo.press('Delete');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:(pippi)');
});

test('pressing backspace at the start of a group jumps backward out of the group instead of destroying it', async ({
	page
}) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:pippi');
	for (let i = 0; i < 5; i++) {
		await combo.press('ArrowLeft');
	}
	await combo.press('Backspace');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:(pippi)');
});

test('pressing delete before a group jumps forward into the group instead of destroying it', async ({
	page
}) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi');
	for (let i = 0; i < 6; i++) {
		await combo.press('ArrowLeft');
	}
	await combo.press('Delete');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('title:(pippi)');
});

test('user selects and deletes the start of a group; repair start', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:pippi långstrump');
	for (let i = 0; i < 17; i++) {
		await combo.press('ArrowLeft');
	}
	await page.keyboard.down('Shift');
	for (let i = 0; i < 6; i++) {
		await combo.press('ArrowRight');
	}
	await page.keyboard.up('Shift');
	await combo.press('Delete');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:( långstrump)');
});

test('user selects and deletes the end of a group; repair end', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:pippi långstrump');
	await page.keyboard.down('ArrowRight');
	await page.keyboard.down('Shift');
	for (let i = 0; i < 11; i++) {
		await combo.press('ArrowLeft');
	}
	await page.keyboard.up('Shift');
	await combo.press('Delete');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:(pippi )');
});

test('user selects start of a group and inserts text; repair start', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:pippi långstrump');
	for (let i = 0; i < 17; i++) {
		await combo.press('ArrowLeft');
	}
	await page.keyboard.down('Shift');
	for (let i = 0; i < 6; i++) {
		await combo.press('ArrowRight');
	}
	await page.keyboard.up('Shift');
	await combo.pressSequentially('a');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:(a långstrump)');
});

test('user selects end of a group and inserts text; repair end', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:pippi långstrump');
	await page.keyboard.down('ArrowRight');
	await page.keyboard.down('Shift');
	for (let i = 0; i < 11; i++) {
		await combo.press('ArrowLeft');
	}
	await page.keyboard.up('Shift');
	await combo.pressSequentially('a');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:(pippi a)');
});

test('deletion includes end of a group with qualifier after; keep integrity if qualifiers', async ({
	page
}) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:pippi långstrump');
	await page.keyboard.down('ArrowRight');
	await combo.pressSequentially('key:value');
	for (let i = 0; i < 10; i++) {
		await combo.press('ArrowLeft');
	}
	await page.keyboard.down('Shift');
	for (let i = 0; i < 7; i++) {
		await combo.press('ArrowLeft');
	}
	await page.keyboard.up('Shift');
	await combo.press('Delete');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText(
		'titel:(pippi lång)key:(value)'
	);
});

test('select end of a group and insert text with qualifier after; keep integrity if qualifiers', async ({
	page
}) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:pippi långstrump');
	await page.keyboard.down('ArrowRight');
	await combo.pressSequentially('key:value');
	for (let i = 0; i < 10; i++) {
		await combo.press('ArrowLeft');
	}
	await page.keyboard.down('Shift');
	for (let i = 0; i < 7; i++) {
		await combo.press('ArrowLeft');
	}
	await page.keyboard.up('Shift');
	await combo.pressSequentially('a');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText(
		'titel:(pippi långa)key:(value)'
	);
});

test('deletion includes end of grup AND subsequent text, keep integrity of group', async ({
	page
}) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:pippi långstrump');
	await page.keyboard.down('ArrowRight');
	await combo.pressSequentially('moretext');
	for (let i = 0; i < 4; i++) {
		await combo.press('ArrowLeft');
	}
	await page.keyboard.down('Shift');
	for (let i = 0; i < 11; i++) {
		await combo.press('ArrowLeft');
	}
	await page.keyboard.up('Shift');
	await combo.press('Delete');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:(pippi lång)text');
});

test('typing text between the operator and group ends up inside the group', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi');
	for (let i = 0; i < 6; i++) {
		await combo.press('ArrowLeft');
	}
	await combo.pressSequentially('hej');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('title:(hejpippi)');
});

test('pasting text between the operator and group ends up inside the group', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi');
	for (let i = 0; i < 6; i++) {
		await combo.press('ArrowLeft');
	}
	await combo.pressSequentially('hej');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('title:(hejpippi)');
});

test('typing ")" between the operator and group is skipped', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi');
	for (let i = 0; i < 6; i++) {
		await combo.press('ArrowLeft');
	}
	await combo.pressSequentially(')');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('title:(pippi)');
});

test('No longer a valid qualifier; remove group', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi');
	for (let i = 0; i < 6; i++) {
		await combo.press('ArrowLeft');
	}
	await combo.press('Backspace');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titlepippi');
});

test('No longer a valid qualifier; remove group 2', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('titel:pippi');
	for (let i = 0; i < 3; i++) {
		await combo.press('ArrowLeft');
	}
	await page.keyboard.down('Shift');
	for (let i = 0; i < 5; i++) {
		await combo.press('ArrowLeft');
	}
	await page.keyboard.up('Shift');
	await combo.press('Backspace');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titeppi');
});

// test('dont touch a quoted qualifier value', async ({ page }) => {
// 	await page.getByRole('combobox').click();
// 	const combo = page.getByRole('dialog').getByRole('combobox');
// 	await combo.evaluate((el) => {
// 		const data = new DataTransfer();
// 		data.setData('text/plain', 'titel:"pippi"');
// 		const event = new ClipboardEvent('paste', { clipboardData: data, bubbles: true });
// 		el.dispatchEvent(event);
// 	});
// 	await expect(page.getByTestId('supersearch-input-value')).toHaveText('titel:"pippi"');
// });

test('autocomplete ) inside the group', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi)');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('title:(pippi())');
});

test('autocomplete multiple ) inside the group', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi)))');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('title:(pippi((())))');
});

test('cursor ends up inside an autocompleted group', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi)');
	await combo.pressSequentially('more');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('title:(pippi(more))');
});

test('reverses autocompletion of group, remove stray )', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi)');
	await combo.press('Backspace');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('title:(pippi)');
});

test('reverses autocompletion of group, remove multiple stray )', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi)))');
	for (let i = 0; i < 3; i++) await combo.press('Backspace');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('title:(pippi)');
});

test('can handle bulk deletion by removing multiple stray )))', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi)))');
	await page.keyboard.down('Shift');
	for (let i = 0; i < 3; i++) await combo.press('ArrowLeft');
	await page.keyboard.up('Shift');
	await combo.press('Delete');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('title:(pippi)');
});

test('reverses autocompletion of group, remove stray ) far away in the group', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi)');
	await combo.pressSequentially('more');
	for (let i = 0; i < 4; i++) await combo.press('ArrowLeft');
	await combo.press('Backspace');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('title:(pippimore)');
});

test('handles autocomplete when pasting', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi');

	await combo.evaluate((el) => {
		const data = new DataTransfer();
		data.setData('text/plain', 'lång)');
		const event = new ClipboardEvent('paste', { clipboardData: data, bubbles: true });
		el.dispatchEvent(event);
	});

	await expect(page.getByTestId('supersearch-input-value')).toHaveText('title:(pippi(lång))');
});

test('handles autocomplete when pasting multiple ))', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('title:pippi');

	await combo.evaluate((el) => {
		const data = new DataTransfer();
		data.setData('text/plain', 'lång)))');
		const event = new ClipboardEvent('paste', { clipboardData: data, bubbles: true });
		el.dispatchEvent(event);
	});

	await expect(page.getByTestId('supersearch-input-value')).toHaveText('title:(pippi(((lång))))');
});

test('opening ( in group does not destroy succeeding qualifiers', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('a:aa');
	await combo.press('ArrowRight');
	await combo.pressSequentially('b:bb');
	for (let i = 0; i < 7; i++) await combo.press('ArrowLeft');
	await combo.pressSequentially('(');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('a:(a()a)b:(bb)');
});

test('multiple opening ( in group does not destroy succeeding qualifiers', async ({ page }) => {
	await page.getByRole('combobox').click();
	const combo = page.getByRole('dialog').getByRole('combobox');
	await combo.pressSequentially('a:aa');
	await combo.press('ArrowRight');
	await combo.pressSequentially('b:bb');
	for (let i = 0; i < 7; i++) await combo.press('ArrowLeft');
	await combo.pressSequentially('(((');
	await expect(page.getByTestId('supersearch-input-value')).toHaveText('a:(a((()))a)b:(bb)');
});
