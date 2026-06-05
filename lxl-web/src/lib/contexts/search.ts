import { createContext } from 'svelte';
import type {
	Selection,
	ShowExpandedSearchOptions,
	EditorState,
	HideExpandedSearchParams,
	Extension
} from 'supersearch';
import type { ChangeQueryParams } from '$lib/components/supersearch/SuperSearchWrapper.svelte';

export type SearchContext = {
	editorState: EditorState | undefined;
	getQuery: () => string;
	getSelection: () => Selection | undefined;
	historyField?: Extension;
	setEditorState: (editorState: EditorState) => void;
	showExpandedSearch: (options?: ShowExpandedSearchOptions) => void;
	hideExpandedSearch: (params?: HideExpandedSearchParams) => void;
	changeQuery: (params: ChangeQueryParams) => void;
	submit: (form: HTMLFormElement) => void;
	initialStateBeforeMount?: {
		value: string;
		selection?: { anchor: number | null | undefined; head: number | null | undefined };
	};
	isMounted: boolean;
};

export const [getSearchContext, setSearchContext] = createContext<SearchContext>();
