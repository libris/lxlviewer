import { getRequestEvent, query } from '$app/server';
import { API_URL } from '$app/env/private';
import type { ApiError } from '#lib/types/api.js';
import { error } from '@sveltejs/kit';
import type { PartialCollectionView } from '#lib/types/search.js';
import { cslFromMainEntity } from '#lib/utils/cslFromMainEntity.js';
import { initCite } from '#lib/utils/citation.js';
import { CiteSelectionSchema } from '#lib/schemas/citeSelectionSchema.js';

export const getCitationsFromSelection = query(CiteSelectionSchema, async ({ ids, format }) => {
	const { fetch, locals } = getRequestEvent();
	const searchParams = new URLSearchParams();
	searchParams.set('_stats', 'false');
	searchParams.set('_limit', '100');
	searchParams.set('_q', ids.join(' OR '));

	const res = await fetch(`${API_URL}/find.jsonld?${searchParams.toString()}`);

	if (!res.ok) {
		const err = (await res.json()) as ApiError;
		return error(err.status_code, err.message, {
			...(err.error_id && { errorId: err.error_id })
		});
	}

	const data = (await res.json()) as PartialCollectionView;
	const items = data.items;
	const csl = items.flatMap((i) => cslFromMainEntity(i, locals.vocab));

	const cite = await initCite('sv');
	cite.add(csl);
	const formatted = cite.formatAs(format) as string;

	return formatted;
});
