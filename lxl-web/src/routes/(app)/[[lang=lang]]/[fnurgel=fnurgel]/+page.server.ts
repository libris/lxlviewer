import { error } from '@sveltejs/kit';
import jmespath from 'jmespath';
import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import { getTranslator } from '$lib/i18n';

import { type FramedData, JsonLd, LensType } from '$lib/types/xl.js';
import { LxlLens } from '$lib/types/display';
import { type ApiError } from '$lib/types/api.js';

import { pickProperty, toString, asArray } from '$lib/utils/xl.js';
import { getImages, toSecure } from '$lib/utils/auxd';
import getAtPath from '$lib/utils/getAtPath';
import {
	getHoldingsByInstanceId,
	getHoldingsByType,
	getHoldersByType
} from '$lib/utils/holdings.js';
import { holdersCache } from '$lib/utils/holdersCache.svelte.js';
import getTypeLike from '$lib/utils/getTypeLike';
import { getUriSlug } from '$lib/utils/http';
import { centerOnWork } from '$lib/utils/centerOnWork';
import { getRelations, type Relation } from '$lib/utils/relations';
import type { TableOfContentsItem } from '$lib/components/TableOfContents.svelte';
import { asResult } from '$lib/utils/search';

export const load = async ({ params, locals, fetch }) => {
	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;
	const locale = getSupportedLocale(params?.lang);
	const translate = await getTranslator(locale);

	let resourceId: null | string = null;

	const resourceRes = await fetch(`${env.API_URL}/${params.fnurgel}?framed=true`, {
		headers: { Accept: 'application/ld+json' }
	});

	if (resourceRes.status === 404) {
		throw error(resourceRes.status, { message: 'Not found' });
	}

	if (!resourceRes.ok) {
		try {
			const err = (await resourceRes.json()) as ApiError;
			throw error(err.status_code, { message: err.message, status: err.status });
		} catch (e) {
			console.warn(e);
			throw error(resourceRes?.status, { message: resourceRes?.statusText });
		}
	}

	const resource = await resourceRes.json();
	const mainEntity = centerOnWork(resource['mainEntity'] as FramedData);
	copyMediaLinksToWork(mainEntity);

	resourceId = resource.mainEntity['@id'];

	// FIXME DisplayDecorated needs a dummy wrapper to get the styling right
	//const types = getTypeLike(mainEntity, vocabUtil).map(t => displayUtil.lensAndFormat(t, LensType.Chip, locale));
	const t = { '@type': 'Work', _category: getTypeLike(mainEntity, vocabUtil) };
	const types = displayUtil.lensAndFormat(t, LensType.Card, locale);

	const heading = displayUtil.lensAndFormat(mainEntity, LxlLens.PageHeading, locale);
	const overview = displayUtil.lensAndFormat(mainEntity, LxlLens.PageOverView, locale);

	const relations: Relation[] | null = await getRelations(resourceId, vocabUtil, locale);

	/** TODO: Better error handling while fetching relations previews */
	const relationsPreviews = await Promise.all(
		relations.map(async (relation) => {
			const previewRes = await fetch(relation.previewUrl);
			const previewData = await previewRes.json();
			return asResult(
				previewData,
				displayUtil,
				vocabUtil,
				locale,
				env.AUXD_SECRET,
				undefined,
				locals.userSettings?.myLibraries
			);
		})
	);
	const relationsPreviewsByQualifierKey = relations.reduce(
		(acc, currentRelation, relationIndex) => {
			return {
				...acc,
				[currentRelation.qualifierKey]: relationsPreviews[relationIndex].items
			};
		},
		{}
	);
	// TODO: Replace with a custom getProperty method (similar to pickProperty)
	const instances = jmespath.search(overview, '*[].hasInstance[]');

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, overviewWithoutHasInstance] = pickProperty(overview, ['hasInstance']);
	const sortedInstances = getSortedInstances([...instances]);

	const tableOfContents: TableOfContentsItem[] = [
		...(instances.length > 1
			? [
					{
						id: 'editions',
						label: translate('resource.editions')
					}
				]
			: []),
		...(relations.length
			? [
					{
						id: 'occurrences',
						label: translate('resource.occurrences'),
						children: relations.map((relationItem) => ({
							id: `occurrences-${relationItem.qualifierKey}`, // all ids should  be prefixed in +page.svelte
							label: relationItem.label
						}))
					}
				]
			: [])
	];
	const images = getImages(mainEntity, locale).map((i) => toSecure(i, env.AUXD_SECRET));
	const holdingsByInstanceId = getHoldingsByInstanceId(mainEntity, displayUtil, locale);
	const holdingsByType = getHoldingsByType(mainEntity);
	const holdersByType = getHoldersByType(holdingsByType, displayUtil, locale);

	if (holdersCache.holders) {
		console.log('Current number of cached holders:', Object.keys(holdersCache.holders).length);
	}

	return {
		workFnurgel: getUriSlug(resourceId || undefined),
		type: mainEntity[JsonLd.TYPE],
		types: types,
		title: toString(heading),
		heading,
		overview: overviewWithoutHasInstance,
		relations,
		relationsPreviewsByQualifierKey,
		instances: sortedInstances,
		holdingsByInstanceId,
		holdersByType,
		images,
		tableOfContents
	};
};

function getSortedInstances(instances: Record<string, unknown>[]) {
	return instances.sort((a, b) => {
		const yearA = parseInt(
			jmespath.search(a, '*[].publication[].*[][?year].year[]').flat(Infinity),
			10
		);
		const yearB = parseInt(
			jmespath.search(b, '*[].publication[].*[][?year].year[]').flat(Infinity),
			10
		);

		if (Number.isNaN(yearA)) {
			return 1;
		}

		if (Number.isNaN(yearB)) {
			return -1;
		}
		return yearB - yearA;
	});
}

function copyMediaLinksToWork(mainEntity: FramedData) {
	const cp = (thing: FramedData, fromPath: (string | number | object)[], toProp: string) => {
		const v = getAtPath(thing, fromPath).filter((v) => v['cataloguersNote'] != 'digipic');
		if (v.length > 0) {
			thing[toProp] = asArray(thing[toProp]).concat(v);
		}
	};
	cp(mainEntity, ['@reverse', 'instanceOf', '*', 'associatedMedia', '*'], 'associatedMedia');
	cp(mainEntity, ['@reverse', 'instanceOf', '*', 'isPrimaryTopicOf', '*'], 'isPrimaryTopicOf');
}
