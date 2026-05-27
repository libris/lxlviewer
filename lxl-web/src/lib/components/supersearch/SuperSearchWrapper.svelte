<script lang="ts">
	import { mount, onMount, onDestroy, unmount } from 'svelte';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import {
		type DebouncedWaitFunction,
		type ExpandEvent,
		lxlQualifierPlugin,
		type QualifierRendererProps,
		type Selection,
		type ShowExpandedSearchOptions,
		SuperSearch,
		type ViewUpdateSuperSearchEvent,
		type UserEvent
	} from 'supersearch';
	import FooterRow from './rows/FooterRow.svelte';
	import QualifierSuggestionsRow from './rows/QualifierSuggestionsRow.svelte';
	import ShowAllResultsRow from './rows/ShowAllResultsRow.svelte';
	import QualifierPill from './QualifierPill.svelte';
	import Suggestion from './Suggestion.svelte';
	import getLabelFromMappings from '$lib/utils/getLabelsFromMapping.svelte';
	import addSpaceIfEndingQualifier from '$lib/utils/addSpaceIfEndingQualifier';
	import { type DisplayMapping, type QualifierSuggestion2 } from '$lib/types/search';
	import { lxlQuery } from 'codemirror-lang-lxlquery';
	import IconClear from '~icons/bi/x-circle';
	import IconBack from '~icons/bi/arrow-left-short';
	import IconSearch from '~icons/bi/search';
	import '$lib/styles/lxlquery.css';
	import { getSearchContext } from '$lib/contexts/search';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { ID_APP_BAR } from '../../../routes/(app)/[[lang=lang]]/AppBar2.svelte';
	import { ID_HERO_SEARCH } from '../../../routes/(app)/[[lang=lang]]/+page.svelte';

	interface Props {
		id: string;
		placeholder: string;
		collapsedAriaLabelledBy?: string;
		collapsedAriaLabel?: string;
		collapsedAriaDescribedBy?: string;
		expandedAriaLabelledBy?: string;
		expandedAriaLabel?: string;
		expandedAriaDescribedBy?: string;
		onCursorChange: (cursor: number | null) => void;
		qualifierSuggestions: QualifierSuggestion2[];
		autofocus?: boolean;
	}

	export type ChangeQueryParams = {
		change: { insert: string; from?: number; to?: number };
		selection?: {
			anchor?: number | null;
			head?: number | null;
		};
		userEvent?: UserEvent;
	};

	let {
		id,
		placeholder,
		collapsedAriaLabelledBy,
		collapsedAriaLabel,
		collapsedAriaDescribedBy,
		expandedAriaLabelledBy,
		expandedAriaLabel,
		expandedAriaDescribedBy,
		onCursorChange,
		qualifierSuggestions,
		autofocus
	}: Props = $props();

	const searchContext = getSearchContext();

	let q = $state(addSpaceIfEndingQualifier(page.url.searchParams.get('_q') || ''));
	let selection: Selection | undefined = $state();

	let isLoading: boolean | undefined = $state();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let debouncedLoading: boolean | undefined = $state();
	let wrappedLines: boolean | undefined = $state();
	let searchOffset: number | undefined = $state();

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

	const isHomeRoute = $derived(page.route.id === '/(app)/[[lang=lang]]');

	// We don't want to provide search suggestions when user has entered < 3 chars, because
	// they are expensive. Use decreasing debounce as query gets longer.
	const MIN_LENGTH_FOR_SUGGESTIONS = 3;
	const getDebouncedWait: DebouncedWaitFunction = (query) => {
		const trimmedLength = query.trim().length;
		if (trimmedLength < MIN_LENGTH_FOR_SUGGESTIONS) return null;
		if (trimmedLength === MIN_LENGTH_FOR_SUGGESTIONS) return 3000;
		if (trimmedLength === MIN_LENGTH_FOR_SUGGESTIONS + 1) return 1500;
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
			if (isHomeRoute) {
				q = ''; // reset query if navigating to start/index page
			} else if (to.url.searchParams.has('_q')) {
				q = addSpaceIfEndingQualifier(to.url.searchParams.get('_q') || '');
			}

			pageMapping = page.data.searchResult?.mapping || pageMapping; // use previous page mapping if there is no new page mapping

			hideExpandedSearch();
			fetchOnExpand = true;

			if (userClearedSearch) {
				showExpandedSearch();
				userClearedSearch = false;
			} else {
				superSearch?.blur(); // remove focus from input after searching or navigating
			}
		}
	});

	const hasCharBefore = $derived(/\S/.test(q.charAt(cursor - 1)));
	const hasCharAfter = $derived(/\S/.test(q.charAt(cursor)));

	const NO_WILDCARD_AFTER_CHAR = [')', '"', '*', '?'];
	const NO_WILDCARD_AFTER_WORD = ['AND', 'OR', 'NOT'];

	const lastWordBeforeCursor = $derived.by(() => {
		const before = q.slice(0, cursor);
		const match = before.match(/(\S+)$/);
		return match ? match[1] : '';
	});

	const isValidWildcardPosition = $derived.by(() => {
		// a valid wildcard position is at end of word (inside group, not inside quote)
		if (
			hasCharBefore &&
			!NO_WILDCARD_AFTER_CHAR.includes(q.charAt(cursor - 1)) &&
			!NO_WILDCARD_AFTER_WORD.includes(lastWordBeforeCursor)
		) {
			if (!hasCharAfter || q.charAt(cursor) === ')') {
				return true;
			}
		}
		return false;
	});

	function handleTransform(data) {
		suggestMapping = data?.mapping;
		return data;
	}

	function changeQuery({ change, selection, userEvent }: ChangeQueryParams) {
		const from = typeof change.from === 'number' ? change.from : q.length;
		const to = typeof change.to === 'number' ? change.to : q.length;

		superSearch?.dispatchChange({
			change: {
				from,
				to,
				insert: change.insert
			},
			selection: {
				anchor:
					selection && typeof selection.anchor === 'number'
						? selection.anchor
						: (q.slice(0, from) + change.insert).length,
				head:
					selection && typeof selection.head === 'number'
						? selection.head
						: (q.slice(0, from) + change.insert).length
			},
			userEvent
		});
	}

	const renderer = (container: HTMLElement, props: QualifierRendererProps) => {
		const propsWithHandler = {
			...props,
			onclick: () => showExpandedSearch({ cursorAtEnd: true })
		};
		const component = mount(QualifierPill, {
			target: container,
			props: propsWithHandler
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

	function showExpandedSearch(options?: ShowExpandedSearchOptions) {
		superSearch?.showExpandedSearch(options);
	}

	function hideExpandedSearch() {
		superSearch?.hideExpandedSearch();
	}

	function handleOnChange() {
		fetchOnExpand = false;
	}

	function handleOnExpand({ windowPageYOffset }: ExpandEvent) {
		if (page.route.id === '/(app)/[[lang=lang]]') {
			const searchElement = document.getElementById(ID_HERO_SEARCH);
			if (searchElement) {
				const contentOffsetTop = document.getElementById('content')?.offsetTop || 0;
				const heroSearchOffsetTop = searchElement.offsetTop;
				console.log('heroSearchOffsetTop', heroSearchOffsetTop);

				searchOffset = Math.max(0, contentOffsetTop + heroSearchOffsetTop - windowPageYOffset);
				console.log('searchOffset', searchOffset);
			}
		} else {
			const appBarElement = document.getElementById(ID_APP_BAR);
			const searchElement = document.getElementById(ID_HERO_SEARCH);
			if (appBarElement) {
				const searchOffsetTop = searchElement?.offsetTop || 0;
				searchOffset = Math.max(0, appBarElement.offsetTop + searchOffsetTop - windowPageYOffset);

				console.log('agaga', searchOffset);
			}
		}
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

	$effect(() => {
		// call back with cursor pos to append it to search
		if (isValidWildcardPosition) {
			onCursorChange?.(cursor);
		} else {
			onCursorChange?.(null);
		}
	});

	onMount(() => {
		if (searchContext.initialStateBeforeMount?.value) {
			changeQuery({
				change: { insert: searchContext.initialStateBeforeMount.value, from: 0, to: q.length },
				selection: {
					anchor: searchContext.initialStateBeforeMount.selection?.anchor,
					head: searchContext.initialStateBeforeMount.selection?.head
				},
				userEvent: 'input.complete'
			});
		}
		searchContext.getQuery = () => q;
		searchContext.getSelection = () => selection;
		searchContext.showExpandedSearch = showExpandedSearch;
		searchContext.hideExpandedSearch = hideExpandedSearch;
		searchContext.changeQuery = changeQuery;
		searchContext.isMounted = true;
	});

	onDestroy(() => {
		if (timeout) clearTimeout(timeout); // ensure timeout is cleared to prevent memory leaks
		searchContext.initialStateBeforeMount = undefined;
	});
</script>

{#key page.data.locale}
	<SuperSearch
		{id}
		name="_q"
		bind:this={superSearch}
		bind:value={q}
		bind:selection
		bind:isLoading
		language={lxlQuery}
		{placeholder}
		{collapsedAriaLabelledBy}
		{collapsedAriaLabel}
		{collapsedAriaDescribedBy}
		{expandedAriaLabelledBy}
		{expandedAriaLabel}
		{expandedAriaDescribedBy}
		collapsedAriaKeyshortcuts={`Shift+7 ${navigator.userAgent.includes('Mac OS X') ? 'Meta+K' : 'Control+K'}`}
		{autofocus}
		endpoint={`/api/${page.data.locale}/supersearch`}
		queryFn={(query, cursor) => {
			const searchParams = new SvelteURLSearchParams({
				_q: query,
				_limit: '5',
				cursor: cursor.toString()
			});
			if (page.url.searchParams.get('_r')) {
				searchParams.set('_r', page.url.searchParams.get('_r')!);
			}
			return searchParams;
		}}
		transformFn={handleTransform}
		extensions={[derivedLxlQualifierPlugin]}
		shallowRouting
		toggleWithKeyboardShortcut
		wrappingArrowKeyNavigation
		defaultInputCol={undefined}
		{getDebouncedWait}
		onexpand={handleOnExpand}
		onchange={handleOnChange}
		onexpandedviewupdate={handleOnExpandedViewUpdate}
		--search-offset={searchOffset ? `${searchOffset}px` : undefined}
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
					'supersearch-input bg-input flex w-full max-w-7xl cursor-text overflow-hidden focus-within:relative',
					expanded && 'expanded sm:mx-0.5 lg:mx-0',
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
							'action text-subtle flex min-h-11 sm:hidden sm:min-h-13.5 lg:min-h-auto',
							expanded && 'mr-1 h-16.5 w-14 sm:h-full sm:w-13'
						]}
						onclick={onclickClose}
					>
						<IconBack aria-hidden="true" class="size-7" />
					</button>
				{/if}
				<div class="flex-1 overflow-hidden">
					{@render inputField()}
				</div>
				{#if q}
					<svelte:element
						this={clearUrl ? 'a' : 'button'}
						role={clearUrl ? undefined : 'button'}
						href={clearUrl ? clearUrl : undefined}
						onclick={(e: MouseEvent) => {
							userClearedSearch = true;
							onclickClear(e);
						}}
						id={getCellId(1)}
						class:focused-cell={isFocusedCell(1)}
						class={[
							'action sm:min-h-auto',
							expanded ? 'flex h-16.5 max-sm:w-13 sm:h-full' : 'hidden sm:flex'
						]}
						aria-label={page.data.t('search.clear')}
						title={page.data.t('search.clear')}
					>
						<IconClear aria-hidden="true" class="size-4.5 sm:size-4" />
					</svelte:element>
				{:else if !expanded}
					<button
						type="button"
						onclick={() => showExpandedSearch()}
						tabindex={-1}
						class="hidden h-full cursor-text items-center justify-center px-3 select-none sm:flex"
					>
						<kbd
							class="key pointer-events-auto h-[1.75em] w-[1.75em] text-sm"
							title={`${page.data.t('supersearch.expandSearch')} (Shift+7 ${page.data.t('supersearch.or')} ${navigator.userAgent.includes('Mac OS X') ? 'Meta+K' : 'Control+K'})`}
							>/</kbd
						>
					</button>
				{/if}
				<button
					type="submit"
					id={getCellId(2)}
					class:focused-cell={isFocusedCell(2)}
					class={[
						'action rounded-r-md border-l-neutral-300 sm:rounded-r-lg sm:border-l',
						isHomeRoute || expanded ? 'hidden sm:flex' : 'flex'
					]}
					aria-label={page.data.t('supersearch.search')}
					tabindex={isHomeRoute ? -1 : undefined}
				>
					<IconSearch aria-hidden="true" class={['flex size-4.5']} />
				</button>
			</div>
		{/snippet}
		{#snippet expandedContent({
			resultsCount,
			resultsSnippet,
			getCellId,
			isFocusedRow,
			isFocusedCell
		})}
			{@const inputRowIndex = 0}
			{@const qualifiersRowIndex = 1}
			{@const showAllResultsRowIndex = 2}
			{@const suggestionsRowOffset = 3}
			{@const footerRowIndex = suggestionsRowOffset + (resultsCount || 0)}
			<nav class="expanded-content mt-2 sm:mt-3">
				<QualifierSuggestionsRow
					{qualifierSuggestions}
					rowIndex={qualifiersRowIndex}
					{getCellId}
					{isFocusedRow}
					{isFocusedCell}
					query={q}
					{selection}
				/>
				<ShowAllResultsRow
					{resultsCount}
					{isLoading}
					rowIndex={showAllResultsRowIndex}
					{getCellId}
					{isFocusedRow}
					{isFocusedCell}
				/>
				{#if resultsCount && q.trim().length}
					<div
						role="rowgroup"
						aria-labelledby="supersearch-results-label"
						class="border-neutral border-t"
					>
						{@render resultsSnippet({ rowOffset: suggestionsRowOffset })}
					</div>
				{/if}
				<FooterRow
					{inputRowIndex}
					{showAllResultsRowIndex}
					{qualifiersRowIndex}
					{footerRowIndex}
					{getCellId}
					{isFocusedRow}
					{isFocusedCell}
				/>
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
		font-size: var(--text-base);
		border-radius: var(--radius-md);
		box-shadow: 0 0 0 1px var(--color-primary-400);

		&:hover {
			box-shadow: 0 0 0 1px var(--color-primary-600);
		}

		@variant sm {
			border-radius: var(--radius-lg);
		}

		@variant 2xl {
			font-size: var(--text-base);
		}
	}

	.supersearch-input:not(.expanded),
	.expanded.supersearch-input.focused-row:not(:has(.focused-cell)) {
		@variant sm {
			&:focus-within:not(:has(button:focus)) {
				box-shadow: 0 0 0 6px var(--color-accent-100);
				outline: 2px solid var(--color-outline);
				outline-offset: 0;
			}
		}
	}

	.expanded.supersearch-input {
		min-height: var(--search-input-height);
		border-bottom: 1px solid var(--color-neutral);
		border-radius: 0;
		box-shadow: none;

		&:focus-within {
			outline: none;
		}

		@variant sm {
			border-bottom: none;
			border-radius: var(--radius-md);
			margin-top: calc(var(--spacing) * 1.5);
			box-shadow: 0 0 0 1px var(--color-neutral-400);

			&:hover {
				box-shadow: 0 0 0 1px var(--color-neutral-600);
			}
		}

		@variant sm {
			border-radius: var(--radius-lg);
			margin-top: 0;
		}
	}

	:global(.supersearch-combobox) {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: var(--search-input-height);

		&:has(.expanded) {
			@variant sm {
				margin-top: calc(var(--spacing) * 2);
			}

			@variant lg {
				margin-top: calc(var(--spacing) * 3);
				margin-inline: calc(var(--spacing) * 3);
			}

			@variant 2xl {
				margin-top: calc(var(--spacing) * 3.25);
				margin-inline: calc(var(--spacing) * 3);
			}
		}
	}

	/* adjust combobox for navbar with subset filter */
	:global(.with-subset .supersearch-combobox) {
		&:has(.expanded) {
			@variant lg {
				margin-inline: calc(var(--spacing) * 1.25);
			}

			@media screen and (min-width: 1380px) {
				margin-inline: calc(var(--spacing) * 1.5);
			}
		}
	}

	.action {
		min-height: var(--search-input-height);
		@apply text-subtle aspect-square items-center justify-center -outline-offset-2;
		&:hover {
			background: var(--color-accent-50);
		}

		&:focus {
			background: var(--color-accent-100);
		}
	}

	:global(.supersearch-dialog) {
		position: fixed;
		height: 100%;
		max-height: 100vh;
		max-height: 100lvh;
		width: 100%;
		max-width: 100%;
		background-color: transparent;
		margin: 0;
		padding: 0;
		top: 0;

		&::backdrop {
			background: var(--color-backdrop);
		}

		@variant sm {
			top: 0;
			margin-top: var(--search-offset, 0px);
		}
	}

	:global(.supersearch-dialog-wrapper) {
		height: 100%;
		width: 100%;

		@variant sm {
			position: fixed;
			height: auto;
			margin-top: calc(var(--spacing) * 1);
		}

		@variant lg {
			margin-top: 0;
			display: grid;
			grid-template-areas: var(--appbar-template-areas);
			grid-template-columns: var(--appbar-template-columns);
			gap: var(--appbar-gap);
			padding-inline: 0;
		}

		@variant 2xl {
			margin-top: calc(var(--spacing) * 0.25);
		}
	}

	:global(.supersearch-dialog-content) {
		grid-area: search;
		background: var(--color-page);
		pointer-events: auto;
		max-height: 100vh;
		max-height: 100lvh;
		overflow-y: scroll;
		overflow-x: hidden;
		overscroll-behavior: contain;
		scrollbar-width: none;
		width: 100%;
		height: 100%;
		margin: 0 auto;
		@apply max-w-7xl;

		@variant sm {
			border-radius: var(--radius-2xl);
			height: fit-content;
			@apply drop-shadow-md;
		}
		& :global(.supersearch-combobox) {
			@variant sm {
				padding-inline: calc(var(--spacing) * 1.5);
			}

			@variant lg {
				padding-inline: 0;
			}
		}
	}

	:global(.supersearch-suggestions) {
		@apply min-h-2;
	}

	:global(.supersearch-dialog .focused-cell) {
		background-color: var(--color-accent-100);
		outline: 2px solid var(--color-accent);
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
		min-height: var(--search-input-height);
	}

	.supersearch-input :global(.cm-content:has(.cm-placeholder)) {
		padding: calc(var(--spacing) * 1.5) 0;

		@variant sm {
			padding: calc(var(--spacing) * 1.75) 0;
		}

		@variant 2xl {
			padding: calc(var(--spacing) * 2) 0;
		}
	}

	.expanded.supersearch-input :global(.cm-scroller) {
		min-height: calc(var(--spacing) * 16.5);
		scrollbar-width: thin;
		max-height: 128px;
		overflow-x: hidden;

		@variant sm {
			min-height: calc(var(--spacing) * 11);
		}
	}

	.expanded.supersearch-input :global(.cm-content) {
		margin-top: 0;
		@variant max-sm {
			padding: calc(var(--spacing) * 3.75) 0;
		}
	}

	.expanded.supersearch-input :global(.cm-content:has(.cm-placeholder)) {
		@variant 2xl {
			padding: calc(var(--spacing) * 2) 0;
		}
	}

	.supersearch-input :global(.cm-line) {
		line-height: 36px;
		padding-left: calc(var(--spacing) * 3);

		@variant lg {
			padding-left: calc(var(--spacing) * 4);
		}
	}

	.expanded.supersearch-input :global(.cm-line) {
		@variant 2xl {
			padding-left: calc(var(--spacing) * 4);
		}
	}

	.supersearch-input :global(.cm-content) {
		margin: 0;
		padding: calc(var(--spacing) * 1.25) 0;
		min-height: var(--search-input-height);

		@variant sm {
			padding: calc(var(--spacing) * 2) 0;
		}

		@variant 2xl {
			padding: calc(var(--spacing) * 2.5) 0;
		}
	}

	:global(.supersearch-dialog .supersearch-input .cm-line) {
		@variant max-sm {
			padding-left: 0;
		}
	}

	:global(.codemirror-container .cm-content) {
		outline: none;
	}

	:global(.codemirror-container .cm-placeholder) {
		font-size: var(--text-base);
		color: var(--color-placeholder);
		white-space: nowrap;

		line-height: 36px;

		@variant sm {
			line-height: 38px;
		}

		@variant 2xl {
			@apply text-base;
			line-height: 40px;
		}
	}

	.expanded-content {
		& :global([role='row']:not([data-skip-row-on-arrow-key]):hover) {
			@apply bg-accent-50/75;
		}

		& :global(.focused-cell) {
			outline: 2px solid var(--color-outline);
		}
	}

	button:has(kbd) {
		min-height: var(--search-input-height);
	}
</style>
