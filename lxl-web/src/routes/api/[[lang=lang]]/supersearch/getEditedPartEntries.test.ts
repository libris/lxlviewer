import { describe, it, expect } from 'vitest';
import getEditedPartEntries from './getEditedPartEntries';

describe('getEditedPartEntries', () => {
	it('narrows down search query when editing qualifier parts', () => {
		expect(getEditedPartEntries('hello title:"hej"', 16)).toEqual([['_q', 'title:"hej"']]);
	});
	it('narrows down search query by base class for query codes', () => {
		expect(getEditedPartEntries('astrid lindgren subject:"winter"', 27)).toEqual([
			['_q', `"winter" "rdf:type":(Agent OR Subject)`],
			['min-reverseLinks.totalItems', '1']
		]);
	});
	it('it does not narrow down skipped qualifiers (year)', () => {
		expect(getEditedPartEntries('hello ÅR:2024', 13)).toEqual([
			['_q', 'hello ÅR:2024 "rdf:type":(Agent OR Concept OR Language OR Work)']
		]);
	});
	it('append nothing if query has specified type', () => {
		expect(getEditedPartEntries('hello "rdf:type":genreForm', 5)).toEqual([]);
	});
	it('applies base types in other cases', () => {
		expect(getEditedPartEntries('hello', 5)).toEqual([
			['_q', 'hello "rdf:type":(Agent OR Concept OR Language OR Work)']
		]);
	});
});
