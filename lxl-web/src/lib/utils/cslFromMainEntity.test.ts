import mainEntity from '$lib/assets/json/test-data/main-entity.json';
import { describe, it, expect } from 'vitest';
import { cslFromMainEntity } from './cslFromMainEntity';

describe('getCslFromMainEntity', () => {
	it('Returns the expected CSL output', async () => {
		expect(cslFromMainEntity(mainEntity)).toStrictEqual(expected);
	});
});

const expected = [
	{
		id: 'https://libris-qa.kb.se/0h96fs3b0c49qkt#it',
		type: 'book',
		title: 'Ture Sventon i London och Paris',
		shortTitle: 'Ture Sventon i London och Paris',
		publisher: 'MånPocket',
		'publisher-place': 'Stockholm',
		issued: {
			'date-parts': [['1987']]
		},
		'number-of-pages': '237, [1] s.',
		language: 'Svenska',
		ISBN: '9176423484',
		keyword: 'Sventon, Ture, (fiktiv gestalt)',
		author: [
			{
				family: 'Holmberg',
				given: 'Åke'
			}
		],
		illustrator: [
			{
				family: 'Hemmel',
				given: 'Sven'
			}
		],
		translator: [],
		interviewer: [],
		composer: [],
		director: [],
		editor: []
	}
];
