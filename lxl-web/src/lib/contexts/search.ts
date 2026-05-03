import { createContext } from 'svelte';
import type { Selection, ShowExpandedSearchOptions } from 'supersearch';
import type { ChangeQueryParams } from '$lib/components/supersearch/SuperSearchWrapper.svelte';

export type SearchContext = {
	getQuery: () => string;
	getSelection: () => Selection | undefined;
	showExpandedSearch: (options?: ShowExpandedSearchOptions) => void;
	hideExpandedSearch: () => void;
	changeQuery: (params: ChangeQueryParams) => void;
	submit: (form: HTMLFormElement) => void;
	initialStateBeforeMount?: {
		value: string;
		selection?: { anchor: number | null | undefined; head: number | null | undefined };
	};
	isMounted: boolean;
};

export const [getSearchContext, setSearchContext] = createContext<SearchContext>();
