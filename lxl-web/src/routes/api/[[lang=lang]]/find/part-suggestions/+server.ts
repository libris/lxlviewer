import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import Fuse from 'fuse.js';
import BOOLEAN_QUALIFIERS from '$lib/constants/booleanQualifiers';
import type { PropertySuggestion } from '$lib/types/suggestions';

/** TODO:
 * Search by property key if exists in the beginning of the part
 */

const booleanQualifiersWithSuggestionType = BOOLEAN_QUALIFIERS.map((item) => ({
	...item,
	'@type': 'boolean' // should we hardcode boolean type like this?
}));

export const GET: RequestHandler = async ({ url, params, fetch }) => {
	const q = url.searchParams.get('q');
	const propertiesRes = await fetch(`/api/property`);

	const properties: PropertySuggestion[] = await propertiesRes.json();

	const list = [...properties, ...booleanQualifiersWithSuggestionType];

	const fuse = new Fuse(list, {
		keys: [
			'@id',
			// key (is key reserved?)
			['keyByLang', params.lang || 'sv'],
			['labelByLang', params.lang || 'sv']
		],
		threshold: 0.3 // this value is NOT written in stone
	});

	const fuseResult = q ? fuse.search(q, { limit: 5 }) : [];
	const suggestions = fuseResult.map(({ item }) => item);

	return json(suggestions);
};
