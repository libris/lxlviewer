import type { QualifierRendererProps } from './types/lxlQualifierPlugin.js';
import type {
	ResultItem,
	ShowExpandedSearchOptions,
	DebouncedWaitFunction,
	ExpandEvent,
	CollapseEvent,
	UserEvent,
	HideExpandedSearchParams
} from './types/superSearch.js';
import type { Selection } from './components/CodeMirror.svelte';
import type {
	ChangeCodeMirrorEvent as ChangeSuperSearchEvent,
	ViewUpdateCodeMirrorEvent as ViewUpdateSuperSearchEvent
} from './components/CodeMirror.svelte';
import lxlQualifierPlugin from './extensions/lxlQualifierPlugin/index.js';
import SuperSearch from '$lib/components/SuperSearch.svelte';
import useSearchRequest from './utils/useSearchRequest.svelte';
import { getParentNodeByType } from './utils/getParentByType.js';
import { isEqualState } from './utils/isEqualState.js';

import type { EditorState } from '@codemirror/state';

export {
	SuperSearch,
	lxlQualifierPlugin,
	useSearchRequest,
	getParentNodeByType,
	isEqualState,
	type ResultItem,
	type Selection,
	type QualifierRendererProps,
	type ChangeSuperSearchEvent,
	type ViewUpdateSuperSearchEvent,
	type ShowExpandedSearchOptions,
	type DebouncedWaitFunction,
	type ExpandEvent,
	type CollapseEvent,
	type UserEvent,
	type EditorState,
	type HideExpandedSearchParams
};
