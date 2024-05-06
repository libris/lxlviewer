import { redirect, error } from '@sveltejs/kit';
import jmespath from 'jmespath';
import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales.js';

import { type FramedData, DisplayUtil, pickProperty, toString, JsonLd } from '$lib/utils/xl.js';
import { LxlLens } from '$lib/utils/display.types.js';
import { relativizeUrl } from '$lib/utils/http';
import { getImages, toSecure } from '$lib/utils/auxd';
import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams.js';
import getSortedSearchParams from '$lib/utils/getSortedSearchParams.js';
import { type apiError } from '$lib/types/API.js';
import { asResult, type PartialCollectionView, type SearchResult } from './search.js';
import getAtPath from '$lib/utils/getAtPath';

export const load = async ({ params, url, locals, fetch, isDataRequest }) => {
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

		resourceParts = {
			type: mainEntity[JsonLd.TYPE],
			title: toString(heading),
			heading,
			overview: overviewWithoutHasInstance,
			details: displayUtil.lensAndFormat(mainEntity, LxlLens.PageDetails, locale),
			instances: sortedInstances,
			holdingsByInstanceId,
			holdersByType,
			full: overview,
			images
		};
	}

	const searchResult = isFindRoute || shouldFindRelations ? getSearchResult() : null;
	async function getSearchResult() {
		if (isFindRoute && !url.searchParams.size) {
			redirect(303, `/`); // redirect to home page if no search params are given
		}

		let searchParams = new URLSearchParams(url.searchParams.toString());

		if (shouldFindRelations && resourceId) {
			searchParams.set('_o', resourceId);
			searchParams.set('_i', '*');
			searchParams = getSortedSearchParams(addDefaultSearchParams(searchParams));
		}

		const recordsRes = await fetch(`${env.API_URL}/find.jsonld?${searchParams.toString()}`, {
			// intercept 3xx redirects to sync back the correct _i/_q combination provided by api
			redirect: 'manual'
		});

		if (!recordsRes.ok) {
			if (recordsRes.status > 299 && recordsRes.status < 400) {
				// redirect from api -> redirect in app
				const location = recordsRes.headers.get('location');
				const url = location && new URL(location);
				if (url) {
					console.log('redirecting to', `${url.pathname}${url.search}`);
					redirect(recordsRes.status, `${url.pathname}${url.search}`);
				}
			} else {
				const err = (await recordsRes.json()) as apiError;
				throw error(err.status_code, err.status);
			}
		}

		const result = (await recordsRes.json()) as PartialCollectionView;

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

function sortHoldings(holdings) {
	return [...holdings].sort((a, b) => {
		if (a?.heldBy?.name < b?.heldBy?.name) {
			return -1;
		}
		if (a?.heldBy?.name > b?.heldBy?.name) {
			return 1;
		}
		return 0;
	});
}

function getHoldingsByInstanceId(mainEntity) {
	return mainEntity['@reverse']?.instanceOf?.reduce((acc, instanceOfItem) => {
		const id = relativizeUrl(instanceOfItem['@id'])?.replace('#it', '');
		if (!id) {
			return acc;
		}
		return {
			...acc,
			[id]: sortHoldings(instanceOfItem?.['@reverse']?.itemOf || [])
		};
	}, {});
}

function getHoldingsByType(mainEntity: FramedData) {
	const holdingsByType = mainEntity['@reverse']?.instanceOf?.reduce((acc, instanceOfItem) => {
		const type = instanceOfItem['@type'];
		return {
			...acc,
			[type]: [...(acc[type] || []), ...(instanceOfItem?.['@reverse']?.itemOf || [])]
		};
	}, {});
	if (!holdingsByType) {
		return {};
	}
	const sortedHoldingsByType = Object.entries(holdingsByType).reduce((acc, [type, holdings]) => {
		return {
			...acc,
			[type]: sortHoldings(holdings)
		};
	}, {});
	return sortedHoldingsByType;
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

function asArray<V>(v: V | Array<V>): Array<V> | [] {
	return Array.isArray(v) ? v : v === null || v === undefined ? [] : [v];
}
