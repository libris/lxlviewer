import { error } from '@sveltejs/kit';
import { query, getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import * as v from 'valibot';
import type { PartialCollectionView } from '$lib/types/search';
import { type ApiError } from '$lib/types/api';
import { asAdjecentSearchResult } from '$lib/utils/adjecentSearchResult';

export const getAdjecentSearchResult = query(v.string(), async (viewId) => {
	const { fetch, url } = getRequestEvent();
	const searchParams = new URL(url.origin + viewId).searchParams;
	const res = await fetch(`${env.API_URL}/find.jsonld?${searchParams.toString()}`);

	if (!res.ok) {
		const err = (await res.json()) as ApiError;
		return error(err.status_code, { message: err.message, status: err.status });
	}

	const data = (await res.json()) as PartialCollectionView;
	return asAdjecentSearchResult(data);
});
