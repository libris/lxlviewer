// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { CitationsType } from '$lib/types/citation';
import type { MatomoTracker } from '$lib/types/matomo';
import type { UserSettings } from '$lib/types/userSettings';
import type { DisplayUtil, VocabUtil } from '$lib/utils/xl.server';
import type { AdjecentSearchResult, DisplayMapping, QualifierSuggestion2 } from '$lib/types/search';
import 'unplugin-icons/types/svelte';
import type { Site } from '$lib/types/site';

declare global {
	namespace App {
		interface Error {
			status?: string;
			errorId?: string;
		}
		interface Locals {
			vocab: VocabUtil;
			display: DisplayUtil;
			userSettings: UserSettings;
			librisSession?: string;
			site?: Site;
			subsetMapping?: DisplayMapping[];
			qualifierSuggestionsByLocale: Record<
				import('$lib/i18n/locales').LocaleCode,
				QualifierSuggestion2[]
			>;
		}
		interface LayoutData {
			locale: import('$lib/i18n/locales').LocaleCode;
			t: Awaited<ReturnType<typeof import('$lib/i18n').getTranslator>>;
			localizeHref: ReturnType<typeof import('$lib/i18n/locales').initLocalizeHref>;
		}
		interface PageData extends LayoutData {
			base: string;
			librisSession?: string;
			locale: string;
			qualifierSuggestions: QualifierSuggestion2[];
			siteName?: string;
			subsetMapping: DisplayMapping[] | undefined;
			userSettings: UserSettings;
		}
		interface PageState {
			expandedSuperSearch?: boolean;
			expandedInstances?: string[];
			holdings?: string;
			adjecentSearchResults?: AdjecentSearchResult[];
			dimissedHighlighting?: boolean;
			citations?: CitationsType;
			citationId?: string;
		}
		// interface Platform {}
	}
	interface Window {
		Matomo?: {
			getTracker: (trackerUrl: string, siteId: number) => MatomoTracker | undefined;
		};
	}
}

export {};
