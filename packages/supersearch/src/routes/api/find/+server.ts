import type { RequestHandler } from './$types.ts';
import { json } from '@sveltejs/kit';

const MAX_ITEMS = 30;

const MOCK_ITEMS_DATA = Array.from({ length: MAX_ITEMS }, (_, i) => ({
	id: i,
	heading: `Heading ${i + 1}`
}));

export const GET: RequestHandler = async ({ url }) => {
	const limit = parseInt(url.searchParams.get('_limit')!, 10);
	const offset = parseInt(url.searchParams.get('_offset') || '0', 10);

	return json({
		'@id': `/api/find?${url.searchParams.toString()}`,
		items: MOCK_ITEMS_DATA.slice(offset, offset + limit).map((item) => ({
			'@id': item.id,
			heading: item.heading
		})),
		totalItems: MAX_ITEMS
	});
};

export interface MockQueryResponse {
	'@id'?: string;
	items: {
		'@id'?: string;
		heading: string;
	}[];
	totalItems: number;
}
