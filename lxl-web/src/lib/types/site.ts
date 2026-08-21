import type { Translations } from '$lib/i18n';

export interface Site {
	name: string;
	searchSite?: string;
	configuration?: {
		themeName?: string;
		heroImage?: string;
		locales?: Translations;
	};
}
