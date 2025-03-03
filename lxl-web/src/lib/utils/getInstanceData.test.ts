import { describe, it, expect } from 'vitest';
import getInstanceData from './getInstanceData';

describe('getInstanceData', () => {
	it('returns count and years for multiple instances', () => {
		expect(getInstanceData(multipleInstances)).toStrictEqual({ count: 3, years: '2020-2022' });
	});

	it('returns count and year for one instance', () => {
		expect(getInstanceData(oneInstance)).toStrictEqual({ count: 1, years: '2016' });
	});

	it('can handle an unknown object', () => {
		expect(getInstanceData({ foo: 'bar' })).toStrictEqual({ count: 1, years: '' });
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
				_contentBefore: ' • ',
				responsibilityStatement: 'Mikael Yvesand',
				_label: 'upphovsuppgift'
			},
			{
				_contentBefore: ' • ',
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
							_contentBefore: ' • ',
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
				_contentBefore: ' • ',
				responsibilityStatement: 'Mikael Yvesand',
				_label: 'upphovsuppgift'
			},
			{
				_contentBefore: ' • ',
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
				_contentBefore: ' • ',
				responsibilityStatement: 'Mikael Yvesand',
				_label: 'upphovsuppgift'
			},
			{
				_contentBefore: ' • ',
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
							_contentBefore: ' • ',
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
			_contentBefore: ' • ',
			responsibilityStatement: 'Mikael Yvesand',
			_label: 'upphovsuppgift'
		},
		{
			_contentBefore: ' • ',
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
						_contentBefore: ' • ',
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
