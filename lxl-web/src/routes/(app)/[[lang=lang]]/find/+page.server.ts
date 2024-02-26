import { env } from '$env/dynamic/private';
import { redirect, error } from '@sveltejs/kit';
import { DisplayUtil } from '$lib/utils/xl';
import { getSupportedLocale } from '$lib/i18n/locales';
import { asResult, type PartialCollectionView } from './search';
import { getTranslator } from '$lib/i18n';
import type { apiError } from '$lib/types/API';

export const load = async ({ params, locals, fetch, url }) => {
	if (!url.searchParams.size) {
		redirect(303, `/`); // redirect to home page if no search params are given
	}

	const recordsRes = await fetch(`${env.API_URL}/find.jsonld?${url.searchParams.toString()}`);

	if (!recordsRes.ok) {
		const err = (await recordsRes.json()) as apiError;
		throw error(err.status_code, err.status);
	}

	const result = (await recordsRes.json()) as PartialCollectionView;
	const displayUtil: DisplayUtil = locals.display;
	const locale = getSupportedLocale(params?.lang);
	const translator = await getTranslator(locale);
	const searchResult = await asResult(result, displayUtil, locale, translator);

	return {
		searchResult
	};
};
