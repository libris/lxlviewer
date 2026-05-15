import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales';
import type { HoldingsData } from '$lib/types/holdings.js';
import { getTranslator } from '$lib/i18n';
import { appendMyLibrariesParam, displayFacets } from '$lib/utils/search.server';
import type { PartialCollectionView } from '$lib/types/search';

export const load = async ({ url, params, fetch, locals, isDataRequest }) => {
	const locale = getSupportedLocale(params?.lang);
	const displayUtil = locals.display;
	const myLibraries = locals.userSettings?.myLibraries;

	const searchParams = new URLSearchParams();

	// reruns on change in these params:
	const _q = url.searchParams.get('_q');
	const _r = url.searchParams.get('_r');
	const holdingsParam = url.searchParams.get('holdings');

	searchParams.set('_q', _q || '');
	if (_r) searchParams.set('_r', _r);

	async function getHoldings(fnurgel: string): Promise<HoldingsData> {
		const res = await fetch(`/api/${locale}/${fnurgel}/holdings`);
		const holdings = await res.json();
		return holdings;
	}

	async function getFacets() {
		searchParams.set('_stats', 'true');
		searchParams.set('_limit', '0');

		const recordsRes = await fetch(
			`${env.API_URL}/find.jsonld?${appendMyLibrariesParam(searchParams, myLibraries).toString()}`
		);
		const view = (await recordsRes.json()) as PartialCollectionView;

		const translate = await getTranslator(locale);
		return displayFacets(view, displayUtil, locale, translate, '');
	}

	if (holdingsParam) {
		// support javascript disabled by fully SSR if "true" http request
		return {
			holdings: isDataRequest ? getHoldings(holdingsParam) : await getHoldings(holdingsParam),
			facets: null
		};
	} else {
		return { facets: isDataRequest ? getFacets() : await getFacets() };
	}
};
