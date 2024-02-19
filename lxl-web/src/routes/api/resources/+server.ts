import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import displayGroups from '$lib/assets/json/displayGroups.json';
import i18n from '$lib/assets/json/i18n.json';

/**
 * Groups the external API calls required for the LXLJS `resources` parameter
 * into a single response, which can be cached.
 */

export async function GET() {
	const [contextRes, vocabRes, displayRes] = await Promise.all([
		fetch(`${env.ID_URL}/context.jsonld`),
		fetch(`${env.ID_URL}/vocab/data.jsonld`),
		fetch(`${env.ID_URL}/vocab/display/data.jsonld`)
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
