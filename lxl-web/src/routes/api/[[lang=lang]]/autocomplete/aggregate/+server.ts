import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import getSortedSearchParams from '$lib/utils/getSortedSearchParams.js';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const qParam = url.searchParams.get('q');

	if (!qParam) {
		return error(400, 'Missing q param value');
	}

	let q = qParam;

	/** Remove quoted character in the beginning if not closed quotation */
	if (q.startsWith('"') && !q.endsWith('"')) {
		q = q.substring(1);
	}

	/** Add wildcard if not already present and if not quoted */
	/* NOTE: We cannot rely on prefix characters as a wildcard as it greatly affects the relevancy of the results (e.g. longer names are favoured over shorter?) */
	if (!q.endsWith('*') && !q.endsWith('"')) {
		q = `${q}*`;
	}

	const searchParams = getSortedSearchParams(
		new URLSearchParams([
			['q', q],
			['_limit', '5'],
			['_offset', '0'],
			['_sort', ''],
			['@type', 'Person'],
			['@type', 'Concept'],
			['@type', 'Language']
			// ['@type', 'Work']
		])
	);

	console.log('url', `${env.API_URL}/find.jsonld?${searchParams.toString()}`);
	const aggregateRes = await fetch(`${env.API_URL}/find.jsonld?${searchParams.toString()}`);
	const aggregate = await aggregateRes.json();

	return json({ items: aggregate.items });
};
