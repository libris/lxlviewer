import { getTranslator } from '$lib/i18n/index.js';
import { getSupportedLocale, defaultLocale } from '$lib/i18n/locales';

export async function load({ params }) {
	const locale = getSupportedLocale(params?.lang); // will use default locale if no lang param
	const t = await getTranslator(locale);
	const base = locale === defaultLocale ? '/' : `/${locale}/`;
	return { locale, t, base };
}
