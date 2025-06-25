import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.ts';
import type { SuperSearchResult } from '$lib/types/search.js';
import { getSupportedLocale } from '$lib/i18n/locales.js';
// import getEditedPartEntries from './getEditedPartEntries.js';
// import getEditedRanges from './getEditedRanges.js';
import insertWildcard from './insertWildcard.js';
import { asResult } from '$lib/utils/search.js';
import { DebugFlags } from '$lib/types/userSettings.js';
import itemAsQualifiers from './itemAsQualifiers.js';

/**
 * TODO:
 * - Investigate how we should also send the full query if we wish to boost faceted results.
 * - Investigate if we also should do a separate query for the last edited word – and not only the whole phrase (e.g. should we show a result for the subject `winter` when entering `astrid lindgren winter`?)
 */

export const GET: RequestHandler = async ({ url, params, locals }) => {
	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;
	const locale = getSupportedLocale(params?.lang);

	const _q = url.searchParams.get('_q') || '';
	const cursor = parseInt(url.searchParams.get('cursor') || '0', 10);

	const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);

	// alter query based on edited part
	// const editedPartEntries = getEditedPartEntries(_q, cursor, editedRanges);
	// editedPartEntries.forEach(([key, value]) => newSearchParams.set(key, value));

	if (locals.userSettings?.debug?.includes(DebugFlags.ES_SCORE)) {
		newSearchParams.set('_debug', 'esScore');
	}

	newSearchParams.set('_suggest', 'true');

	const withWildcard = insertWildcard(_q, cursor);
	newSearchParams.set('_q', withWildcard.query);
	newSearchParams.set('cursor', withWildcard.cursor.toString());

	console.log('Initial search params:', decodeURIComponent(url.searchParams.toString()));
	console.log('Search params sent to /find:', decodeURIComponent(newSearchParams.toString()));

	const data = await fetch(`${env.API_URL}/find?${newSearchParams.toString()}`).then((res) =>
		res.json()
	);

	const searchResult = await asResult(data, displayUtil, vocabUtil, locale, env.AUXD_SECRET);

	const superSearchResult: SuperSearchResult = {
		'@id': data['@id'],
		...searchResult,
		items: searchResult.items?.map((item, index) => {
			return {
				...item,
				qualifiers: itemAsQualifiers(data.items[index], locale)
			};
		})
	};

	return json(superSearchResult);
};
