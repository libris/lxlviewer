import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.ts';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import { asResult } from '$lib/utils/search.js';

export const GET: RequestHandler = async ({ url, params, locals }) => {
	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;
	const locale = getSupportedLocale(params?.lang);

	const _q = url.searchParams.get('_q') || '';
	console.log('HELLO _q', _q);

	const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);

	const findRes = await fetch(`${env.API_URL}/find?${newSearchParams.toString()}`);

	const data = await findRes.json();

	const result = await asResult(data, displayUtil, vocabUtil, locale, env.AUXD_SECRET);

	return json(result);
};
