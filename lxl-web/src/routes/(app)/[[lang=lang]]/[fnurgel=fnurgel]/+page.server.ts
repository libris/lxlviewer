import { error } from '@sveltejs/kit';
import jmespath from 'jmespath';
import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales.js';

import { type FramedData, JsonLd, LensType } from '$lib/types/xl.js';
import { LxlLens } from '$lib/types/display';
import { type ApiError } from '$lib/types/api.js';
import type { PartialCollectionView, SearchResult } from '$lib/types/search.js';

import { pickProperty, toString, asArray } from '$lib/utils/xl.js';
import { getImages, toSecure } from '$lib/utils/auxd';
import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams.js';
import getSortedSearchParams from '$lib/utils/getSortedSearchParams.js';
import { asResult, displayPredicates } from '$lib/utils/search';
import getAtPath from '$lib/utils/getAtPath';
import {
	getHoldingsByInstanceId,
	getHoldingsByType,
	getHoldersByType
} from '$lib/utils/holdings.js';
import { DebugFlags } from '$lib/types/userSettings';
import { holdersCache } from '$lib/utils/holdersCache.svelte.js';
import getTypeLike from '$lib/utils/getTypeLike';
import { getUriSlug } from '$lib/utils/http';

export const load = async ({ params, url, locals, fetch }) => {
	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;
	const locale = getSupportedLocale(params?.lang);

	let resourceId: null | string = null;
	let searchPromise: Promise<SearchResult | null> | null = null;

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
	// TODO: Replace with a custom getProperty method (similar to pickProperty)
	const instances = jmespath.search(overview, '*[].hasInstance[]');

	if (resourceId && instances.length <= 1) {
		searchPromise = getRelated();
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, overviewWithoutHasInstance] = pickProperty(overview, ['hasInstance']);
	const sortedInstances = getSortedInstances([...instances]);

	const images = getImages(mainEntity, locale).map((i) => toSecure(i, env.AUXD_SECRET));
	const holdingsByInstanceId = getHoldingsByInstanceId(mainEntity, displayUtil, locale);
	const holdingsByType = getHoldingsByType(mainEntity);
	const holdersByType = getHoldersByType(holdingsByType, displayUtil, locale);

	if (holdersCache.holders) {
		console.log('Current number of cached holders:', Object.keys(holdersCache.holders).length);
	}
	console.log('holdersByType', holdersByType);
	return {
		workFnurgel: getUriSlug(resourceId || undefined),
		type: mainEntity[JsonLd.TYPE],
		types: types,
		title: toString(heading),
		heading,
		overview: overviewWithoutHasInstance,
		instances: sortedInstances,
		holdingsByInstanceId,
		holdersByType,
		images,
		searchResult: searchPromise ? await searchPromise : null
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

		const debug = locals.userSettings?.debug?.includes(DebugFlags.ES_SCORE)
			? '&_debug=esScore'
			: '';

		let result = await fetchRelated(
			`${env.API_URL}/find.jsonld?${searchParams.toString()}${debug}`
		);

		// Go to first tab (predicate) if none selected
		if (searchParams.has('_o') && !searchParams.has('_p')) {
			const predicates = displayPredicates(result, displayUtil, locale, url.pathname);
			if (predicates.length > 0) {
				const queryParams = new URL(predicates[0].view['@id'], url).search;
				const fetchUrl = `${env.API_URL}/find.jsonld${queryParams}${debug}`;
				result = await fetchRelated(fetchUrl);
			} else {
				return null;
			}
		}

		if (result) {
			return (await asResult(
				result,
				displayUtil,
				vocabUtil,
				locale,
				env.AUXD_SECRET,
				url.pathname,
				locals.userSettings?.myLibraries
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
