import { getTranslator } from '$lib/i18n/index.js';
import { baseLocale, getSupportedLocale, initLocalizeHref } from '$lib/i18n/locales';

export async function load({ params, data, url }) {
	const locale = getSupportedLocale(params?.lang); // will use default locale if no lang param
	const t = await getTranslator(locale);
	const localizeHref = initLocalizeHref(locale, url);

	const base = locale === baseLocale ? '/' : `/${locale}`;
	const userSettings = data.userSettings;
	const subsetMapping = data.subsetMapping;
	const siteName = data.siteName;

	return { locale, t, localizeHref, base, userSettings, subsetMapping, siteName };
}
