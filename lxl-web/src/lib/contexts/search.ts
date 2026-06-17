import { createContext } from 'svelte';
import type { SuperSearch, Editor } from 'supersearch';

export type SearchContext = {
	finishedLoadingSuperSearch: boolean;
	superSearch: SuperSearch | undefined;
	lastTouchedEditor: Editor | undefined;
	showSearchInAppBar: boolean;
};

export const [getSearchContext, setSearchContext] = createContext<SearchContext>();
