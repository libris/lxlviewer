import { redirect, error } from '@sveltejs/kit';
import jmespath from 'jmespath';
import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import { type FramedData, DisplayUtil, pickProperty } from '$lib/utils/xl.js';
import { LxlLens } from '$lib/utils/display.types.js';
import { relativizeUrl } from '$lib/utils/http';
import { calculateExpirationTime, generateAuxdImageUri, getImageLinks } from '$lib/utils/auxd';
import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams.js';
import getSortedSearchParams from '$lib/utils/getSortedSearchParams.js';
import { type apiError } from '$lib/types/API.js';
import { asResult, type PartialCollectionView, type SearchResult } from './search.js';
import getAtPath from '$lib/utils/getAtPath';

let cachedSearchResult: null | PartialCollectionView = null;

export const load = async ({ params, url, locals, fetch, isDataRequest }) => {
	console.log('has cache', !!cachedSearchResult);
	const displayUtil: DisplayUtil = locals.display;
	const locale = getSupportedLocale(params?.lang);

	const isResourceRoute = !!params.fnurgel;
	const isFindRoute = url.pathname.endsWith('/find');
	let resourceParts = {};
	let shouldFindRelations = false;
	let resourceId: null | string = null;

	// If product page, get the resource
	if (isResourceRoute) {
		const resourceRes = await fetch(`${env.API_URL}/${params.fnurgel}?framed=true`, {
			headers: { Accept: 'application/ld+json' }
		});

		if (!resourceRes.ok) {
			const err = (await resourceRes.json()) as apiError;
			throw error(err.status_code, err.status);
		}

		const resource = await resourceRes.json();
		const mainEntity = centerOnWork(resource['mainEntity'] as FramedData);
		copyMediaLinksToWork(mainEntity);

		resourceId = resource.mainEntity['@id'];
		const overview = displayUtil.lensAndFormat(mainEntity, LxlLens.PageOverView, locale);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_, overviewWithoutHasInstance] = pickProperty(overview, ['hasInstance']);
		// TODO: Replace with a custom getProperty method (similar to pickProperty)
		const instances = jmespath.search(overview, '*[].hasInstance[]');
		const sortedInstances = getSortedInstances([...instances]);
		// set condition to perform search

		shouldFindRelations = instances.length <= 1;

		const images = getImageUris(getImageLinks(mainEntity));
		const holdingsByInstanceId = getHoldingsByInstanceId(mainEntity);

		resourceParts = {
			heading: displayUtil.lensAndFormat(mainEntity, LxlLens.PageHeading, locale),
			overview: overviewWithoutHasInstance,
			details: displayUtil.lensAndFormat(mainEntity, LxlLens.PageDetails, locale),
			instances: sortedInstances,
			holdingsByInstanceId,
			full: overview,
			images
		};
	}

	const searchResult = isFindRoute || shouldFindRelations ? getSearchResult() : null;
	async function getSearchResult() {
		if (isFindRoute && !url.searchParams.size) {
			redirect(303, `/`); // redirect to home page if no search params are given
		}

		let result;

		if (cachedSearchResult && cachedSearchResult['@id'] === `/find${url.search}`) {
			// we have a cached result with matching query
			console.log('picking up from cache');
			result = cachedSearchResult;
			cachedSearchResult = null;
		} else {
			let searchParams = new URLSearchParams(url.searchParams.toString());

			if (shouldFindRelations && resourceId) {
				searchParams.set('_o', resourceId);
				searchParams = getSortedSearchParams(addDefaultSearchParams(searchParams));
			}

			console.log('fetching', searchParams.toString());
			const recordsRes = await fetch(`${env.API_URL}/find.jsonld?${searchParams.toString()}`);

			if (!recordsRes.ok) {
				const err = (await recordsRes.json()) as apiError;
				throw error(err.status_code, err.status);
			}

			result = (await recordsRes.json()) as PartialCollectionView;
		}

		console.log(
			'matching',
			result['@id'],
			`/find${url.search}`,
			result['@id'] === `/find${url.search}`
		);

		if (isFindRoute && `/find${url.search}` !== result['@id']) {
			// recieved a redirected api response
			// redirect and cache response for next load
			cachedSearchResult = result;
			console.log('redirecting');
			redirect(308, result['@id']);
		}

		// Hide zero results from resource page
		if (result.totalItems > 0 || isFindRoute) {
			const pathname = params.lang ? url.pathname.replace(`/${params.lang}`, '') : url.pathname;
			return (await asResult(
				result,
				displayUtil,
				locale,
				env.AUXD_SECRET,
				pathname
			)) as SearchResult;
		}
		return null;
	}

	return {
		...resourceParts,
		// waits for data on initial page load, streams in on client side navigation
		searchResult: isDataRequest && isResourceRoute ? searchResult : await searchResult
	};
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

function getImageUris(imageLinks: { recordId: string; imageLink: string }[]) {
	return imageLinks
		.map((idAndLink) => {
			return {
				recordId: idAndLink.recordId,
				imageUri: generateAuxdImageUri(
					calculateExpirationTime(),
					idAndLink.imageLink,
					env.AUXD_SECRET
				)
			};
		})
		.filter((image) => image.imageUri !== '');
}

function getHoldingsByInstanceId(mainEntity) {
	return mainEntity['@reverse']?.instanceOf?.reduce((acc, instanceOfItem) => {
		const id = relativizeUrl(instanceOfItem['@id'])?.replace('#it', '');
		if (!id) {
			return acc;
		}
		const sortedHoldings = [...(instanceOfItem?.['@reverse']?.itemOf || [])].sort((a, b) => {
			if (a?.heldBy?.name < b?.heldBy?.name) {
				return -1;
			}
			if (a?.heldBy?.name > b?.heldBy?.name) {
				return 1;
			}
			return 0;
		});
		return {
			...acc,
			[id]: sortedHoldings
		};
	}, {});
}

function copyMediaLinksToWork(mainEntity: FramedData) {
	const cp = (thing: FramedData, fromPath: (string | number | object)[], toProp: string) => {
		const v = getAtPath(thing, fromPath);
		if (v.length > 0) {
			thing[toProp] = asArray(thing[toProp]).concat(v);
		}
	};
	cp(mainEntity, ['@reverse', 'instanceOf', '*', 'associatedMedia', '*'], 'associatedMedia');
	cp(mainEntity, ['@reverse', 'instanceOf', '*', 'isPrimaryTopicOf', '*'], 'isPrimaryTopicOf');
}

function asArray<V>(v: V | Array<V>): Array<V> | [] {
	return Array.isArray(v) ? v : v === null || v === undefined ? [] : [v];
}
