import { interpolate } from './interpolate';
import { defaultLocale, type LocaleCode } from './locales';

export type TranslateFn = {
	(key: string, values?: { [key: string]: string }): string;
};

export async function getTranslator(locale: LocaleCode) {
	const loadedTranslations: Record<string, string> = {};
	try {
		loadedTranslations[locale] = (await import(`./locales/${locale}.js`)).default;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		console.error('failed to load locale file for ', locale);
		loadedTranslations[defaultLocale] = (await import(`./locales/${defaultLocale}.js`)).default;
	}

	return (key: string, values?: { [key: string]: string }): string => {
		if (!key.includes('.')) {
			// do we require nested keys?
			throw new Error('Incorrect i11n key');
		}

		// split key at the first '.'
		const [section, ...rest] = key.split('.') as [string, string[]];
		const item = rest.join('.');

		// @ts-expect-error - how to typecheck??
		const localeResult = loadedTranslations?.[locale]?.[section]?.[item];

		if (localeResult) {
			return interpolate(localeResult, values);
		} else {
			console.warn(`Missing ${locale} translation for ${key}`);
		}

		// @ts-expect-error - how to typecheck??
		const fallbackResult = loadedTranslations[defaultLocale][section][item];

		if (fallbackResult) {
			return interpolate(fallbackResult, values);
		}

		console.error(`Missing fallback translation for ${key}`);
		return key;
	};
}
