<script lang="ts">
	import { mount, onMount, unmount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { afterNavigate } from '$app/navigation';
	// import { resolve } from '$app/paths';
	import {
		SuperSearch,
		lxlQualifierPlugin,
		type QualifierRendererProps,
		type Selection,
		type ShowExpandedSearchOptions,
		type ViewUpdateSuperSearchEvent,
		type DebouncedWaitFunction,
		type ExpandEvent,
		type ChangeSuperSearchEvent
	} from 'supersearch';
	import QualifierPill from './QualifierPill.svelte';
	import Suggestion from './Suggestion.svelte';
	import getLabelFromMappings from '$lib/utils/getLabelsFromMapping.svelte';
	import addSpaceIfEndingQualifier from '$lib/utils/addSpaceIfEndingQualifier';
	import type { DisplayMapping, QualifierSuggestion2 } from '$lib/types/search';
	import { lxlQuery } from 'codemirror-lang-lxlquery';
	import IconClear from '~icons/bi/x-circle';
	import IconBack from '~icons/bi/arrow-left-short';
	import IconSearch from '~icons/bi/search';
	import IconAddFilter from '~icons/bi/plus-circle';
	//import IconSearchHistory from '~icons/bi/clock-history';
	import '$lib/styles/lxlquery.css';
	import { getSearchContext } from '$lib/contexts/search';
	import Spinner from '$lib/components/Spinner.svelte';
	import { controlOrMetaKey } from '$lib/utils/controlOrMetaKey';

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
	}

	export type ChangeQueryParams = { insert: string; from?: number; to?: number };
	export type SuperSearchMode = 'DEFAULT' | 'QUALIFIERS';

	let {
		placeholder,
		collapsedAriaLabelledBy,
		collapsedAriaLabel,
		collapsedAriaDescribedBy,
		expandedAriaLabelledBy,
		expandedAriaLabel,
		expandedAriaDescribedBy,
		onCursorChange,
		qualifierSuggestions
	}: Props = $props();

	const searchContext = getSearchContext();

	let q = $state(addSpaceIfEndingQualifier(page.url.searchParams.get('_q')?.trim() || ''));
	let selection: Selection | undefined = $state();
	let mode: SuperSearchMode = $state('DEFAULT');

	let isLoading: boolean | undefined = $state();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let debouncedLoading: boolean | undefined = $state();
	let wrappedLines: boolean | undefined = $state();
	let pageYOffset: number | undefined = $state();
	let qualifierSlashPos: number | undefined = $state();

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

	onDestroy(() => {
		if (timeout) clearTimeout(timeout);
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
				q = addSpaceIfEndingQualifier(to.url.searchParams.get('_q')?.trim() || '');
			}

			pageMapping = page.data.searchResult?.mapping || pageMapping; // use previous page mapping if there is no new page mapping

			hideExpandedSearch();
			fetchOnExpand = true;

			if (userClearedSearch) {
				showExpandedSearch();
				userClearedSearch = false;
			} else if (isHomeRoute) {
				focus(); // focus input on start page
			} else {
				blur(); // remove focus from input after searching or navigating
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
			const filtered = qualifierSuggestions
				.map((q) => ({ q: q, score: score(q, qualifierSuggestionNeedle.word) }))
				.filter((qs) => qs.score > 0)
				.sort((a, b) => b.score - a.score)
				.map((qs) => qs.q);

			if (filtered.length) return filtered;
			return qualifierSuggestions.filter((q) => q?.curated);
		}

		if (!hasCharBefore && !hasCharAfter && editedParentNode !== 'QualifierValue') {
			return qualifierSuggestionsExpanded
				? qualifierSuggestions
				: qualifierSuggestions.filter((q) => q?.curated);
		}

		return qualifierSuggestions.filter((q) => q?.curated);
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

	const showQualifiersRow = $derived(true);
	const showResultRows = $derived(mode === 'DEFAULT');
	const showHistoryRows = $derived(false);

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

	// const numCuratedQualifiers = $derived(qualifierSuggestions.filter((q) => q.curated).length);

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

	export function changeQuery(params: ChangeQueryParams) {
		const { insert } = params;
		const from = params.from || q.length;
		const to = params.to || q.length;
		const before = q.slice(0, from);
		superSearch?.dispatchChange({
			change: {
				from,
				to,
				insert
			},
			selection: {
				anchor: (before + insert).length,
				head: (before + insert).length
			},
			userEvent: 'input'
		});
	}

	export function addQualifierKey(qualifierKey: string) {
		superSearch?.resetData();
		showExpandedSearch(); // keep dialog open (since 'regular' search is hidden on mobile)

		if (qualifierSuggestionNeedle.word.length > 0) {
			// TODO don't need this if we can check qualifier editing state?
			// TODO don't suggest same
			// TODO handle replacement of qualifier more smoothly
			const insert = [':', '=', '<', '>', '~'].includes(q.charAt(qualifierSuggestionNeedle.to))
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
			const insert = `${qualifierKey}: `;

			superSearch?.dispatchChange({
				change: {
					from: cursor,
					to: cursor,
					insert
				},
				selection: {
					anchor: cursor + insert.length - 1,
					head: cursor + insert.length - 1
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

	export function showExpandedSearch(options?: ShowExpandedSearchOptions) {
		superSearch?.showExpandedSearch(options);
	}

	export function hideExpandedSearch() {
		superSearch?.hideExpandedSearch();
	}

	export function showQualifiersMode() {
		mode = 'QUALIFIERS';
		showExpandedSearch();
	}

	export function focus() {
		superSearch?.focus();
	}

	export function blur() {
		superSearch?.blur();
	}

	export function isExpanded() {
		return superSearch?.isExpanded();
	}

	export function getSelection() {
		return superSearch?.getSelection();
	}

	function handleOnChange({ value }: ChangeSuperSearchEvent) {
		fetchOnExpand = false;
		if (
			typeof qualifierSlashPos === 'number' &&
			value.slice(qualifierSlashPos, qualifierSlashPos + 1) !== '/'
		) {
			mode = 'DEFAULT'; // TODO: Do something smarter here (with the syntax tree?)
		}
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

	function handleOnCollapse() {
		mode = 'DEFAULT';
		qualifierSlashPos = undefined;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (controlOrMetaKey(event) && event.key === 'k' && !superSearch?.isExpanded()) {
			event.preventDefault();
			showExpandedSearch();
		}

		if (event.shiftKey && event.key === '/') {
			qualifierSlashPos = superSearch?.getSelection?.()?.from || 0;
			if (mode !== 'QUALIFIERS') {
				showQualifiersMode();
			}
		}

		if (mode === 'QUALIFIERS' && event.key === 'Escape') {
			event.preventDefault();
			mode = 'DEFAULT';
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
		searchContext.showExpandedSearch = showExpandedSearch;
		searchContext.hideExpandedSearch = hideExpandedSearch;
		searchContext.focus = focus;
		searchContext.blur = blur;
		searchContext.changeQuery = changeQuery;
		searchContext.addQualifierKey = addQualifierKey;
		searchContext.showQualifiersMode = showQualifiersMode;
		searchContext.isExpanded = isExpanded;
		document.addEventListener('keydown', handleKeyDown);
	});

	onDestroy(() => {
		document.removeEventListener('keydown', handleKeyDown);
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
		autofocus={isHomeRoute ? true : undefined}
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
		wrappingArrowKeyNavigation
		hideOnEscapeKey={mode === 'DEFAULT'}
		defaultInputCol={undefined}
		{getDebouncedWait}
		onexpand={handleOnExpand}
		onchange={handleOnChange}
		oncollapse={handleOnCollapse}
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
					'supersearch-input bg-input! flex w-full max-w-7xl cursor-text overflow-hidden focus-within:relative lg:h-12',
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
							'text-subtle bg-input absolute flex size-11 items-center justify-center rounded-md sm:hidden',
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
		})}
			{@const inputRowIndex = 0}
			{@const qualifiersRowIndex = 1}
			{@const resultsRowIndex = 2}
			{@const resultRowsOffset = 1 + (showQualifiersRow ? 1 : 0) + (showResultRows ? 1 : 0)}
			{@const searchHelpRowIndex = resultRowsOffset + (resultsCount || 0)}
			<nav class="@container mt-3 lg:mt-4">
				{#if mode === 'QUALIFIERS'}
					<div
						role="row"
						class={['has-[:hover]:bg-accent-50/50 relative', isFocusedRow(1) && 'focused-row']}
					>
						aaa
					</div>
					<div
						role="row"
						class={['has-[:hover]:bg-accent-50/50 relative', isFocusedRow(2) && 'focused-row']}
					>
						bbb
					</div>
				{:else}
					{#if showQualifiersRow}
						{#snippet addFiltersLabel()}
							<span class="flex min-h-14 w-fit cursor-pointer items-center px-4 hover:underline">
								<IconAddFilter class="text-link mr-2 size-4.5" />
								<span class="text-link whitespace-nowrap">
									{page.data.t('supersearch.add')}
									{page.data.t('supersearch.filter')}
								</span>
							</span>
						{/snippet}
						<div
							role="row"
							class={[
								'has-[:hover]:bg-accent-50/50 relative',
								isFocusedRow(qualifiersRowIndex) && 'focused-row'
							]}
						>
							<button
								type="button"
								id={getCellId(qualifiersRowIndex, 0)}
								title={`${page.data.t('supersearch.add')} ${page.data.t('supersearch.filters')} (Shift+7)`}
								onclick={showQualifiersMode}
								class={[
									'w-full cursor-default',
									isFocusedCell(qualifiersRowIndex, 0) && 'focused-cell'
								]}
							>
								{@render addFiltersLabel()}
							</button>
							<span class="pointer-events-none absolute top-0 left-0 flex size-full items-center">
								<span class="invisible" aria-hidden="true">
									{@render addFiltersLabel()}
								</span>
								<ul
									class="scrollbar-hidden relative flex h-14 items-center gap-2 overflow-x-auto overflow-y-visible"
								>
									{#each filteredQualifierSuggestions as { key, label }, cellIndex (key)}
										<li>
											<button
												type="button"
												id={getCellId(qualifiersRowIndex, cellIndex + 1)}
												class={[
													'qualifier-suggestion text-body border-accent-200 hover:bg-accent-50 pointer-events-auto inline-flex min-h-10 min-w-9 shrink-0 items-center gap-1.5 rounded-md border px-2 text-sm font-medium whitespace-nowrap -outline-offset-2',
													isFocusedCell(qualifiersRowIndex, cellIndex + 1) && 'focused-cell'
												]}
												title={`${page.data.t('supersearch.add')} ${label.toLocaleLowerCase()}`}
												onclick={() => addQualifierKey(key)}
											>
												<span class="first-letter:capitalize">{label}</span>
											</button>
										</li>
									{/each}
								</ul>
								<div class="flex-1 pr-4 pl-2 text-right">
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<!-- We need a clickable span here as the pointer events otherwise won't reach the button under -->
									<span
										class="text-placeholder hover:[&>span]:text-link pointer-events-auto cursor-pointer items-center text-sm whitespace-nowrap hover:[&>span]:underline"
										title={`${page.data.t('supersearch.showMore')} ${page.data.t('supersearch.filters')} (Shift+7)`}
										onclick={showQualifiersMode}
									>
										<span>{page.data.t('supersearch.showMore')}</span>
										<span class="sr-only">{page.data.t('supersearch.filters')}</span>
										<kbd class="keyboard-shortcut ml-0.5">/</kbd>
									</span>
								</div>
							</span>
							<!--
							{#if !isSuggestingQualifiers && filteredQualifierSuggestions.length}
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
						-->
						</div>
					{/if}
					{#if showHistoryRows}
						<div role="rowgroup" class="min-h-14">
							<!--
						<div role="row" class={['has-[:hover]:bg-accent-50', isFocusedRow(2) && 'focused-row']}>
							<button
								type="button"
								id={getCellId(2, 0)}
								class={[
									'flex min-h-14 w-full items-center px-4 hover:*:underline',
									isFocusedCell(2, 0) && 'focused-cell'
								]}
							>
								<span
									class={['text-link flex items-center gap-1 whitespace-nowrap hover:underline']}
								>
									<span
										class="bg-accent-200/30 text-link mr-1 flex size-10 items-center justify-center rounded-lg"
									>
										<IconSearchHistory aria-hidden="true" class="size-4.5" />
									</span>
								</span>
							</button>
						</div>
						-->
						</div>
					{:else if showResultRows}
						<div role="row" class={['has-[:hover]:bg-accent-50', isFocusedRow(2) && 'focused-row']}>
							<button
								type="submit"
								id={getCellId(resultsRowIndex, 0)}
								class={[
									'flex min-h-14 w-full items-center px-4',
									isFocusedCell(resultsRowIndex, 0) && 'focused-cell'
								]}
							>
								<span
									class={['text-link flex items-center gap-2 whitespace-nowrap hover:underline']}
								>
									<IconSearch aria-hidden="true" class="size-4.5" />
									{page.data.t('supersearch.showResults')}
									{#if isLoading}
										<div class="ml-auto h-5 w-5">
											<Spinner />
										</div>
									{/if}
								</span>
							</button>
						</div>
						<div role="rowgroup" aria-label={page.data.t('supersearch.suggestions')}>
							{@render resultsSnippet({
								rowOffset: resultRowsOffset
							})}
						</div>
					{/if}
				{/if}
				<div
					role="row"
					data-skip-row-on-arrow-key
					class="border-neutral flex justify-between gap-4 border-t pl-4 text-sm"
				>
					<ul class="text-placeholder flex cursor-default items-center gap-4">
						<li>
							<kbd class="keyboard-shortcut" title={page.data.t('supersearch.arrowUp')}>↑</kbd>
							<kbd class="keyboard-shortcut" title={page.data.t('supersearch.arrowDown')}>↓</kbd>
							<kbd class="keyboard-shortcut" title={page.data.t('supersearch.arrowLeft')}>←</kbd>
							<kbd class="keyboard-shortcut" title={page.data.t('supersearch.arrowRight')}>→</kbd>
							<span class="ml-0.5">
								{page.data.t('supersearch.navigate')}
							</span>
						</li>
						<li>
							<kbd class="keyboard-shortcut" title={page.data.t('supersearch.returnKey')}>↵</kbd>
							<span class="ml-0.5">
								{#if isFocusedCell(inputRowIndex, 1)}
									{page.data.t('search.clear')}
								{:else if isFocusedRow(inputRowIndex)}
									{page.data.t('supersearch.search')}
								{:else if isFocusedRow(qualifiersRowIndex) && !isFocusedCell(qualifiersRowIndex, 0)}
									{page.data.t('supersearch.add')}
								{:else}
									{page.data.t('supersearch.select')}
								{/if}
							</span>
						</li>
					</ul>
					<a
						href={resolve(page.data.localizeHref('/help'))}
						id={getCellId(searchHelpRowIndex, 0)}
						class={[
							'text-link mr-3 flex min-h-14 items-center justify-end px-1 hover:underline',
							isFocusedCell(searchHelpRowIndex, 0) && 'underline outline-2 -outline-offset-2'
						]}
					>
						{page.data.t('supersearch.searchHelp')}
					</a>
				</div>
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
		box-shadow: 0 0 0 1px var(--color-neutral-400);

		&:hover {
		}

		&:not(.expanded) {
			&:focus-within:not(:has(button:focus)) {
				outline: 2px solid var(--color-outline);
				box-shadow: 0 0 0 8px var(--color-primary-200);
			}
		}

		& button:focus {
			outline: 2px solid var(--color-outline);
			background: var(--color-accent-100);
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

			&.focused-row:not(:has(:global(.focused-cell))) {
				outline: 2px solid var(--color-outline);
				box-shadow: 0 0 0 9px var(--color-accent-100);

				@variant lg {
					box-shadow: 0 0 0 8px var(--color-accent-100);
				}
			}
		}

		@variant lg {
			border-radius: var(--radius-md);
			margin-top: 0;
		}
	}

	.action.focused-cell {
		background-color: var(--color-accent-50);
		outline-color: var(--color-outline);
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
		outline-offset: -2px;
	}

	:global(.supersearch-dialog .focused-row) {
		@apply bg-accent-100/75;
	}
	:global(.supersearch-dialog .focused-cell) {
		outline: 2px solid var(--color-accent);
		outline-offset: -2px;
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
	}

	.qualifier-suggestion {
		&.focused-cell {
			background: var(--color-accent-200);
		}
	}
</style>
