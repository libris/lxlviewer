import { getSupportedLocale } from '$lib/i18n/locales';
import { resolveFeatures } from '$lib/types/site';
import { defaultFooter } from '$lib/constants/footer';

export async function load({ locals, url, params }) {
	const userSettings = locals.userSettings;
	const librisSession = locals.librisSession;
	const locale = getSupportedLocale(params?.lang); // will use default locale if no lang param

	// create dependency to react to _r changes
	url.searchParams.get('_r');
	const subsetMapping = locals.subsetMapping;

	const siteName = locals.site?.name;
	const siteTranslations = locals.site?.configuration?.locales;
	const heroImage = locals.site?.configuration?.heroImage;
	const features = resolveFeatures(locals.site?.configuration?.features);
	const footer = locals.site ? (locals.site.configuration?.footer ?? []) : defaultFooter;
	const qualifierSuggestions = locals.qualifierSuggestionsByLocale[locale];

	return {
		userSettings,
		librisSession,
		subsetMapping,
		siteName,
		siteTranslations,
		heroImage,
		features,
		footer,
		qualifierSuggestions
	};
}
