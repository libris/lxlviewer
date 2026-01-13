import { error } from '@sveltejs/kit';
import jmespath from 'jmespath';
import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import { getTranslator } from '$lib/i18n';

import { Bibframe, type FramedData, JsonLd, LensType } from '$lib/types/xl.js';
import { LxlLens } from '$lib/types/display';
import { type ApiError } from '$lib/types/api.js';
import type { PartialCollectionView, ResourceSearchResult } from '$lib/types/search.js';
import type { TableOfContentsItem } from '$lib/components/TableOfContents.svelte';
import type { HoldingsData } from '$lib/types/holdings.js';

import { asArray, first, pickProperty, toString } from '$lib/utils/xl.js';
import { getImages, toSecure } from '$lib/utils/auxd';
import getAtPath from '$lib/utils/getAtPath';
import {
	getBibIdsByInstanceId,
	getHoldersByType,
	getHoldingLibraries,
	getHoldingsByInstanceId,
	getHoldingsByType
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

	const mainEntityCopy = { ...mainEntity };
	mainEntityCopy.meta = { [JsonLd.ID]: mainEntity[JsonLd.ID] };

	const workCard = asSearchResultItem(
		[mainEntityCopy],
		displayUtil,
		vocabUtil,
		locale,
		env.AUXD_SECRET,
		myLibraries,
		undefined
	)[0];

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

	const _instances = mainEntity?.['@reverse']?.instanceOf || [];

	const heading = displayUtil.lensAndFormat(mainEntity, LxlLens.PageHeading, locale);
	const headingExtra = displayUtil.lensAndFormat(mainEntity, LensType.WebCardHeaderExtra, locale);
	const overview = [
		displayUtil.lensAndFormat(mainEntity, LensType.WebOverview, locale),
		...(_instances.length === 1
			? [displayUtil.lensAndFormat(_instances[0], LensType.WebOverview, locale)]
			: [])
	];

	// TODO ...
	const isWork =
		vocabUtil.getType(mainEntity) == 'Work' ||
		vocabUtil.isSubClassOf(vocabUtil.getType(mainEntity), 'Work');
	const overviewLens = isWork ? LensType.WebOverview2 : LxlLens.PageOverView;
	const overview2 = [
		displayUtil.lensAndFormat(mainEntity, overviewLens, locale),
		...(_instances.length === 1
			? [displayUtil.lensAndFormat(_instances[0], overviewLens, locale)]
			: [])
	];

	const details = [
		displayUtil.lensAndFormat(mainEntity, LensType.WebDetails, locale),
		...(_instances.length === 1
			? [displayUtil.lensAndFormat(_instances[0], LensType.WebDetails, locale)]
			: [])
	];

	let searchResult: ResourceSearchResult | undefined;
	let instances;
	if (mainEntity?.['@reverse']?.instanceOf?.length > 0) {
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

	const creations = [mainEntity].concat(mainEntity?.['@reverse']?.instanceOf || []);
	const summary = creations
		.filter((c: FramedData) => c[Bibframe.summary])
		.map((c: FramedData) => ({
			[JsonLd.TYPE]: c[JsonLd.TYPE],
			...(creations.length > 2 ? { [Bibframe.publication]: c[Bibframe.publication] } : {}),
			[Bibframe.summary]: c[Bibframe.summary]
		}))
		// FIXME Don't use SearchCard lens - support ad-hoc lenses?
		.map((c: FramedData) => displayUtil.lensAndFormat(c, LensType.SearchCard, locale));

	const resourceTableOfContents = creations
		.filter((c: FramedData) => c[Bibframe.tableOfContents])

		.map((c: FramedData) => ({
			[JsonLd.TYPE]: c[JsonLd.TYPE],
			...(creations.length > 2 ? { [Bibframe.publication]: c[Bibframe.publication] } : {}),
			[Bibframe.tableOfContents]: c[Bibframe.tableOfContents]
		}))
		// FIXME Don't use SearchCard lens - support ad-hoc lenses?
		.map((c: FramedData) => displayUtil.lensAndFormat(c, LensType.SearchCard, locale));

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
		...(summary.length
			? [
					{
						id: 'summary',
						label: translate('resource.summary')
					}
				]
			: []),
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
		...(resourceTableOfContents.length
			? [
					{
						id: 'resourceTableOfContents',
						label: translate('resource.tableOfContents')
					}
				]
			: []),
		{
			id: 'details',
			label: translate('resource.details')
		}
	];

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, overviewWithoutHasInstance] = pickProperty(overview[0], ['hasInstance']);

	const images = getImages(mainEntity, locale).map((i) => toSecure(i, env.AUXD_SECRET));
	const holdingsByType = getHoldingsByType(mainEntity);
	const byType = getHoldersByType(holdingsByType);

	const holdings: HoldingsData = {
		byInstanceId: getHoldingsByInstanceId(mainEntity),
		byType,
		bibIdData: getBibIdsByInstanceId(mainEntity, displayUtil, resource, locale),
		holdingLibraries: getHoldingLibraries(byType)
	};

	const subsetMapping = locals?.subsetMapping;
	const refinedOrgs = getRefinedOrgs(myLibraries, [subsetMapping, searchResult?.mapping]);

	return {
		uri: resourceId,
		recordUri: resource['@id'] as string,
		controlNumber: resource['controlNumber'] as string,
		type: mainEntity[JsonLd.TYPE],
		typeForIcon: getTypeForIcon(typeLike), // FIXME
		title: toString(heading),
		relations,
		relationsPreviewsByQualifierKey,
		instances,
		decoratedData: {
			headingTop: types,
			heading: heading,
			headingExtra: headingExtra,
			overview: overview,
			overview2: overview2,
			overviewFooter: {},
			summary: summary,
			resourceTableOfContents: resourceTableOfContents,
			details: details
		},
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
