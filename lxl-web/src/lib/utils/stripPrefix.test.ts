import { describe, it, expect } from 'vitest';
import { stripPrefix } from './stripPrefix';

describe('stripPrefix', () => {
	it('returns undefined if undefined', () => {
		expect(stripPrefix(undefined, 'prefix')).toBe(undefined);
	});
	it('returns stripped if match', () => {
		expect(stripPrefix('prefixFoo', 'prefix')).toBe('Foo');
		expect(stripPrefix('   xxx', '   ')).toBe('xxx');
		expect(stripPrefix('foo', 'foo')).toBe('');
	});
	it('same if no match', () => {
		expect(stripPrefix('prefixFoo', 'prefix1')).toBe('prefixFoo');
		expect(stripPrefix('prefixFoo', 'Prefix')).toBe('prefixFoo');
		expect(stripPrefix('prefixFoo', 'prefixFoo1')).toBe('prefixFoo');
	});
});
