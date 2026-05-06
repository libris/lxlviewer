import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { query, getRequestEvent } from '$app/server';
import * as v from 'valibot';

import { type ApiError } from '$lib/types/api';
import { asResult } from '$lib/utils/search';
import type { PartialCollectionView } from '$lib/types/search';
import { DebugFlags } from '$lib/types/userSettings';
import { getSupportedLocale } from '$lib/i18n/locales';
import { SearchResultsSchema } from '$lib/schemas/searchResult';
import { asAdjecentSearchResult } from '$lib/utils/adjecentSearchResult';

export const getSearchResults = query(SearchResultsSchema, async (params) => {
	const { fetch, locals, params: routeParams, url } = getRequestEvent();
	const searchParams = new URLSearchParams(Object.entries(params));

	if (locals.userSettings?.debug?.includes(DebugFlags.ES_SCORE)) {
		searchParams.set('_debug', 'true');
	}

	const _r = url.searchParams.get('_r');
	if (_r) {
		searchParams.set('_r', _r);
	}

	searchParams.set('_stats', 'falseThisRequest');

	const _searchUrl = `${env.API_URL}/find.jsonld?${searchParams.toString()}`;
	console.log('[DEBUG fetch searchResult getSearchResults]', {
		outerUrl: url.toString(),
		fetchUrl: _searchUrl
	});
	const res = await fetch(_searchUrl);
	console.log('[DEBUG fetch searchResult getSearchResults <-]', {
		fetchUrl: _searchUrl,
		status: res.status,
		contentType: res.headers.get('content-type')
	});

	if (!res.ok) {
		const err = (await res.json()) as ApiError;
		return error(err.status_code, { message: err.message, status: err.status });
	}

	const displayUtil = locals.display;
	const vocabUtil = locals.vocab;
	const locale = getSupportedLocale(routeParams.lang);
	const myLibraries = locals.userSettings?.myLibraries;

	const data = (await res.json()) as PartialCollectionView;

	return asResult(
		data,
		displayUtil,
		vocabUtil,
		locale,
		env.AUXD_SECRET || '',
		undefined,
		myLibraries
	);
});

export const getAdjecentSearchResult = query(v.string(), async (viewId) => {
	const { fetch, url } = getRequestEvent();
	const searchParams = new URL(url.origin + viewId).searchParams;
	searchParams.set('_stats', 'falseThisRequest');
	const _adjUrl = `${env.API_URL}/find.jsonld?${searchParams.toString()}`;
	console.log('[DEBUG fetch searchResult getAdjecent]', {
		outerUrl: url.toString(),
		fetchUrl: _adjUrl
	});
	const res = await fetch(_adjUrl);
	console.log('[DEBUG fetch searchResult getAdjecent <-]', {
		fetchUrl: _adjUrl,
		status: res.status,
		contentType: res.headers.get('content-type')
	});

	if (!res.ok) {
		const err = (await res.json()) as ApiError;
		return error(err.status_code, { message: err.message, status: err.status });
	}

	const data = (await res.json()) as PartialCollectionView;
	return asAdjecentSearchResult(data);
});
