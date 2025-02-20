<script lang="ts">
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { SuperSearch, lxlQualifierPlugin } from 'supersearch';
	import SuggestionCard from './SuggestionCard.svelte';
	import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
	import getSortedSearchParams from '$lib/utils/getSortedSearchParams';
	import getLabelFromMappings from '$lib/utils/getLabelsFromMapping.svelte';
	import type { DisplayMapping } from '$lib/types/search';
	import { lxlQuery } from 'codemirror-lang-lxlquery';
	import BiXLg from '~icons/bi/x-lg';
	import BiArrowLeft from '~icons/bi/arrow-left';
	import BiArrowUpLeft from '~icons/bi/arrow-up-left';
	import BiChevronDown from '~icons/bi/chevron-down';
	import BiChevronUp from '~icons/bi/chevron-up';
	import '$lib/styles/lxlquery.css';

	interface Props {
		placeholder: string;
	}

	let { placeholder = '' }: Props = $props();

	let q = $state($page.params.fnurgel ? '' : $page.url.searchParams.get('_q')?.trim() || '');
	let cursor: number = $state(0);
	let superSearch = $state<ReturnType<typeof SuperSearch>>();
	let showMoreFilters = $state(false);

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
			superSearch?.hideExpandedSearch();
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

	function addQualifierKey(qualifierKey: string) {
		superSearch?.dispatchChange({
			change: {
				from: cursor,
				to: cursor,
				insert: `${qualifierKey}:""`
			},
			selection: {
				anchor: cursor + qualifierKey?.length + 2,
				head: cursor + qualifierKey?.length + 2
			}
		});
		superSearch?.hideExpandedSearch();
	}

	let derivedLxlQualifierPlugin = $derived.by(() => {
		function getLabels(key: string, value?: string) {
			let pageMapping = $page.data.searchResult?.mapping;
			return getLabelFromMappings(key, value, pageMapping, suggestMapping);
		}
		return lxlQualifierPlugin(getLabels);
	});

	let moreFiltersRowIndex = $derived(showMoreFilters ? 7 : 4);

	function getFullQualifierLink(q: string) {
		const params = new URLSearchParams($page.url.searchParams.toString());
		params.set('_q', q);
		params.delete('_i');
		params.set('_offset', '0');
		return `/find?${params.toString()}`;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function onClickAddQualifier(cursor: string) {
		// TODO set cursor position
	}
</script>

{#snippet startFilterItem({
	qualifierKey,
	qualifierLabel,
	qualifierPlaceholder,
	getCellId,
	isFocusedCell,
	isFocusedRow,
	rowIndex
}: {
	qualifierKey: string;
	qualifierLabel: string;
	qualifierPlaceholder: string;
	getCellId: (rowIndex: number, colIndex: number) => string | undefined;
	isFocusedCell: (rowIndex: number, colIndex: number) => boolean;
	isFocusedRow: (rowIndex: number) => boolean;
	rowIndex: number;
})}
	<div role="row" class="start-item" class:focused={isFocusedRow(rowIndex)}>
		<button
			type="button"
			role="gridcell"
			id={getCellId(rowIndex, 0)}
			class="flex min-h-12 w-full items-center px-4 hover:bg-main"
			class:focused-cell={isFocusedCell(rowIndex, 0)}
			onclick={() => addQualifierKey(qualifierKey)}
		>
			<span class="overflow-hidden text-ellipsis whitespace-nowrap">
				<strong class="text-3-cond-bold">{qualifierLabel}:</strong>
				<span class="text-sm italic text-tertiary">{qualifierPlaceholder}</span>
			</span>
			<BiArrowUpLeft class="ml-auto inline-block" />
		</button>
	</div>
{/snippet}

<form class="relative w-full" action="find" onsubmit={handleSubmit}>
	<SuperSearch
		name="_q"
		bind:this={superSearch}
		bind:value={q}
		bind:cursor
		language={lxlQuery}
		{placeholder}
		endpoint={`/api/${$page.data.locale}/supersearch`}
		queryFn={(query, cursor) => {
			return new URLSearchParams({
				_q: query,
				_limit: '8',
				cursor: cursor.toString()
			});
		}}
		transformFn={handleTransform}
		paginationQueryFn={handlePaginationQuery}
		extensions={[derivedLxlQualifierPlugin]}
		toggleWithKeyboardShortcut
		comboboxAriaLabel={$page.data.t('search.search')}
		defaultResultRow={1}
		defaultInputCol={2}
	>
		{#snippet loadingIndicator()}
			<div class="flex min-h-11 w-full items-center px-4 text-left">
				{$page.data.t('search.loading')}
			</div>
		{/snippet}
		{#snippet inputRow({
			expanded,
			inputField,
			getCellId,
			isFocusedCell,
			onclickSubmit,
			onclickClear,
			onclickClose
		})}
			<div class="supersearch-input">
				{#if expanded}
					<button
						type="button"
						id={getCellId(0)}
						class:focused-cell={isFocusedCell(0)}
						aria-label={$page.data.t('general.close')}
						class="button-ghost min-h-12 min-w-11 rounded-none border-none hover:bg-main sm:hidden"
						onclick={onclickClose}
					>
						<BiArrowLeft />
					</button>
				{/if}
				<div class="flex-1 overflow-hidden">
					{@render inputField()}
				</div>
				{#if q}
					<button
						type="reset"
						id={getCellId(1)}
						class:focused-cell={isFocusedCell(1)}
						class="button-ghost min-h-12 rounded-none border-none hover:bg-main"
						aria-label={$page.data.t('search.clearFilters')}
						onclick={onclickClear}
					>
						<BiXLg />
					</button>
				{/if}
				<button
					type="submit"
					id={getCellId(2)}
					class:focused-cell={isFocusedCell(2)}
					class="submit-action button-primary min-h-12 rounded-none"
					enterkeyhint="search"
					onclick={onclickSubmit}
				>
					{$page.data.t('search.search')}
				</button>
			</div>
		{/snippet}
		{#snippet startContent({ getCellId, isFocusedCell, isFocusedRow })}
			<div role="rowgroup">
				<div class="flex min-h-11 w-full items-center px-4 text-3-cond-bold">
					{$page.data.t('search.supersearchStartHeader')}
				</div>
				{@render startFilterItem({
					qualifierKey: 'contributor',
					qualifierLabel: 'Medverkan',
					qualifierPlaceholder: 'Selma Lagerlöf, Astrid Lindgren',
					getCellId,
					isFocusedCell,
					isFocusedRow,
					rowIndex: 1
				})}
				{@render startFilterItem({
					qualifierKey: 'hasTitle',
					qualifierLabel: 'Titel',
					qualifierPlaceholder: 'Röda rummet, Casablanca',
					getCellId,
					isFocusedCell,
					isFocusedRow,
					rowIndex: 2
				})}
				{@render startFilterItem({
					qualifierKey: 'language',
					qualifierLabel: 'Språk',
					qualifierPlaceholder: 'Svenska, Engelska, Arabiska',
					getCellId,
					isFocusedCell,
					isFocusedRow,
					rowIndex: 3
				})}
				{#if showMoreFilters}
					{@render startFilterItem({
						qualifierKey: 'subject',
						qualifierLabel: 'Ämne',
						qualifierPlaceholder: 'Sommar, Romarriket',
						getCellId,
						isFocusedCell,
						isFocusedRow,
						rowIndex: 4
					})}
					{@render startFilterItem({
						qualifierKey: 'år',
						qualifierLabel: 'År',
						qualifierPlaceholder: '2002, 1987-1994',
						getCellId,
						isFocusedCell,
						isFocusedRow,
						rowIndex: 5
					})}
					{@render startFilterItem({
						qualifierKey: 'genreForm',
						qualifierLabel: 'Genre/form',
						qualifierPlaceholder: 'Skönlitteratur, Tidsskrift',
						getCellId,
						isFocusedCell,
						isFocusedRow,
						rowIndex: 6
					})}
				{/if}
				<div role="row" class="start-item" class:focused={isFocusedRow(moreFiltersRowIndex)}>
					<button
						type="button"
						role="gridcell"
						id={getCellId(moreFiltersRowIndex, 0)}
						class="flex min-h-11 w-full items-center px-4 hover:bg-main"
						class:focused-cell={isFocusedCell(moreFiltersRowIndex, 0)}
						onclick={() => (showMoreFilters = !showMoreFilters)}
					>
						{#if showMoreFilters}
							<BiChevronUp class="mr-2" />
							{$page.data.t('search.showFewer')}
						{:else}
							<BiChevronDown class="mr-2" />
							{$page.data.t('search.showMore')}
						{/if}
					</button>
				</div>
			</div>
		{/snippet}
		{#snippet persistentResultItemRow({ getCellId, isFocusedCell })}
			<div class="flex min-h-12 w-full items-stretch border-b border-b-primary/16">
				<button
					type="submit"
					role="gridcell"
					id={getCellId(0)}
					class="flex flex-1 items-center px-4 no-underline text-3-cond-bold hover:bg-main"
					class:focused-cell={isFocusedCell(0)}
					enterkeyhint="search"
					>{$page.data.t('search.showAllResults')}
				</button>
			</div>
		{/snippet}
		{#snippet resultItemRow({ resultItem, getCellId, isFocusedCell })}
			{#if resultItem}
				<div class="suggestion-card-container flex text-xs md:text-sm">
					<SuggestionCard item={resultItem} cellId={getCellId(0)} isFocused={isFocusedCell(0)} />
					{#if resultItem.qualifiers.length > 0}
						<div class="flex pr-2">
							{#each resultItem.qualifiers as qualifier, index}
								<!-- pills -->
								<a
									id={getCellId(index + 1)}
									role="gridcell"
									class={[
										'flex items-center p-1 no-underline hover:bg-main sm:p-1.5',
										isFocusedCell(index + 1) && 'focused-cell'
									]}
									onclick={() => onClickAddQualifier(qualifier.cursor)}
									href={getFullQualifierLink(qualifier._q)}
								>
									<span class="lxl-qualifier atomic add-qualifier">
										<BiArrowUpLeft
											class=""
											fill="currentColor"
											aria-label={$page.data.t('search.addAs')}
										/>
										<span class="first-letter:capitalize">{qualifier.label}</span>
									</span>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{/snippet}
	</SuperSearch>
	{#each searchParams as [name, value]}
		{#if name !== '_q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
</form>

<style lang="postcss">
	.supersearch-input {
		@apply relative flex min-h-12 w-full cursor-text overflow-hidden rounded-md bg-cards focus-within:outline focus-within:outline-2 focus-within:outline-accent-dark/32;
	}

	.suggestion-card-container {
		container-type: inline-size;
	}

	.add-qualifier {
		@apply flex items-center gap-1 rounded-sm px-2 py-1;
	}

	/* dialog */

	:global(.supersearch-dialog) {
		@apply static m-0 h-full max-h-screen w-full max-w-full border-none bg-transparent p-0;
	}

	:global(.supersearch-dialog-wrapper) {
		@apply pointer-events-none header-layout;
		grid-template-areas: 'supersearch-content supersearch-content supersearch-content';

		@media screen and (min-width: theme('screens.sm')) {
			grid-template-areas: '. supersearch-content .';
		}
	}

	:global(.supersearch-dialog-content) {
		@apply pointer-events-auto max-h-screen overflow-hidden overflow-y-scroll rounded-md bg-cards drop-shadow-md;
		grid-area: supersearch-content;
		scrollbar-width: none;
	}

	:global(.supersearch-dialog .supersearch-combobox) {
		@apply sticky top-0 z-20 items-stretch border-b border-b-primary/16 bg-cards p-4;
	}

	:global(.supersearch-dialog .supersearch-input) {
		@apply overflow-hidden rounded-md sm:px-0;
		box-shadow: inset 0 0 0 1px rgba(105, 65, 25, 0.24);
	}

	:global(.supersearch-dialog .focused) {
		@apply bg-site-header/24;
	}

	:global(.focused-cell) {
		@apply bg-site-header/40;
	}

	:global(.button-primary.focused-cell) {
		@apply before:opacity-100;
	}

	/* suggestions */

	:global(.supersearch-suggestions [role='row']:last-child) {
		/* border-bottom: 1px solid rgb(var(--color-primary) / 0.12); */
		@apply border-b border-b-primary/16;
	}

	/* snippets elements */

	:global(.supersearch-show-more) {
		@apply flex min-h-11 w-full items-center px-4 text-left hover:bg-main;
	}

	/* codemirror elements */

	:global(.codemirror-container) {
		@apply block flex-1;
	}

	:global(.codemirror-container .cm-scroller) {
		@apply min-h-12 font-sans outline-none text-3-regular;
		scrollbar-width: none;
	}

	:global(.supersearch-input .cm-line) {
		@apply px-4;
		min-height: 28px;
		line-height: 28px;
	}

	:global(.supersearch-input .cm-focused) {
		outline: none;
	}

	:global(.codemirror-container .cm-content) {
		padding-top: 0.6125rem;
		padding-bottom: 0.6125rem;
		outline: none;
	}
</style>
