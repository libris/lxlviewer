import { getSupportedLocale } from '$lib/i18n/locales';

export async function load({ locals, url, params }) {
	const userSettings = locals.userSettings;
	const dismissedBanner = locals.dismissedBanner;
	const librisSession = locals.librisSession;
	const locale = getSupportedLocale(params?.lang); // will use default locale if no lang param

	// create dependency to react to _r changes
	url.searchParams.get('_r');
	const subsetMapping = locals.subsetMapping;

	const siteName = locals.site?.name;
	const qualifierSuggestions = locals.qualifierSuggestionsByLocale[locale];

	return {
		userSettings,
		dismissedBanner,
		librisSession,
		subsetMapping,
		siteName,
		qualifierSuggestions
	};
}
