import { describe, it, expect } from 'vitest';
import { getBibIdsByInstanceId } from './holdings';
import mainEntity from '$lib/assets/json/test-data/main-entity.json';
import record from '$lib/assets/json/test-data/record.json';

describe('getBibIdsByInstanceId', () => {
	it('Returns a correctly mapped object (bibId, type & holders)', () => {
		expect(getBibIdsByInstanceId(mainEntity, record)).toStrictEqual({
			'0h96fs3b0c49qkt': {
				bibId: '7654300',
				'@type': 'Instance',
				holders: ['S', 'H', 'U', 'Um', 'Umdp', 'La', 'Q', 'L', 'Sbi', 'NB'],
				onr: '9176423484',
				isbn: ['9176423484'],
				issn: []
			}
		});
	});
});
