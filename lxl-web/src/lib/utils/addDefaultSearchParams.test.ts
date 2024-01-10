import { describe, it, expect } from 'vitest';
import addDefaultSearchParams from './addDefaultSearchParams';

describe('addDefaultSearchParams', () => {
	it('adds default search params if they are missing', () => {
		expect(addDefaultSearchParams(new URLSearchParams())).toStrictEqual(
			new URLSearchParams([
				['q', '*'],
				['@type', 'Work'],
				['_limit', '10'],
				['_offset', '0'],
				['_sort', '']
			])
		);
	});
	it("doesn't change initial params if they are already set", () => {
		expect(addDefaultSearchParams(new URLSearchParams([['q', 'test']]))).toStrictEqual(
			new URLSearchParams([
				['q', 'test'],
				['@type', 'Work'],
				['_limit', '10'],
				['_offset', '0'],
				['_sort', '']
			])
		);
	});
});
