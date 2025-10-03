import { env } from '$env/dynamic/private';
import { getTranslator } from '$lib/i18n/index.js';
import { getSupportedLocale } from '$lib/i18n/locales.js';
import { displayMappings } from '$lib/utils/search';

export async function load({ locals, url, params }) {
	const userSettings = locals.userSettings;
	let subset = null;

	if (url.searchParams.has('_r')) {
		// get the label for a subset on any page
		const r = encodeURIComponent(url.searchParams.get('_r')?.toString() || '');
		const response = await fetch(`${env.API_URL}/find.jsonld?_q=${r}&_limit=0&_stats=false`);
		if (response.ok) {
			const result = await response.json();

			const locale = getSupportedLocale(params?.lang);
			const translator = await getTranslator(locale);
			subset = displayMappings(result, locals.display, locale, translator);
		}
	}

	return {
		userSettings,
		subset
	};
}
