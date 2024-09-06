import { describe, it, expect } from 'vitest';
import getEditedParts from './getEditedParts';

describe('getEditedParts', () => {
	it('returns edited word', () => {
		expect(getEditedParts({ value: 'astrid', cursor: 6 })).toEqual({
			word: 'astrid',
			wordRange: { from: 0, to: 6 },
			phrase: null,
			phraseRange: null,
			qualifierLikeName: null,
			qualifierLikeValue: null
		});
		expect(getEditedParts({ value: 'astrid', cursor: 3 })).toEqual({
			word: 'astrid',
			wordRange: { from: 0, to: 6 },
			phrase: null,
			phraseRange: null,
			qualifierLikeName: null,
			qualifierLikeValue: null
		});
	});
	it('returns edited word and phrase if two or more words', () => {
		expect(getEditedParts({ value: 'astrid lindgren', cursor: 15 })).toEqual({
			word: 'lindgren',
			wordRange: { from: 7, to: 15 },
			phrase: 'astrid lindgren',
			phraseRange: { from: 0, to: 15 },
			qualifierLikeName: null,
			qualifierLikeValue: null
		});
		expect(getEditedParts({ value: 'astrid lindgren', cursor: 6 })).toEqual({
			word: 'astrid',
			wordRange: { from: 0, to: 6 },
			phrase: 'astrid lindgren',
			phraseRange: { from: 0, to: 15 },
			qualifierLikeName: null,
			qualifierLikeValue: null
		});
	});
	it('returns matched qualifier-like names and values', () => {
		expect(getEditedParts({ value: 'astrid lindgren hasTitle:', cursor: 25 })).toEqual({
			word: 'hasTitle:',
			wordRange: { from: 16, to: 25 },
			phrase: null,
			phraseRange: null,
			qualifierLikeName: 'hasTitle',
			qualifierLikeValue: null
		});
		expect(getEditedParts({ value: 'astrid lindgren hasTitle:Pippi', cursor: 30 })).toEqual({
			word: 'hasTitle:Pippi',
			wordRange: { from: 16, to: 30 },
			phrase: null,
			phraseRange: null,
			qualifierLikeName: 'hasTitle',
			qualifierLikeValue: 'Pippi'
		});
	});
	it('works with quoted qualifiers', () => {
		expect(getEditedParts({ value: 'astrid lindgren "rdf:type":Text', cursor: 23 })).toEqual({
			word: '"rdf:type":Text',
			wordRange: { from: 16, to: 31 },
			phrase: null,
			phraseRange: null,
			qualifierLikeName: '"rdf:type"',
			qualifierLikeValue: 'Text'
		});
		expect(
			getEditedParts({ value: 'astrid lindgren "rdf:type":Text itemHeldBy:"sigel:S"', cursor: 50 })
		).toEqual({
			word: 'itemHeldBy:"sigel:S"',
			wordRange: { from: 32, to: 52 },
			phrase: null,
			phraseRange: null,
			qualifierLikeName: 'itemHeldBy',
			qualifierLikeValue: '"sigel:S"'
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
			qualifierLikeName: null,
			qualifierLikeValue: null
		});
	});
});
