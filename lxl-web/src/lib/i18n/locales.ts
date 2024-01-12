export enum Locales {
	sv = 'Svenska',
	en = 'English'
}

export type LocaleCode = keyof typeof Locales;
export const defaultLocale = 'sv';

export function getSupportedLocale(userLocale: string | undefined): LocaleCode {
	const locale = Object.keys(Locales).find((supportedLocale) => {
		return userLocale?.includes(supportedLocale);
	}) as LocaleCode;
	return locale || defaultLocale;
}
