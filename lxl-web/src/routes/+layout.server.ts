import { env } from '$env/dynamic/private';
import type { MappingsOnlyPartialCollectionView } from '$lib/types/search';
import { getTranslator } from '$lib/i18n/index.js';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import { displayMappings } from '$lib/utils/search';

export async function load({ locals, url, params, fetch }) {
	const userSettings = locals.userSettings;
	let subsetMapping;
	const r = url.searchParams.get('_r');
	// get the label for a subset filter on any page
	if (r && r !== '*') {
		const res = await fetch(
			`${env.API_URL}/find.jsonld?${new URLSearchParams({
				_r: r,
				_q: '*',
				_mappingOnly: 'true'
			}).toString()}`
		);

		if (res.ok) {
			const data = (await res.json()) as MappingsOnlyPartialCollectionView;

			const locale = getSupportedLocale(params?.lang);
			const translator = await getTranslator(locale);
			const mappings = displayMappings(data, locals.display, locale, translator, url.pathname);
			subsetMapping = mappings.filter((m) => m.variable === '_r');
		} else {
			console.warn('Failed to get _r mappings');
		}
	}

	return {
		userSettings,
		subsetMapping
	};
}
