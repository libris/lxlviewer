import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.ts';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import getEditedPartEntries from './getEditedPartEntries.js';
import getEditedRanges from './getEditedRanges.js';
import {
	DEFAULT_SUPERSEARCH_TYPES,
	getTypeQualifier,
	queryIncludesType
} from './qualifierTypes.js';
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

	const _q = url.searchParams.get('_q');
	const cursor = parseInt(url.searchParams.get('cursor') || '0', 10);

	const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);
	newSearchParams.delete('cursor');

	const editedRanges = _q && Number.isInteger(cursor) && getEditedRanges(_q, cursor);
	let getFullQuery = false;

	// user is editing a qualifier
	if (editedRanges && editedRanges?.qualifierKey) {
		getFullQuery = true;
		// add 'corresponding' types
		const editedPartEntries = getEditedPartEntries(_q, cursor, editedRanges);

		editedPartEntries.forEach(([key, value]) => {
			newSearchParams.set(key, value);
		});
	} else {
		// ...or add default types
		const newQ = newSearchParams.get('_q')?.toString();
		if (!queryIncludesType(newQ)) {
			newSearchParams.set('_q', `${newQ} ${getTypeQualifier(DEFAULT_SUPERSEARCH_TYPES)}`);
		}
	}

	console.log('Initial search params:', decodeURIComponent(url.searchParams.toString()));
	console.log('Search params sent to /find:', decodeURIComponent(newSearchParams.toString()));

	if (locals.userSettings?.debug?.includes(DebugFlags.ES_SCORE)) {
		newSearchParams.set('_debug', 'esScore');
	}

	const findResponse = await fetch(`${env.API_URL}/find?${newSearchParams.toString()}`);
	const data = await findResponse.json();

	if (getFullQuery) {
		// send full query in order to get mapping labels, really only needed when a qualifier is added...
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
