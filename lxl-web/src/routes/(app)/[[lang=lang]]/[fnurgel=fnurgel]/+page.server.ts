import { env } from '$env/dynamic/private';

export const load = async ({ params, fetch }) => {
	const iri = `${env.API_URL}/${params.fnurgel}`;
	const response = await fetch(iri, { headers: { Accept: 'application/ld+json' } });
	const doc = await response.json();

	return { fnurgel: params.fnurgel, iri: iri, lang: params.lang ?? 'sv', doc: doc };
};
