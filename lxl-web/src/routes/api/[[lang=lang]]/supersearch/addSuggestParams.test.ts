import { describe, it, expect } from 'vitest';
import addSuggestParams from './addSuggestParams';

describe('addSuggestParams', () => {
	it('insert quotes when qualifierValue is an empty group', () => {
		const { _q } = addSuggestParams('hello title:()', 13);
		expect(_q).toEqual('hello title:""');
	});

	it('applies _mappingOnly when qualifierValue is an empty group', () => {
		const { _mappingOnly } = addSuggestParams('hello title:()', 13);
		expect(_mappingOnly).toEqual('true');
	});

	it('applies _mappingOnly when qualifierValue is an empty string', () => {
		const { _mappingOnly } = addSuggestParams('hello title:""', 13);
		expect(_mappingOnly).toEqual('true');
	});

	it('does not alter a qualifierValue with text', () => {
		const { _q } = addSuggestParams('hello title:"hello"', 13);
		expect(_q).toEqual('hello title:"hello"');
	});

	it('applies _suggest for a qualifierValue with text', () => {
		const { _suggest } = addSuggestParams('hello title:(hello)', 13);
		expect(_suggest).toEqual('true');
	});

	it('it does not alter q when cursor is in another range', () => {
		const { _q } = addSuggestParams('hello title:""', 1);
		expect(_q).toEqual('hello title:""');
	});

	it('it does not alter cursor when cursor is in another range', () => {
		const { cursor } = addSuggestParams('hello title:""', 1);
		expect(cursor).toEqual(1);
	});
});
