import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.ts';
import type { SuperSearchResult } from '$lib/types/search.js';
import { getSupportedLocale } from '$lib/i18n/locales.js';
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
	const _sort = url.searchParams.get('_sort') || '';

	const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);

	if (locals.userSettings?.debug?.includes(DebugFlags.ES_SCORE)) {
		newSearchParams.set('_debug', 'esScore');
	}

	newSearchParams.set('_suggest', 'true');

	const withWildcard = insertWildcard(_q, cursor);
	newSearchParams.set('_q', withWildcard.query);
	newSearchParams.set('cursor', withWildcard.cursor.toString());
	newSearchParams.set('_sort', _sort);

	const langModelSearchParams = new URLSearchParams([
		['q', newSearchParams.get('_q') || ''],
		['sort', newSearchParams.get('_sort') || '']
	]);

	console.log('Params sent to language model endpoint', langModelSearchParams);

	const data = await fetch(`${env.API_URL}/find?${newSearchParams.toString()}`).then((res) =>
		res.json()
	);

	const searchResult = await asResult(data, displayUtil, vocabUtil, locale, env.AUXD_SECRET);

	const superSearchResult: SuperSearchResult = {
		searchResult: {
			...searchResult,
			items: searchResult.items?.map((item, index) => {
				return {
					...item,
					qualifiers: itemAsQualifiers(data.items[index], locale)
				};
			})
		},
		langModelResult: []
	};

	return json(superSearchResult);
};
