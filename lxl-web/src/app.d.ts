// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { CitationDataWithError } from '#lib/types/citation.js';
import type { MatomoTracker } from '#lib/types/matomo.js';
import type { UserSettings } from '#lib/types/userSettings.js';
import type { DisplayUtil, VocabUtil } from '#lib/utils/xl.server.js';
import type {
	AdjecentSearchResult,
	DisplayMapping,
	QualifierSuggestion2
} from '#lib/types/search.js';
import 'unplugin-icons/types/svelte';
import type { AppMenuItem, Features, FooterSection, Site } from '#lib/types/site.js';
import type { ModalType } from '#lib/types/modal.js';
import type { HoldingsData } from '#lib/types/holdings.js';

declare global {
	namespace App {
		interface Error {
			errorId?: string;
		}
		interface Locals {
			vocab: VocabUtil;
			display: DisplayUtil;
			userSettings: UserSettings;
			librisSession?: string;
			dismissedBanner3: boolean;
			site?: Site;
			subsetMapping?: DisplayMapping[];
			qualifierSuggestionsByLocale: Record<
				import('#lib/i18n/locales.js').LocaleCode,
				QualifierSuggestion2[]
			>;
		}
		interface LayoutData {
			locale: import('#lib/i18n/locales.js').LocaleCode;
			t: Awaited<ReturnType<typeof import('#lib/i18n/index.js').getTranslator>>;
			localizeHref: ReturnType<typeof import('#lib/i18n/locales.js').initLocalizeHref>;
		}
		interface PageData extends LayoutData {
			base: string;
			features: Features;
			footer: FooterSection[];
			appMenuItems: AppMenuItem[];
			librisSession?: string;
			dismissedBanner3?: boolean;
			locale: string;
			qualifierSuggestions: QualifierSuggestion2[];
			siteName?: string;
			subsetMapping: DisplayMapping[] | undefined;
			userSettings: UserSettings;
		}
		interface PageState {
			expandedSuperSearch?: boolean;
			expandedInstances?: string[];
			holdings?: HoldingsData;
			holdingId?: string;
			adjecentSearchResults?: AdjecentSearchResult[];
			dimissedHighlighting?: boolean;
			citations?: CitationDataWithError;
			citationId?: string;
			modal?: {
				type: ModalType;
			};
		}
	}
	interface Window {
		Matomo?: {
			getTracker: (trackerUrl: string, siteId: number) => MatomoTracker | undefined;
		};
	}
}

export {};
