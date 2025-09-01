import { describe, it, expect } from 'vitest';
import insertWildcard from './insertWildcard';

describe('insertWildcard', () => {
	it('inserts a wildcard when qualifierValue is an empty string', () => {
		const { query } = insertWildcard('hello title:""', 13);
		expect(query).toEqual('hello title:"*"');
	});

	it('inserts a wildcard when qualifierValue is an empty group', () => {
		const { query } = insertWildcard('hello title:()', 13);
		expect(query).toEqual('hello title:(*)');
	});

	it('adds + 1 to cursor when inserting the wildcard', () => {
		const { cursor } = insertWildcard('hello title:""', 13);
		expect(cursor).toEqual(14);
	});

	it('does not alter a qualifierValue with text', () => {
		const { query } = insertWildcard('hello title:"hello"', 13);
		expect(query).toEqual('hello title:"hello"');
	});

	it('it does not alter q when cursor is in another range', () => {
		const { query } = insertWildcard('hello title:""', 1);
		expect(query).toEqual('hello title:""');
	});

	it('it does not alter cursor when cursor is in another range', () => {
		const { cursor } = insertWildcard('hello title:""', 1);
		expect(cursor).toEqual(1);
	});
});
