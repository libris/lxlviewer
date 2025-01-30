import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.ts';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import getEditedPartEntries from './getEditedPartEntries.js';
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

	if (_q && Number.isInteger(cursor)) {
		const editedPartEntries = getEditedPartEntries(_q, cursor);

		editedPartEntries.forEach(([key, value]) => {
			newSearchParams.set(key, value);
		});
		newSearchParams.delete('cursor');

		if (!_q.toString().includes('"rdf:type":') && !_q.toString().includes('"rdf:type"=')) {
			// Add types to suggest
			const types =
				'"rdf:type":(Agent OR Concept OR Language OR Work) "rdf:type":(NOT ComplexSubject) ';
			newSearchParams.set('_q', types + _q.toString());
		}
		console.log('Initial search params:', decodeURIComponent(url.searchParams.toString()));
		console.log('Search params sent to /find:', decodeURIComponent(newSearchParams.toString()));
	}
	const debug = locals.userSettings?.debug?.includes(DebugFlags.ES_SCORE) ? '&_debug=esScore' : '';

	const findResponse = await fetch(`${env.API_URL}/find?${newSearchParams.toString()}${debug}`);
	const data = await findResponse.json();

	const searchResult = await asResult(data, displayUtil, vocabUtil, locale, env.AUXD_SECRET);

	return json({
		'@id': data['@id'],
		'@context': data['@context'],
		...searchResult
	});
};
