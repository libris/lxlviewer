import { createContext } from 'svelte';
import type { ChangeQueryParams } from '$lib/components/supersearch/SuperSearchWrapper.svelte';
import type { ShowExpandedSearchOptions, Selection } from 'supersearch';

export const [getSearchContext, setSearchContext] = createContext<{
	showExpandedSearch?: (params: ShowExpandedSearchOptions) => void;
	hideExpandedSearch?: () => void;
	focus?: () => void;
	blur?: () => void;
	isExpanded?: () => boolean | undefined;
	getSelection?: () => Selection | undefined;
	changeQuery?: (params: ChangeQueryParams) => void;
	addQualifierKey?: (qualifierKey: string) => void;
	showQualifiersMode?: () => void;
}>();
