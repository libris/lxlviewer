import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import BOOLEAN_QUALIFIERS from '$lib/constants/booleanQualifiers';
import type { AutocompleteSuggestion } from '$lib/types/autocomplete';
import { env } from '$env/dynamic/private';
import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
import getSortedSearchParams from '$lib/utils/getSortedSearchParams';
import { type PartialCollectionView } from '../../../../_tempRoutes/(app)/[[lang=lang]]/(find)/search';
import { relativizeUrl } from '$lib/utils/http';
import { LxlLens } from '$lib/utils/display.types';

/** TODO:
 * Search by property key if exists in the beginning of the part
 */

const booleanQualifiersWithSuggestionType = BOOLEAN_QUALIFIERS.map((item) => ({
	...item,
	'@type': 'boolean' // should we hardcode boolean type like this?
}));

console.log('booleanQualifiersWithSuggestionType', booleanQualifiersWithSuggestionType);

export const GET: RequestHandler = async ({ url, params, fetch, locals }) => {
	const displayUtil = locals.display;
	const lang = params.lang || 'sv';

	const q = url.searchParams.get('_q');
	if (!q) {
		return error(400, 'Missing _q param value');
	}

	const editedRange = url.searchParams
		.get('editedRange')
		?.split(',')
		.map((n) => parseInt(n, 10));
	if (!editedRange || editedRange.some(isNaN)) {
		return error(400, 'Invalid editedRange param value');
	}

	const editedRangeValue = q.slice(editedRange[0], editedRange[1]);
	const qualifier = editedRangeValue.match(
		/^(?<!\S+)([0-9a-zA-ZaåöAÅÖ]+):((")?[0-9a-zA-ZaåöAÅÖ:]+\3?)/
	);

	if (qualifier) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const [_, name, value] = qualifier;
		console.log('name', name, 'value', value);

		// 1. first check if valid qualifier name!
		// 2. check range and/or rangesInclude and search on these as type! (kanske även domainIncludes)
		// 3. BOOYAH!

		const qualifiedSearchParams = getSortedSearchParams(
			addDefaultSearchParams(new URLSearchParams())
		);

		qualifiedSearchParams.set(`exists-${value}`, 'true'); // should we encodeURI?
		qualifiedSearchParams.set('_q', value || '*');

		console.log('qualifiedSearchParams', qualifiedSearchParams);
		const qualifiedRecordsRes = await fetch(
			`${env.API_URL}/find.jsonld?${qualifiedSearchParams.toString()}`
		);
		const qualifiedRecords = (await qualifiedRecordsRes.json()) as PartialCollectionView;

		const processedQualifiedRecords: AutocompleteSuggestion[] = qualifiedRecords.items?.map(
			(item) => {
				const relativeId = relativizeUrl(item['@id'] as string)?.replace('#it', '');

				return {
					'@id': item['@id'] as string,
					'@type': item['@type'] as string,
					label: displayUtil.lensAndFormat(item, LxlLens.CardHeading, lang),
					description: 'description',
					replacement: `${name}:${relativeId}`
				};
			}
		);

		//console.log('processedQualifiedRecords', processedQualifiedRecords)
		return json(processedQualifiedRecords);
	}

	return json({ qualifier });
};

/*
	const key =
				item?.isDefinedBy?.['@id'] === 'https://id.kb.se/vocab/' ||
				item?.['@id'].includes('https://id.kb.se/marc/') // unsure if we should treat marc the same as vocab...
					? item?.['@id'].split('/').pop() // use last part of id if part of base vocabulary
					: item['@id'];
					*/
