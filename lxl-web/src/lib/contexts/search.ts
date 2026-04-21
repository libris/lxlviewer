import { createContext } from 'svelte';
import type { ShowExpandedSearchOptions } from 'supersearch';
import type { ChangeQueryParams } from '$lib/components/supersearch/SuperSearchWrapper.svelte';
import type { Mode } from '$lib/types/supersearch';

export const [getSearchContext, setSearchContext] = createContext<{
	showExpandedSearch: (options?: ShowExpandedSearchOptions) => void;
	hideExpandedSearch: () => void;
	changeQuery: (params: ChangeQueryParams) => void;
	initialStateBeforeMount?: {
		value: string;
		selection?: { anchor: number | null | undefined; head: number | null | undefined };
	};
	isMounted: boolean;
	mode: Mode;
}>();
