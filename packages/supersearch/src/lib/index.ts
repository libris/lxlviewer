import type { QualifierWidgetProps } from './types/lxlQualifierPlugin.js';
import type { ResultItem, ShowExpandedSearchOptions } from './types/superSearch.js';
import type { Selection } from './components/CodeMirror.svelte';
import type {
	ChangeCodeMirrorEvent as ChangeSuperSearchEvent,
	ViewUpdateCodeMirrorEvent as ViewUpdateSuperSearchEvent
} from './components/CodeMirror.svelte';
import lxlQualifierPlugin from './extensions/lxlQualifierPlugin/index.js';
import SuperSearch from '$lib/components/SuperSearch.svelte';
import useSearchRequest from './utils/useSearchRequest.svelte';

export {
	SuperSearch,
	lxlQualifierPlugin,
	useSearchRequest,
	type ResultItem,
	type Selection,
	type QualifierWidgetProps,
	type ChangeSuperSearchEvent,
	type ViewUpdateSuperSearchEvent,
	type ShowExpandedSearchOptions
};
