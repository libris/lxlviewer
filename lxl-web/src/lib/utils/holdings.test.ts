import { describe, it, expect } from 'vitest';
import {
	getHoldingsByInstanceId,
	getBibIdsByInstanceId,
	getMyLibsFromHoldings
} from './holdings.server';
import mainEntity from '$lib/assets/json/test-data/main-entity.json';
import record from '$lib/assets/json/test-data/record.json';
import { UserSettings } from './userSettings.svelte';
import { centerOnWork } from './centerOnWork';

const workCenteredMainEntity = centerOnWork(mainEntity);

describe('getBibIdsByInstanceId', () => {
	it('Returns a correctly mapped object (bibId, type & holders)', () => {
		const instanceTokenStr = 'Natur och kultur, 2018';
		const DisplayUtil = { lensAndFormat: () => instanceTokenStr };

		expect(getBibIdsByInstanceId(workCenteredMainEntity, DisplayUtil, record, 'sv')).toStrictEqual({
			'0h96fs3b0c49qkt': {
				bibId: '7654300',
				'@type': 'PhysicalResource',
				holders: ['S', 'H', 'U', 'Um', 'Umdp', 'La', 'Q', 'L', 'Sbi', 'NB'],
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
		userSettings.addLibrary({ '@id': '434566', label: 'Kungliga biblioteket', sigel: 'S' });
		userSettings.addLibrary({ '@id': '54345', label: 'Mitt bibliotek', sigel: 'Mitt' });
		const instances = getHoldingsByInstanceId(workCenteredMainEntity);

		expect(getMyLibsFromHoldings(userSettings.myLibraries, instances)).toStrictEqual([
			{
				'@id': '434566',
				label: 'Kungliga biblioteket',
				sigel: 'S'
			}
		]);

		userSettings.addLibrary({ '@id': '645656', label: 'Frescatibilbioteket', sigel: 'H' });

		expect(getMyLibsFromHoldings(userSettings.myLibraries, instances)).toStrictEqual([
			{
				'@id': '434566',
				label: 'Kungliga biblioteket',
				sigel: 'S'
			},
			{
				'@id': '645656',
				label: 'Frescatibilbioteket',
				sigel: 'H'
			}
		]);
	});
});
