import { describe, it, expect } from 'vitest';
import itemAsQualifiers from './itemAsQualifiers';
import type { VocabUtil } from '$lib/utils/xl';

describe('itemAsQualifiers', () => {
	it('produces a subject qualifier from ämne:vinter', () => {
		const _q = 'ämne:vinter';
		const item = { '@type': 'Topic', '@id': 'https://id.kb.se/term/barn/Vintern' };
		const vocabUtil = {
			getLabelByLang: () => 'test label',
			getBaseClasses: () => ['Topic', 'Subject', 'Concept', 'Identity', 'Resource']
		} as unknown as VocabUtil;
		const editedRanges = {
			from: 0,
			to: 11,
			qualifierKey: { from: 0, to: 4 },
			qualifierOperator: { from: 4, to: 5 },
			qualifierValue: { from: 5, to: 11 }
		};

		const qualifiers = itemAsQualifiers(item, editedRanges, _q, 'sv', vocabUtil);
		const result = [
			{
				_q: ' subject:"barn:Vintern" ',
				cursor: 23,
				label: 'test label'
			}
		];
		expect(qualifiers).toEqual(result);
	});

	it('correctly inserts the qualifier in the middle of _q', () => {
		const _q = 'hej ämne:vinter hej';
		const item = { '@type': 'Topic', '@id': 'https://id.kb.se/term/barn/Vintern' };
		const vocabUtil = {
			getLabelByLang: () => 'test label',
			getBaseClasses: () => ['Topic', 'Subject', 'Concept', 'Identity', 'Resource']
		} as unknown as VocabUtil;
		const editedRanges = {
			from: 4,
			to: 15,
			qualifierKey: { from: 4, to: 8 },
			qualifierOperator: { from: 8, to: 9 },
			qualifierValue: { from: 9, to: 15 }
		};

		const qualifiers = itemAsQualifiers(item, editedRanges, _q, 'sv', vocabUtil);
		const result = [
			{
				_q: 'hej subject:"barn:Vintern" hej',
				cursor: 26,
				label: 'test label'
			}
		];
		expect(qualifiers).toEqual(result);
	});

	it('returns all qualifiers in its range when not editing a qualifier', () => {
		const _q = 'Astrid';
		const item = { '@type': 'Person', '@id': 'https://libris-qa.kb.se/fcrtpljz1qp2bdv' };
		const vocabUtil = {
			getLabelByLang: () => 'test label',
			getBaseClasses: () => ['Person', 'Agent']
		} as unknown as VocabUtil;
		const editedRanges = { from: 0, to: 6 };

		const qualifiers = itemAsQualifiers(item, editedRanges, _q, 'sv', vocabUtil);
		const result = [
			{
				_q: ' contributor:"libris:fcrtpljz1qp2bdv" ',
				cursor: 37,
				label: 'test label'
			},
			{
				_q: ' subject:"libris:fcrtpljz1qp2bdv" ',
				cursor: 33,
				label: 'test label'
			}
		];
		expect(qualifiers).toEqual(result);
	});
});
