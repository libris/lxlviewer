// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import 'unplugin-icons/types/svelte';

declare global {
	namespace App {
		interface Error {
			status?: string;
		}
		// interface Locals {}
		interface PageData {
			locale: import('$lib/i18n/locales').LocaleCode;
			t: Awaited<ReturnType<typeof import('$lib/i18n').getTranslator>>;
		}
		interface PageState {
			expandedInstances?: string[];
			holdings?: string;
		}
		// interface Platform {}
	}
}

export {};
