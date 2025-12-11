import { error } from '@sveltejs/kit';
import jmespath from 'jmespath';
import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import { getTranslator } from '$lib/i18n';

import { type FramedData, JsonLd, LensType } from '$lib/types/xl.js';
import { LxlLens } from '$lib/types/display';
import { type ApiError } from '$lib/types/api.js';
import type { PartialCollectionView, ResourceSearchResult } from '$lib/types/search.js';
import type { TableOfContentsItem } from '$lib/components/TableOfContents.svelte';
import type { HoldingsData } from '$lib/types/holdings.js';

import { pickProperty, toString, asArray, first } from '$lib/utils/xl.js';
import { getImages, toSecure } from '$lib/utils/auxd';
import getAtPath from '$lib/utils/getAtPath';
import {
	getHoldingLibraries,
	getHoldingsByInstanceId,
	getBibIdsByInstanceId,
	getHoldingsByType,
	getHoldersByType
} from '$lib/utils/holdings.server';
import getTypeLike, { getTypeForIcon } from '$lib/utils/getTypeLike';
import { centerOnWork } from '$lib/utils/centerOnWork';
import { getRelations, type Relation } from '$lib/utils/relations';
import {
	appendMyLibrariesParam,
	asResult,
	asSearchResultItem,
	displayMappings
} from '$lib/utils/search';
import { getRefinedOrgs } from '$lib/utils/getRefinedOrgs.server';

export const load = async ({ params, locals, fetch, url }) => {
	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;
	const locale = getSupportedLocale(params?.lang);
	const translate = await getTranslator(locale);
	const myLibraries = locals.userSettings?.myLibraries;

	let resourceId: null | string = null;
	const subsetFilter = url.searchParams.get('_r');
	const _q = url.searchParams.get('_q');

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
	const mainEntity = { ...centerOnWork(resource['mainEntity'] as FramedData) };
	copyMediaLinksToWork(mainEntity);

	resourceId = resource.mainEntity['@id'];

	const typeLike = getTypeLike(mainEntity, vocabUtil);
	const t = {
		'@type': '_Types', // FIXME? DisplayDecorated needs a dummy wrapper to get the styling right
		...(typeLike.find.length > 0 && { _find: typeLike.find }),
		...(typeLike.identify.length > 0 && { _identify: typeLike.identify }),
		//...(typeLike.select.length > 0 && { _select: typeLike.select }),
		// FIXME: don't do this here
		...(!!mainEntity['language'] && { language: mainEntity['language'] })
	};
	const types = displayUtil.lensAndFormat(t, LensType.Card, locale);

	if (mainEntity['category']) {
		const category = typeLike.none.filter((c) => first(asArray(c[JsonLd.TYPE])) !== 'ContentType');
		if (category.length > 0) {
			mainEntity['category'] = category;
		} else {
			delete mainEntity['category'];
		}

		delete mainEntity['language'];
	}

	const heading = displayUtil.lensAndFormat(mainEntity, LxlLens.PageHeading, locale);
	const overview = displayUtil.lensAndFormat(mainEntity, LxlLens.PageOverView, locale);

	let instances;
	let searchResult: ResourceSearchResult | undefined;

	// Format & sort instances; single instance -> pick from resource overview
	if (mainEntity?.['@reverse']?.instanceOf?.length === 1) {
		// TODO: Replace with a custom getProperty method (similar to pickProperty)
		instances = jmespath.search(overview, '*[].hasInstance[]');
	} else if (mainEntity?.['@reverse']?.instanceOf?.length > 1) {
		// multiple instances -> format as web cards
		const sortedInstances = getSortedInstances(mainEntity?.['@reverse']?.instanceOf);
		instances = asSearchResultItem(
			sortedInstances,
			displayUtil,
			vocabUtil,
			locale,
			env.AUXD_SECRET,
			myLibraries,
			undefined
		);
	}

	// Search for instances that matches query
	if ((subsetFilter && subsetFilter !== '*') || (_q && _q !== '*') || locals.site) {
		const searchParams = appendMyLibrariesParam(
			new URLSearchParams({
				_o: resourceId || '',
				_p: 'instanceOf',
				_q: _q || '*',
				_r: subsetFilter || '',
				_spell: 'false',
				_stats: 'false',
				_site: locals.site?.searchSite || ''
			}),
			myLibraries
		);

		const res = await fetch(`${env.API_URL}/find.jsonld?${searchParams.toString()}`);

		if (res.ok) {
			const data = (await res.json()) as PartialCollectionView;
			searchResult = {
				items: data.items.map((item) => (item['@id'] as string).replace('#it', '')),
				mapping: displayMappings(data, locals.display, locale, translate, url.pathname)
			};
		}
	}

	const relations: Relation[] | null = await getRelations(
		resourceId,
		vocabUtil,
		locale,
		subsetFilter,
		locals.site?.searchSite
	);

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
				myLibraries
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

	const tableOfContents: TableOfContentsItem[] = [
		...(instances?.length > 1
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
			: []),
		{
			id: 'details',
			label: translate('resource.details')
		}
	];

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, overviewWithoutHasInstance] = pickProperty(overview, ['hasInstance']);

	const images = getImages(mainEntity, locale).map((i) => toSecure(i, env.AUXD_SECRET));
	const holdingsByType = getHoldingsByType(mainEntity);
	const byType = getHoldersByType(holdingsByType);

	const holdings: HoldingsData = {
		byInstanceId: getHoldingsByInstanceId(mainEntity),
		byType,
		bibIdData: getBibIdsByInstanceId(mainEntity, displayUtil, resource, locale),
		holdingLibraries: getHoldingLibraries(byType)
	};

	const workCard = asSearchResultItem(
		[resource.mainEntity],
		displayUtil,
		vocabUtil,
		locale,
		env.AUXD_SECRET,
		myLibraries,
		undefined
	)[0];

	const subsetMapping = locals?.subsetMapping;
	const refinedOrgs = getRefinedOrgs(myLibraries, [subsetMapping, searchResult?.mapping]);

	return {
		uri: resource['@id'] as string,
		type: mainEntity[JsonLd.TYPE],
		types: types,
		typeForIcon: getTypeForIcon(typeLike), // FIXME
		title: toString(heading),
		heading,
		overview: overviewWithoutHasInstance,
		relations,
		relationsPreviewsByQualifierKey,
		instances,
		searchResult,
		holdings,
		images,
		tableOfContents,
		workCard,
		refinedOrgs
	};
};

function getSortedInstances(instances: Record<string, unknown>[]) {
	return instances.sort((a, b) => {
		const yearA = parseInt(jmespath.search(a, 'publication[0].year'), 10);
		const yearB = parseInt(jmespath.search(b, 'publication[0].year'), 10);

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
