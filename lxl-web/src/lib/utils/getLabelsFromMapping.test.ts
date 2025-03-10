import { describe, it, expect } from 'vitest';
import getLabelsFromMapping from './getLabelsFromMapping.svelte';
import type { DisplayMapping } from '$lib/types/search';

describe('getLabelsFromMapping', () => {
	it('it returns labels when supplied with page mappings', () => {
		const labels = getLabelsFromMapping('genreForm', 'saogf:Romaner', pageMapping, undefined);
		expect(labels.keyLabel).toBe('Genre/form');
		expect(labels.valueLabel).toBe('Romaner');
	});

	it('it returns labels when supplied with suggest mappings', () => {
		const labels = getLabelsFromMapping('genreForm', 'saogf:Romaner', undefined, suggestMapping);
		expect(labels.keyLabel).toBe('Genre/form');
		expect(labels.valueLabel).toBe('Romaner');
	});

	it('it returns suggest labels when supplied with both mappings', () => {
		const labels = getLabelsFromMapping('SPRÅK', 'lang:swe', pageMapping, suggestMapping);
		expect(labels.keyLabel).toBe('Språk');
		expect(labels.valueLabel).toBe('Svenska');
	});

	it('it returns undefined values when no correct key match', () => {
		const labels = getLabelsFromMapping('invalid', 'saogf:Romaner', pageMapping, suggestMapping);
		expect(labels.keyLabel).toBe(undefined);
		expect(labels.valueLabel).toBe(undefined);
	});

	it('it returns no value label when value does not match', () => {
		const labels = getLabelsFromMapping('genreForm', 'saogf:SomeInvalidTerm', pageMapping);
		expect(labels.keyLabel).toBe('Genre/form');
		expect(labels.valueLabel).toBe(undefined);
	});

	it('does not return value labels for unlinked items', () => {
		const labels = getLabelsFromMapping('ÅR', '2023', pageMapping, suggestMapping);
		expect(labels.keyLabel).toBe('Utgivningsår');
		expect(labels.valueLabel).toBe(undefined);
	});
});

// sommar genreForm:"saogf:Romaner" ÅR:2023
const pageMapping: DisplayMapping[] = [
	{
		children: [
			{
				'@id': 'https://id.kb.se/vocab/textQuery',
				display: 'sommar',
				displayStr: 'sommar',
				label: 'Fritextsökning',
				operator: 'equals',
				up: {
					'@id': '/find?_i=&_q=genreForm:%22saogf:Romaner%22&_limit=20&_spell=true'
				}
			},
			{
				'@id': 'https://id.kb.se/vocab/genreForm',
				display: {
					'@id': 'https://id.kb.se/term/saogf/Romaner',
					'@type': 'GenreForm',
					_display: [
						{
							prefLabel: 'Romaner',
							_label: 'föredragen benämning'
						}
					],
					_style: ['link', 'pill'],
					_label: 'Genre/form'
				},
				displayStr: 'Romaner',
				label: 'Genre/form',
				operator: 'equals',
				up: {
					'@id': '/find?_i=sommar&_q=sommar+%C3%85R:2023&_limit=20&_spell=true'
				},
				_key: 'genreForm',
				_value: 'saogf:Romaner'
			}
		],
		operator: 'and',
		up: {
			'@id': '/find?_i=&_q=*&_limit=20&_spell=true'
		}
	}
];

// sommar genreForm:"saogf:Romaner" ÅR:2023 SPRÅK:"lang:swe"
const suggestMapping: DisplayMapping[] = [
	{
		children: [
			{
				'@id': 'https://id.kb.se/vocab/textQuery',
				display: 'sommar',
				displayStr: 'sommar',
				label: 'Fritextsökning',
				operator: 'equals',
				up: {
					'@id':
						'/find?_i=&_q=genreForm:%22saogf:Romaner%22+%C3%85R:2023+SPR%C3%85K:%22lang:swe%22&_limit=0'
				}
			},
			{
				'@id': 'https://id.kb.se/vocab/genreForm',
				display: {
					'@id': 'https://id.kb.se/term/saogf/Romaner',
					'@type': 'GenreForm',
					_display: [
						{
							prefLabel: 'Romaner',
							_label: 'föredragen benämning'
						}
					],
					_style: ['link', 'pill'],
					_label: 'Genre/form'
				},
				displayStr: 'Romaner',
				label: 'Genre/form',
				operator: 'equals',
				up: {
					'@id': '/find?_i=sommar&_q=sommar+%C3%85R:2023+SPR%C3%85K:%22lang:swe%22&_limit=0'
				},
				_key: 'genreForm',
				_value: 'saogf:Romaner'
			},
			{
				'@id': 'https://id.kb.se/vocab/yearPublished',
				display: '2023',
				displayStr: '2023',
				label: 'Utgivningsår',
				operator: 'equals',
				up: {
					'@id':
						'/find?_i=sommar&_q=sommar+genreForm:%22saogf:Romaner%22+SPR%C3%85K:%22lang:swe%22&_limit=0'
				},
				_key: 'ÅR',
				_value: '2023'
			},
			{
				'@id': 'https://id.kb.se/vocab/language',
				display: {
					'@id': 'https://id.kb.se/language/swe',
					'@type': 'Language',
					_display: [
						{
							prefLabel: 'Svenska',
							_label: 'föredragen benämning'
						}
					],
					_label: 'Språk'
				},
				displayStr: 'Svenska',
				label: 'Språk',
				operator: 'equals',
				up: {
					'@id': '/find?_i=sommar&_q=sommar+genreForm:%22saogf:Romaner%22+%C3%85R:2023&_limit=0'
				},
				_key: 'SPRÅK',
				_value: 'lang:swe'
			}
		],
		operator: 'and',
		up: {
			'@id': '/find?_i=&_q=*&_limit=0'
		}
	}
];
