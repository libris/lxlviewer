import { error, json } from '@sveltejs/kit';
import { getSupportedLocale } from '$lib/i18n/locales';
import { type FramedData } from '$lib/types/xl';
import { createHolderLinks } from '$lib/utils/holdings';
import { getLibrary } from '$lib/utils/getLibraries.js';

export async function GET({ params, url, locals }) {
	const displayUtil = locals.display;
	const id = url.searchParams.get('id');

	if (id) {
		const library = getLibrary(id);
		if (library) {
			const libraryMainEntity = library['mainEntity'] as FramedData;

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
			return error(404, 'not found');
		}
	}
}
