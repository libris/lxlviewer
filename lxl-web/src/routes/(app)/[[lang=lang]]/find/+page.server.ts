import { redirect, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales.js';

import { type ApiError } from '$lib/types/api.js';
import type { PartialCollectionView } from '$lib/types/search.js';
import { asResult } from '$lib/utils/search';
import { DebugFlags } from '$lib/types/userSettings';

export const load = async ({ params, url, locals, fetch }) => {
	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;
	const locale = getSupportedLocale(params?.lang);
	const userSettings = locals.userSettings;

	if (!url.searchParams.size) {
		redirect(303, `/`); // redirect to home page if no search params are given
	}

	const debug = locals.userSettings?.debug?.includes(DebugFlags.ES_SCORE) ? '&_debug=esScore' : '';

	const searchParams = new URLSearchParams(url.searchParams.toString());
	const recordsRes = await fetch(`${env.API_URL}/find.jsonld?${searchParams.toString()}${debug}`, {
		// intercept 3xx redirects to sync back the correct _i/_q combination provided by api
		redirect: 'manual'
	});

	if (!recordsRes.ok) {
		if (recordsRes.status > 299 && recordsRes.status < 400) {
			// redirect from api -> redirect in app
			const location = recordsRes.headers.get('location');

			if (location) {
				const apiSearch = new URL(location).search;
				console.log('redirecting to', `${url.pathname}${apiSearch}`);
				redirect(recordsRes.status, `${url.pathname}${apiSearch}`);
			}
		} else {
			const err = (await recordsRes.json()) as ApiError;
			throw error(err.status_code, { message: err.message, status: err.status });
		}
	}

	const result = (await recordsRes.json()) as PartialCollectionView;

	const searchResult = await asResult(
		result,
		displayUtil,
		vocabUtil,
		locale,
		env.AUXD_SECRET,
		url.pathname
	);

	return { searchResult, userSettings };
};
