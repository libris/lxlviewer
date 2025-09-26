import { error, json } from '@sveltejs/kit';
import { getSupportedLocale } from '$lib/i18n/locales';
import { type FramedData } from '$lib/types/xl';
import { createHolderLinks } from '$lib/utils/holdings';

export async function GET({ params, url, locals }) {
	const displayUtil = locals.display;
	const id = url.searchParams.get('id');

	if (id) {
		const response = await fetch(`${id}?framed=true`, {
			headers: { Accept: 'application/ld+json' }
		});
		if (response.ok) {
			const resJson = await response.json();
			const libraryMainEntity = resJson['mainEntity'] as FramedData;

			const holderLinks = createHolderLinks(
				libraryMainEntity,
				getSupportedLocale(params.lang),
				displayUtil
			);

			return json(
				{
					links: holderLinks,
					libraryMainEntity
				},
				{
					headers: {
						'cache-control': 'public, max-age=86400' // 24 hrs??
					}
				}
			);
		} else {
			console.error(`Could not fetch holder data for ${id}`);
			return error(response.status, response.statusText);
		}
	}
}
