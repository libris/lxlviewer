import { getTranslator } from '$lib/i18n/index.js';
import { getSupportedLocale } from '$lib/i18n/locales';

export async function load({ params }) {
	const locale = getSupportedLocale(params?.lang); // will use default locale if no lang param
	const t = await getTranslator(locale);
	return { locale, t };
}
