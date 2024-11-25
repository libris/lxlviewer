import type { QueryResponse, ResultItem } from '$lib/types/superSearch.js';
import type { RequestHandler } from './$types.ts';
import { json } from '@sveltejs/kit';

const MAX_ITEMS = 30;

const MOCK_ITEMS_DATA = Array.from({ length: MAX_ITEMS }, (_, i) => ({
	id: i,
	heading: `Heading ${i + 1}`
}));

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('_q');
	const limit = parseInt(url.searchParams.get('_limit')!, 10);
	const offset = parseInt(url.searchParams.get('_offset') || '0', 10);

	return json({
		'@id': `/api/find?${url.searchParams.toString()}`,
		items: MOCK_ITEMS_DATA.slice(offset, offset + limit).map((item) => ({
			'@id': `${q}-${item.id}`,
			heading: `${item.heading} for query: "${q}"`
		})),
		totalItems: MAX_ITEMS
	});
};

export interface MockQueryResponse extends QueryResponse {
	'@id'?: string;
	items: ResultItem[];
	totalItems: number;
}
