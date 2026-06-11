import { describe, it, expect } from 'vitest';
import { getBibIdsByInstanceId, getHoldersByType, getHoldingsByType } from './holdings.server';
import { getLibsFromHoldings } from './holdings';
import mainEntity from '$lib/assets/json/test-data/main-entity.json';
import record from '$lib/assets/json/test-data/record.json';
import { UserSettings } from './userSettings.svelte';
import { centerOnWork } from './centerOnWork.server';

const workCenteredMainEntity = centerOnWork(mainEntity);

describe('getBibIdsByInstanceId', () => {
	it('Returns a correctly mapped object (bibId, type & holders)', () => {
		const publicationStr = 'Natur och kultur, 2018';
		const displayUtil = { lensAndFormat: () => publicationStr };
		const vocabUtil = { getDefinition: () => '' };

		expect(
			getBibIdsByInstanceId(workCenteredMainEntity, vocabUtil, displayUtil, record, 'sv')
		).toStrictEqual({
			'0h96fs3b0c49qkt': {
				bibId: '7654300',
				'@type': 'PhysicalResource',
				onr: '9176423484',
				isbn: ['9176423484'],
				issn: [],
				publicationStr: publicationStr,
				selectSlug: 'PrintedVolume',
				titleStr: publicationStr,
				items: []
			}
		});
	});
});

describe('getLibsFromHoldings', () => {
	it('Returns favourite library present in the holdings list', () => {
		const userSettings = new UserSettings({});
		const vocabUtil = { getDefinition: () => '' };
		const displayUtil = { lensAndFormat: () => '' };
		userSettings.addLibrary('https://libris.kb.se/library/S');
		userSettings.addLibrary('https://libris.kb.se/library/foo');
		const { holdingsByType } = getHoldingsByType(
			workCenteredMainEntity,
			vocabUtil,
			displayUtil,
			'sv'
		);
		const byType = getHoldersByType(holdingsByType);

		expect(getLibsFromHoldings(userSettings.myLibraries, byType)).toStrictEqual([
			'https://libris.kb.se/library/S'
		]);

		userSettings.addLibrary('https://libris.kb.se/library/H');

		expect(getLibsFromHoldings(userSettings.myLibraries, byType)).toStrictEqual([
			'https://libris.kb.se/library/S',
			'https://libris.kb.se/library/H'
		]);
	});
});
