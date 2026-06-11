import { createContext } from 'svelte';
import type { SearchResult } from '$lib/types/search';

export const [getHomepageContext, setHomepageContext] = createContext<{
	showSearchInAppBar: boolean;
	previews?: { [x: string]: SearchResult | undefined };
}>();
