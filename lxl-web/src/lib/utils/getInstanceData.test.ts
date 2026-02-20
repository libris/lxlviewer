import { describe, it, expect } from 'vitest';
import getInstanceData from './getInstanceData';

describe('getInstanceData', () => {
	it('returns count and years for multiple instances', () => {
		expect(getInstanceData(multipleInstances.slice(0, 3))).toStrictEqual({
			count: 3,
			years: '2020, 2021, 2022'
		});
	});

	it('returns count and years for multiple instances', () => {
		expect(getInstanceData(multipleInstances)).toStrictEqual({
			count: 5,
			years: '2020 … 2022, 2025, 2027'
		});
	});

	it('returns count and year for one instance', () => {
		expect(getInstanceData(oneInstance)).toStrictEqual({ count: 1, years: '2016' });
	});

	it('can handle an unknown object', () => {
		expect(getInstanceData({ foo: 'bar' })).toStrictEqual({ count: 1, years: '' });
	});

	it('gets span for serials', () => {
		expect(getInstanceData(serial)).toStrictEqual({ count: 1, years: '1904-1912' });
	});

	it('gets span for serials (non-array publication)', () => {
		expect(getInstanceData(serial2)).toStrictEqual({ count: 1, years: '1881-' });
	});
});

const multipleInstances = [
	{
		'@id': 'https://libris-qa.kb.se/kz701csjh57m5k0z',
		'@type': 'Instance',
		_display: [
			{
				_style: ['block'],
				hasTitle: {
					'@type': 'Title',
					_display: [
						{
							mainTitle: 'Häng City',
							_label: 'huvudtitel'
						}
					],
					_label: 'Titel'
				},
				_label: 'har titel'
			},
			{
				_contentBefore: ' · ',
				responsibilityStatement: 'Mikael Yvesand',
				_label: 'upphovsuppgift'
			},
			{
				_contentBefore: ' · ',
				publication: {
					'@type': 'PrimaryPublication',
					_display: [
						{
							country: {
								'@id': 'https://libris-qa.kb.se/jf9xxz4ml0jrz74j',
								'@type': 'Country',
								_display: [
									{
										prefLabel: 'Sverige',
										_label: 'föredragen benämning'
									}
								],
								_label: 'Land'
							},
							_label: 'land'
						},
						{
							_contentBefore: ' · ',
							place: {
								'@type': 'Place',
								_display: [
									{
										label: 'Stockholm',
										_label: 'benämning'
									}
								],
								_label: 'Plats'
							},
							_label: 'plats'
						},
						{
							_contentBefore: ' : ',
							agent: {
								'@type': 'Agent',
								_display: [
									{
										label: 'Polaris',
										_label: 'benämning'
									}
								],
								_style: ['link'],
								_label: 'Agent'
							},
							_label: 'agent'
						},
						{
							_contentBefore: ', ',
							year: '2020',
							_label: 'år'
						},
						{
							_contentBefore: ', ',
							date: '[2022]',
							_label: 'datum'
						}
					],
					_label: 'Primär utgivning'
				},
				_label: 'utgivning'
			}
		],
		_style: ['link'],
		_label: 'Instans'
	},
	{
		'@id': 'https://libris-qa.kb.se/p3cc9rvhmwp5vnw4',
		'@type': 'Electronic',
		_display: [
			{
				_style: ['block'],
				hasTitle: {
					'@type': 'Title',
					_display: [
						{
							mainTitle: 'Häng City',
							_label: 'huvudtitel'
						}
					],
					_label: 'Titel'
				},
				_label: 'har titel'
			},
			{
				_contentBefore: ' · ',
				responsibilityStatement: 'Mikael Yvesand',
				_label: 'upphovsuppgift'
			},
			{
				_contentBefore: ' · ',
				publication: {
					'@type': 'PrimaryPublication',
					_display: [
						{
							country: {
								'@id': 'https://libris-qa.kb.se/jf9xxz4ml0jrz74j',
								'@type': 'Country',
								_display: [
									{
										prefLabel: 'Sverige',
										_label: 'föredragen benämning'
									}
								],
								_label: 'Land'
							},
							_label: 'land'
						},
						{
							_contentBefore: ' : ',
							agent: {
								'@type': 'Agent',
								_display: [
									{
										label: 'Bokförlaget Polaris',
										_label: 'benämning'
									}
								],
								_style: ['link'],
								_label: 'Agent'
							},
							_label: 'agent'
						},
						{
							_contentBefore: ', ',
							year: '2021',
							_label: 'år'
						}
					],
					_label: 'Primär utgivning'
				},
				_label: 'utgivning'
			}
		],
		_style: ['link'],
		_contentBefore: ', ',
		_label: 'Elektronisk'
	},
	{
		'@id': 'https://libris-qa.kb.se/br78xdb78kg8gzr5',
		'@type': 'Instance',
		_display: [
			{
				_style: ['block'],
				hasTitle: {
					'@type': 'Title',
					_display: [
						{
							mainTitle: 'Häng City',
							_label: 'huvudtitel'
						}
					],
					_label: 'Titel'
				},
				_label: 'har titel'
			},
			{
				_contentBefore: ' · ',
				responsibilityStatement: 'Mikael Yvesand',
				_label: 'upphovsuppgift'
			},
			{
				_contentBefore: ' · ',
				publication: {
					'@type': 'PrimaryPublication',
					_display: [
						{
							country: {
								'@id': 'https://libris-qa.kb.se/jf9xxz4ml0jrz74j',
								'@type': 'Country',
								_display: [
									{
										prefLabel: 'Sverige',
										_label: 'föredragen benämning'
									}
								],
								_label: 'Land'
							},
							_label: 'land'
						},
						{
							_contentBefore: ' · ',
							place: {
								'@type': 'Place',
								_display: [
									{
										label: 'Stockholm',
										_label: 'benämning'
									}
								],
								_label: 'Plats'
							},
							_label: 'plats'
						},
						{
							_contentBefore: ' : ',
							agent: {
								'@type': 'Agent',
								_display: [
									{
										label: 'Polaris',
										_label: 'benämning'
									}
								],
								_style: ['link'],
								_label: 'Agent'
							},
							_label: 'agent'
						},
						{
							_contentBefore: ', ',
							year: '2022',
							_label: 'år'
						},
						{
							_contentBefore: ', ',
							date: '[2022]',
							_label: 'datum'
						}
					],
					_label: 'Primär utgivning'
				},
				_label: 'utgivning'
			}
		],
		_style: ['link'],
		_contentBefore: ', ',
		_label: 'Instans'
	},
	{
		'@id': 'https://libris-qa.kb.se/br78xdb78ksdfzr5',
		'@type': 'Instance',
		_display: [
			{
				_style: ['block'],
				hasTitle: {
					'@type': 'Title',
					_display: [
						{
							mainTitle: 'Häng City',
							_label: 'huvudtitel'
						}
					],
					_label: 'Titel'
				},
				_label: 'har titel'
			},
			{
				_contentBefore: ' · ',
				responsibilityStatement: 'Mikael Yvesand',
				_label: 'upphovsuppgift'
			},
			{
				_contentBefore: ' · ',
				publication: {
					'@type': 'PrimaryPublication',
					_display: [
						{
							country: {
								'@id': 'https://libris-qa.kb.se/jf9xxz4ml0jrz74j',
								'@type': 'Country',
								_display: [
									{
										prefLabel: 'Sverige',
										_label: 'föredragen benämning'
									}
								],
								_label: 'Land'
							},
							_label: 'land'
						},
						{
							_contentBefore: ' · ',
							place: {
								'@type': 'Place',
								_display: [
									{
										label: 'Stockholm',
										_label: 'benämning'
									}
								],
								_label: 'Plats'
							},
							_label: 'plats'
						},
						{
							_contentBefore: ' : ',
							agent: {
								'@type': 'Agent',
								_display: [
									{
										label: 'Polaris',
										_label: 'benämning'
									}
								],
								_style: ['link'],
								_label: 'Agent'
							},
							_label: 'agent'
						},
						{
							_contentBefore: ', ',
							year: '2025',
							_label: 'år'
						},
						{
							_contentBefore: ', ',
							date: '[2022]',
							_label: 'datum'
						}
					],
					_label: 'Primär utgivning'
				},
				_label: 'utgivning'
			}
		],
		_style: ['link'],
		_contentBefore: ', ',
		_label: 'Instans'
	},
	{
		'@id': 'https://libris-qa.kb.se/br78xdb78kg8gz11',
		'@type': 'Instance',
		_display: [
			{
				_style: ['block'],
				hasTitle: {
					'@type': 'Title',
					_display: [
						{
							mainTitle: 'Häng City',
							_label: 'huvudtitel'
						}
					],
					_label: 'Titel'
				},
				_label: 'har titel'
			},
			{
				_contentBefore: ' · ',
				responsibilityStatement: 'Mikael Yvesand',
				_label: 'upphovsuppgift'
			},
			{
				_contentBefore: ' · ',
				publication: {
					'@type': 'PrimaryPublication',
					_display: [
						{
							country: {
								'@id': 'https://libris-qa.kb.se/jf9xxz4ml0jrz74j',
								'@type': 'Country',
								_display: [
									{
										prefLabel: 'Sverige',
										_label: 'föredragen benämning'
									}
								],
								_label: 'Land'
							},
							_label: 'land'
						},
						{
							_contentBefore: ' · ',
							place: {
								'@type': 'Place',
								_display: [
									{
										label: 'Stockholm',
										_label: 'benämning'
									}
								],
								_label: 'Plats'
							},
							_label: 'plats'
						},
						{
							_contentBefore: ' : ',
							agent: {
								'@type': 'Agent',
								_display: [
									{
										label: 'Polaris',
										_label: 'benämning'
									}
								],
								_style: ['link'],
								_label: 'Agent'
							},
							_label: 'agent'
						},
						{
							_contentBefore: ', ',
							year: '2027',
							_label: 'år'
						},
						{
							_contentBefore: ', ',
							date: '[2022]',
							_label: 'datum'
						}
					],
					_label: 'Primär utgivning'
				},
				_label: 'utgivning'
			}
		],
		_style: ['link'],
		_contentBefore: ', ',
		_label: 'Instans'
	}
];

const oneInstance = {
	'@id': 'https://libris-qa.kb.se/5l9h8z9t3f8rs82v#it',
	'@type': 'SoundRecording',
	_display: [
		{
			_style: ['block'],
			hasTitle: {
				'@type': 'Title',
				_display: [
					{
						mainTitle: 'Häng City',
						_label: 'huvudtitel'
					}
				],
				_label: 'Titel'
			},
			_label: 'har titel'
		},
		{
			_contentBefore: ' · ',
			responsibilityStatement: 'Mikael Yvesand',
			_label: 'upphovsuppgift'
		},
		{
			_contentBefore: ' · ',
			publication: {
				'@type': 'PrimaryPublication',
				_display: [
					{
						country: {
							'@id': 'https://libris-qa.kb.se/jf9xxz4ml0jrz74j',
							'@type': 'Country',
							_display: [
								{
									prefLabel: 'Sverige',
									_label: 'föredragen benämning'
								}
							],
							_label: 'Land'
						},
						_label: 'land'
					},
					{
						_contentBefore: ' · ',
						place: {
							'@type': 'Place',
							_display: [
								{
									label: '[Stockholm]',
									_label: 'benämning'
								}
							],
							_label: 'Plats'
						},
						_label: 'plats'
					},
					{
						_contentBefore: ' : ',
						agent: {
							'@type': 'Agent',
							_display: [
								{
									label: 'Polaris',
									_label: 'benämning'
								}
							],
							_style: ['link'],
							_label: 'Agent'
						},
						_label: 'agent'
					},
					{
						_contentBefore: ', ',
						year: '2016',
						_label: 'år'
					}
				],
				_label: 'Primär utgivning'
			},
			_label: 'utgivning'
		}
	],
	_style: ['link'],
	_label: 'Ljudinspelning'
};

const serial = {
	'@id': 'https://libris-qa.kb.se/r88v5ct4pjxz1hrb#it',
	'@type': 'PhysicalResource',
	_display: [
		{
			publication: [
				{
					'@type': 'PrimaryPublication',
					_display: [
						{
							agent: {
								'@type': 'Agent',
								_display: [
									{
										label: 'Andover Press',
										_label: 'benämning'
									}
								],
								_style: ['link'],
								_label: 'Agent'
							},
							_label: 'agent'
						},
						{
							_contentBefore: ', ',
							startYear: '1904',
							_label: 'startår'
						},
						{
							_contentBefore: '-',
							endYear: '1912',
							_label: 'slutår'
						}
					],
					_style: ['block'],
					_label: 'Primär utgivning'
				},
				{
					'@type': 'Publication',
					_display: [
						{
							agent: {
								'@type': 'Agent',
								_display: [
									{
										label: 'Norwood Press',
										_label: 'benämning'
									}
								],
								_style: ['link'],
								_label: 'Agent'
							},
							_label: 'agent'
						}
					],
					_style: ['block'],
					_label: 'Utgivning'
				}
			],
			_label: 'utgivning'
		}
	],
	_style: ['link'],
	_label: 'Fysisk resurs'
};

const serial2 = {
	'@id': 'https://libris-qa.kb.se/tb4101952lnr755#it',
	'@type': 'PhysicalResource',
	_display: [
		{
			publication: {
				'@type': 'PrimaryPublication',
				_display: [
					{
						agent: {
							'@type': 'Agent',
							_display: [
								{
									label: 'Svenska sällskapet för antropologi och geografi',
									_label: 'benämning'
								}
							],
							_style: ['link'],
							_label: 'Agent'
						},
						_label: 'agent'
					},
					{
						_contentBefore: ', ',
						startYear: '1881',
						_label: 'startår'
					}
				],
				_style: ['block'],
				_label: 'Primär utgivning'
			},
			_label: 'utgivning'
		}
	],
	_style: ['link'],
	_label: 'Fysisk resurs'
};
