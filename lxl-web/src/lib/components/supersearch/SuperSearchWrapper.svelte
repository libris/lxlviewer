<script lang="ts">
	import { page } from '$app/stores';
	import { afterNavigate, goto } from '$app/navigation';
	import { SuperSearch, lxlQualifierPlugin, type Selection } from 'supersearch';
	import Suggestion from './Suggestion.svelte';
	import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
	import getSortedSearchParams from '$lib/utils/getSortedSearchParams';
	import getLabelFromMappings from '$lib/utils/getLabelsFromMapping.svelte';
	import addSpaceIfEndingQualifier from '$lib/utils/addSpaceIfEndingQualifier';
	import type { DisplayMapping, QualifierSuggestion } from '$lib/types/search';
	import { lxlQuery } from 'codemirror-lang-lxlquery';
	import BiXLg from '~icons/bi/x-lg';
	import BiArrowLeft from '~icons/bi/arrow-left';
	import BiSearch from '~icons/bi/search';
	import BiChevronDown from '~icons/bi/chevron-down';
	import BiChevronUp from '~icons/bi/chevron-up';
	import '$lib/styles/lxlquery.css';

	interface Props {
		placeholder: string;
	}

	let { placeholder = '' }: Props = $props();
	let q = $state(
		$page.params.fnurgel
			? ''
			: addSpaceIfEndingQualifier($page.url.searchParams.get('_q')?.trim() || '')
	);
	let selection: Selection | undefined = $state();
	let cursor = $derived(selection?.head || 0);

	let superSearch = $state<ReturnType<typeof SuperSearch>>();
	let showMoreFilters = $state(false);

	let pageParams = $derived.by(() => {
		let p = getSortedSearchParams(addDefaultSearchParams($page.url.searchParams));
		// Always reset these params on new search
		p.set('_offset', '0');
		p.delete('_i');
		p.delete('_o');
		p.delete('_p');
		return p;
	});
	let suggestMapping: DisplayMapping[] | undefined = $state();

	afterNavigate(({ to }) => {
		/** Update input value after navigation on /find route */
		if (to?.url) {
			const toQ = addSpaceIfEndingQualifier(new URL(to.url).searchParams.get('_q')?.trim() || '');
			q = $page.params.fnurgel ? '' : toQ !== '*' ? toQ : ''; // hide wildcard in input field
			superSearch?.hideExpandedSearch();
		}
	});

	function handleSubmit(event: SubmitEvent) {
		if (!q || !q.trim()) {
			event.preventDefault();
		} else {
			q = addSpaceIfEndingQualifier(q.trim());
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

	function handleShouldShowStartContent(value: string, selection?: Selection) {
		if (selection && selection.anchor == selection.head) {
			const tree = lxlQuery.language.parser.parse(value);
			const nodeLeft = tree.resolveInner(selection.head, -1);
			const nodeRight = tree.resolveInner(selection.head, 1);

			/** Start content should be shown when the cursor isn't placed inside a qualifier or edited string part */
			if (!nodeLeft.parent?.name && !nodeRight.parent?.name) {
				return true;
			}
		}

		return false;
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
				insert: `${qualifierKey}:`
			},
			selection: {
				anchor: cursor + qualifierKey?.length + 1,
				head: cursor + qualifierKey?.length + 1
			},
			userEvent: 'input.complete'
		});
		superSearch?.hideExpandedSearch();
	}

	function addQualifier(qualifier: QualifierSuggestion) {
		superSearch?.dispatchChange({
			change: { from: 0, to: q.length, insert: addSpaceIfEndingQualifier(qualifier._q) },
			selection: { anchor: qualifier.cursor + 1, head: qualifier.cursor + 1 },
			userEvent: 'input.complete'
		});
		goto(getFullQualifierLink(qualifier._q));
	}

	function removeQualifier(qualifier: string) {
		const newQ = addSpaceIfEndingQualifier(q.replace(qualifier, '').trim());
		const insertCursor = Math.min(q.indexOf(qualifier), newQ.length);
		const newSearchParams = new URLSearchParams(pageParams);
		newSearchParams.set('_q', newQ.trim() ? newQ : '*');

		superSearch?.dispatchChange({
			change: { from: 0, to: q.length, insert: newQ },
			selection: { anchor: insertCursor, head: insertCursor },
			userEvent: 'delete'
		});
		goto('/find?' + newSearchParams.toString());
	}

	let derivedLxlQualifierPlugin = $derived.by(() => {
		function getLabels(key: string, value?: string) {
			let pageMapping = $page.data.searchResult?.mapping;
			return getLabelFromMappings(key, value, pageMapping, suggestMapping);
		}
		return lxlQualifierPlugin(getLabels, removeQualifier);
	});

	let moreFiltersRowIndex = $derived(showMoreFilters ? 7 : 4);

	function getFullQualifierLink(q: string) {
		const newParams = new URLSearchParams(pageParams);
		newParams.set('_q', q);
		return `/find?${newParams.toString()}`;
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
	<div role="row" class="suggestion" class:focused={isFocusedRow(rowIndex)}>
		<button
			type="button"
			role="gridcell"
			id={getCellId(rowIndex, 0)}
			class="hover:bg-primary/10 flex min-h-12 w-full items-center px-4"
			class:focused-cell={isFocusedCell(rowIndex, 0)}
			onclick={() => addQualifierKey(qualifierKey)}
		>
			<span class="truncate text-sm">
				<span class="font-medium">{qualifierLabel}:</span>
				<span class="text-subtle italic">{qualifierPlaceholder}</span>
			</span>
		</button>
	</div>
{/snippet}

<form class="relative w-full" action="find" onsubmit={handleSubmit} data-testid="main-search">
	<SuperSearch
		name="_q"
		bind:this={superSearch}
		bind:value={q}
		bind:selection
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
		shouldShowStartContentFn={handleShouldShowStartContent}
		extensions={[derivedLxlQualifierPlugin]}
		toggleWithKeyboardShortcut
		comboboxAriaLabel={$page.data.t('search.search')}
		defaultInputCol={2}
		loadMoreLabel={$page.data.t('search.showMore')}
		debouncedWait={100}
	>
		{#snippet loadingIndicator()}
			<!-- <div class="flex min-h-11 w-full items-center px-4 text-left">
				{$page.data.t('search.loading')}
			</div> -->
		{/snippet}
		{#snippet inputRow({
			expanded,
			inputField,
			getCellId,
			isFocusedCell,
			// onclickSubmit,
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
						class="p-4 sm:hidden"
						onclick={onclickClose}
					>
						<BiArrowLeft />
					</button>
				{/if}
				<div class="flex-1 overflow-hidden">
					<div class={['text-subtle absolute p-4', expanded ? 'hidden sm:block' : 'block']}>
						<BiSearch aria-hidden="true" />
					</div>
					{@render inputField()}
				</div>
				{#if q}
					<button
						type="reset"
						id={getCellId(1)}
						class:focused-cell={isFocusedCell(1)}
						class="text-subtle p-4"
						aria-label={$page.data.t('search.clearFilters')}
						onclick={onclickClear}
					>
						<BiXLg />
					</button>
				{/if}
				<!-- <button
					type="submit"
					id={getCellId(2)}
					class:focused-cell={isFocusedCell(2)}
					class="submit-action min-h-12 rounded-none"
					enterkeyhint="search"
					onclick={onclickSubmit}
				>
					{$page.data.t('search.search')}
				</button> -->
			</div>
		{/snippet}
		{#snippet startContent({ getCellId, isFocusedCell, isFocusedRow })}
			<div role="rowgroup">
				<div class="text-2xs text-subtle flex w-full items-center px-4 py-2 font-medium">
					{$page.data.t('search.supersearchStartHeader')}
				</div>
				{@render startFilterItem({
					qualifierKey: $page.data.t('qualifiers.contributorKey'),
					qualifierLabel: $page.data.t('qualifiers.contributorLabel'),
					qualifierPlaceholder: $page.data.t('qualifiers.contributorPlaceholder'),
					getCellId,
					isFocusedCell,
					isFocusedRow,
					rowIndex: 1
				})}
				{@render startFilterItem({
					qualifierKey: $page.data.t('qualifiers.titleKey'),
					qualifierLabel: $page.data.t('qualifiers.titleLabel'),
					qualifierPlaceholder: $page.data.t('qualifiers.titlePlaceholder'),
					getCellId,
					isFocusedCell,
					isFocusedRow,
					rowIndex: 2
				})}
				{@render startFilterItem({
					qualifierKey: $page.data.t('qualifiers.languageKey'),
					qualifierLabel: $page.data.t('qualifiers.languageLabel'),
					qualifierPlaceholder: $page.data.t('qualifiers.languagePlaceholder'),
					getCellId,
					isFocusedCell,
					isFocusedRow,
					rowIndex: 3
				})}
				{#if showMoreFilters}
					{@render startFilterItem({
						qualifierKey: $page.data.t('qualifiers.subjectKey'),
						qualifierLabel: $page.data.t('qualifiers.subjectLabel'),
						qualifierPlaceholder: $page.data.t('qualifiers.subjectPlaceholder'),
						getCellId,
						isFocusedCell,
						isFocusedRow,
						rowIndex: 4
					})}
					{@render startFilterItem({
						qualifierKey: $page.data.t('qualifiers.yearKey'),
						qualifierLabel: $page.data.t('qualifiers.yearLabel'),
						qualifierPlaceholder: $page.data.t('qualifiers.yearPlaceholder'),
						getCellId,
						isFocusedCell,
						isFocusedRow,
						rowIndex: 5
					})}
					{@render startFilterItem({
						qualifierKey: $page.data.t('qualifiers.genreFormKey'),
						qualifierLabel: $page.data.t('qualifiers.genreFormLabel'),
						qualifierPlaceholder: $page.data.t('qualifiers.genreFormPlaceholder'),
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
						class="hover:bg-primary/10 flex min-h-11 w-full items-center px-4 text-sm"
						class:focused-cell={isFocusedCell(moreFiltersRowIndex, 0)}
						onclick={() => (showMoreFilters = !showMoreFilters)}
					>
						{#if showMoreFilters}
							<BiChevronUp class="text-subtle mr-2" />
							{$page.data.t('search.showFewer')}
						{:else}
							<BiChevronDown class="text-subtle mr-2" />
							{$page.data.t('search.showMore')}
						{/if}
					</button>
				</div>
			</div>
		{/snippet}
		{#snippet resultItemRow({ resultItem, getCellId, isFocusedCell })}
			{#if resultItem}
				<Suggestion item={resultItem} {getCellId} {isFocusedCell} {addQualifier} />
			{/if}
		{/snippet}
	</SuperSearch>
	{#each Array.from(pageParams) as [name, value] (name)}
		{#if name !== '_q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
</form>

<style lang="postcss">
	@reference "../../../app.css";

	.supersearch-input {
		@apply flex min-h-12 w-full cursor-text overflow-hidden rounded-md focus-within:relative;
		background: var(--color-input);
		outline: 1px solid var(--color-neutral-300);
	}

	/* dialog */

	:global(.supersearch-dialog) {
		@apply static m-0 h-full max-h-screen w-full max-w-full bg-transparent p-0;
	}

	:global(.supersearch-dialog-wrapper) {
		@apply header-layout pointer-events-none;
		grid-template-areas: 'supersearch-content supersearch-content supersearch-content';

		@variant sm {
			grid-template-areas: '. supersearch-content .';
		}
	}

	:global(.supersearch-dialog-content) {
		@apply pointer-events-auto max-h-screen overflow-hidden overflow-y-scroll rounded-md drop-shadow-md;
		background: var(--color-page);
		grid-area: supersearch-content;
		scrollbar-width: none;
	}

	:global(.supersearch-dialog .supersearch-combobox) {
		@apply sticky top-0 z-20 items-stretch px-4 pt-4 pb-2;
		background-color: var(--color-page);
	}

	:global(.supersearch-suggestions) {
		@apply min-h-2;
	}

	:global(.supersearch-dialog .supersearch-input) {
		@apply overflow-hidden rounded-md sm:px-0;
	}

	:global(.supersearch-dialog .focused) {
		background-color: --alpha(var(--color-primary) / 10%);
	}

	:global(.focused-cell) {
		background-color: --alpha(var(--color-primary) / 5%);
	}

	/* :global(.button-primary.focused-cell) {
		@apply before:opacity-100;
	} */

	/* suggestions */

	:global(.supersearch-suggestions [role='row']:last-child) {
		border-color: var(--color-neutral);
	}

	/* snippets elements */

	:global(.supersearch-show-more) {
		@apply flex min-h-11 w-full items-center px-4 text-left text-sm;

		&:hover {
			background-color: --alpha(var(--color-primary) / 10%);
		}
	}

	/* codemirror elements */

	:global(.codemirror-container) {
		@apply block flex-1;
	}

	:global(.codemirror-container .cm-scroller) {
		@apply min-h-12 font-sans outline-hidden;
		scrollbar-width: none;
	}

	:global(.supersearch-input .cm-line) {
		padding-left: calc(var(--spacing, 0.25rem) * 12);
		min-height: 28px;
		line-height: 28px;
		font-size: var(--text-xs);
	}

	:global(.supersearch-dialog .supersearch-input .cm-line) {
		padding-left: 0;
		@variant sm {
			padding-left: calc(var(--spacing, 0.25rem) * 12);
		}
	}

	:global(.supersearch-input .cm-focused) {
		outline: none;
	}

	:global(.codemirror-container .cm-content) {
		padding-top: 0.6125rem;
		padding-bottom: 0.6125rem;
		outline: none;
	}

	:global(.codemirror-container .cm-placeholder) {
		color: var(--color-placeholder);
	}
</style>
