import { describe, it, expect } from 'vitest';
import getPageTitle from './getPageTitle';

describe('getPageTitle', () => {
	it('adds separator and suffix if page title is given', () => {
		expect(getPageTitle('test')).toBe('test | Libris');
	});
	it('returns only suffix if page title is omitted', () => {
		expect(getPageTitle()).toBe('Libris');
	});
});
