import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import getSortedSearchParams from '$lib/utils/getSortedSearchParams.js';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const q = url.searchParams.get('q');

	if (!q) {
		return error(400, 'Missing q param value');
	}

	const wildcardQ = q.endsWith('*') ? q : `${q}*`;

	const searchParams = getSortedSearchParams(
		new URLSearchParams([
			['q', wildcardQ],
			['_limit', '5'],
			['_offset', '0'],
			['_sort', ''],
			['@type', 'Person'],
			['@type', 'Concept'],
			['@type', 'Language']
			// ['@type', 'Work']
		])
	);

	const aggregateRes = await fetch(`${env.API_URL}/find.jsonld?${searchParams.toString()}`);
	const aggregate = await aggregateRes.json();

	return json({ items: aggregate.items });
};
