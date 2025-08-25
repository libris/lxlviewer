import { error, redirect } from '@sveltejs/kit';
import { query, getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import * as v from 'valibot';
import { getSupportedLocale } from '$lib/i18n/locales';
import type { PartialCollectionView } from '$lib/types/search';
import { asResult } from '$lib/utils/search';
import { DebugFlags } from '$lib/types/userSettings';
import { MY_LIBRARIES_FILTER_ALIAS } from '$lib/constants/facets';
import { type ApiError } from '$lib/types/api';

const DEFAULT_QUERY = '*';
const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

export const findRecords = query(
	v.object({
		query: v.optional(v.string(), DEFAULT_QUERY),
		limit: v.optional(v.pipe(v.number(), v.transform(String)), DEFAULT_LIMIT),
		offset: v.optional(v.pipe(v.number(), v.transform(String)), DEFAULT_OFFSET),
		sort: v.optional(v.string(), ''),
		spell: v.optional(v.pipe(v.boolean(), v.transform(String)), true),
		suggest: v.optional(v.boolean(), false),
		cursor: v.optional(v.pipe(v.number(), v.integer()))
	}),
	async ({ query, limit, offset, sort, spell, suggest, cursor }) => {
		const { locals, fetch, url, params } = getRequestEvent();
		const displayUtil = locals.display;
		const vocabUtil = locals.vocab;

		const searchParams = new URLSearchParams([
			['_q', query],
			['_limit', limit],
			['_offset', offset],
			['_sort', sort],
			['_spell', spell]
		]);

		if (suggest) {
			searchParams.append('suggest', 'true');
			searchParams.append(
				'cursor',
				(cursor && Number.isInteger(cursor) && cursor?.toString()) || '0'
			);
		}

		if (query.includes(MY_LIBRARIES_FILTER_ALIAS) && locals.userSettings?.myLibraries) {
			searchParams.append(
				`_${MY_LIBRARIES_FILTER_ALIAS}`,
				Object.values(locals.userSettings.myLibraries)
					.map((lib) => `itemHeldBy:"sigel:${lib.sigel}"`)
					.join(' OR ')
			);
		}

		if (locals.userSettings?.debug?.includes(DebugFlags.ES_SCORE)) {
			searchParams.append('_debug', 'esScore');
		}

		const res = await fetch(`${env.API_URL}/find.jsonld?${searchParams.toString()}`);

		if (!res.ok) {
			if (res.status > 299 && res.status < 400) {
				// redirect from api -> redirect in app
				const location = res.headers.get('location');

				if (location) {
					const apiSearch = new URL(location).search;
					console.log('redirecting to', `${url.pathname}${apiSearch}`);
					redirect(res.status, `${url.pathname}${apiSearch}`);
				}
			} else {
				const err = (await res.json()) as ApiError;
				throw error(err.status_code, { message: err.message, status: err.status });
			}
		}

		const data = (await res.json()) as PartialCollectionView;

		const searchResult = await asResult(
			data,
			displayUtil,
			vocabUtil,
			getSupportedLocale(params.lang),
			env.AUXD_SECRET,
			undefined,
			locals.userSettings?.myLibraries
		);

		return searchResult;
	}
);
