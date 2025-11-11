import { describe, it, expect } from 'vitest';
import { displayMappingToString } from './displayMappingToString';
import type { DisplayMapping } from '$lib/types/search';

describe('displayMappingToString', () => {
	it('returns a readable text string from a DisplayMapping object', () => {
		expect(displayMappingToString(mapping)).toBe('Typ: Stillbild, Format: Elektronisk');
	});

	it('handles filter aliases correctly (no key)', () => {
		expect(displayMappingToString(mappingFilterAlias)).toBe('Suecia');
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
