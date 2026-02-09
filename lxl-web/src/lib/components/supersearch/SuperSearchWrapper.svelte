<script lang="ts">
	import { mount, unmount } from 'svelte';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import {
		SuperSearch,
		lxlQualifierPlugin,
		type QualifierRendererProps,
		type Selection,
		type ShowExpandedSearchOptions,
		type ViewUpdateSuperSearchEvent,
		type DebouncedWaitFunction
	} from 'supersearch';
	import QualifierPill from './QualifierPill.svelte';
	import Suggestion from './Suggestion.svelte';
	import getLabelFromMappings from '$lib/utils/getLabelsFromMapping.svelte';
	import addSpaceIfEndingQualifier from '$lib/utils/addSpaceIfEndingQualifier';
	import type { DisplayMapping } from '$lib/types/search';
	import { lxlQuery } from 'codemirror-lang-lxlquery';
	import IconClear from '~icons/bi/x-circle';
	import IconBack from '~icons/bi/arrow-left-short';
	import IconGo from '~icons/bi/arrow-right-short';
	import IconSearch from '~icons/bi/search';
	import '$lib/styles/lxlquery.css';

	const qualifierSuggestions = $derived([
		{
			key: page.data.t('qualifiers.contributorKey'),
			label: page.data.t('qualifiers.contributorLabel')
		},
		{ key: page.data.t('qualifiers.categoryKey'), label: page.data.t('qualifiers.categoryLabel') },
		{ key: page.data.t('qualifiers.titleKey'), label: page.data.t('qualifiers.titleLabel') },
		{ key: page.data.t('qualifiers.languageKey'), label: page.data.t('qualifiers.languageLabel') },
		{ key: page.data.t('qualifiers.subjectKey'), label: page.data.t('qualifiers.subjectLabel') },
		{ key: page.data.t('qualifiers.yearKey'), label: page.data.t('qualifiers.yearLabel') }
	]);

	interface Props {
		placeholder: string;
	}

	let { placeholder = '' }: Props = $props();
	let q = $state(addSpaceIfEndingQualifier(page.url.searchParams.get('_q')?.trim() || ''));
	let selection: Selection | undefined = $state();

	let isLoading: boolean | undefined = $state();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let debouncedLoading: boolean | undefined = $state();
	let wrappedLines: boolean | undefined = $state();

	let timeout: ReturnType<typeof setTimeout> | null = null;
	let fetchOnExpand = $state(true);
	let pageMapping: DisplayMapping[] | undefined = $state(page.data.searchResult?.mapping);
	let prevLocale = page.data.locale;

	let clearUrl = $derived.by(() => {
		if (page.url.pathname !== '/find') return undefined;
		const url = new URL(page.url);
		url.searchParams.set('_q', '');
		url.searchParams.delete('_offset');
		return url.toString();
	});

	let userClearedSearch = $state(false);

	// We don't want to provide search suggestions when user has entered < 3 chars, because
	// they are expensive. Use decreasing debounce as query gets longer.
	const MIN_LENGTH_FOR_SUGGESTIONS = 3;
	const getDebouncedWait: DebouncedWaitFunction = (query) => {
		const trimmedLength = query.trim().length;
		if (trimmedLength < MIN_LENGTH_FOR_SUGGESTIONS) return null;
		if (trimmedLength === MIN_LENGTH_FOR_SUGGESTIONS) return 3000;
		if (trimmedLength === 4) return 1500;
		return 400;
	};

	// debounce loading spinner
	$effect(() => {
		const current = isLoading;
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			debouncedLoading = current;
		}, 300);
	});

	let cursor = $derived(selection?.head || 0);

	let superSearch = $state<ReturnType<typeof SuperSearch>>();

	let suggestMapping: DisplayMapping[] | undefined = $state();

	afterNavigate(({ to }) => {
		/** Update input value after navigation on /find route */
		if (to?.url) {
			if (page.route.id === '/(app)/[[lang=lang]]') {
				q = ''; // reset query if navigating to start/index page
			} else if (to.url.searchParams.has('_q')) {
				q = addSpaceIfEndingQualifier(to.url.searchParams.get('_q')?.trim() || '');
			}

			pageMapping = page.data.searchResult?.mapping || pageMapping; // use previous page mapping if there is no new page mapping

			superSearch?.hideExpandedSearch();
			fetchOnExpand = true;
			if (userClearedSearch) {
				superSearch?.showExpandedSearch();
				userClearedSearch = false;
			} else {
				superSearch?.blur(); // remove focus from input after searching or navigating
			}
		}
	});

	function handleSubmit() {
		// if (!q || !q.trim()) {
		// 	event.preventDefault();
		// }
	}

	const editedParentNode = $derived.by(() => {
		if (!q || !selection) {
			return null;
		}

		if (selection) {
			const tree = lxlQuery.language.parser.parse(q);
			const node = tree.resolveInner(selection.head, 0);

			if (node.type.name) {
				return node.parent?.type.name;
			}
		}

		return null;
	});

	const charBefore = $derived(/\S/.test(q.charAt(cursor - 1)));
	const charAfter = $derived(/\S/.test(q.charAt(cursor)));

	const showAddQualifiers = $derived(
		!charBefore && !charAfter && editedParentNode !== 'QualifierValue'
	);

	const showAllResultsButton = $derived(editedParentNode !== 'QualifierValue');

	function handleTransform(data) {
		suggestMapping = data?.mapping;
		return data;
	}

	function addQualifierKey(qualifierKey: string) {
		superSearch?.resetData();
		superSearch?.showExpandedSearch(); // keep dialog open (since 'regular' search is hidden on mobile)
		const insert = `${qualifierKey}:`;
		superSearch?.dispatchChange({
			change: {
				from: cursor,
				to: cursor,
				insert
			},
			selection: {
				anchor: cursor + insert.length,
				head: cursor + insert.length
			},
			userEvent: 'input.complete'
		});
	}

	const renderer = (container: HTMLElement, props: QualifierRendererProps) => {
		const component = mount(QualifierPill, {
			target: container,
			props
		});

		return {
			destroy() {
				unmount(component);
			}
		};
	};

	let derivedLxlQualifierPlugin = $derived.by(() => {
		function getLabels(key: string, value?: string) {
			// Make sure supersearch doesn't use '_r' section of mapping
			const filteredPageMapping = pageMapping?.filter((m) => m.variable === '_q');
			const filteredSuggestMapping = suggestMapping?.filter((m) => m.variable === '_q');
			return getLabelFromMappings(key, value, filteredPageMapping, filteredSuggestMapping);
		}
		return lxlQualifierPlugin(getLabels, renderer);
	});

	export function showExpandedSearch(options?: ShowExpandedSearchOptions) {
		superSearch?.showExpandedSearch(options);
	}

	function handleOnChange() {
		fetchOnExpand = false;
	}

	function handleOnExpand() {
		if (fetchOnExpand && q.trim()) {
			superSearch?.fetchData();
			fetchOnExpand = false;
		}
	}

	function handleOnExpandedViewUpdate(event: ViewUpdateSuperSearchEvent) {
		if (event.lineHeight >= 60) {
			wrappedLines = true;
		} else {
			wrappedLines = false;
		}
	}

	$effect(() => {
		if (page.data.locale !== prevLocale) {
			prevLocale = page.data.locale;
			superSearch?.fetchData();
		}
	});
	console.log(page.url);
</script>

{#key page.data.locale}
	<SuperSearch
		name="_q"
		bind:this={superSearch}
		bind:value={q}
		bind:selection
		bind:isLoading
		language={lxlQuery}
		{placeholder}
		endpoint={`/api/${page.data.locale}/supersearch`}
		queryFn={(query, cursor) => {
			return new URLSearchParams({
				_q: query,
				_limit: '5',
				cursor: cursor.toString(),
				_sort: page.url.searchParams.get('_sort') || '',
				_r: page.url.searchParams.get('_r') || ''
			});
		}}
		transformFn={handleTransform}
		extensions={[derivedLxlQualifierPlugin]}
		toggleWithKeyboardShortcut
		wrappingArrowKeyNavigation
		comboboxAriaLabel={page.data.t('search.search')}
		defaultInputCol={undefined}
		{getDebouncedWait}
		onexpand={handleOnExpand}
		onchange={handleOnChange}
		onexpandedviewupdate={handleOnExpandedViewUpdate}
	>
		{#snippet inputRow({
			expanded,
			inputField,
			getCellId,
			isFocusedCell,
			isFocusedRow,
			onclickClear,
			onclickClose
		})}
			<div
				class={[
					'supersearch-input bg-input flex w-full max-w-7xl cursor-text overflow-hidden focus-within:relative lg:h-12',
					expanded && 'expanded',
					isFocusedRow() && ['focused-row'],
					wrappedLines && 'wrapped'
				]}
			>
				{#if expanded}
					<button
						type="button"
						id={getCellId(0)}
						class:focused-cell={isFocusedCell(0)}
						aria-label={page.data.t('general.close')}
						class={[
							'action text-subtle flex size-11 items-center justify-center sm:hidden',
							expanded && 'h-14 w-13 sm:size-11 lg:size-12'
						]}
						onclick={onclickClose}
					>
						<IconBack aria-hidden="true" class="size-7" />
					</button>
				{/if}
				<div class="flex-1 overflow-hidden">
					<div
						class={[
							'text-subtle bg-input absolute z-30 flex size-11 items-center justify-center rounded-md sm:hidden',
							expanded && 'hidden sm:flex'
						]}
					>
						<button
							type="button"
							tabindex="-1"
							onclick={() => showExpandedSearch({ cursorAtEnd: true })}
							class="flex h-full w-full cursor-default items-center justify-center"
							aria-hidden="true"
						>
							<IconSearch aria-hidden="true" class="flex size-4 lg:mt-px" />
						</button>
					</div>
					{@render inputField()}
				</div>
				{#if q}
					<svelte:element
						this={clearUrl ? 'a' : 'button'}
						role={clearUrl ? undefined : 'button'}
						href={clearUrl}
						onclick={(e: MouseEvent) => {
							userClearedSearch = true;
							onclickClear(e);
						}}
						id={getCellId(1)}
						class:focused-cell={isFocusedCell(1)}
						class={[
							'action text-subtle flex size-11 items-center justify-center lg:size-12',
							expanded && 'max-sm:h-14 max-sm:w-13'
						]}
						aria-label={page.data.t('search.clearFilters')}
						title={page.data.t('search.clearFilters')}
					>
						<IconClear class="size-4.5 sm:size-4" />
					</svelte:element>
				{/if}
				<button
					type="submit"
					id={getCellId(2)}
					class:focused-cell={isFocusedCell(2)}
					class={[
						'hover:bg-primary-50 hidden size-11 items-center justify-center border-l border-l-neutral-300 sm:flex lg:size-12'
					]}
					aria-label={page.data.t('supersearch.search')}
					onclick={handleSubmit}
				>
					<IconSearch aria-hidden="true" class={['flex size-4.5 ']} />
				</button>
			</div>
		{/snippet}
		{#snippet expandedContent({ resultsCount, resultsSnippet, getCellId, isFocusedCell })}
			<nav class="mt-2 mb-2 sm:mt-1 sm:mb-3 lg:mt-0">
				{#if showAddQualifiers}
					<div
						id="supersearch-add-qualifier-key-label"
						class="text-subtle mt-1.5 mb-1 px-4 text-sm font-medium lg:mt-0"
					>
						{page.data.t('supersearch.addQualifiers')}
					</div>
					<div role="rowgroup" aria-labelledby="supersearch-add-qualifier-key-label" class="mb-1">
						<div role="row" class="flex w-screen items-center gap-2 overflow-x-auto py-2 pl-4">
							{#each qualifierSuggestions as { key, label }, cellIndex (key)}
								<button
									type="button"
									id={getCellId(1, cellIndex)}
									class={[
										'text-body bg-accent-50 text-2xs  border-accent-200 hover:bg-accent-100 inline-block min-h-8 min-w-9 shrink-0 rounded-md border px-1.5 font-medium whitespace-nowrap last-of-type:mr-4',
										isFocusedCell(1, cellIndex) &&
											'border-accent-500 bg-accent-100 outline-accent-100 outline-4'
									]}
									onclick={() => addQualifierKey(key)}
								>
									{label}:
								</button>
							{/each}
						</div>
					</div>
				{/if}
				{#if showAllResultsButton && q.trim().length}
					<div
						role="row"
						class="text-subtle mb-2 flex items-center justify-between px-4 text-xs sm:mb-3 sm:text-sm"
					>
						<h2 id="supersearch-results-label" class="font-medium">
							{#if q.trim().length >= MIN_LENGTH_FOR_SUGGESTIONS || resultsCount}
								{page.data.t('supersearch.suggestions')}
							{/if}
						</h2>
						<button type="submit" onclick={handleSubmit}>
							<span class={['text-link flex items-center gap-1 hover:underline']}>
								{page.data.t('supersearch.showAll')}
								<IconGo aria-hidden="true" class="text-link size-6" />
							</span>
						</button>
					</div>
				{/if}
				{#if resultsCount && q.trim().length}
					<div
						role="rowgroup"
						aria-labelledby="supersearch-results-label"
						class="border-neutral border-t"
					>
						{@render resultsSnippet({ rowOffset: showAddQualifiers ? 2 : 1 })}
					</div>
				{/if}
			</nav>
		{/snippet}
		{#snippet resultItemRow({ resultItem, getCellId, isFocusedCell })}
			{#if resultItem}
				<Suggestion item={resultItem} {getCellId} {isFocusedCell} />
			{/if}
		{/snippet}
	</SuperSearch>
{/key}

<style lang="postcss">
	@reference "../../../app.css";

	.supersearch-input {
		height: 100%;
		min-height: var(--search-input-height);
		font-size: var(--text-xs);
		border-radius: var(--radius-md);
		box-shadow: 0 0 0 1px var(--color-primary-400);
		@variant sm {
			&:hover {
				box-shadow: 0 0 0 1px var(--color-primary-500);
			}

			&:focus-within {
				outline: 3px solid var(--color-primary-200);
				outline-offset: 1px;
			}
		}

		@variant lg {
			&:focus-within {
				outline: 4px solid var(--color-primary-200);
			}
		}

		@variant 3xl {
			font-size: var(--text-sm);
		}
	}

	.expanded.supersearch-input {
		border-bottom: 1px solid var(--color-neutral);
		border-radius: 0;
		box-shadow: none;

		@variant sm {
			border-bottom: none;
			border-radius: var(--radius-md);
			margin-inline: calc(var(--spacing) * 2);
			box-shadow: 0 0 0 1px var(--color-neutral-300);
			margin-block: calc((var(--spacing) * 2));

			&.focused-row {
				box-shadow: 0 0 0 1px var(--color-primary-500);
				outline: 3px solid var(--color-primary-200);
				outline-offset: 1px;
			}
		}

		@variant lg {
			margin-block: calc(var(--spacing) * 3);
			margin-inline: calc(var(--spacing) * 4);

			&.focused-row {
				outline: 4px solid var(--color-primary-200);
			}
		}
	}

	.action {
		&:hover {
			background: var(--color-primary-50);
		}

		&:focus {
			background: var(--color-primary-100);
		}
	}

	:global(.supersearch-dialog) {
		position: fixed;
		height: 100%;
		max-height: 100vh;
		width: 100%;
		max-width: 100%;
		background-color: transparent;
		margin: 0;
		padding: 0;
		top: 0;

		@variant sm {
			position: static;
			top: var(--sm-dialog-top);
			height: fit-content;
		}

		@variant lg {
			top: calc(var(--banner-height, 0));
		}
	}

	:global(.supersearch-dialog-wrapper) {
		height: 100%;
		width: 100%;

		@variant sm {
			position: fixed;
			height: auto;
		}

		@variant lg {
			display: grid;
			grid-template-areas: var(--search-grid-template-areas);
			grid-template-columns: var(--search-grid-template-columns);
			padding: var(--search-padding);
			gap: var(--search-gap);
		}
	}

	:global(.supersearch-dialog-content) {
		grid-area: search;
		background: var(--color-page);
		pointer-events: auto;
		max-height: 100vh;
		overflow-y: scroll;
		overflow-x: hidden;
		overscroll-behavior: contain;
		scrollbar-width: none;
		width: 100%;
		height: 100%;
		margin: 0 auto;
		@apply max-w-7xl;

		@variant sm {
			border-radius: var(--radius-lg);
			@apply drop-shadow-md;
		}
	}

	:global(.supersearch-suggestions) {
		@apply min-h-2;
	}

	:global(.supersearch-dialog .focused) {
		background-color: var(--color-primary-100);
	}

	:global(.focused-cell) {
		background-color: var(--color-primary-100);
	}

	/* :global(.button-primary.focused-cell) {
		@apply before:opacity-100;
	} */

	/* suggestions */

	/*
	:global(.supersearch-suggestions [role='row']:last-child) {
		border-color: var(--color-warning-600);
	}
	*/

	/* snippets elements */

	/*
	:global(.supersearch-show-more) {
		@apply flex min-h-11 w-full items-center px-4 text-left text-sm;

		&:hover {
			background-color: var(--color-primary-50);
		}
	}
	*/

	/* codemirror elements */

	:global(.codemirror-container) {
		@apply block flex-1;
	}

	:global(.cm-editor.cm-focused) {
		outline: none;
	}

	.supersearch-input :global(.cm-scroller) {
		font-family: var(--font-sans);
		scrollbar-width: none;
		min-height: calc(var(--spacing) * 11);
	}

	.expanded.supersearch-input :global(.cm-scroller) {
		min-height: calc(var(--spacing) * 14);
		scrollbar-width: thin;
		max-height: 100px;
		overflow-x: hidden;

		@variant sm {
			min-height: calc(var(--spacing) * 11);
		}
	}

	.supersearch-input :global(.cm-line) {
		line-height: 30px;
		padding-left: calc(var(--spacing) * 11);

		@variant sm {
			padding-left: calc(var(--spacing) * 3);
		}

		@variant 3xl {
			padding-left: calc(var(--spacing) * 4);
		}
	}

	.expanded.supersearch-input :global(.cm-line) {
		padding-left: 0;

		@variant sm {
			padding-left: calc(var(--spacing) * 3);
		}

		@variant 3xl {
			padding-left: calc(var(--spacing) * 4);
		}
	}

	.supersearch-input :global(.cm-content) {
		margin: 0;
		padding: calc(var(--spacing) * 1.5) 0;

		@variant lg {
			padding: calc(var(--spacing) * 2) 0;
		}
	}

	.expanded.supersearch-input :global(.cm-content) {
		padding: calc(var(--spacing) * 3) 0;

		@variant sm {
			padding: calc(var(--spacing) * 1.5) 0;
		}

		@variant lg {
			padding: calc(var(--spacing) * 2) 0;
		}
	}

	.expanded.supersearch-input.wrapped :global(.cm-content) {
		padding: calc(var(--spacing) * 0.5) 0;

		@variant sm {
			padding: calc(var(--spacing) * 0.5) 0;
		}

		@variant lg {
			padding: calc(var(--spacing) * 0.5) 0;
		}
	}

	:global(.supersearch-dialog .supersearch-input .cm-line) {
		padding-left: 0;
		@variant sm {
			padding-left: calc(var(--spacing) * 11);
		}

		@variant lg {
			padding-left: calc(var(--spacing) * 12);
		}
	}

	:global(.codemirror-container .cm-content) {
		outline: none;
	}

	:global(.codemirror-container .cm-placeholder) {
		color: var(--color-placeholder);
		margin: 1px 0;
	}
</style>
