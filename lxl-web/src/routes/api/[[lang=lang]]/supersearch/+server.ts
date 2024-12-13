import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.ts';
import { LxlLens } from '$lib/types/display';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import { toString } from '$lib/utils/xl.js';
import getEditedPartQuery from './getEditedPartQuery.js';

export const GET: RequestHandler = async ({ url, params, locals }) => {
	const displayUtil = locals.display;
	const locale = getSupportedLocale(params?.lang);

	const _q = url.searchParams.get('_q');
	const cursor = parseInt(url.searchParams.get('cursor') || '0', 10);

	if (_q && Number.isInteger(cursor)) {
		const editedPartQuery = getEditedPartQuery(_q, cursor);

		url.searchParams.set('_q', editedPartQuery);
		url.searchParams.delete('cursor');

		console.log('Search params sent to /find:', decodeURIComponent(url.searchParams.toString()));
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
