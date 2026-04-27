import { createContext } from 'svelte';
import type { ShowExpandedSearchOptions } from 'supersearch';

export enum Mode {
	DEFAULT_MODE = 'DEFAULT_MODE',
	SELECT_QUALIFIER_KEY_MODE = 'SELECT_QUALIFIER_KEY_MODE',
	SELECT_QUALIFIER_VALUE_MODE = 'SELECT_QUALIFIER_VALUE_MODE'
}

export type ChangeQueryParams = {
	change: { insert: string; from?: number; to?: number };
	selection?: {
		anchor?: number | null;
		head?: number | null;
	};
};

export const [getSearchContext, setSearchContext] = createContext<{
	mode: Mode;
	showExpandedSearch: (options: ShowExpandedSearchOptions) => void;
	hideExpandedSearch: () => void;
	changeQuery: (params: ChangeQueryParams) => void;
	initialStateBeforeMount?: {
		value: string;
		selection?: { anchor: number | null | undefined; head: number | null | undefined };
	};
	isMounted: boolean;
}>();
