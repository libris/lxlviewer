import SuperSearch from '$lib/components/SuperSearch.svelte';
import type { Selection } from './components/CodeMirror.svelte';
import lxlQualifierPlugin from '$lib/extensions/lxlQualifierPlugin/index.js';
import type { ResultItem } from './types/superSearch.js';
import useSearchRequest from './utils/useSearchRequest.svelte';

export { SuperSearch, lxlQualifierPlugin, useSearchRequest, type ResultItem, type Selection };
