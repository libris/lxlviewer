import { env } from '$env/dynamic/private';
import { type DisplayDecorated, DisplayUtil, type FramedData, pickProperty } from '$lib/utils/xl';
import {
	calculateExpirationTime,
	generateAuxdImageUri,
	getImageLinks,
	getFirstImageUri
} from '$lib/utils/auxd';
import { getSupportedLocale } from '$lib/i18n/locales';
import { LxlLens } from '$lib/utils/display.types';
import jmespath from 'jmespath';
import type { PartialCollectionView } from '../find/search.js';
import type { apiError } from '$lib/types/API.js';
import { getTranslator } from '$lib/i18n/index.js';
import { asResult } from '../find/search.js';

export interface ResourcePage {
	header: DisplayDecorated;
	overview: DisplayDecorated;
	details: DisplayDecorated;
}

export const load = async ({ params, locals, fetch, isDataRequest }) => {
	const displayUtil: DisplayUtil = locals.display;
	//const vocabUtil: VocabUtil = locals.vocab;

	const locale = getSupportedLocale(params?.lang);

	const resourceRes = await fetch(`${env.API_URL}/${params.fnurgel}?framed=true`, {
		headers: { Accept: 'application/ld+json' }
	});
	const resource = await resourceRes.json();
	const mainEntity = centerOnWork(resource['mainEntity'] as FramedData);

	// TODO this doesn't really play well with alternativeProperties...?
	// say we want to use alternativeProperties for hasTitle in the heading
	// "alternateProperties": [
	//	 {"subPropertyOf": "hasTitle", "range": "KeyTitle"},
	//	 {"subPropertyOf": "hasTitle", "range": "Title"},
	// 	 "hasTitle"
	// ]
	// we then probably want all titles in the overview
	// but we don't want them there when there is only one title?
	// or just place "hasTitle" (without alternateProperties) in details?

	const overview = displayUtil.lensAndFormat(mainEntity, LxlLens.PageOverView, locale);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, overviewWithoutHasInstance] = pickProperty(overview, ['hasInstance']);

	// TODO: Replace with a custom getProperty method (similar to pickProperty)
	const instances = jmespath.search(overview, '*[].hasInstance[]');

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
	// move me

	const relations = instances.length > 1 ? false : getRelations();

	async function getRelations() {
		const query = {
			_limit: '20',
			'not-@type': 'Item',
			'@type': 'Work',
			o: overview['@id'] + '#it',
			_sort: `_sortKeyByLang.${locale}`
		};

		const searchParams = new URLSearchParams(query).toString();
		// const id = encodeURIComponent(overview['@id'] + '#it')
		// const recordsRes = await fetch(`${env.API_URL}/find.jsonld?_limit=20&o=${encodeURIComponent(overview['@id'] + '#it')}`);
		const recordsRes = await fetch(`${env.API_URL}/find.jsonld?${searchParams}`);
		if (!recordsRes.ok) {
			const err = (await recordsRes.json()) as apiError;
			return Promise.reject(err);
		} else {
			const result = (await recordsRes.json()) as PartialCollectionView;
			const displayUtil: DisplayUtil = locals.display;
			const translator = await getTranslator(locale);
			const searchResult = await asResult(result, displayUtil, locale, translator);
			return searchResult;
		}
		// await delay(2000);
		// return 'o search here';
	}
	//

	return {
		heading: displayUtil.lensAndFormat(mainEntity, LxlLens.PageHeading, locale),
		overview: overviewWithoutHasInstance,
		details: displayUtil.lensAndFormat(mainEntity, LxlLens.PageDetails, locale),
		instances: sortedInstances,
		full: overview,
		imageUris: imageUris,
		firstImageUri: getFirstImageUri(imageUris),
		// waits for data on initial page load, streams in on client side navigation
		relations: isDataRequest ? relations : await relations
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
