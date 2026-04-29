import { createContext } from 'svelte';
import type { ShowExpandedSearchOptions } from 'supersearch';
import type { ChangeQueryParams } from '$lib/components/supersearch/SuperSearchWrapper.svelte';

export type SearchContext = {
	showExpandedSearch: (options?: ShowExpandedSearchOptions) => void;
	hideExpandedSearch: () => void;
	changeQuery: (params: ChangeQueryParams) => void;
	addQualifierKey: (qualifierKey: string) => void;
	submit: (form: HTMLFormElement) => void;
	initialStateBeforeMount?: {
		value: string;
		selection?: { anchor: number | null | undefined; head: number | null | undefined };
	};
	isMounted: boolean;
};

export const [getSearchContext, setSearchContext] = createContext<SearchContext>();
