import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes';
import { API_URL } from '$env/static/private';

export const load = (async ({ params, fetch }) => {
	const iri = `${API_URL}/${params.fnurgel}`;
	const response = await fetch(iri, { headers: { Accept: 'application/ld+json' } });
	const doc = await response.json();

	return { fnurgel: params.fnurgel, iri: iri, lang: params.lang ?? 'sv', doc: doc };
}) satisfies PageServerLoad;
