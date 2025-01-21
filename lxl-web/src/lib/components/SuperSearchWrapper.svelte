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
			<div class="py-2">
				<a
					href={relativizeUrl(item?.['@id'])}
					role="gridcell"
					id={getCellId(0)}
					class:focused-cell={isFocusedCell(0)}
				>
					<h2>{item?.heading}</h2>
				</a>
			</div>
		{/snippet}
	</SuperSearch>
	{#each searchParams as [name, value]}
		{#if name !== '_q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
</form>

<style lang="postcss">
	:global(.supersearch-input) {
		@apply relative min-h-12 w-full cursor-text rounded-md border-0 bg-cards px-2 shadow-input;
	}

	:global(.supersearch-dialog .supersearch-input) {
		box-shadow: inset 0 0 0 1px #d5e4dd;
	}

	:global(.supersearch-dialog) {
		@apply m-0 h-full w-full border-none p-0;
		background: none;
		max-width: 100vw;
		max-height: 100vh;
	}

	:global(.supersearch-dialog-wrapper) {
		@apply pointer-events-none grid grid-cols-header gap-x-8 md:grid-cols-header-md md:pl-2;

		grid-template-areas: 'supersearch-content supersearch-content supersearch-content';
		@media screen and (min-width: 810px) {
			grid-template-areas: '. supersearch-content .';
		}
	}

	:global(.supersearch-dialog-content) {
		@apply pointer-events-auto overflow-hidden rounded-md bg-cards px-4 drop-shadow-md;
		grid-area: supersearch-content;
	}

	:global(.supersearch-dialog .supersearch-combobox) {
		@apply py-4;
	}

	:global(.codemirror-container .cm-scroller) {
		@apply min-h-12;
		/* font size & family here */
		scrollbar-width: none;
	}

	:global(.codemirror-container .cm-content) {
		padding-top: 0.6125rem;
		padding-bottom: 0.6125rem;
	}

	:global(.supersearch-suggestions) {
		@apply pb-4;
	}

	:global(.supersearch-show-more) {
		@apply py-4;
	}

	:global(.supersearch-dialog .focused) {
		@apply bg-main;
	}

	/* :global(.codemirror-container .cm-line) {
    padding: 0 1px; using 0 on horizontal axis causes codemirror cursor to occasionally disappear on firefox
    line-height: 2;
  } */

	/* :global(.codemirror-container .cm-editor.cm-focused) {
    outline: none;
  } */
</style>
