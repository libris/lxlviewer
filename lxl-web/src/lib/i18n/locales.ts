export enum Locales {
	sv = 'Svenska',
	en = 'English'
}

export type LocaleCode = keyof typeof Locales;
export const defaultLocale = 'sv';
export const baseLocale = defaultLocale;

export function getSupportedLocale(userLocale: string | undefined): LocaleCode {
	const locale = Object.keys(Locales).find((supportedLocale) => {
		return userLocale?.includes(supportedLocale);
	}) as LocaleCode;
	return locale || defaultLocale;
}

export function isLocale(potentialLocale: string) {
	return !!Locales?.[potentialLocale as keyof typeof Locales];
}

export function initLocalizeHref(locale: LocaleCode, baseUrl: string | URL) {
	return (url: string | URL, options?: { locale?: LocaleCode }) =>
		localizeHref(url, { locale: options?.locale || locale, baseUrl });
}

function localizeHref(href: string | URL, options: { locale: LocaleCode; baseUrl: string | URL }) {
	const url = localizeUrl(href, options);

	if (url.origin !== options.baseUrl) {
		return href?.toString(); // return URLs with different origin as-is
	}

	return (
		(url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname) + // remove trailing slashes
		url.search +
		url.hash
	);
}

function localizeUrl(url: string | URL, options: { locale: LocaleCode; baseUrl: string | URL }) {
	const urlObj = typeof url === 'string' ? new URL(url, options.baseUrl) : url;

	const pathSegments = urlObj.pathname.split('/').filter(Boolean);
	const localeFromUrl = isLocale(pathSegments[0]) ? pathSegments[0] : undefined;

	if (localeFromUrl) {
		const localizedPathname = urlObj.pathname.replace(
			new RegExp('^/' + localeFromUrl),
			options.locale === baseLocale ? '' : `/${options.locale}`
		);
		urlObj.pathname = localizedPathname;
		return urlObj;
	}

	/** Return unchanged if both current and target locale is base locale */
	if (options.locale === baseLocale) {
		return urlObj;
	}

	const localizedPathname = `/${options.locale}` + urlObj.pathname;
	urlObj.pathname = localizedPathname;
	return urlObj;
}
