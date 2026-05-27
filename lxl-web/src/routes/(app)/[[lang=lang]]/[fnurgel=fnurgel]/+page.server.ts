import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import { getTranslator } from '$lib/i18n';
import * as v from 'valibot';

import {
	Bibframe,
	type DisplayDecorated,
	Fmt,
	type FramedData,
	JsonLd,
	LensType
} from '$lib/types/xl.js';
import { LxlLens } from '$lib/types/display';
import { type ApiError } from '$lib/types/api.js';
import type {
	PartialCollectionView,
	ResourceSearchResult,
	SearchResultItem
} from '$lib/types/search.js';
import type { TableOfContentsItem } from '$lib/components/TableOfContents.svelte';
import type { HoldingsData, HoldingItem } from '$lib/types/holdings.js';
import { type Relation } from '$lib/types/relations';

import { asArray, toString } from '$lib/utils/misc';
import { pickProperty, first } from '$lib/utils/xl.server';
import { bestImage, toSecure } from '$lib/utils/auxd.server';
import { getSortedInstances } from '$lib/utils/getSortedInstances.server';
import {
	getBibIdsByInstanceId,
	getHoldersByType,
	getHoldingLibraries,
	getHoldingsByInstanceId,
	getHoldingsByType
} from '$lib/utils/holdings.server';
import getTypeLike, { getTypeForIcon, toTypes } from '$lib/utils/getTypeLike.server';
import { centerOnWork } from '$lib/utils/centerOnWork.server';
import { getRelations } from '$lib/utils/relations.server';
import {
	appendMyLibrariesParam,
	asSearchResultItem,
	displayMappings
} from '$lib/utils/search.server';
import { getRefinedOrgs } from '$lib/utils/getRefinedOrgs.server';
import { getEodAvailable } from '$lib/utils/getEodAvailable.server';
import { getSearchResults } from '$lib/remotes/searchResult.remote';
import { SearchResultsSchema } from '$lib/schemas/searchResult';
import { copyMediaLinksToWork } from '$lib/utils/copyMediaLinksToWork.server';
import { getLibraryIdsFromMapping } from '$lib/utils/getLibraryIdsFromMapping.js';

export const load = async ({ params, locals, fetch, url }) => {
	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;
	const locale = getSupportedLocale(params?.lang);
	const translate = await getTranslator(locale);

	const subsetMapping = locals?.subsetMapping;
	const subsetLibraries = getLibraryIdsFromMapping([subsetMapping]) || undefined;
	const myLibraries = locals.userSettings?.myLibraries;

	let resourceId: null | string = null;
	const subsetFilter = url.searchParams.get('_r');
	const _q = url.searchParams.get('_q');

	const resourceRes = await fetch(`${env.API_URL}/${params.fnurgel}?framed=true&_findBlank=true`, {
		headers: { Accept: 'application/ld+json' }
	});

	if (resourceRes.status === 404) {
		throw error(resourceRes.status, { message: 'Not found' });
	}

	if (!resourceRes.ok) {
		let apiError: ApiError | undefined;
		try {
			apiError = (await resourceRes.json()) as ApiError;
		} catch (e) {
			console.warn(e);
		}
		throw error(apiError?.status_code || resourceRes.status, {
			message: apiError?.message || resourceRes.statusText,
			status: apiError?.status,
			...(apiError?.error_id && { errorId: apiError.error_id })
		});
	}

	const resource = await resourceRes.json();

	let workCard;
	let isWork = false;

	if (resource.mainEntity?.['@reverse']?.instanceOf) {
		isWork = true;
		// work - get card
		workCard = asSearchResultItem(
			[{ ...resource.mainEntity }],
			displayUtil,
			vocabUtil,
			locale,
			env.AUXD_SECRET,
			myLibraries
		)[0];
	} else if (resource.mainEntity.instanceOf) {
		// instance - fetch work card
		const workId = (resource.mainEntity.instanceOf[JsonLd.ID] || '').split('/').pop();
		if (workId) {
			const workRes = await fetch(`/api/${locale}/${workId}`);
			workCard = await workRes.json();
		}
	}

	const mainEntity = { ...centerOnWork(resource['mainEntity'] as FramedData) };
	if (isWork) {
		copyMediaLinksToWork(mainEntity);
	}

	resourceId = resource.mainEntity['@id'];

	const typeLike = getTypeLike(mainEntity, vocabUtil);
	const t = toTypes(typeLike);
	if (mainEntity['language']) {
		// FIXME: don't do this here
		t.language = mainEntity['language'];
	}
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

	const _instances = mainEntity?.[JsonLd.REVERSE]?.instanceOf || [];

	if (_instances.length == 1 && typeLike.select.length > 0) {
		_instances[0]['_select'] = typeLike.select;
	}

	const isWorkSingleInstance = _instances.length == 1;

	const headingThing = isWorkSingleInstance
		? (mainEntity[JsonLd.REVERSE]['instanceOf'][0] as FramedData)
		: mainEntity;

	const workTitle = isWorkSingleInstance
		? displayUtil.lensAndFormat(mainEntity, LxlLens.CardHeading, locale)
		: undefined;

	const heading = displayUtil.lensAndFormat(headingThing, LxlLens.PageHeading, locale);
	const hasWorkTitle = isWorkSingleInstance && toString(heading) !== toString(workTitle);

	const headingExtra = displayUtil.lensAndFormat(mainEntity, LensType.WebCardHeaderExtra, locale);
	const overview = [
		displayUtil.lensAndFormat(mainEntity, LensType.WebOverview, locale),
		...(_instances.length === 1
			? [displayUtil.lensAndFormat(_instances[0], LensType.WebOverview, locale)]
			: [])
	];
	const token = displayUtil.lensAndFormat(mainEntity, LensType.WebToken, locale);

	// TODO ...
	const _isWorkOrBibliography =
		vocabUtil.getType(mainEntity) == 'Work' ||
		vocabUtil.getType(mainEntity) == 'Bibliography' ||
		vocabUtil.isSubClassOf(vocabUtil.getType(mainEntity), 'Work');
	const overviewLens = _isWorkOrBibliography ? LensType.WebOverview2 : LxlLens.PageOverView;
	const overview2 = [
		displayUtil.lensAndFormat(mainEntity, overviewLens, locale),
		...(_instances?.length === 1
			? [displayUtil.lensAndFormat(_instances[0], overviewLens, locale)]
			: [])
	];

	const overviewFooter = {};

	const details = [
		displayUtil.lensAndFormat(mainEntity, LensType.WebDetails, locale),
		...(_instances.length === 1
			? [displayUtil.lensAndFormat(_instances[0], LensType.WebDetails, locale)]
			: []),
		displayUtil.lensAndFormat(resource, LensType.WebDetails, locale) // record
	];

	let searchResult: ResourceSearchResult | undefined;
	let instances: SearchResultItem[] = [];

	let itemInformation: {
		heldBy: DisplayDecorated;
		items: DisplayDecorated[];
	}[] = [];

	if (mainEntity?.[JsonLd.REVERSE]?.instanceOf?.length > 0) {
		const sortedInstances = getSortedInstances(mainEntity?.[JsonLd.REVERSE]?.instanceOf);
		sortedInstances.forEach(
			(i) => (i[Bibframe.instanceOf] = { [JsonLd.TYPE]: mainEntity[JsonLd.TYPE] })
		);
		instances = asSearchResultItem(
			sortedInstances,
			displayUtil,
			vocabUtil,
			locale,
			env.AUXD_SECRET,
			myLibraries,
			subsetLibraries
		);

		if (!isWork && sortedInstances.length === 1) {
			const items = sortedInstances[0]?.[JsonLd.REVERSE]?.itemOf ?? [];
			items.forEach((item: HoldingItem) => {
				const _item = { ...item };
				const component = _item?.hasComponent;
				delete _item.hasComponent;
				const allItems = component?.length ? [...component, _item] : [_item];

				itemInformation.push({
					heldBy: displayUtil.lensAndFormat(item?.heldBy, LensType.Chip, locale),
					items: allItems
						.map((i) => displayUtil.lensAndFormat(i, LensType.WebDetails, locale))
						.filter((i) => i[Fmt.DISPLAY].length)
				});
			});
		}
	}

	itemInformation = itemInformation.filter((i) => i.items.length);

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
				_q: _q || '',
				...(subsetFilter && { _r: subsetFilter }),
				_limit: '150',
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
		(relations || []).map(async (relation) => {
			const url = new URL(relation.previewUrl);
			const params = Object.fromEntries(url.searchParams);

			if (v.is(SearchResultsSchema, params)) {
				const preview = await getSearchResults(params);
				return preview;
			}
		})
	);
	const relationsPreviewsByQualifierKey = (relations || []).reduce(
		(acc, currentRelation, relationIndex) => {
			return {
				...acc,
				[currentRelation.qualifierKey]: relationsPreviews?.[relationIndex]?.items
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
		...(relations?.length
			? [
					{
						id: 'relations',
						label: translate('resource.relations'),
						children: relations.map((relationItem) => ({
							id: `relations-${relationItem.qualifierKey}`, // all ids should  be prefixed in +page.svelte
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
		...(details.length && details.some((d) => d[Fmt.DISPLAY] && d[Fmt.DISPLAY].length > 0)
			? [
					{
						id: 'details',
						label: translate('resource.details')
					}
				]
			: [])
	];

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, overviewWithoutHasInstance] = pickProperty(overview[0], ['hasInstance']);

	const image = toSecure(bestImage(mainEntity, locale), env.AUXD_SECRET);
	const holdingsByType = getHoldingsByType(mainEntity);
	const byType = getHoldersByType(holdingsByType);

	const holdings: HoldingsData = {
		byInstanceId: getHoldingsByInstanceId(mainEntity, displayUtil, locale),
		byType,
		bibIdData: getBibIdsByInstanceId(mainEntity, displayUtil, resource, locale),
		holdingLibraries: getHoldingLibraries(byType),
		eodAvailable: null
	};

	holdings.eodAvailable = getEodAvailable(_instances, holdings.holdingLibraries);

	const refinedOrgs = getRefinedOrgs(myLibraries, [subsetMapping, searchResult?.mapping]);

	return {
		uri: resourceId,
		recordUri: resource['@id'] as string,
		controlNumber: resource['controlNumber'] as string,
		type: mainEntity[JsonLd.TYPE] as string,
		typeForIcon: getTypeForIcon(typeLike), // FIXME
		title: toString(heading),
		relations,
		relationsPreviewsByQualifierKey,
		instances,
		decoratedData: {
			headingTop: types,
			heading: heading,
			headingExtra: headingExtra,
			...(hasWorkTitle && { _workTitle2: workTitle }),
			overview: overview,
			overview2: overview2,
			overviewFooter: overviewFooter,
			summary: summary,
			resourceTableOfContents: resourceTableOfContents,
			details: details,
			token: token,
			itemInformation
		},
		searchResult,
		holdings,
		image,
		tableOfContents,
		workCard,
		refinedOrgs,
		isWork
	};
};
