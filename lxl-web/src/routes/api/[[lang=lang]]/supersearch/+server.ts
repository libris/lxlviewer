import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.ts';
import { LxlLens } from '$lib/types/display';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import { toString } from '$lib/utils/xl.js';
import getEditedRanges from './getEditedRanges.js';

export const GET: RequestHandler = async ({ url, params, locals }) => {
	const displayUtil = locals.display;
	const locale = getSupportedLocale(params?.lang);

	const query = url.searchParams.get('_q');
	const cursor = parseInt(url.searchParams.get('cursor') || '0', 10);

	if (query && Number.isInteger(cursor)) {
		const editedRanges = getEditedRanges(query, cursor);
		console.log('editedRanges:', editedRanges, query.slice(editedRanges.from, editedRanges.to));
	}

	const findResponse = await fetch(`${env.API_URL}/find?${url.searchParams.toString()}`);
	const data = await findResponse.json();

	return json({
		'@id': data['@id'],
		items: data.items?.map((item) => ({
			'@id': item['@id'],
			'@type': item['@type'],
			heading: toString(displayUtil.lensAndFormat(item, LxlLens.CardHeading, locale))
		})),
		totalItems: data.totalItems,
		'@context': data['@context']
	});
};
