import { redirect } from '@sveltejs/kit';
import { findRecords } from '$lib/remotes/find.remote.js';

export const load = async ({ url }) => {
	if (!url.searchParams.size || !url.searchParams.has('_q')) {
		redirect(303, `/`); // redirect to home page if no search params are given or missing query value
	}

	const searchResult = await findRecords({
		query: url.searchParams.get('_q') ?? '*',
		limit:
			(url.searchParams.get('_limit') &&
				Number.isInteger(Number.parseInt(url.searchParams.get('_limit')!, 10)) &&
				Number.parseInt(url.searchParams.get('_limit')!, 10)) ||
			undefined,
		offset:
			(url.searchParams.get('_offset') &&
				Number.isInteger(Number.parseInt(url.searchParams.get('_offset')!, 10)) &&
				Number.parseInt(url.searchParams.get('_offset')!, 10)) ||
			undefined,
		sort: url.searchParams.get('_sort') ?? ''
	});

	return { searchResult };

	/**
	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;
	const locale = getSupportedLocale(params?.lang);

	if (!url.searchParams.size) {
		redirect(303, `/`); // redirect to home page if no search params are given
	}

	const debug = locals.userSettings?.debug?.includes(DebugFlags.ES_SCORE) ? '&_debug=esScore' : '';
	const searchParams = new URLSearchParams(url.searchParams.toString());

	// Add param with my libraries from cookie
	if (searchParams.get('_q')?.includes(MY_LIBRARIES_FILTER_ALIAS)) {
		let sigelStr;
		if (locals.userSettings?.myLibraries) {
			sigelStr = Object.values(locals.userSettings?.myLibraries)
				.map((lib) => `itemHeldBy:"sigel:${lib.sigel}"`)
				.join(' OR ');
		}
		searchParams.append(`_${MY_LIBRARIES_FILTER_ALIAS}`, sigelStr || '""');
	}

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
		undefined,
		locals.userSettings?.myLibraries
	);

	return { searchResult };
	*/
};
