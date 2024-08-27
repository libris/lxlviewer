import { describe, it, expect } from 'vitest';
import isFnurgel from './isFnurgel';

describe('isFnurgel', () => {
	it('returns true if fnurgel', () => {
		expect(isFnurgel('n5ftk39xlxc7vs6g')).toBe(true);
	});
	it('returns false if not fnurgel', () => {
		expect(isFnurgel('test')).toBe(false);
	});
});
