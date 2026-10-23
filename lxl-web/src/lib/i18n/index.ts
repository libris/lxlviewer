import { interpolate } from './interpolate';
import { defaultLocale, type LocaleCode } from './locales';

export type TranslateFn = {
	(key: string, values?: { [key: string]: string }): string;
};

// locale -> section -> item
export type Translations = Record<string, Record<string, Record<string, string>>>;

export async function getTranslator(locale: LocaleCode, siteOverrides?: Translations) {
	const loadedTranslations: Translations = {};
	let siteTranslations: Translations | undefined = undefined;
	try {
		loadedTranslations[locale] = (await import(`./locales/${locale}.js`)).default;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		console.error('failed to load locale file for ', locale);
		loadedTranslations[defaultLocale] = (await import(`./locales/${defaultLocale}.js`)).default;
	}

	siteTranslations = siteOverrides;

	return (key: string, values?: { [key: string]: string }): string => {
		if (!key.includes('.')) {
			// do we require nested keys?
			throw new Error('Incorrect i11n key');
		}

		// split key at the first '.'
		const [section, ...rest] = key.split('.') as [string, string[]];
		const item = rest.join('.');

		let localeResult;
		if (siteTranslations) {
			localeResult = siteTranslations?.[locale]?.[section]?.[item];
		}
		if (!localeResult) {
			localeResult = loadedTranslations?.[locale]?.[section]?.[item];
		}

		if (localeResult) {
			return interpolate(localeResult, values);
		} else {
			console.warn(`Missing ${locale} translation for ${key}`);
		}

		// @ts-expect-error - how to typecheck??
		const fallbackResult = loadedTranslations?.[defaultLocale]?.[section]?.[item];

		if (fallbackResult) {
			return interpolate(fallbackResult, values);
		}

		console.error(`Missing fallback translation for ${key}`);
		return key;
	};
}
