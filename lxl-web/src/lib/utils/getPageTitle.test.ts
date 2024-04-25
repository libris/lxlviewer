import { describe, it, expect } from 'vitest';
import getPageTitle from './getPageTitle';
import { TITLE_SEPARATOR, TITLE_SUFFIX, TITLE_MAX_LENGTH } from '$lib/constants/pageTitle';

describe('getPageTitle', () => {
	it('adds separator and suffix if page title is given', () => {
		expect(getPageTitle('test')).toBe('test' + TITLE_SEPARATOR + TITLE_SUFFIX);
	});
	it('returns only suffix if page title is omitted', () => {
		expect(getPageTitle()).toBe(TITLE_SUFFIX);
	});
	it('it truncates the title and adds an ellipsis if the total length is greater than the max length', () => {
		const testString = 'a'.repeat(TITLE_MAX_LENGTH);
		const truncatedTestString = testString.substring(
			0,
			testString.length - TITLE_SEPARATOR.length - TITLE_SUFFIX.length - 1
		);
		expect(getPageTitle(testString)).toBe(
			truncatedTestString + '…' + TITLE_SEPARATOR + TITLE_SUFFIX
		);
		expect(getPageTitle(testString).length).toBe(TITLE_MAX_LENGTH);
	});
	it('it keeps the title as-is if the total length is equal to the max length', () => {
		const testString = 'a'.repeat(TITLE_MAX_LENGTH - TITLE_SEPARATOR.length - TITLE_SUFFIX.length);
		expect(getPageTitle(testString)).toBe(testString + TITLE_SEPARATOR + TITLE_SUFFIX);
		expect(getPageTitle(testString).length).toBe(TITLE_MAX_LENGTH);
	});
});
