import type { RequestHandler } from './$types.ts';
import { json } from '@sveltejs/kit';

const MOCK_DATA = Array.from({ length: 1000 }, (_, i) => ({ id: i, heading: `Heading ${i + 1}` }));

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q');
	const limit = parseInt(url.searchParams.get('limit')!, 10);
	const offset = parseInt(url.searchParams.get('offset')!, 10);

	const data = MOCK_DATA.slice(offset, offset + limit).map(({ id, ...rest }) => ({
		id: `${q}-${id}`,
		...rest
	}));

	return json(data);
};
