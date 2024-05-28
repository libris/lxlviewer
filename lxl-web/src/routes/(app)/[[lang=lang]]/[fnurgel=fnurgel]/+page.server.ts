import { error } from '@sveltejs/kit';
import jmespath from 'jmespath';
import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales.js';

import { type FramedData, JsonLd } from '$lib/types/xl.js';
import { LxlLens } from '$lib/types/display';
import { type ApiError } from '$lib/types/api.js';
import type { PartialCollectionView, SearchResult } from '$lib/types/search.js';

import { DisplayUtil, pickProperty, toString, VocabUtil, asArray } from '$lib/utils/xl.js';
import { getImages, toSecure } from '$lib/utils/auxd';
import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams.js';
import getSortedSearchParams from '$lib/utils/getSortedSearchParams.js';
import { asResult, displayPredicates } from '$lib/utils/search';
import getAtPath from '$lib/utils/getAtPath';
import { getHoldingsByInstanceId, getHoldingsByType } from '$lib/utils/holdings.js';

export const load = async ({ params, url, locals, fetch, isDataRequest }) => {
	const displayUtil: DisplayUtil = locals.display;
	const vocabUtil: VocabUtil = locals.vocab;
	const locale = getSupportedLocale(params?.lang);

	let shouldFindRelations = false;
	let resourceId: null | string = null;

	const resourceRes = await fetch(`${env.API_URL}/${params.fnurgel}?framed=true`, {
		headers: { Accept: 'application/ld+json' }
	});

	if (resourceRes.status === 404) {
		throw error(resourceRes.status, { message: 'Not found' });
	}

	if (!resourceRes.ok) {
		const err = (await resourceRes.json()) as ApiError;
		throw error(err.status_code, { message: err.message, status: err.status });
	}

	const resource = await resourceRes.json();
	const mainEntity = centerOnWork(resource['mainEntity'] as FramedData);
	copyMediaLinksToWork(mainEntity);

	resourceId = resource.mainEntity['@id'];
	const heading = displayUtil.lensAndFormat(mainEntity, LxlLens.PageHeading, locale);
	const overview = displayUtil.lensAndFormat(mainEntity, LxlLens.PageOverView, locale);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, overviewWithoutHasInstance] = pickProperty(overview, ['hasInstance']);
	// TODO: Replace with a custom getProperty method (similar to pickProperty)
	const instances = jmespath.search(overview, '*[].hasInstance[]');
	const sortedInstances = getSortedInstances([...instances]);
	// set condition to perform search

	shouldFindRelations = instances.length <= 1;

	const images = getImages(mainEntity).map((i) => toSecure(i, env.AUXD_SECRET));
	const holdingsByInstanceId = getHoldingsByInstanceId(mainEntity);
	const holdingsByType = getHoldingsByType(mainEntity);
	const holdersByType = Object.entries(holdingsByType).reduce((acc, [type, holdings]) => {
		const heldBys = holdings.map((holdingItem) => holdingItem.heldBy);
		const uniqueHeldBys = [
			...new Map(heldBys.map((heldByItem) => [heldByItem['@id'], heldByItem])).values()
		];
		return { ...acc, [type]: uniqueHeldBys };
	}, {});

	return {
		type: mainEntity[JsonLd.TYPE],
		title: toString(heading),
		heading,
		overview: overviewWithoutHasInstance,
		details: displayUtil.lensAndFormat(mainEntity, LxlLens.PageDetails, locale),
		instances: sortedInstances,
		holdingsByInstanceId,
		holdersByType,
		full: overview,
		images,
		searchResult:
			shouldFindRelations && resourceId
				? // stream results on resource page when doing client side navigation
					// TODO: fix waterfall. fetch in parallel with rest of page data when SSR
					isDataRequest
					? getRelated()
					: await getRelated()
				: null
	};

	async function getRelated() {
		let searchParams = new URLSearchParams(url.searchParams.toString());

		if (resourceId) {
			searchParams.set('_o', resourceId);

			if (!searchParams.has('_i')) {
				searchParams.set('_i', '*');
			}
			searchParams = getSortedSearchParams(addDefaultSearchParams(searchParams));
		}

		let result = await fetchRelated(`${env.API_URL}/find.jsonld?${searchParams.toString()}`);

		// Go to first tab (predicate) if none selected
		if (searchParams.has('_o') && !searchParams.has('_p')) {
			const predicates = displayPredicates(result, displayUtil, locale, url.pathname);
			if (predicates.length > 0) {
				const queryParams = new URL(predicates[0].view['@id'], url).search;
				const fetchUrl = `${env.API_URL}/find.jsonld${queryParams}`;
				result = await fetchRelated(fetchUrl);
			} else {
				return null;
			}
		}

		// Hide zero results from resource page
		if (result.totalItems > 0) {
			return (await asResult(
				result,
				displayUtil,
				vocabUtil,
				locale,
				env.AUXD_SECRET,
				url.pathname
			)) as SearchResult;
		}
		return null;
	}

	async function fetchRelated(fetchUri: string) {
		const recordsRes = await fetch(fetchUri);

		if (!recordsRes.ok) {
			const err = (await recordsRes.json()) as ApiError;
			throw error(err.status_code, { message: err.message, status: err.status });
		}

		return (await recordsRes.json()) as PartialCollectionView;
	}
};

// TODO: handle titles correctly
function centerOnWork(mainEntity: FramedData): FramedData {
	if ('instanceOf' in mainEntity) {
		const result = mainEntity.instanceOf;
		delete mainEntity.instanceOf;
		result['@reverse'] = { instanceOf: [mainEntity] };
		if (!result.hasTitle && mainEntity.hasTitle) {
			result.hasTitle = mainEntity.hasTitle;
		}
		return result;
	} else {
		return mainEntity;
	}
}

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
