import { createContext } from 'svelte';
import type { SearchResult } from '$lib/types/search';

export const [getHomepageContext, setHomepageContext] = createContext<{
	previews?: { [x: string]: SearchResult | undefined };
}>();
