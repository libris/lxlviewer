import { describe, it, expect } from 'vitest';
import { getHoldingsByInstanceId, getBibIdsByInstanceId } from './holdings.server';
import { getMyLibsFromHoldings } from './holdings';
import mainEntity from '$lib/assets/json/test-data/main-entity.json';
import record from '$lib/assets/json/test-data/record.json';
import { UserSettings } from './userSettings.svelte';
import { centerOnWork } from './centerOnWork';

const workCenteredMainEntity = centerOnWork(mainEntity);

describe('getBibIdsByInstanceId', () => {
	it('Returns a correctly mapped object (bibId, type & holders)', () => {
		const instanceTokenStr = 'Natur och kultur, 2018';
		const DisplayUtil = { lensAndFormat: () => instanceTokenStr };

		// @ts-expect-error - Display is mocked
		expect(getBibIdsByInstanceId(workCenteredMainEntity, DisplayUtil, record, 'sv')).toStrictEqual({
			'0h96fs3b0c49qkt': {
				bibId: '7654300',
				'@type': 'PhysicalResource',
				onr: '9176423484',
				isbn: ['9176423484'],
				issn: [],
				str: instanceTokenStr
			}
		});
	});
});

describe('getMyLibsFromHoldings', () => {
	it('Returns favourite library present in the holdings list', () => {
		const userSettings = new UserSettings({});
		userSettings.addLibrary('https://libris.kb.se/library/S', 'Kungliga biblioteket');
		userSettings.addLibrary('https://libris.kb.se/library/foo', 'Mitt bibliotek');
		const instances = getHoldingsByInstanceId(workCenteredMainEntity);

		expect(getMyLibsFromHoldings(userSettings.myLibraries, instances)).toStrictEqual([
			'https://libris.kb.se/library/S'
		]);

		userSettings.addLibrary('https://libris.kb.se/library/H', 'Frescatibilbioteket');

		expect(getMyLibsFromHoldings(userSettings.myLibraries, instances)).toStrictEqual([
			'https://libris.kb.se/library/S',
			'https://libris.kb.se/library/H'
		]);
	});
});
