import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';

import type { PartialCollectionView, SearchMapping } from '$lib/utils/search';
import sanitizeQSearchParamValue from '$lib/utils/sanitizeQSearchParamValue';

const SearchParamsSchema = z.object({
	q: z.string()
});

export type SearchMappingSearchParamsSchema = z.input<typeof SearchParamsSchema>;

export type SearchMappingResponse = {
	searchMappings: SearchMapping[];
};

export const GET: RequestHandler = async ({ url, fetch }) => {
	const { data: dataFromSearchParams, error: searchParamsError } = SearchParamsSchema.safeParse({
		q: url.searchParams.get('q')
	});

	if (searchParamsError) {
		error(400, searchParamsError.message); // TODO: format zod error messages
	}

	const { q } = dataFromSearchParams;

	const findResSearchParams = new URLSearchParams([
		['_q', sanitizeQSearchParamValue(q).trim()],
		['_limit', '0'],
		['_offset', '0'],
		['_sort', '']
	]);

	const findRes = await fetch(`${env.API_URL}/find.jsonld?${findResSearchParams.toString()}`);

	if (findRes.status !== 200) {
		error(findRes.status, findRes.statusText);
	}

	const findResult = (await findRes.json()) as PartialCollectionView;
	const searchMappings = findResult.search.mapping;
	return json({ searchMappings });
};
