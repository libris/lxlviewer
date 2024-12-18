import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.ts';
import { LxlLens } from '$lib/types/display';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import { toString } from '$lib/utils/xl.js';
import { displayMappings } from '$lib/utils/search.js';
import { getTranslator } from '$lib/i18n/index.js';
import getEditedPartEntries from './getEditedPartEntries.js';

/**
 * TODO:
 * - Investigate how we should also send the full query if we wish to boost faceted results.
 * - Investigate if we also should do a separate query for the last edited word – and not only the whole phrase (e.g. should we show a result for the subject `winter` when entering `astrid lindgren winter`?)
 */

export const GET: RequestHandler = async ({ url, params, locals }) => {
	const displayUtil = locals.display;
	const locale = getSupportedLocale(params?.lang);
	const translate = await getTranslator(locale);

	const _q = url.searchParams.get('_q');
	const cursor = parseInt(url.searchParams.get('cursor') || '0', 10);

	const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);

	if (_q && Number.isInteger(cursor)) {
		const editedPartEntries = getEditedPartEntries(_q, cursor);

		editedPartEntries.forEach(([key, value]) => {
			newSearchParams.set(key, value);
		});
		newSearchParams.delete('cursor');
		console.log('Initial search params:', decodeURIComponent(url.searchParams.toString()));
		console.log('Search params sent to /find:', decodeURIComponent(newSearchParams.toString()));
	}

	const findResponse = await fetch(`${env.API_URL}/find?${newSearchParams.toString()}`);
	const data = await findResponse.json();

	return json({
		'@id': data['@id'],
		items: data.items?.map((item) => ({
			'@id': item['@id'],
			'@type': item['@type'],
			heading: toString(displayUtil.lensAndFormat(item, LxlLens.CardHeading, locale))
		})),
		...(data?.search?.mapping && {
			mapping: displayMappings(data, displayUtil, locale, translate)
		}),
		totalItems: data.totalItems,
		'@context': data['@context']
	});
};
