import { describe, it, expect } from 'vitest';
import addSuggestParens from './addSuggestParens';

describe('addSuggestParens', () => {
	it('insert quotes when qualifierValue is an empty group', () => {
		const { _q } = addSuggestParens('hello title:()', 13);
		expect(_q).toEqual('hello title:""');
	});

	it('applies _mappingOnly when qualifierValue is an empty group', () => {
		const { _mappingOnly } = addSuggestParens('hello title:()', 13);
		expect(_mappingOnly).toEqual('true');
	});

	it('applies _mappingOnly when qualifierValue is an empty string', () => {
		const { _mappingOnly } = addSuggestParens('hello title:""', 13);
		expect(_mappingOnly).toEqual('true');
	});

	it('does not alter a qualifierValue with text', () => {
		const { _q } = addSuggestParens('hello title:"hello"', 13);
		expect(_q).toEqual('hello title:"hello"');
	});

	it('applies _suggest for a qualifierValue with text', () => {
		const { _suggest } = addSuggestParens('hello title:(hello)', 13);
		expect(_suggest).toEqual('true');
	});

	it('it does not alter q when cursor is in another range', () => {
		const { _q } = addSuggestParens('hello title:""', 1);
		expect(_q).toEqual('hello title:""');
	});

	it('it does not alter cursor when cursor is in another range', () => {
		const { cursor } = addSuggestParens('hello title:""', 1);
		expect(cursor).toEqual(1);
	});
});
