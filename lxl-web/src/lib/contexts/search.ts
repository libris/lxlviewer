import { createContext } from 'svelte';
import type { ShowExpandedSearchOptions, HideExpandedSearchOptions, Editor } from 'supersearch';
import type { ChangeQueryParams } from 'supersearch';

export type SearchContext = {
	lastUpdatedEditor: Editor | undefined;
	showExpandedSearch: (options?: ShowExpandedSearchOptions) => void;
	hideExpandedSearch: (options?: HideExpandedSearchOptions) => void;
	changeQuery: (params: ChangeQueryParams) => void;
};

export const [getSearchContext, setSearchContext] = createContext<SearchContext>();
