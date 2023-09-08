import { PUBLIC_ID_PATH } from '$env/static/public';
import { json } from '@sveltejs/kit';
import displayGroups from '$lib/assets/json/displayGroups.json';
import i18n from '$lib/assets/json/i18n.json';

/**
 * Groups the external API calls required for the LXLJS `resources` parameter
 * into a single response, which can be cached (depending on if the data is suitable for caching?).
 * Unique version hashes could maybe also be an alternative to allow longer cache max-ages?
 *
 * Further optimization can also be made using the `handleFetch` hook to hit the LibrisXL API
 * directly when server-side rendering using localhost (bypassing whatever proxies and load
 * balancers sit between it and the public internet).
 * See: https://kit.svelte.dev/docs/hooks#server-hooks-handlefetch
 */

export async function GET() {
	const [contextRes, vocabRes, displayRes] = await Promise.all([
		fetch(`${PUBLIC_ID_PATH}/context.jsonld`),
		fetch(`${PUBLIC_ID_PATH}/vocab/data.jsonld`),
		fetch(`${PUBLIC_ID_PATH}/vocab/display/data.jsonld`)
	]);

	const context = await contextRes.json();
	const vocab = await vocabRes.json();
	const display = await displayRes.json();

	return json(
		{
			context,
			vocab,
			display,
			displayGroups,
			i18n
		},
		{
			headers: {
				'cache-control': 'public, max-age=300' // Probably best with an short max-age?
			}
		}
	);
}
