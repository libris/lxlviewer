import { describe, it, expect } from 'vitest';
import addDefaultSearchParams from './addDefaultSearchParams';

describe('addDefaultSearchParams', () => {
	it('adds default search params if they are missing', () => {
		expect(addDefaultSearchParams(new URLSearchParams())).toStrictEqual(
			new URLSearchParams([['_q', '*']])
		);
	});
	it("doesn't change initial params if they are already set", () => {
		expect(addDefaultSearchParams(new URLSearchParams([['_q', 'test']]))).toStrictEqual(
			new URLSearchParams([['_q', 'test']])
		);
	});
	it("don't reset the offset if set", () => {
		expect(addDefaultSearchParams(new URLSearchParams([['_offset', '30']]))).toStrictEqual(
			new URLSearchParams([
				['_offset', '30'],
				['_q', '*']
			])
		);
	});
});
