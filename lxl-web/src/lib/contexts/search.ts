import { createContext } from 'svelte';
import type { SuperSearch, Editor } from 'supersearch';

export type SearchContext = {
	superSearch: SuperSearch | undefined;
	lastUpdatedEditor: Editor | undefined;
	showSearchInAppBar: boolean;
};

export const [getSearchContext, setSearchContext] = createContext<SearchContext>();
