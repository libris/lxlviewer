import { describe, it, expect } from 'vitest';
import { displayMappingToString } from './displayMappingToString';
import type { DisplayMapping } from '$lib/types/search';

describe('displayMappingToString', () => {
	it('returns a readable text string from a DisplayMapping object', () => {
		expect(displayMappingToString(mapping)).toBe('Typ: Stillbild Format: Elektronisk');
	});

	it('handles filter aliases correctly (no key)', () => {
		expect(displayMappingToString(mappingFilterAlias)).toBe('Suecia');
	});

	it('does not show label for free text query', () => {
		expect(displayMappingToString(mappingOnlyFreeText)).toBe('hej hej');
	});

	it('does not output anything for a wildcard query', () => {
		expect(displayMappingToString(wildCardMapping)).toBe('');
	});
});

const mapping: DisplayMapping[] = [
	{
		children: [
			{
				'@id': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
				display: {
					'@id': 'https://id.kb.se/vocab/StillImage',
					'@type': 'Class',
					_display: [
						{
							label: 'Stillbild',
							_label: 'benämning'
						}
					],
					_label: 'Klass'
				},
				displayStr: 'Stillbild',
				label: 'Typ',
				operator: 'equals',
				_key: '"rdf:type"',
				_value: 'StillImage'
			},
			{
				'@id': 'https://id.kb.se/vocab/hasInstanceType',
				display: {
					'@id': 'https://id.kb.se/vocab/Electronic',
					'@type': 'Class',
					_display: [
						{
							label: 'Elektronisk',
							_label: 'benämning'
						}
					],
					_label: 'Klass'
				},
				displayStr: 'Elektronisk',
				label: 'Format',
				operator: 'equals',
				_key: 'hasInstanceType',
				_value: 'Electronic'
			}
		],
		operator: 'and',
		variable: '_r'
	}
];

const mappingFilterAlias: DisplayMapping[] = [
	{
		display: {
			'@type': 'Resource',
			_display: [
				{
					prefLabel: 'Suecia',
					_label: 'föredragen benämning'
				}
			],
			_label: 'Resurs'
		},
		displayStr: 'Suecia',
		label: '',
		operator: 'none',
		up: {
			'@id': '/find?_q=*&_r=*'
		},
		variable: '_r',
		_value: '_suecia'
	}
];

const mappingOnlyFreeText: DisplayMapping[] = [
	{
		'@id': 'https://id.kb.se/vocab/textQuery',
		display: 'hej hej',
		displayStr: 'hej hej',
		label: 'Fritextsökning',
		operator: 'equals',
		up: { '@id': '/find?_q=*' },
		variable: '_q',
		_key: undefined,
		_value: undefined
	}
];

const wildCardMapping: DisplayMapping[] = [
	{
		children: [],
		operator: 'none',
		variable: '_q'
	},
	{
		children: [],
		operator: 'none',
		variable: '_r'
	},
	{
		children: [
			{
				'@id': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
				display: {
					'@id': 'Work',
					'@type': 'Class',
					_display: [
						{
							label: 'Verk',
							_label: 'benämning'
						}
					],
					_label: 'Klass'
				},
				displayStr: 'Verk',
				label: 'Typ',
				operator: 'equals',
				up: {
					'@id':
						'/find?_q=*&_r=*&defaultSiteFilters=excludeEplikt+excludePreliminary+NOT+inCollection:%22https://id.kb.se/term/uniformWorkTitle%22+NOT+inDataset:%22https://id.kb.se/dataset/swepub%22'
				},
				_key: '"rdf:type"',
				_value: 'Work'
			},
			{
				display: {
					'@type': 'Resource',
					_display: [
						{
							prefLabel: 'Exkludera elektroniska pliktleveranser',
							_label: 'föredragen benämning'
						}
					],
					_label: 'Resurs'
				},
				displayStr: 'Exkludera elektroniska pliktleveranser',
				label: '',
				operator: 'none',
				up: {
					'@id':
						'/find?_q=*&_r=*&defaultSiteFilters=%22rdf:type%22:Work+excludePreliminary+NOT+inCollection:%22https://id.kb.se/term/uniformWorkTitle%22+NOT+inDataset:%22https://id.kb.se/dataset/swepub%22'
				},
				_value: 'excludeEplikt'
			},
			{
				display: {
					'@type': 'Resource',
					_display: [
						{
							prefLabel: 'Exkludera kommande publiceringar',
							_label: 'föredragen benämning'
						}
					],
					_label: 'Resurs'
				},
				displayStr: 'Exkludera kommande publiceringar',
				label: '',
				operator: 'none',
				up: {
					'@id':
						'/find?_q=*&_r=*&defaultSiteFilters=%22rdf:type%22:Work+excludeEplikt+NOT+inCollection:%22https://id.kb.se/term/uniformWorkTitle%22+NOT+inDataset:%22https://id.kb.se/dataset/swepub%22'
				},
				_value: 'excludePreliminary'
			},
			{
				children: [
					{
						'@id': 'https://id.kb.se/vocab/inCollection',
						display: {
							'@id': 'https://id.kb.se/term/uniformWorkTitle',
							'@type': 'TermCollection',
							_display: [
								{
									title: 'Uniform titel',
									_label: 'titel'
								}
							],
							_label: 'Termsamling'
						},
						displayStr: 'Uniform titel',
						label: 'Del av termsamling',
						operator: 'equals',
						up: {
							'@id':
								'/find?_q=*&_r=*&defaultSiteFilters=%22rdf:type%22:Work+excludeEplikt+excludePreliminary+NOT+inDataset:%22https://id.kb.se/dataset/swepub%22'
						},
						_key: 'inCollection',
						_value: '"https://id.kb.se/term/uniformWorkTitle"'
					}
				],
				operator: 'not',
				up: {
					'@id':
						'/find?_q=*&_r=*&defaultSiteFilters=%22rdf:type%22:Work+excludeEplikt+excludePreliminary+NOT+inDataset:%22https://id.kb.se/dataset/swepub%22'
				}
			},
			{
				children: [
					{
						'@id': 'https://id.kb.se/vocab/inDataset',
						display: {
							'@id': 'https://id.kb.se/dataset/swepub',
							label: 'https://id.kb.se/dataset/swepub',
							_label: 'benämning'
						},
						displayStr: 'https://id.kb.se/dataset/swepub',
						label: 'Ingår i dataset',
						operator: 'equals',
						up: {
							'@id':
								'/find?_q=*&_r=*&defaultSiteFilters=%22rdf:type%22:Work+excludeEplikt+excludePreliminary+NOT+inCollection:%22https://id.kb.se/term/uniformWorkTitle%22'
						},
						_key: 'inDataset',
						_value: '"https://id.kb.se/dataset/swepub"'
					}
				],
				operator: 'not',
				up: {
					'@id':
						'/find?_q=*&_r=*&defaultSiteFilters=%22rdf:type%22:Work+excludeEplikt+excludePreliminary+NOT+inCollection:%22https://id.kb.se/term/uniformWorkTitle%22'
				}
			}
		],
		operator: 'and',
		up: {
			'@id': '/find?_q=*&_r=*&defaultSiteFilters='
		},
		variable: 'defaultSiteFilters'
	}
];
