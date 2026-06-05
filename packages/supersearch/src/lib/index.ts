import type { QualifierRendererProps } from './types/lxlQualifierPlugin.js';
import type {
	ResultItem,
	ChangeQueryParams,
	ShowExpandedSearchOptions,
	HideExpandedSearchOptions,
	DebouncedWaitFunction,
	ExpandEvent,
	UserEvent
} from './types/superSearch.js';
import type { EditorState } from '@codemirror/state';
import type { Selection } from './components/CodeMirror.svelte';
import type {
	ChangeCodeMirrorEvent as ChangeSuperSearchEvent,
	ViewUpdateCodeMirrorEvent as ViewUpdateSuperSearchEvent
} from './components/CodeMirror.svelte';
import lxlQualifierPlugin from './extensions/lxlQualifierPlugin/index.js';
import SuperSearch from '$lib/components/SuperSearch.svelte';
import useSearchRequest from './utils/useSearchRequest.svelte';
import { getParentNodeByType } from './utils/getParentByType.js';

export {
	SuperSearch,
	lxlQualifierPlugin,
	useSearchRequest,
	getParentNodeByType,
	type EditorState,
	type ResultItem,
	type Selection,
	type QualifierRendererProps,
	type ChangeSuperSearchEvent,
	type ViewUpdateSuperSearchEvent,
	type ChangeQueryParams,
	type ShowExpandedSearchOptions,
	type HideExpandedSearchOptions,
	type DebouncedWaitFunction,
	type ExpandEvent,
	type UserEvent
};
