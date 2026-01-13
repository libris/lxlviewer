import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

import * as v from 'valibot';
import { query, getRequestEvent } from '$app/server';
import { type ApiError } from '$lib/types/api';
import { asResult } from '$lib/utils/search';
import type { PartialCollectionView } from '$lib/types/search';
import { DebugFlags } from '$lib/types/userSettings';
import { getSupportedLocale } from '$lib/i18n/locales';

export const getSearchResults = query(
	v.pipe(
		v.object({
			_q: v.string(),
			_limit: v.optional(v.pipe(v.number(), v.toString())),
			_offset: v.optional(v.pipe(v.number(), v.toString())),
			_sort: v.optional(v.string()),
			_spell: v.optional(v.pipe(v.boolean(), v.toString())),
			_r: v.optional(v.string()),
			_stats: v.optional(v.pipe(v.boolean(), v.toString()))
		})
	),
	async (params) => {
		const { fetch, locals, params: routeParams } = getRequestEvent();
		const searchParams = new URLSearchParams(Object.entries(params));

		if (locals.userSettings?.debug?.includes(DebugFlags.ES_SCORE)) {
			searchParams.set('_debug', 'true');
		}

		const res = await fetch(`${env.API_URL}/find.jsonld?${searchParams.toString()}`);

		if (!res.ok) {
			const err = (await res.json()) as ApiError;
			return error(err.status_code, { message: err.message, status: err.status });
		}

		const displayUtil = locals.display;
		const vocabUtil = locals.vocab;
		const locale = getSupportedLocale(routeParams.lang);
		const myLibraries = locals.userSettings?.myLibraries;

		const data = (await res.json()) as PartialCollectionView;

		return asResult(data, displayUtil, vocabUtil, locale, env.AUXD_SECRET, undefined, myLibraries);
	}
);
