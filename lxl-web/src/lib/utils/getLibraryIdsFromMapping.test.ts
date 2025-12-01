import { describe, it, expect } from 'vitest';
import type { DisplayMapping } from '$lib/types/search';
import { getLibraryIdsFromMapping } from './getLibraryIdsFromMapping';

describe('getSigelsFromMapping', () => {
	it('it returns an array of sigels included in mapping', () => {
		expect(getLibraryIdsFromMapping([mappingOneLib])).toStrictEqual(['Alve']);
	});

	it('it returns an array of sigels included in mapping 2', () => {
		expect(getLibraryIdsFromMapping([mappingTwoLibs])).toStrictEqual(['Boln', 'Hagf']);
	});

	it('does not include explicitly excluded libraries', () => {
		expect(getLibraryIdsFromMapping([mappingExcludedLib])).toStrictEqual(['Boln']);
	});

	it('it returns an empty array if none found', () => {
		expect(getLibraryIdsFromMapping([mappingNoLibs])).toStrictEqual([]);
	});

	it('returns an empty array if passed a random thing', () => {
		expect(getLibraryIdsFromMapping('hello')).toStrictEqual([]);
	});
});

const mappingOneLib: DisplayMapping[] = [
	{
		children: [
			{
				'@id': 'https://id.kb.se/vocab/itemHeldBy',
				display: {
					'@id': 'https://libris.kb.se/library/Alve',
					'@type': 'Library',
					_display: [
						{
							name: 'Alvesta bibliotek',
							_label: 'namn'
						},
						{
							_contentBefore: ' · ',
							sigel: 'Alve',
							_label: 'sigel'
						}
					],
					_style: ['link'],
					_label: 'Bibliotek'
				},
				displayStr: 'Alvesta bibliotek · Alve',
				label: 'Bibliotek',
				operator: 'equals',
				up: {
					'@id': '/find?_q=hej'
				},
				_key: 'itemHeldBy',
				_value: '"sigel:Alve"'
			},
			{
				'@id': 'https://id.kb.se/vocab/textQuery',
				display: 'hej',
				displayStr: 'hej',
				label: 'Fritextsökning',
				operator: 'equals',
				up: {
					'@id': '/find?_q=itemHeldBy:%22sigel:Alve%22'
				}
			}
		],
		operator: 'and',
		up: {
			'@id': '/find?_q=*'
		},
		variable: '_q'
	}
];

const mappingTwoLibs: DisplayMapping[] = [
	{
		children: [
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
					'@id': '/find?_q=itemHeldBy:%22sigel:Boln%22+OR+itemHeldBy:%22sigel:Hagf%22'
				},
				_key: 'språk',
				_value: '"lang:swe"'
			},
			{
				children: [
					{
						'@id': 'https://id.kb.se/vocab/itemHeldBy',
						display: {
							'@id': 'https://libris.kb.se/library/Boln',
							'@type': 'Library',
							_display: [
								{
									name: 'Bollnäs bibliotek',
									_label: 'namn'
								},
								{
									_contentBefore: ' · ',
									sigel: 'Boln',
									_label: 'sigel'
								}
							],
							_style: ['link'],
							_label: 'Bibliotek'
						},
						displayStr: 'Bollnäs bibliotek · Boln',
						label: 'Bibliotek',
						operator: 'equals',
						up: {
							'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+itemHeldBy:%22sigel:Hagf%22'
						},
						_key: 'itemHeldBy',
						_value: '"sigel:Boln"'
					},
					{
						'@id': 'https://id.kb.se/vocab/itemHeldBy',
						display: {
							'@id': 'https://libris.kb.se/library/Hagf',
							'@type': 'Library',
							_display: [
								{
									name: 'Hagfors bibliotek',
									_label: 'namn'
								},
								{
									_contentBefore: ' · ',
									sigel: 'Hagf',
									_label: 'sigel'
								}
							],
							_style: ['link'],
							_label: 'Bibliotek'
						},
						displayStr: 'Hagfors bibliotek · Hagf',
						label: 'Bibliotek',
						operator: 'equals',
						up: {
							'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+itemHeldBy:%22sigel:Boln%22'
						},
						_key: 'itemHeldBy',
						_value: '"sigel:Hagf"'
					}
				],
				operator: 'or',
				up: {
					'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22'
				}
			}
		],
		operator: 'and',
		up: {
			'@id': '/find?_q=*'
		},
		variable: '_q'
	}
];

const mappingExcludedLib: DisplayMapping[] = [
	{
		children: [
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
					'@id': '/find?_q=itemHeldBy:%22sigel:Boln%22+NOT+itemHeldBy:%22sigel:Hagf%22'
				},
				_key: 'språk',
				_value: '"lang:swe"'
			},
			{
				'@id': 'https://id.kb.se/vocab/itemHeldBy',
				display: {
					'@id': 'https://libris.kb.se/library/Boln',
					'@type': 'Library',
					_display: [
						{
							name: 'Bollnäs bibliotek',
							_label: 'namn'
						},
						{
							_contentBefore: ' · ',
							sigel: 'Boln',
							_label: 'sigel'
						}
					],
					_style: ['link'],
					_label: 'Bibliotek'
				},
				displayStr: 'Bollnäs bibliotek · Boln',
				label: 'Bibliotek',
				operator: 'equals',
				up: {
					'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+NOT+itemHeldBy:%22sigel:Hagf%22'
				},
				_key: 'itemHeldBy',
				_value: '"sigel:Boln"'
			},
			{
				children: [
					{
						'@id': 'https://id.kb.se/vocab/itemHeldBy',
						display: {
							'@id': 'https://libris.kb.se/library/Hagf',
							'@type': 'Library',
							_display: [
								{
									name: 'Hagfors bibliotek',
									_label: 'namn'
								},
								{
									_contentBefore: ' · ',
									sigel: 'Hagf',
									_label: 'sigel'
								}
							],
							_style: ['link'],
							_label: 'Bibliotek'
						},
						displayStr: 'Hagfors bibliotek · Hagf',
						label: 'Bibliotek',
						operator: 'equals',
						up: {
							'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+itemHeldBy:%22sigel:Boln%22'
						},
						_key: 'itemHeldBy',
						_value: '"sigel:Hagf"'
					}
				],
				operator: 'not',
				up: {
					'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+itemHeldBy:%22sigel:Boln%22'
				}
			}
		],
		operator: 'and',
		up: {
			'@id': '/find?_q=*'
		},
		variable: '_q'
	}
];

const mappingNoLibs: DisplayMapping[] = [
	{
		children: [
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
					'@id': '/find?_q=NOT+itemHeldBy:%22sigel:Hagf%22+hasInstanceType:DigitalResource+hagfors'
				},
				_key: 'språk',
				_value: '"lang:swe"'
			},
			{
				children: [
					{
						'@id': 'https://id.kb.se/vocab/itemHeldBy',
						display: {
							'@id': 'https://libris.kb.se/library/Hagf',
							'@type': 'Library',
							_display: [
								{
									name: 'Hagfors bibliotek',
									_label: 'namn'
								},
								{
									_contentBefore: ' · ',
									sigel: 'Hagf',
									_label: 'sigel'
								}
							],
							_style: ['link'],
							_label: 'Bibliotek'
						},
						displayStr: 'Hagfors bibliotek · Hagf',
						label: 'Bibliotek',
						operator: 'equals',
						up: {
							'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+hasInstanceType:DigitalResource+hagfors'
						},
						_key: 'itemHeldBy',
						_value: '"sigel:Hagf"'
					}
				],
				operator: 'not',
				up: {
					'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+hasInstanceType:DigitalResource+hagfors'
				}
			},
			{
				'@id': 'https://id.kb.se/vocab/hasInstanceType',
				display: {
					'@id': 'https://id.kb.se/vocab/DigitalResource',
					'@type': 'Class',
					_display: [
						{
							label: 'Digital resurs',
							_label: 'benämning'
						}
					],
					_label: 'Klass'
				},
				displayStr: 'Digital resurs',
				label: 'Format',
				operator: 'equals',
				up: {
					'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+NOT+itemHeldBy:%22sigel:Hagf%22+hagfors'
				},
				_key: 'hasInstanceType',
				_value: 'DigitalResource'
			},
			{
				'@id': 'https://id.kb.se/vocab/textQuery',
				display: 'hagfors',
				displayStr: 'hagfors',
				label: 'Fritextsökning',
				operator: 'equals',
				up: {
					'@id':
						'/find?_q=spr%C3%A5k:%22lang:swe%22+NOT+itemHeldBy:%22sigel:Hagf%22+hasInstanceType:DigitalResource'
				}
			}
		],
		operator: 'and',
		up: {
			'@id': '/find?_q=*'
		},
		variable: '_q'
	}
];
