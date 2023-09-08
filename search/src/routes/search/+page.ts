import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_PATH } from '$env/static/public';
import getFnurgelFromUri from '$lib/utils/getFnurgelFromUri';
import type { PageLoad } from './$types';
import getRecordContributions from '$lib/utils/getRecordContributions';
import propertyChains from '$lib/assets/json/propertyChains.json';

export const load = (async ({ fetch, url, parent }) => {
	if (!url.searchParams.size) {
		throw redirect(303, `/`); // redirect to home page if no search params are given
	}

	const res = await fetch(`${PUBLIC_API_PATH}/find.jsonld?${url.searchParams.toString()}`);
	const records = await res.json();

	const { displayUtil, resources } = await parent();

	const items = records.items.map((item) => ({
		id: item['@id'],
		fnurgel: getFnurgelFromUri(item['@id']),
		title: displayUtil.getItemLabel(item.hasTitle?.[0]), // should we use chip here? Linking to contributors won't be possible if we only get strings in return...,
		contributions: getRecordContributions(item, resources),
		languages: item.language?.map((lang) => displayUtil.getItemLabel(lang))
	}));

	const selectedFacets = records.search.mapping
		.filter((mapping) => mapping.variable !== 'q' && mapping.object?.['@id'] !== 'Work')
		.map((mapping) => {
			return {
				id: mapping.variable,
				label:
					mapping.value ||
					displayUtil.getItemLabel(mapping?.object).replace('https://id.kb.se/', ''),
				groupLabel: mapping.variable, // TODO: language should'nt be hardcoded
				link: mapping?.up?.['@id'].replace('/find?', '/search?')
			};
		});

	const facetGroups = records?.stats
		? Object.keys(records.stats?.sliceByDimension).map((key) => {
				const group = records.stats?.sliceByDimension[key];
				return {
					id: group.dimension,
					label: propertyChains[group.dimension].sv,
					items: group.observation.map((observation) => {
						return {
							id: observation.view?.['@id'],
							label: displayUtil.getItemLabel(observation.object).replace('https://id.kb.se/', ''),
							link: observation.view?.['@id'].replace('/find?', '/search?'),
							totalItems: observation.totalItems
						};
					})
				};
		  })
		: null;

	return {
		items,
		totalItems: records.totalItems,
		offset: records.offset,
		selectedFacets,
		facetGroups
	};
}) satisfies PageLoad;
