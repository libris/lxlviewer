import { describe, expect, it } from 'vitest';
import {
	getBibIdsByInstanceId,
	getHoldersByType,
	getHoldersCount,
	getHoldingsByType
} from './holdings.server';
import { getHeldBy } from './holdings';
import mainEntity from '#lib/assets/json/test-data/main-entity.json';
import record from '#lib/assets/json/test-data/record.json';
import { UserSettings } from './userSettings.svelte';
import { centerOnWork } from './centerOnWork.server';
import type { HoldingInstance, HoldingItem, HoldingMainEntity } from '#lib/types/holdings.ts';
import { type ClassName, type Data } from '#lib/types/xl.ts';
import type { VocabUtil } from '#lib/utils/xl.server.ts';

const workCenteredMainEntity = centerOnWork(mainEntity);

describe('getBibIdsByInstanceId', () => {
	it('Returns a correctly mapped object (bibId, type & holders)', () => {
		const publicationStr = 'Natur och kultur, 2018';
		const DisplayUtil = { lensAndFormat: () => publicationStr };

		// @ts-expect-error - Display is mocked
		expect(getBibIdsByInstanceId(workCenteredMainEntity, DisplayUtil, record, 'sv')).toStrictEqual({
			'0h96fs3b0c49qkt': {
				bibId: '7654300',
				'@type': 'PhysicalResource',
				onr: '9176423484',
				isbn: ['9176423484'],
				issn: [],
				publicationStr: publicationStr,
				titleStr: publicationStr,
				items: []
			}
		});
	});
});

describe('getHeldBy', () => {
	it('Returns favourite library present in the holdings list', () => {
		const userSettings = new UserSettings({});
		userSettings.addLibrary('https://libris.kb.se/library/S');
		userSettings.addLibrary('https://libris.kb.se/library/foo');
		const byType = getHoldersByType(getHoldingsByType(workCenteredMainEntity));

		expect(getHeldBy(userSettings.myLibraries, byType)).toStrictEqual([
			'https://libris.kb.se/library/S'
		]);

		userSettings.addLibrary('https://libris.kb.se/library/H');

		expect(getHeldBy(userSettings.myLibraries, byType)).toStrictEqual([
			'https://libris.kb.se/library/S',
			'https://libris.kb.se/library/H'
		]);
	});

	it('Ignores orgs missing from the org index', () => {
		const userSettings = new UserSettings({});
		userSettings.addLibrary('https://libris.kb.se/library/S');
		userSettings.addLibrary('https://libris.kb.se/library/org/GOMU');
		const byType = getHoldersByType(getHoldingsByType(workCenteredMainEntity));

		expect(getHeldBy(userSettings.myLibraries, byType, {})).toStrictEqual([
			'https://libris.kb.se/library/S'
		]);
	});

	it('Ignores holdings on reproductions', () => {
		const reproduction = {
			'@id': 'https://example.com/b',
			'@type': 'DigitalResource',
			reproductionOf: { '@id': 'https://example.com/a' },
			'@reverse': {
				itemOf: [
					{
						'@id': 'https://example.com/2',
						'@type': 'Item',
						heldBy: { '@id': 'https://libris.kb.se/library/S' }
					} as HoldingItem
				]
			}
		} as HoldingInstance;

		const work = {
			'@id': 'https://example.com/work',
			'@type': 'Monograph',
			'@reverse': {
				instanceOf: [
					{
						'@id': 'https://example.com/a',
						'@type': 'PhysicalResource',
						'@reverse': {
							itemOf: [
								{
									'@id': 'https://example.com/1',
									'@type': 'Item',
									heldBy: { '@id': 'https://libris.kb.se/library/GU' }
								}
							]
						}
					} as HoldingInstance,
					reproduction,
					{
						'@id': 'https://example.com/c',
						'@type': 'DigitalResource',
						'@reverse': {
							itemOf: [
								{
									'@id': 'https://example.com/3',
									'@type': 'Item',
									heldBy: { '@id': 'https://libris.kb.se/library/Aneb' }
								}
							]
						}
					} as HoldingInstance
				]
			}
		} as HoldingMainEntity;

		expect(getHoldersByType(getHoldingsByType(work))).toStrictEqual({
			PhysicalResource: ['https://libris.kb.se/library/GU'],
			DigitalResource: ['https://libris.kb.se/library/Aneb']
		});

		expect(getHoldersByType(getHoldingsByType(reproduction))).toStrictEqual({});

		const vocabUtil = {
			getType: function (thing: Data): ClassName {
				return thing['@type'] as string;
			},
			isSubClassOf: function (className: ClassName, baseClassName: ClassName): boolean {
				return (
					(className == 'Monograph' && baseClassName == 'Work') ||
					(className == 'DigitalResource' && baseClassName == 'Instance')
				);
			}
		} as VocabUtil;

		expect(getHoldersCount(work, vocabUtil)).toStrictEqual(2);
		expect(getHoldersCount(reproduction, vocabUtil)).toStrictEqual(-1);
	});
});
