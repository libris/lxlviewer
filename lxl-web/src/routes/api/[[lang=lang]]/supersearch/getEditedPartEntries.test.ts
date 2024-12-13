import { describe, it, expect } from 'vitest';
import getEditedPartEntries from './getEditedPartEntries';

describe('getEditedPartEntries', () => {
	it('narrows down search query when editing qualifier parts', () => {
		expect(getEditedPartEntries('hello title:"hej"', 16)).toEqual([['_q', 'title:"hej"']]);
	});
	it('keeps query as is when editing year qualifiers', () => {
		expect(getEditedPartEntries('hello ÅR:2024', 13)).toEqual([]);
	});
	it('narrows down search query by base class for query codes', () => {
		expect(getEditedPartEntries('astrid lindgren subject:"winter"', 27)).toEqual([
			['_q', `"rdf:type":Topic "winter"`],
			['min-reverseLinks.totalItems', '1']
		]);
	});
	it('otherwise keeps query as is', () => {
		expect(getEditedPartEntries('hello', 5)).toEqual([]);
	});
});
