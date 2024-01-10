import { describe, it, expect } from 'vitest';
import getSortedSearchParams from './getSortedSearchParams';

describe('getSortedSearchParams', () => {
	it('sorts search params by key', () => {
		expect(
			getSortedSearchParams(
				new URLSearchParams([
					['q', '*'],
					['@type', 'Work'],
					['_limit', '10'],
					['_offset', '0'],
					['_sort', '']
				])
			)
		).toStrictEqual(
			new URLSearchParams([
				['@type', 'Work'],
				['_limit', '10'],
				['_offset', '0'],
				['_sort', ''],
				['q', '*']
			])
		);
	});
});
