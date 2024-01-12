import { dev } from '$app/environment';
import { interpolate } from './interpolate';
import { defaultLocale, type LocaleCode } from './locales';
import sv from './locales/sv.js';

const loadedTranslations: Record<string, typeof sv> = {
	sv
};

export async function getTranslator(locale: LocaleCode) {
	if (!loadedTranslations[locale]) {
		loadedTranslations[locale] = (await import(`./locales/${locale}.js`)).default;
		// add error handling?
	}

	return (key: string, options?: { values?: Record<string, string> }): string => {
		if (!key.includes('.')) {
			// do we require nested keys?
			throw new Error('Incorrect i11n key');
		}
		const [section, item] = key.split('.') as [string, string];

		// @ts-expect-error - how to typecheck??
		const localeResult = loadedTranslations[locale][section]?.[item];

		if (localeResult) {
			return interpolate(localeResult, options?.values);
		} else {
			console.warn(`Missing ${locale} translation for ${key}`);
		}

		// @ts-expect-error - how to typecheck??
		const fallbackResult = loadedTranslations[defaultLocale][section][item];

		if (fallbackResult) {
			return interpolate(fallbackResult, options?.values);
		}

		const error = `Missing fallback translation for ${key}`;
		if (dev) {
			throw new Error(error);
		}

		console.error(error);
		return key;
	};
}
