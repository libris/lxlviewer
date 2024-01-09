
import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes';
import {API_URL, ID_URL} from '$env/static/private';
import { error } from '@sveltejs/kit';
import { page } from '$app/stores';
import {DisplayUtil, VocabUtil} from "$lib/utils/xl";

export const load = (async ({ params, locals, fetch, url }) => {
	const uri = `${API_URL}/${params.id}`
	const response = await fetch(uri,{ headers: { "Accept": "application/ld+json" } });
	const doc = await response.json();

	loadUtil();

	return { id: params.id, lang: params.lang ?? 'sv', doc: doc } ;
}) satisfies PageServerLoad;

async function loadUtil() {
	const [contextRes, vocabRes, displayRes] = await Promise.all([
		fetch(`${ID_URL}/context.jsonld`),
		fetch(`${ID_URL}/vocab/data.jsonld`),
		fetch(`${ID_URL}/vocab/display/data.jsonld`)
	]);

	const context = await contextRes.json();
	const vocab = await vocabRes.json();
	const display = await displayRes.json();

	const displayUtil = new DisplayUtil(display, new VocabUtil(vocab, context));
}