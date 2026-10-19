import { error } from '@sveltejs/kit';
import { API_URL, AUXD_SECRET } from '$app/env/private';
import { query, getRequestEvent } from '$app/server';

import { type ApiError } from '#lib/types/api.js';
import { asResult } from '#lib/utils/search.server.js';
import type { PartialCollectionView } from '#lib/types/search.js';
import { DebugFlags } from '#lib/types/userSettings.js';
import { getSupportedLocale } from '#lib/i18n/locales.js';
import { AdjacentSearchResultsSchema, SearchResultsSchema } from '#lib/schemas/searchResult.js';
import { asAdjecentSearchResult } from '#lib/utils/adjecentSearchResult.js';

export const getSearchResults = query(SearchResultsSchema, async ({ lang, url, ...params }) => {
	const { fetch, locals } = getRequestEvent();
	const searchParams = new URLSearchParams(Object.entries(params));
	const _url = new URL(url);

	if (locals.userSettings?.debug?.includes(DebugFlags.ES_SCORE)) {
		searchParams.set('_debug', 'true');
	}

	if (locals.site?.searchSite) {
		searchParams.set('_site', locals.site.searchSite);
	}

	const _r = _url.searchParams.get('_r');
	if (_r) {
		searchParams.set('_r', _r);
	}

	searchParams.set('_stats', 'falseThisRequest');

	const res = await fetch(`${API_URL}/find.jsonld?${searchParams.toString()}`);

	if (!res.ok) {
		const err = (await res.json()) as ApiError;
		return error(err.status_code, err.message, {
			...(err.error_id && { errorId: err.error_id })
		});
	}

	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;
	const locale = getSupportedLocale(lang);
	const myLibraries = locals.userSettings?.myLibraries;
	const data = (await res.json()) as PartialCollectionView;

	return asResult(data, displayUtil, vocabUtil, locale, AUXD_SECRET || '', undefined, myLibraries);
});

export const getAdjecentSearchResult = query(
	AdjacentSearchResultsSchema,
	async ({ url, lang, viewId }) => {
		const { fetch, locals } = getRequestEvent();
		const _url = new URL(url);
		const searchParams = new URL(_url.origin + viewId).searchParams;
		searchParams.set('_stats', 'falseThisRequest');
		const res = await fetch(`${API_URL}/find.jsonld?${searchParams.toString()}`);

		if (!res.ok) {
			const err = (await res.json()) as ApiError;
			return error(err.status_code, err.message, {
				...(err.error_id && { errorId: err.error_id })
			});
		}

		const data = (await res.json()) as PartialCollectionView;
		const result = await asResult(data, locals.display, locals.vocab, getSupportedLocale(lang), '');

		return asAdjecentSearchResult(result);
	}
);
