import { describe, it, expect } from 'vitest';
import getEditedParts from './getEditedParts';

describe('getEditedParts', () => {
	it('returns edited word', () => {
		expect(getEditedParts({ value: 'astrid', cursor: 6 })).toEqual({
			word: 'astrid',
			wordRange: { from: 0, to: 6 },
			phrase: null,
			phraseRange: null,
			qualifierType: null,
			qualifierValue: null
		});
		expect(getEditedParts({ value: 'astrid', cursor: 3 })).toEqual({
			word: 'astrid',
			wordRange: { from: 0, to: 6 },
			phrase: null,
			phraseRange: null,
			qualifierType: null,
			qualifierValue: null
		});
	});
	it('returns edited word and phrase if two or more words', () => {
		expect(getEditedParts({ value: 'astrid lindgren', cursor: 15 })).toEqual({
			word: 'lindgren',
			wordRange: { from: 7, to: 15 },
			phrase: 'astrid lindgren',
			phraseRange: { from: 0, to: 15 },
			qualifierType: null,
			qualifierValue: null
		});
		expect(getEditedParts({ value: 'astrid lindgren', cursor: 6 })).toEqual({
			word: 'astrid',
			wordRange: { from: 0, to: 6 },
			phrase: 'astrid lindgren',
			phraseRange: { from: 0, to: 15 },
			qualifierType: null,
			qualifierValue: null
		});
	});
	it('returns matched qualifier-like names and values', () => {
		expect(getEditedParts({ value: 'astrid lindgren hasTitle:', cursor: 25 })).toEqual({
			word: 'hasTitle:',
			wordRange: { from: 16, to: 25 },
			// should a qualifier without value be a qualifier?
			// phrase: null,
			// phraseRange: null,
			phrase: 'astrid lindgren hasTitle:',
			phraseRange: {
				from: 0,
				to: 25
			},
			qualifierType: null,
			qualifierValue: null
		});
		expect(getEditedParts({ value: 'astrid lindgren hasTitle:Pippi', cursor: 30 })).toEqual({
			word: 'hasTitle:Pippi',
			wordRange: { from: 16, to: 30 },
			phrase: null,
			phraseRange: null,
			qualifierType: 'hasTitle',
			qualifierValue: 'Pippi'
		});
	});
	it('works with quoted qualifiers', () => {
		expect(getEditedParts({ value: 'astrid lindgren "rdf:type":Text', cursor: 23 })).toEqual({
			word: '"rdf:type":Text',
			wordRange: { from: 16, to: 31 },
			phrase: null,
			phraseRange: null,
			qualifierType: '"rdf:type"',
			qualifierValue: 'Text'
		});
		expect(
			getEditedParts({ value: 'astrid lindgren "rdf:type":Text itemHeldBy:"sigel:S"', cursor: 50 })
		).toEqual({
			word: 'itemHeldBy:"sigel:S"',
			wordRange: { from: 32, to: 52 },
			phrase: null,
			phraseRange: null,
			qualifierType: 'itemHeldBy',
			qualifierValue: '"sigel:S"'
		});
		expect(
			getEditedParts({
				value: 'astrid lindgren title:"Pippi Långstrump" some more text',
				cursor: 23
			})
		).toEqual({
			word: 'title:"Pippi Långstrump"',
			wordRange: { from: 16, to: 40 },
			phrase: null,
			phraseRange: null,
			qualifierType: 'title',
			qualifierValue: '"Pippi Långstrump"'
		});
	});
	it('gets relevant part between qualfiers', () => {
		expect(
			getEditedParts({ value: 'YEAR:2002 astrid lind "rdf:type":Text lejonhjärta', cursor: 21 })
		).toEqual({
			word: 'lind',
			wordRange: { from: 17, to: 21 },
			phrase: 'astrid lind',
			phraseRange: { from: 10, to: 21 },
			qualifierType: null,
			qualifierValue: null
		});
	});
	it('trims words and phrases', () => {
		expect(getEditedParts({ value: ' astrid ', cursor: 7 })).toEqual({
			word: 'astrid',
			wordRange: { from: 1, to: 7 },
			phrase: null,
			phraseRange: null,
			qualifierType: null,
			qualifierValue: null
		});
		expect(getEditedParts({ value: ' astrid lindgren   ', cursor: 16 })).toEqual({
			word: 'lindgren',
			wordRange: { from: 8, to: 16 },
			phrase: 'astrid lindgren',
			phraseRange: { from: 1, to: 16 },
			qualifierType: null,
			qualifierValue: null
		});
	});
});
