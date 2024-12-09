<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { SuperSearch, lxlQualifierPlugin } from 'supersearch';
	import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
	import getSortedSearchParams from '$lib/utils/getSortedSearchParams';
	import getLabelFromMappings from '$lib/utils/getLabelsFromMapping.svelte';
	import type { DisplayMapping } from '$lib/types/search';
	import BiSearch from '~icons/bi/search';
	import { lxlQuery } from 'codemirror-lang-lxlquery';
	import '$lib/styles/lxlquery.css';

	interface Props {
		placeholder: string;
		autofocus?: boolean;
	}

	let { placeholder, autofocus = false }: Props = $props();

	const useSuperSearch = env?.PUBLIC_USE_SUPERSEARCH === 'true';
	const showAdvanced = $page.url.searchParams.get('_x') === 'advanced' || useSuperSearch;

	let q = $state(
		$page.params.fnurgel
			? '' //don't reflect related search on resource pages
			: showAdvanced
				? $page.url.searchParams.get('_q')?.trim() || ''
				: $page.url.searchParams.get('_i')?.trim() || ''
	);

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
			let param = $page.url.searchParams.get('_x') === 'advanced' || useSuperSearch ? '_q' : '_i';
			q = $page.params.fnurgel ? '' : new URL(to.url).searchParams.get(param)?.trim() || '';
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
		// hijacking this function to set get autosuggest labels
		// to not hardcode lxl-needs into useSearchRequest
		// could also be new separate callback
		suggestMapping = data?.mapping;
		return data;
	}

	function getLabels(key: string, value?: string) {
		let pageMapping = $page.data.searchResult?.mapping;
		return getLabelFromMappings(key, value, pageMapping, suggestMapping);
	}
</script>

<form class="relative w-full" action="find" onsubmit={handleSubmit}>
	{#if useSuperSearch}
		<SuperSearch
			name="_q"
			bind:value={q}
			language={lxlQuery}
			placeholder={$page.data.t('search.search')}
			endpoint={'/api/supersearch'}
			queryFn={(query, cursor) => {
				return new URLSearchParams({
					_q: query,
					_limit: '10',
					cursor: cursor.toString()
				});
			}}
			transformFn={handleTransform}
			paginationQueryFn={handlePaginationQuery}
			extensions={[lxlQualifierPlugin(getLabels)]}
		>
			{#snippet resultItem(item)}
				<button type="button">
					<h2>{item?.heading}</h2>
				</button>
			{/snippet}
		</SuperSearch>
	{:else}
		<!-- svelte-ignore a11y_autofocus -->
		<input
			id="main-search"
			class="h-12 w-full rounded-full pr-12 text-secondary shadow-accent-dark/32 focus:shadow-search-focus focus:outline
			focus:outline-8 focus:outline-accent-dark/16 sm:h-14
			sm:pr-28"
			type="search"
			name="_q"
			{placeholder}
			aria-label={$page.data.t('search.search')}
			spellcheck="false"
			bind:value={q}
			{autofocus}
			data-testid="main-search"
		/>
		<input type="hidden" name="_i" value={q} />
		{#if $page.url.searchParams.get('_x') === 'advanced'}
			<!-- keep 'edit' state on new search -->
			<input type="hidden" name="_x" value="advanced" />
		{/if}

		<button
			type="submit"
			class="button-primary absolute right-1 top-1 rounded-full px-3 sm:right-2 sm:top-2 sm:px-4"
		>
			<BiSearch fill="currentColor" aria-hidden="true" />
			<span class="sr-only sm:not-sr-only">{$page.data.t('search.search')}</span>
		</button>
	{/if}
	{#each searchParams as [name, value]}
		{#if name !== '_q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
</form>
