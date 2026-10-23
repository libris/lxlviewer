import { createContext } from 'svelte';

export const [getCookieConsentContext, setCookieConsentContext] = createContext<{
	visibleModal: boolean | undefined;
}>();
