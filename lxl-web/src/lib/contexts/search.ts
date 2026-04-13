import { createContext } from 'svelte';
import type { ChangeQueryParams } from '$lib/components/supersearch/SuperSearchWrapper.svelte';

export const [getSearchContext, setSearchContext] = createContext<{
	changeQuery?: (params: ChangeQueryParams) => void;
}>();
