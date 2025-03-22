import { browser } from '$app/environment';
import { getTranslator } from '$lib/i18n/index.js';
import { getSupportedLocale, defaultLocale } from '$lib/i18n/locales';
import { userSettings as userSettingsState } from '$lib/utils/userSettings.svelte.js';

export async function load({ params, data }) {
	const locale = getSupportedLocale(params?.lang); // will use default locale if no lang param
	const t = await getTranslator(locale);
	const base = locale === defaultLocale ? '/' : `/${locale}/`;
	const userSettings = data.userSettings;

	// make user settings reactive client side
	if (browser) {
		userSettingsState.init(data?.userSettings);
	}
	return { locale, t, base, userSettings };
}
