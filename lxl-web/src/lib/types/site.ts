import type { Translations } from '$lib/i18n';

export interface Features {
	specialCollections: boolean;
	myPages: boolean;
	favouriteLibraries: boolean;
	holdings: boolean;
}

export const defaultFeatures: Features = {
	specialCollections: true,
	myPages: true,
	favouriteLibraries: true,
	holdings: true
};

export function resolveFeatures(overrides?: Partial<Features>): Features {
	return { ...defaultFeatures, ...overrides };
}

export interface Site {
	name: string;
	searchSite?: string;
	configuration?: {
		themeName?: string;
		heroImage?: string;
		locales?: Translations;
		features?: Partial<Features>;
	};
}
