import type { QualifierRendererProps } from './types/lxlQualifierPlugin.js';
import type {
	ResultItem,
	DispatchChangeParams,
	ShowExpandedSearchOptions,
	HideExpandedSearchOptions,
	DebouncedWaitFunction,
	ExpandEvent,
	CollapseEvent,
	UserEvent
} from './types/superSearch.js';
import type { Selection, Editor } from './components/CodeMirror.svelte';
import type {
	ChangeCodeMirrorEvent as ChangeEvent,
	SelectCodeMirrorEvent as SelectEvent,
	ViewUpdateCodeMirrorEvent as ViewUpdateEvent
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
	type Editor,
	type ResultItem,
	type Selection,
	type QualifierRendererProps,
	type ChangeEvent,
	type SelectEvent,
	type ViewUpdateEvent,
	type DispatchChangeParams,
	type ShowExpandedSearchOptions,
	type HideExpandedSearchOptions,
	type DebouncedWaitFunction,
	type ExpandEvent,
	type CollapseEvent,
	type UserEvent
};
