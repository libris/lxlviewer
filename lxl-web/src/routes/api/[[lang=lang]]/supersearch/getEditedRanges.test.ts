import { describe, it, expect } from 'vitest';
import getEditedRanges from './getEditedRanges';

describe('getEditedRanges', () => {
	it('gets the edited range for a simple free-text query', () => {
		const query = 'hello';
		const editedRanges = getEditedRanges(query, 5);
		expect(editedRanges).toEqual({ from: 0, to: 5 });
		expect(query.slice(editedRanges.from, editedRanges.to)).toBe('hello');
	});

	it('gets the edited range (with included ranges of qualifier parts) when editing a qualifier', () => {
		const query = 'hasTitle:"a"';
		const editedRanges = getEditedRanges(query, 11);
		expect(editedRanges).toEqual({
			from: 0,
			to: 12,
			qualifierKey: {
				from: 0,
				to: 8
			},
			qualifierOperator: {
				from: 8,
				to: 9
			},
			qualifierValue: {
				from: 9,
				to: 12
			}
		});
		expect(query.slice(editedRanges.from, editedRanges.to)).toBe('hasTitle:"a"');
		expect(query.slice(editedRanges.qualifierKey?.from, editedRanges.qualifierKey?.to)).toBe(
			'hasTitle'
		);
		expect(
			query.slice(editedRanges.qualifierOperator?.from, editedRanges.qualifierOperator?.to)
		).toBe(':');
		expect(query.slice(editedRanges.qualifierValue?.from, editedRanges.qualifierValue?.to)).toBe(
			'"a"'
		);
	});

	it('gets the edited range when editing a string', () => {
		expect(getEditedRanges('"hello"', 6)).toEqual({
			from: 0,
			to: 7
		});
	});

	it('gets the edited range when editing a group', () => {
		expect(getEditedRanges('(hello world)', 9)).toEqual({
			from: 0,
			to: 13
		});
	});

	it('gets the edited range when editing a part after a qualifier', () => {
		expect(getEditedRanges('hasTitle:"a" hello', 18)).toEqual({
			from: 12,
			to: 18
		});
	});

	it('gets the edited range when editing a part after a qualifier', () => {
		expect(getEditedRanges('hasTitle:"a" hello', 18)).toEqual({
			from: 12,
			to: 18
		});
	});

	it('gets the edited range when editing a part before a qualifier', () => {
		expect(getEditedRanges('hello hasTitle:"a"', 5)).toEqual({
			from: 0,
			to: 6
		});
	});

	it('gets the edited range when editing a part surrounded by qualifiers', () => {
		expect(getEditedRanges('hasTitle:"a" hello hasTitle:"b', 18)).toEqual({
			from: 12,
			to: 19
		});
	});

	it('gets the edited range when editing a part after a group', () => {
		expect(getEditedRanges('(hi) hello', 7)).toEqual({
			from: 4,
			to: 10
		});
	});

	it('gets the edited range when editing a part before a group', () => {
		expect(getEditedRanges('hello (hi)', 3)).toEqual({
			from: 0,
			to: 6
		});
	});

	it('gets the edited range when editing a part surrounded by groups', () => {
		expect(getEditedRanges('(hi) hello (hej)', 7)).toEqual({
			from: 4,
			to: 11
		});
	});
});
