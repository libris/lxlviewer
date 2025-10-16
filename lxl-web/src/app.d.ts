// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { CitationsType } from '$lib/types/citation';
import type { MatomoTracker } from '$lib/types/matomo';
import type { UserSettings } from '$lib/types/userSettings';
import type { DisplayUtil, VocabUtil } from '$lib/utils/xl';
import type { AdjecentSearchResult } from '$lib/types/search';
import 'unplugin-icons/types/svelte';

declare global {
	namespace App {
		interface Error {
			status?: string;
		}
		interface Locals {
			vocab: VocabUtil;
			display: DisplayUtil;
			userSettings: UserSettings;
		}
		interface PageData {
			locale: import('$lib/i18n/locales').LocaleCode;
			t: Awaited<ReturnType<typeof import('$lib/i18n').getTranslator>>;
			localizeHref: ReturnType<typeof import('$lib/i18n').initLocalizeHref>;
			userSettings: UserSettings;
		}
		interface PageState {
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
		// Matomo
		Matomo?: {
			getTracker: (trackerUrl: string, siteId: number) => MatomoTracker | undefined;
		};
	}
}

export {};
