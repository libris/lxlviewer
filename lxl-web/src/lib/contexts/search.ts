import { createContext } from 'svelte';
import type { SuperSearch, Editor } from 'supersearch';

export type SearchContext = {
	superSearch: SuperSearch | undefined;
	lastTouchedEditor: Editor | undefined;
	finishedLoadingSuperSearch: boolean;
	showSearchInAppBar: boolean;
	q: string | null;
};

export const [getSearchContext, setSearchContext] = createContext<SearchContext>();
