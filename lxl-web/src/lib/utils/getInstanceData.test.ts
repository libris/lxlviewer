import { describe, it, expect } from 'vitest';
import getInstanceData from './getInstanceData';

describe('getInstanceData', () => {
	it('returns count and years for multiple instances', () => {
		expect(getInstanceData(multipleInstances.slice(0, 3))).toStrictEqual({
			count: 3,
			years: '2015, 2016, 2018'
		});
	});

	it('returns count and years for multiple instances', () => {
		expect(getInstanceData(multipleInstances)).toStrictEqual({
			count: 6,
			years: '2006 … 2015, 2016, 2018'
		});
	});

	it('returns count and year for one instance', () => {
		expect(getInstanceData(oneInstance)).toStrictEqual({ count: 1, years: '2022' });
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
		'@id': 'https://libris-qa.kb.se/4dps6kh32csc393l',
		'@type': 'DigitalResource',
		_display: [
			{
				_style: ['provisionActivity', 'label', 'ul-when-multiple'],
				_prop: 'publication',
				_value: {
					'@type': 'PrimaryPublication',
					_display: [
						{
							_prop: 'agent',
							_value: {
								'@type': 'Agent',
								_display: [
									{
										_prop: 'label',
										_value: 'Bonnier Carlsen',
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
							_prop: 'year',
							_value: '2016',
							_label: 'år'
						}
					],
					_label: 'Primär utgivning'
				},
				_label: 'utgivning'
			}
		],
		_style: ['link'],
		_label: 'Digital resurs'
	},
	{
		'@id': 'https://libris-qa.kb.se/xg8qlm0815fqpqs',
		'@type': 'DigitalResource',
		_display: [
			{
				_style: ['provisionActivity', 'label', 'ul-when-multiple'],
				_prop: 'publication',
				_value: {
					'@type': 'PrimaryPublication',
					_display: [
						{
							_prop: 'agent',
							_value: {
								'@type': 'Agent',
								_display: [
									{
										_prop: 'label',
										_value: 'Bonnier Carlsen',
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
							_prop: 'year',
							_value: '2018',
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
		_label: 'Digital resurs'
	},
	{
		'@id': 'https://libris-qa.kb.se/8sltrf9l5m1dfrn',
		'@type': 'DigitalResource',
		_display: [
			{
				_style: ['provisionActivity', 'label', 'ul-when-multiple'],
				_prop: 'publication',
				_value: {
					'@type': 'PrimaryPublication',
					_display: [
						{
							_prop: 'agent',
							_value: {
								'@type': 'Agent',
								_display: [
									{
										_prop: 'label',
										_value: 'Bonnier Carlsen',
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
							_prop: 'year',
							_value: '2015',
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
		_label: 'Digital resurs'
	},
	{
		'@id': 'https://libris-qa.kb.se/dwppqlvq17d2t2g',
		'@type': 'PhysicalResource',
		_display: [
			{
				_prop: 'editionStatement',
				_value: '1. uppl.',
				_label: 'upplageuppgift'
			},
			{
				_style: ['provisionActivity', 'label', 'ul-when-multiple'],
				_contentBefore: ' · ',
				_prop: 'publication',
				_value: {
					'@type': 'PrimaryPublication',
					_display: [
						{
							_prop: 'agent',
							_value: {
								'@type': 'Agent',
								_display: [
									{
										_prop: 'label',
										_value: 'Bonnier Carlsen',
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
							_prop: 'year',
							_value: '2006',
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
		_label: 'Fysisk resurs'
	},
	{
		'@id': 'https://libris-qa.kb.se/wf7811r70xtlg1p',
		'@type': 'DigitalResource',
		_display: [
			{
				_style: ['provisionActivity', 'label', 'ul-when-multiple'],
				_prop: 'publication',
				_value: {
					'@type': 'PrimaryPublication',
					_display: [
						{
							_prop: 'agent',
							_value: {
								'@type': 'Agent',
								_display: [
									{
										_prop: 'label',
										_value: 'Bonnier Carlsen',
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
							_prop: 'year',
							_value: '2014',
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
		_label: 'Digital resurs'
	},
	{
		'@id': 'https://libris-qa.kb.se/fzr3dsqr29m974w',
		'@type': 'PhysicalResource',
		_display: [
			{
				_prop: 'editionStatement',
				_value: '1. uppl. i färg',
				_label: 'upplageuppgift'
			},
			{
				_style: ['provisionActivity', 'label', 'ul-when-multiple'],
				_contentBefore: ' · ',
				_prop: 'publication',
				_value: {
					'@type': 'PrimaryPublication',
					_display: [
						{
							_prop: 'agent',
							_value: {
								'@type': 'Agent',
								_display: [
									{
										_prop: 'label',
										_value: 'Bonnier Carlsen',
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
							_prop: 'year',
							_value: '2016',
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
		_label: 'Fysisk resurs'
	}
];

const oneInstance = {
	'@id': 'https://libris-qa.kb.se/5l9h8z9t3f8rs82v',
	'@type': 'PhysicalResource',
	_display: [
		{
			_style: ['provisionActivity', 'label', 'ul-when-multiple'],
			_prop: 'publication',
			_value: {
				'@type': 'PrimaryPublication',
				_display: [
					{
						_prop: 'agent',
						_value: {
							'@type': 'Agent',
							_display: [
								{
									_prop: 'label',
									_value: 'Polaris',
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
						_prop: 'year',
						_value: '2022',
						_label: 'år'
					}
				],
				_label: 'Primär utgivning'
			},
			_label: 'utgivning'
		}
	],
	_style: ['link'],
	_label: 'Fysisk resurs'
};

const serial = {
	'@id': 'https://libris-qa.kb.se/r88v5ct4pjxz1hrb',
	'@type': 'PhysicalResource',
	_display: [
		{
			_style: ['provisionActivity', 'label', 'ul-when-multiple'],
			_prop: 'publication',
			_value: [
				{
					'@type': 'PrimaryPublication',
					_display: [
						{
							_prop: 'agent',
							_value: {
								'@type': 'Agent',
								_display: [
									{
										_prop: 'label',
										_value: 'Andover Press',
										_label: 'benämning'
									}
								],
								_style: ['link'],
								_label: 'Agent'
							},
							_label: 'agent'
						},
						{
							_style: ['startYear'],
							_contentBefore: ', ',
							_contentAfter: '-',
							_prop: 'startYear',
							_value: '1904',
							_label: 'startår'
						},
						{
							_style: ['endYear'],
							_contentBefore: '-',
							_prop: 'endYear',
							_value: '1912',
							_label: 'slutår'
						}
					],
					_label: 'Primär utgivning'
				},
				{
					'@type': 'Publication',
					_display: [
						{
							_prop: 'agent',
							_value: {
								'@type': 'Agent',
								_display: [
									{
										_prop: 'label',
										_value: 'Norwood Press',
										_label: 'benämning'
									}
								],
								_style: ['link'],
								_label: 'Agent'
							},
							_label: 'agent'
						}
					],
					_contentBefore: ', ',
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
	'@id': 'https://libris-qa.kb.se/tb4101952lnr755',
	'@type': 'PhysicalResource',
	_display: [
		{
			_style: ['provisionActivity', 'label', 'ul-when-multiple'],
			_prop: 'publication',
			_value: {
				'@type': 'PrimaryPublication',
				_display: [
					{
						_prop: 'agent',
						_value: {
							'@type': 'Agent',
							_display: [
								{
									_prop: 'label',
									_value: 'Svenska sällskapet för antropologi och geografi',
									_label: 'benämning'
								}
							],
							_style: ['link'],
							_label: 'Agent'
						},
						_label: 'agent'
					},
					{
						_style: ['startYear'],
						_contentBefore: ', ',
						_contentAfter: '-',
						_prop: 'startYear',
						_value: '1881',
						_label: 'startår'
					}
				],
				_label: 'Primär utgivning'
			},
			_label: 'utgivning'
		}
	],
	_style: ['link'],
	_label: 'Fysisk resurs'
};
