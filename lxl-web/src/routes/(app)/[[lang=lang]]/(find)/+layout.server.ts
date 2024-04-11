import { redirect, error } from '@sveltejs/kit';
import jmespath from 'jmespath';
import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import { getTranslator } from '$lib/i18n/index.js';
import { type FramedData, DisplayUtil, pickProperty } from '$lib/utils/xl.js';
import { LxlLens } from '$lib/utils/display.types.js';
import { getImageLinks, generateAuxdImageUri, calculateExpirationTime } from '$lib/utils/auxd';
import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams.js';
import { type apiError } from '$lib/types/API.js';
import { asResult, type PartialCollectionView, type SearchResult } from './search.js';

export const load = async ({ params, url, locals, fetch, isDataRequest }) => {
	const displayUtil: DisplayUtil = locals.display;
	const locale = getSupportedLocale(params?.lang);

	const isResourceRoute = !!params.fnurgel;
	const isFindRoute = url.pathname === '/find';
	let resourceParts = {};
	let searchResult: SearchResult | null = null;
	let shouldFindRelations, resourceId;

	// If product page, get the resource
	if (isResourceRoute) {
		const resourceRes = await fetch(`${env.API_URL}/${params.fnurgel}?framed=true`, {
			headers: { Accept: 'application/ld+json' }
		});

		if (!resourceRes.ok) {
			const err = (await resourceRes.json()) as apiError;
			// Todo better error handling
			throw error(err.status_code, err.status);
		}

		const resource = await resourceRes.json();
		const mainEntity = centerOnWork(resource['mainEntity'] as FramedData);
		resourceId = resource.mainEntity['@id']; // can we rely on this???

		const overview = displayUtil.lensAndFormat(mainEntity, LxlLens.PageOverView, locale);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_, overviewWithoutHasInstance] = pickProperty(overview, ['hasInstance']);

		// TODO: Replace with a custom getProperty method (similar to pickProperty)
		const instances = jmespath.search(overview, '*[].hasInstance[]');

		// set condition to perform search
		shouldFindRelations = instances.length <= 1; // correct??

		const sortedInstances = [...instances].sort((a, b) => {
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

		const imageUris = getImageLinks(mainEntity).map((idAndLink) => {
			return {
				recordId: idAndLink.recordId,
				imageUri: generateAuxdImageUri(
					calculateExpirationTime(),
					idAndLink.imageLink,
					env.AUXD_SECRET
				)
			};
		});

		resourceParts = {
			heading: displayUtil.lensAndFormat(mainEntity, LxlLens.PageHeading, locale),
			overview: overviewWithoutHasInstance,
			details: displayUtil.lensAndFormat(mainEntity, LxlLens.PageDetails, locale),
			instances: sortedInstances,
			full: overview,
			imageUris: imageUris
		};
	}

	// perform search
	if (isFindRoute || shouldFindRelations) {
		if (isFindRoute && !url.searchParams.size) {
			redirect(303, `/`); // redirect to home page if no search params are given
		}

		let params = new URLSearchParams(url.searchParams.toString());

		if (shouldFindRelations) {
			params = addDefaultSearchParams(params);
			params.set('o', resourceId);
		}

		const recordsRes = await fetch(`${env.API_URL}/find.jsonld?${params.toString()}`);

		if (!recordsRes.ok) {
			const err = (await recordsRes.json()) as apiError;
			// TODO handdle error with promise reject
			throw error(err.status_code, err.status);
		}

		const result = (await recordsRes.json()) as PartialCollectionView;
		const translator = await getTranslator(locale); // move to search.ts?
		searchResult = await asResult(result, displayUtil, locale, translator, env.AUXD_SECRET);
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
