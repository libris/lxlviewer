<script lang="ts">
	// import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { SuperSearch, lxlQualifierPlugin } from 'supersearch';
	import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
	import getSortedSearchParams from '$lib/utils/getSortedSearchParams';
	import getLabelFromMappings from '$lib/utils/getLabelsFromMapping.svelte';
	import { relativizeUrl } from '$lib/utils/http';
	import type { DisplayMapping } from '$lib/types/search';
	// import BiSearch from '~icons/bi/search';
	import { lxlQuery } from 'codemirror-lang-lxlquery';
	import '$lib/styles/lxlquery.css';

	// interface Props {
	// 	placeholder: string;
	// 	autofocus?: boolean;
	// }

	// let { placeholder, autofocus = false }: Props = $props();

	// let useSuperSearch =
	// 	env?.PUBLIC_USE_SUPERSEARCH === 'true' || $page.url.searchParams.get('_x') === 'supersearch';
	// const showAdvanced = $page.url.searchParams.get('_x') === 'advanced' || useSuperSearch;

	let q = $state($page.params.fnurgel ? '' : $page.url.searchParams.get('_q')?.trim() || '');

	let params = getSortedSearchParams(addDefaultSearchParams($page.url.searchParams));
	// Always reset these params on new search
	params.set('_offset', '0');
	params.delete('_i');
	params.delete('_o');
	params.delete('_p');
	const searchParams = Array.from(params);

	let suggestMapping: DisplayMapping[] | undefined = $state();

	afterNavigate(({ to }) => {
		/** Update input value after navigation on /find route */
		if (to?.url) {
			q = $page.params.fnurgel ? '' : new URL(to.url).searchParams.get('_q')?.trim() || '';
		}
	});

	function handleSubmit(event: SubmitEvent) {
		if (!q || !q.trim()) {
			event.preventDefault();
		} else {
			q = q.trim();
		}
	}

	function handlePaginationQuery(searchParams: URLSearchParams, prevData: unknown) {
		const paginatedSearchParams = new URLSearchParams(Array.from(searchParams.entries()));
		const limit = parseInt(searchParams.get('_limit')!, 10);
		const offset = limit + parseInt(searchParams.get('_offset') || '0', 10);

		if (prevData && offset < prevData.totalItems) {
			paginatedSearchParams.set('_offset', offset.toString());
			return paginatedSearchParams;
		}
		return undefined;
	}

	function handleTransform(data) {
		suggestMapping = data?.mapping;
		return data;
	}

	let derivedLxlQualifierPlugin = $derived.by(() => {
		function getLabels(key: string, value?: string) {
			let pageMapping = $page.data.searchResult?.mapping;
			return getLabelFromMappings(key, value, pageMapping, suggestMapping);
		}
		return lxlQualifierPlugin(getLabels);
	});
</script>

<form class="relative w-full" action="find" onsubmit={handleSubmit}>
	<SuperSearch
		name="_q"
		bind:value={q}
		language={lxlQuery}
		placeholder={$page.data.t('search.search')}
		endpoint={`/api/${$page.data.locale}/supersearch`}
		queryFn={(query, cursor) => {
			return new URLSearchParams({
				_q: query,
				_limit: '10',
				cursor: cursor.toString()
			});
		}}
		transformFn={handleTransform}
		paginationQueryFn={handlePaginationQuery}
		extensions={[derivedLxlQualifierPlugin]}
		toggleWithKeyboardShortcut
		comboboxAriaLabel={$page.data.t('search.search')}
		defaultRow={-1}
	>
		{#snippet resultItem(item, getCellId, isFocusedCell)}
			<a
				href={relativizeUrl(item?.['@id'])}
				role="gridcell"
				id={getCellId(0)}
				class:focused-cell={isFocusedCell(0)}
			>
				<h2>{item?.heading}</h2>
			</a>
		{/snippet}
	</SuperSearch>
	{#each searchParams as [name, value]}
		{#if name !== '_q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
</form>

<style lang="postcss">
	/* :global(.supersearch-input) {
    position: relative;
    cursor: text;
    box-shadow: var(--box-shadow-border-all);
    border: none;
    border-radius: 8px;
    background: #fff;
    padding: 0 var(--height-input-base);
    width: 100%;
    @apply p-1;
    @apply pl-2 py-1;
    min-height: var(--height-input-lg);
  } */

	/* :global(.codemirror-container .cm-scroller) {
    @apply font-sans text-base text-primary min-h-12 !important;
    
    @apply min-h-12;

    min-height: var(--height-input-lg);
    font-size: var(--font-size-sm);
    font-family: var(--font-body);
  } */

	/* :global(.codemirror-container .cm-content) {
    @apply py-3;
    padding-top: 0.6125rem;
    padding-bottom: 0.6125rem;
  } */

	/* :global(.codemirror-container .cm-line) {
    padding: 0 1px; using 0 on horizontal axis causes codemirror cursor to occasionally disappear on firefox
    line-height: 2;
  } */

	/* :global(.codemirror-container .cm-editor.cm-focused) {
    outline: none;
  } */

	:global(.supersearch-dialog) {
		/* @apply m-0 w-screen h-screen bg-transparent; */
		@apply m-0 h-full w-full border-none p-0;
		background: none;
		max-width: 100vw;
		max-height: 100vh;
	}

	:global(.supersearch-wrapper) {
		/* @apply w-screen page-padding gap-x-8 bg-transparent !important; */
		@apply pointer-events-none grid gap-x-8 page-padding;
		grid-template-areas: '. supersearch-content .';
		/* grid-template-columns: minmax(240px, 1fr) minmax(0, 4fr) minmax(240px, 1fr); */
		/* padding: 0 calc(var(--gap-base) / 2); */
		/* pointer-events: none; */
		grid-template-columns: 1fr minmax(0, 4fr) 1fr;

		@media screen and (min-width: theme('screens.md')) {
			grid-template-columns: minmax(240px, 1fr) minmax(0, 4fr) minmax(240px, 1fr);
		}
	}

	:global(.supersearch-content) {
		@apply pointer-events-auto;
		grid-area: supersearch-content;
	}
</style>
