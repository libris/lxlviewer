<script lang="ts">
	import { mount, onMount, onDestroy, unmount } from 'svelte';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		SuperSearch,
		lxlQualifierPlugin,
		type QualifierRendererProps,
		type Selection,
		type ShowExpandedSearchOptions,
		type ViewUpdateSuperSearchEvent,
		type DebouncedWaitFunction,
		type ExpandEvent
	} from 'supersearch';
	import SuperSearchFooterRow from './SuperSearchFooterRow.svelte';
	import QualifierPill from './QualifierPill.svelte';
	import Suggestion from './Suggestion.svelte';
	import getLabelFromMappings from '$lib/utils/getLabelsFromMapping.svelte';
	import addSpaceIfEndingQualifier from '$lib/utils/addSpaceIfEndingQualifier';
	import type { DisplayMapping, QualifierSuggestion2 } from '$lib/types/search';
	import { lxlQuery } from 'codemirror-lang-lxlquery';
	import IconClear from '~icons/bi/x-circle';
	import IconBack from '~icons/bi/arrow-left-short';
	import IconGo from '~icons/bi/arrow-right-short';
	import IconSearch from '~icons/bi/search';
	import '$lib/styles/lxlquery.css';
	import { getSearchContext } from '$lib/contexts/search';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	interface Props {
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
	};

	let {
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
	let pageYOffset: number | undefined = $state();

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

	// TODO min 3 for prefix match, while allowing exactMatch år?
	const MIN_LENGTH_FOR_QUALIFIER_SUGGESTIONS = 2;

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
			} else if (isHomeRoute) {
				superSearch?.focus(); // focus input on start page
			} else {
				superSearch?.blur(); // remove focus from input after searching or navigating
			}
		}
	});

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

	const hasCharBefore = $derived(/\S/.test(q.charAt(cursor - 1)));
	const hasCharAfter = $derived(/\S/.test(q.charAt(cursor)));

	let qualifierSuggestionsExpanded = $state(false);

	const filteredQualifierSuggestions = $derived.by(() => {
		if (isSuggestingQualifiers) {
			return qualifierSuggestions
				.map((q) => ({ q: q, score: score(q, qualifierSuggestionNeedle.word) }))
				.filter((qs) => qs.score > 0)
				.sort((a, b) => b.score - a.score)
				.map((qs) => qs.q);
		}

		if (!hasCharBefore && !hasCharAfter && editedParentNode !== 'QualifierValue') {
			return qualifierSuggestionsExpanded
				? qualifierSuggestions
				: qualifierSuggestions.filter((q) => q?.curated);
		}

		return [];
	});

	function score(q: QualifierSuggestion2, needle: string): number {
		// TODO only match query codes uppercase? e.g. WHYL
		const needleLower = needle.toLowerCase();

		if (prefixMatch(needleLower, q.label)) {
			return 20;
		}
		if (prefixMatch(needleLower, q.key)) {
			return 10;
		}

		let score = 0;
		for (const s of q.queryCodes) {
			if (prefixMatch(needleLower, s)) {
				score += 1;
			}
		}
		for (const s of q.altLabels) {
			if (prefixMatch(needleLower, s)) {
				score += 1;
			}
		}
		return score;
	}

	function prefixMatch(needleLower: string, haystack: string) {
		return haystack
			.toLowerCase()
			.split(/\s/)
			.find((s) => s.startsWith(needleLower));
	}

	const showAddQualifiers = $derived(filteredQualifierSuggestions.length > 0);

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

	const qualifierSuggestionNeedle = $derived.by(() => {
		if (
			editedParentNode === 'QualifierValue' ||
			editedParentNode === 'QualifierOuterGroup' ||
			[':', '=', '<', '>'].includes(q.charAt(cursor - 1))
		) {
			return { from: cursor, to: cursor, word: '' };
		}

		return editedWord(q, cursor);
	});

	const isSuggestingQualifiers = $derived(
		qualifierSuggestionNeedle.word.length >= MIN_LENGTH_FOR_QUALIFIER_SUGGESTIONS
	);

	const numCuratedQualifiers = $derived(qualifierSuggestions.filter((q) => q.curated).length);

	function editedWord(str: string, cursor: number) {
		let from = cursor;
		for (let i = cursor - 1; i >= 0; i--) {
			if (/\s|[()"<>:=]/.test(str.charAt(i))) {
				break;
			}
			from = i;
		}

		let to = cursor - 1;
		for (let i = cursor; i < q.length; i++) {
			if (/\s|[()"<>:=]/.test(str.charAt(i))) {
				break;
			}
			to = i;
		}
		to += 1;

		return {
			from: from,
			to: to,
			word: str.slice(from, to)
		};
	}

	function handleTransform(data) {
		suggestMapping = data?.mapping;
		return data;
	}

	function changeQuery({ change, selection }: ChangeQueryParams) {
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
			userEvent: 'input'
		});
	}

	function submit(form: HTMLFormElement) {
		superSearch?.submit(form);
	}

	function addQualifierKey(qualifierKey: string) {
		superSearch?.resetData();
		showExpandedSearch(); // keep dialog open (since 'regular' search is hidden on mobile)

		if (qualifierSuggestionNeedle.word.length > 0) {
			// TODO don't need this if we can check qualifier editing state?
			// TODO don't suggest same
			// TODO handle replacement of qualifier more smoothly
			const insert = [':', '=', '<', '>'].includes(q.charAt(qualifierSuggestionNeedle.to))
				? qualifierKey
				: `${qualifierKey}:`;

			superSearch?.dispatchChange({
				change: {
					from: qualifierSuggestionNeedle.from,
					to: qualifierSuggestionNeedle.to,
					insert
				},
				selection: {
					anchor: qualifierSuggestionNeedle.from + insert.length,
					head: qualifierSuggestionNeedle.from + insert.length
				},
				userEvent: 'input.complete'
			});
		} else {
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
		pageYOffset = windowPageYOffset;
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
				}
			});
		}
		searchContext.showExpandedSearch = showExpandedSearch;
		searchContext.hideExpandedSearch = hideExpandedSearch;
		searchContext.changeQuery = changeQuery;
		searchContext.submit = submit;
		searchContext.isMounted = true;
	});

	onDestroy(() => {
		if (timeout) clearTimeout(timeout); // ensure timeout is cleared to prevent memory leaks
		searchContext.initialStateBeforeMount = undefined;
	});
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
		--page-y-offset={pageYOffset ? `${pageYOffset}px` : undefined}
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
					expanded && 'expanded sm:mx-1.5 @5xl:mx-2.25',
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
							'action text-subtle flex size-11 items-center justify-center -outline-offset-2 sm:hidden',
							expanded && 'mr-1 h-14 w-13'
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
							expanded && 'hidden'
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
						href={clearUrl ? clearUrl : undefined}
						onclick={(e: MouseEvent) => {
							userClearedSearch = true;
							onclickClear(e);
						}}
						id={getCellId(1)}
						class:focused-cell={isFocusedCell(1)}
						class={[
							'action text-subtle flex size-11 items-center justify-center -outline-offset-2 lg:size-12',
							expanded && 'max-sm:h-14 max-sm:w-13'
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
						class="hidden size-11 cursor-text items-center justify-center select-none sm:flex lg:size-12"
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
						'action hidden size-11 items-center justify-center rounded-r-md border-l border-l-neutral-300 -outline-offset-2 sm:flex lg:size-12'
					]}
					aria-label={page.data.t('supersearch.search')}
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
			// gotoAfterCollapse
		})}
			{@const inputRowIndex = 0}
			{@const qualifiersRowIndex = showAddQualifiers ? 1 : -1}
			{@const footerRowIndex = (showAddQualifiers ? 1 : 0) + (resultsCount || 0) + 1}
			<nav class="mt-3 lg:mt-4">
				{#if showAddQualifiers}
					<div
						id="supersearch-add-qualifier-key-label"
						class="text-subtle mt-1.5 mb-1 px-4 text-sm font-medium lg:mt-0"
					>
						{page.data.t('supersearch.addQualifiers')}
					</div>
					<div role="rowgroup" aria-labelledby="supersearch-add-qualifier-key-label" class="mb-1">
						<div role="row" class="flex flex-wrap items-center gap-2 px-4 py-2">
							{#each filteredQualifierSuggestions as { key, label }, cellIndex (key)}
								<button
									type="button"
									id={getCellId(1, cellIndex)}
									class={[
										'qualifier-suggestion  text-body bg-accent-50 text-2xs hover:bg-accent-100 inline-block min-h-8 min-w-9 shrink-0 rounded-md px-1.5 font-medium whitespace-nowrap first-letter:capitalize last-of-type:mr-4',
										isFocusedCell(1, cellIndex) && 'focused-cell outline-2'
									]}
									onclick={() => addQualifierKey(key)}
								>
									{label}
								</button>
								{#if filteredQualifierSuggestions.length > numCuratedQualifiers && cellIndex + 1 === numCuratedQualifiers}
									<span class="text-subtle" aria-hidden="true">|</span>
								{/if}
							{/each}
							{#if !isSuggestingQualifiers && filteredQualifierSuggestions.length > 0}
								<button
									type="button"
									id={getCellId(1, filteredQualifierSuggestions.length + 1)}
									class={[
										'link-subtle ml-1 text-sm sm:text-xs',
										isFocusedCell(1, filteredQualifierSuggestions.length + 1) &&
											'focused-cell outline-2'
									]}
									onclick={() => (qualifierSuggestionsExpanded = !qualifierSuggestionsExpanded)}
								>
									{qualifierSuggestionsExpanded
										? page.data.t('search.showFewer')
										: page.data.t('search.showMore')}
								</button>
								{#if qualifierSuggestionsExpanded}
									<a
										href={resolve(page.data.localizeHref('/help/filters'))}
										id={getCellId(1, filteredQualifierSuggestions.length + 2)}
										class={[
											'link-subtle ml-1 text-sm sm:text-xs',
											isFocusedCell(1, filteredQualifierSuggestions.length + 2) &&
												'focused-cell outline-2'
										]}
									>
										{page.data.t('help.reference')}
									</a>
								{/if}
							{/if}
						</div>
					</div>
				{/if}
				{#if q.trim().length}
					<div class="text-subtle mb-2 flex items-center justify-between px-4 text-sm sm:mb-3">
						<h2 id="supersearch-results-label" aria-live="polite" class="font-medium">
							{#if resultsCount}
								<span class="sr-only">{resultsCount}</span> {page.data.t('supersearch.suggestions')}
							{/if}
						</h2>
						<button type="submit">
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
				<SuperSearchFooterRow
					{inputRowIndex}
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
			&:focus-within:not(:has(button:focus)) {
				box-shadow: 0 0 0 6px var(--color-accent-100);
				outline: 2px solid var(--color-outline);
				outline-offset: 0;
			}
		}

		@variant lg {
			font-size: 0.9375rem;
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

		@variant lg {
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
				margin-inline: calc(var(--spacing) * 0.5);
				margin-top: calc(var(--spacing) * 0.5);
			}
			@variant lg {
				margin-top: calc(var(--spacing) * 3.5);
				margin-inline: calc(var(--spacing) * 1.75);
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
				margin-inline: calc(var(--spacing) * 1.75);
			}
		}
	}

	.action {
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
			top: calc(var(--banner-height, 0) + var(--app-bar-height) - var(--spacing) * 0.5);
			margin-top: max(
				calc(var(--header-margin-top) - var(--page-y-offset, 0px) - var(--banner-height, 0)),
				0px
			);
		}

		@variant lg {
			top: var(--banner-height, 0);
			margin-top: max(
				calc(var(--header-margin-top) - var(--page-y-offset, 0px) - var(--banner-height, 0)),
				0px
			);
		}
	}

	:global(.supersearch-dialog-wrapper) {
		height: 100%;
		width: 100%;

		@variant sm {
			position: fixed;
			height: auto;
			padding-inline: calc(var(--spacing) * 2);
		}

		@variant lg {
			display: grid;
			grid-template-areas: var(--search-grid-template-areas);
			grid-template-columns: var(--search-grid-template-columns);
			gap: var(--search-gap);
			padding-inline: calc(var(--spacing) * 1.25);

			@variant @5xl {
				padding-inline: 0;
			}
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
			border-radius: var(--radius-xl);
			height: fit-content;
			@apply drop-shadow-md;
		}

		@variant lg {
			border-radius: var(--radius-2xl);
		}
	}

	:global(.supersearch-suggestions) {
		@apply min-h-2;
	}

	:global(.supersearch-dialog .focused .suggestion .focused-cell) {
		background-color: var(--color-accent-50);
		outline: 2px solid var(--color-outline);
	}

	:global(.supersearch-dialog .focused-cell) {
		background-color: var(--color-accent-50);
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

	.expanded.supersearch-input :global(.cm-scroller) {
		min-height: calc(var(--spacing) * 14);
		scrollbar-width: thin;
		max-height: 128px;
		overflow-x: hidden;

		@variant sm {
			min-height: calc(var(--spacing) * 11);
		}
	}

	.expanded.supersearch-input :global(.cm-content) {
		margin-block: calc(var(--spacing) * 1.5);

		@variant sm {
			margin-block: 0;
		}
	}

	.supersearch-input :global(.cm-line) {
		line-height: 32px;
		padding-left: calc(var(--spacing) * 11);

		@variant sm {
			padding-left: calc(var(--spacing) * 3);

			@variant @3xl {
				padding-left: calc(var(--spacing) * 4);
			}
		}
	}

	.expanded.supersearch-input :global(.cm-line) {
		padding-left: 0;

		@variant sm {
			padding-left: calc(var(--spacing) * 3);
		}

		@variant @3xl {
			padding-left: calc(var(--spacing) * 4);
		}
	}

	.supersearch-input :global(.cm-content) {
		margin: 0;
		padding: calc(var(--spacing) * 1.5) 0;
		min-height: var(--search-input-height);

		@variant lg {
			padding: calc(var(--spacing) * 2) 0;
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
		font-size: var(--text-base);
		color: var(--color-placeholder);
		white-space: nowrap;

		@variant lg {
			font-size: 0.9375rem;
		}
	}

	.qualifier-suggestion {
		box-shadow: 0 0 0 1px var(--color-accent-200);

		&:hover {
			background: var(--color-accent-100);
		}
		&.focused-cell {
			background: var(--color-accent-100);
			box-shadow: 0 0 0 5px var(--color-accent-100);
			outline: 2px solid var(--color-outline);
		}
	}
</style>
