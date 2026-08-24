import type { Translations } from '$lib/i18n';

export interface Features {
	specialCollections: boolean;
	myPages: boolean;
	favouriteLibraries: boolean;
	holdings: boolean;
	resourceImages: boolean;
}

export const defaultFeatures: Features = {
	specialCollections: true,
	myPages: true,
	favouriteLibraries: true,
	holdings: true,
	resourceImages: true
};

export function resolveFeatures(overrides?: Partial<Features>): Features {
	return { ...defaultFeatures, ...overrides };
}

export const FOOTER_COOKIES_HREF = '[cookies]';

export interface FooterLink {
	titleKey: string;
	href: string;
}

export interface FooterSection {
	id: string;
	titleKey: string;
	items: FooterLink[];
}

export interface Site {
	name: string;
	searchSite?: string;
	configuration?: {
		themeName?: string;
		heroImage?: string;
		locales?: Translations;
		features?: Partial<Features>;
		footer?: FooterSection[];
	};
}
