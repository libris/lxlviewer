import { env } from '$env/dynamic/private';

export async function load() {
	const sparqlBaseUrl = env.API_URL?.includes('localhost')
		? 'https://libris-qa.kb.se' // FIXME
		: env.API_URL;

	return { sparqlBaseUrl };
}
