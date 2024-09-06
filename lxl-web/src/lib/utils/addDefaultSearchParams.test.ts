import { describe, it, expect } from 'vitest';
import addDefaultSearchParams from './addDefaultSearchParams';

describe('addDefaultSearchParams', () => {
	it('adds default search params if they are missing', () => {
		expect(addDefaultSearchParams(new URLSearchParams())).toEqual(
			new URLSearchParams([
				['_q', '*'],
				['_limit', '10'],
				['_offset', '0'],
				['_sort', '']
			])
		);
	});
	it("doesn't change initial params if they are already set", () => {
		expect(addDefaultSearchParams(new URLSearchParams([['_q', 'test']]))).toMatchObject(
			new URLSearchParams([
				['_q', 'test'],
				['_limit', '10'],
				['_offset', '0'],
				['_sort', '']
			])
		);
	});
	it('resets the offset if set', () => {
		expect(addDefaultSearchParams(new URLSearchParams([['_offset', '30']]))).toEqual(
			new URLSearchParams([
				['_offset', '30'],
				['_q', '*'],
				['_limit', '10'],
				['_sort', '']
			])
		);
	});
});
