import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.ts';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import getEditedPartEntries from './getEditedPartEntries.js';
import getEditedRanges from './getEditedRanges.js';
import { asResult } from '$lib/utils/search.js';
import { DebugFlags } from '$lib/types/userSettings.js';

/**
 * TODO:
 * - Investigate how we should also send the full query if we wish to boost faceted results.
 * - Investigate if we also should do a separate query for the last edited word – and not only the whole phrase (e.g. should we show a result for the subject `winter` when entering `astrid lindgren winter`?)
 */

export const GET: RequestHandler = async ({ url, params, locals }) => {
	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;
	const locale = getSupportedLocale(params?.lang);
	let editedRanges;

	const _q = url.searchParams.get('_q');
	const cursor = parseInt(url.searchParams.get('cursor') || '0', 10);

	const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);

	if (_q && Number.isInteger(cursor)) {
		editedRanges = getEditedRanges(_q, cursor);

		// alter query based on edited part
		const editedPartEntries = getEditedPartEntries(_q, cursor, editedRanges);
		editedPartEntries.forEach(([key, value]) => newSearchParams.set(key, value));
	}

	if (locals.userSettings?.debug?.includes(DebugFlags.ES_SCORE)) {
		newSearchParams.set('_debug', 'esScore');
	}

	newSearchParams.delete('cursor');

	console.log('Initial search params:', decodeURIComponent(url.searchParams.toString()));
	console.log('Search params sent to /find:', decodeURIComponent(newSearchParams.toString()));

	const findResponse = await fetch(`${env.API_URL}/find?${newSearchParams.toString()}`);
	const data = await findResponse.json();

	if (editedRanges && editedRanges?.qualifierKey) {
		// when getting narrowed results for qualifier,
		// we also need to send the full query to not lose all mapping labels :(
		const fullQueryResponse = await fetch(`${env.API_URL}/find?_q=${_q?.toString()}&_limit=0`);
		const fullQueryData = await fullQueryResponse.json();
		data.search.mapping = [...fullQueryData.search.mapping];
	}

	const searchResult = await asResult(data, displayUtil, vocabUtil, locale, env.AUXD_SECRET);

	return json({
		'@id': data['@id'],
		'@context': data['@context'],
		...searchResult
	});
};
