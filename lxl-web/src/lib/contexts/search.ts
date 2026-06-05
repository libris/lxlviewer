import { createContext } from 'svelte';
import type {
	ShowExpandedSearchOptions,
	HideExpandedSearchOptions,
	EditorState
} from 'supersearch';
import type { ChangeQueryParams } from 'supersearch';

export type SearchContext = {
	initialStateBeforeMount:
		| {
				value: string;
				selection?: { anchor: number; head: number };
		  }
		| undefined;
	editorState: EditorState | undefined;
	showExpandedSearch: (options?: ShowExpandedSearchOptions) => void;
	hideExpandedSearch: (options?: HideExpandedSearchOptions) => void;
	changeQuery: (params: ChangeQueryParams) => void;
};

export const [getSearchContext, setSearchContext] = createContext<SearchContext>();
