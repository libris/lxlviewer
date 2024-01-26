import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import { DisplayUtil } from '$lib/utils/xl';
import { getSupportedLocale } from '$lib/i18n/locales';
import { asResult, type PartialCollectionView } from './search';

export const load = async ({ params, locals, fetch, url }) => {
	if (!url.searchParams.size) {
		redirect(303, `/`); // redirect to home page if no search params are given
	}

	const recordsRes = await fetch(`${env.API_URL}/find.jsonld?${url.searchParams.toString()}`);
	const result = (await recordsRes.json()) as PartialCollectionView;
	const displayUtil: DisplayUtil = locals.display;
	const searchResult = asResult(result, displayUtil, getSupportedLocale(params?.lang));

	return {
		searchResult
	};
};
