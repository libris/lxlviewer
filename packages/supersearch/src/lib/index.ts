import SuperSearch from '$lib/components/SuperSearch.svelte';
import type { Selection } from './components/CodeMirror.svelte';
import lxlQualifierExtension, {
	type QualifierWidgetProps
} from '$lib/extensions/lxlQualifierPlugin/index.js';
import type { ResultItem, ShowExpandedSearchOptions } from './types/superSearch.js';
import useSearchRequest from './utils/useSearchRequest.svelte';
import type {
	ChangeCodeMirrorEvent as ChangeSuperSearchEvent,
	ViewUpdateCodeMirrorEvent as ViewUpdateSuperSearchEvent
} from './components/CodeMirror.svelte';

export {
	SuperSearch,
	lxlQualifierExtension,
	useSearchRequest,
	type ResultItem,
	type Selection,
	type QualifierWidgetProps,
	type ChangeSuperSearchEvent,
	type ViewUpdateSuperSearchEvent,
	type ShowExpandedSearchOptions
};
