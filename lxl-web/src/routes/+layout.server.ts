import { env } from '$env/dynamic/private';
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
				_limit: '0',
				_stats: 'false',
				_spell: 'false'
			}).toString()}`
		);

		if (res.ok) {
			const data = await res.json();

			const locale = getSupportedLocale(params?.lang);
			const translator = await getTranslator(locale);
			const mappings = displayMappings(data, locals.display, locale, translator, url.pathname);
			subsetMapping = mappings.filter((m) => m.variable === '_r');
		}
	}

	return {
		userSettings,
		subsetMapping
	};
}
