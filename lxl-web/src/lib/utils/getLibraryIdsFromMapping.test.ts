import { describe, it, expect } from 'vitest';
import type { DisplayMapping } from '$lib/types/search';
import { getLibraryIdsFromMapping } from './getLibraryIdsFromMapping';

describe('getLibraryIdsFromMapping', () => {
	it('it returns an object of sigels and labels included in mapping', () => {
		expect(getLibraryIdsFromMapping([mappingOneLib])).toStrictEqual({
			'https://libris.kb.se/library/Alve': 'Alvesta bibliotek'
		});
	});

	it('it returns an object of sigels and labels included in mapping 2', () => {
		expect(getLibraryIdsFromMapping([mappingTwoLibs])).toStrictEqual({
			'https://libris.kb.se/library/Boln': 'Bollnäs bibliotek',
			'https://libris.kb.se/library/Hagf': 'Hagfors bibliotek'
		});
	});

	it('does not include explicitly excluded libraries', () => {
		expect(getLibraryIdsFromMapping([mappingExcludedLib])).toStrictEqual({
			'https://libris.kb.se/library/Boln': 'Bollnäs bibliotek'
		});
	});

	it('it returns null if none gound', () => {
		expect(getLibraryIdsFromMapping([mappingNoLibs])).toStrictEqual(null);
	});

	it('returns null if passed a random thing', () => {
		// @ts-expect-error - intentionally passing the wrong thing
		expect(getLibraryIdsFromMapping('hello')).toStrictEqual(null);
	});
});

// library:"sigel:Alve" hej
const mappingOneLib: DisplayMapping[] = [
	{
		children: [
			{
				'@id': 'https://id.kb.se/ns/librissearch/library',
				display: {
					'@id': 'https://libris.kb.se/library/Alve',
					'@type': 'Library',
					_display: [
						{
							name: 'Alvesta bibliotek',
							_label: 'namn'
						}
					],
					_style: ['link', 'block'],
					_label: 'Bibliotek'
				},
				displayStr: 'Alvesta bibliotek',
				label: 'Bibliotek',
				operator: 'equals',
				up: {
					'@id': '/find?_q=hej'
				},
				_key: 'library',
				_value: '"sigel:Alve"',
				isRedundantKeyLabel: true
			},
			{
				'@id': 'https://id.kb.se/vocab/textQuery',
				display: 'hej',
				displayStr: 'hej',
				label: 'Fritextsökning',
				operator: 'equals',
				up: {
					'@id': '/find?_q=library:%22sigel:Alve%22'
				}
			}
		],
		operator: 'and',
		up: {
			'@id': '/find?_q='
		},
		variable: '_q'
	}
];

// språk:"lang:swe" library:"sigel:Boln" library:"sigel:Hagf"
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
					'@id': '/find?_q=library:%22sigel:Boln%22+library:%22sigel:Hagf%22'
				},
				_key: 'språk',
				_value: '"lang:swe"',
				isRedundantKeyLabel: true
			},
			{
				'@id': 'https://id.kb.se/ns/librissearch/library',
				display: {
					'@id': 'https://libris.kb.se/library/Boln',
					'@type': 'Library',
					_display: [
						{
							name: 'Bollnäs bibliotek',
							_label: 'namn'
						}
					],
					_style: ['link', 'block'],
					_label: 'Bibliotek'
				},
				displayStr: 'Bollnäs bibliotek',
				label: 'Bibliotek',
				operator: 'equals',
				up: {
					'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+library:%22sigel:Hagf%22'
				},
				_key: 'library',
				_value: '"sigel:Boln"',
				isRedundantKeyLabel: true
			},
			{
				'@id': 'https://id.kb.se/ns/librissearch/library',
				display: {
					'@id': 'https://libris.kb.se/library/Hagf',
					'@type': 'Library',
					_display: [
						{
							name: 'Hagfors bibliotek',
							_label: 'namn'
						}
					],
					_style: ['link', 'block'],
					_label: 'Bibliotek'
				},
				displayStr: 'Hagfors bibliotek',
				label: 'Bibliotek',
				operator: 'equals',
				up: {
					'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+library:%22sigel:Boln%22'
				},
				_key: 'library',
				_value: '"sigel:Hagf"',
				isRedundantKeyLabel: true
			}
		],
		operator: 'and',
		up: {
			'@id': '/find?_q='
		},
		variable: '_q'
	}
];

// språk:"lang:swe" library:"sigel:Boln" NOT library:"sigel:Hagf"
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
					'@id': '/find?_q=library:%22sigel:Boln%22+NOT+library:%22sigel:Hagf%22'
				},
				_key: 'språk',
				_value: '"lang:swe"',
				isRedundantKeyLabel: true
			},
			{
				'@id': 'https://id.kb.se/ns/librissearch/library',
				display: {
					'@id': 'https://libris.kb.se/library/Boln',
					'@type': 'Library',
					_display: [
						{
							name: 'Bollnäs bibliotek',
							_label: 'namn'
						}
					],
					_style: ['link', 'block'],
					_label: 'Bibliotek'
				},
				displayStr: 'Bollnäs bibliotek',
				label: 'Bibliotek',
				operator: 'equals',
				up: {
					'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+NOT+library:%22sigel:Hagf%22'
				},
				_key: 'library',
				_value: '"sigel:Boln"',
				isRedundantKeyLabel: true
			},
			{
				children: [
					{
						'@id': 'https://id.kb.se/ns/librissearch/library',
						display: {
							'@id': 'https://libris.kb.se/library/Hagf',
							'@type': 'Library',
							_display: [
								{
									name: 'Hagfors bibliotek',
									_label: 'namn'
								}
							],
							_style: ['link', 'block'],
							_label: 'Bibliotek'
						},
						displayStr: 'Hagfors bibliotek',
						label: 'Bibliotek',
						operator: 'equals',
						up: {
							'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+library:%22sigel:Boln%22'
						},
						_key: 'library',
						_value: '"sigel:Hagf"',
						isRedundantKeyLabel: true
					}
				],
				operator: 'not',
				up: {
					'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+library:%22sigel:Boln%22'
				}
			}
		],
		operator: 'and',
		up: {
			'@id': '/find?_q='
		},
		variable: '_q'
	}
];

// språk:"lang:swe" NOT library:"sigel:Hagf" instanceType:DigitalResource
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
					'@id': '/find?_q=NOT+library:%22sigel:Hagf%22+instanceType:DigitalResource'
				},
				_key: 'språk',
				_value: '"lang:swe"',
				isRedundantKeyLabel: true
			},
			{
				children: [
					{
						'@id': 'https://id.kb.se/ns/librissearch/library',
						display: {
							'@id': 'https://libris.kb.se/library/Hagf',
							'@type': 'Library',
							_display: [
								{
									name: 'Hagfors bibliotek',
									_label: 'namn'
								}
							],
							_style: ['link', 'block'],
							_label: 'Bibliotek'
						},
						displayStr: 'Hagfors bibliotek',
						label: 'Bibliotek',
						operator: 'equals',
						up: {
							'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+instanceType:DigitalResource'
						},
						_key: 'library',
						_value: '"sigel:Hagf"',
						isRedundantKeyLabel: true
					}
				],
				operator: 'not',
				up: {
					'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+instanceType:DigitalResource'
				}
			},
			{
				'@id': 'https://id.kb.se/ns/librissearch/instanceType',
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
				label: 'https://id.kb.se/ns/librissearch/instanceType',
				operator: 'equals',
				up: {
					'@id': '/find?_q=spr%C3%A5k:%22lang:swe%22+NOT+library:%22sigel:Hagf%22'
				},
				_key: 'instanceType',
				_value: 'DigitalResource',
				isRedundantKeyLabel: true
			}
		],
		operator: 'and',
		up: {
			'@id': '/find?_q='
		},
		variable: '_q'
	}
];
