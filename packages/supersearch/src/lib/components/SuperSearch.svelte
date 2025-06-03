<script lang="ts">
	import { onMount, onDestroy, type Snippet } from 'svelte';
	import { BROWSER } from 'esm-env';
	import CodeMirror, {
		type ChangeCodeMirrorEvent,
		type SelectCodeMirrorEvent,
		type Selection
	} from '$lib/components/CodeMirror.svelte';
	import { EditorView, placeholder as placeholderExtension, keymap } from '@codemirror/view';
	import { Compartment, StateEffect, type Extension } from '@codemirror/state';
	import { type LanguageSupport } from '@codemirror/language';
	import preventEnterKeyHandling from '$lib/extensions/preventEnterKeyHandling.js';
	import arrowKeyCursorHandling from '$lib/extensions/arrowKeyCursorHandling.js';
	import preventNewLine from '$lib/extensions/preventNewLine.js';
	import useSearchRequest from '$lib/utils/useSearchRequest.svelte.js';
	import { messages } from '$lib/constants/messages.js';
	import type {
		QueryFunction,
		PaginationQueryFunction,
		TransformFunction,
		ShouldShowStartContentFunction,
		ResultItem
	} from '$lib/types/superSearch.js';
	import { standardKeymap } from '@codemirror/commands';

	interface Props {
		id?: string;
		name: string;
		value?: string;
		form?: string;
		language?: LanguageSupport;
		placeholder?: string;
		endpoint: string | URL;
		queryFn?: QueryFunction;
		paginationQueryFn?: PaginationQueryFunction;
		transformFn?: TransformFunction;
		shouldShowStartContentFn?: ShouldShowStartContentFunction;
		extensions?: Extension[];
		comboboxAriaLabel?: string;
		startContent?: Snippet<
			[
				{
					getCellId: (rowIndex: number, cellIndex: number) => string | undefined;
					isFocusedCell: (rowIndex: number, cellIndex: number) => boolean;
					isFocusedRow: (rowIndex: number) => boolean;
				}
			]
		>;
		inputRow?: Snippet<
			[
				{
					expanded: boolean;
					inputField: Snippet;
					getCellId: (cellIndex: number) => string | undefined;
					isFocusedCell: (cellIndex: number) => boolean;
					onclickSubmit: (event: MouseEvent) => void;
					onclickClear: (event: MouseEvent) => void;
					onclickClose: (event: MouseEvent) => void;
				}
			]
		>;
		resultItemRow?: Snippet<
			[
				{
					resultItem: ResultItem;
					getCellId: (cellIndex: number) => string;
					isFocusedCell: (cellIndex: number) => boolean;
					rowIndex: number;
				}
			]
		>;
		persistentResultItemRow?: Snippet<
			[{ getCellId: (cellIndex: number) => string; isFocusedCell: (cellIndex: number) => boolean }]
		>;
		loadingIndicator?: Snippet;
		defaultInputCol?: number;
		defaultResultRow?: number;
		defaultResultCol?: number;
		toggleWithKeyboardShortcut?: boolean;
		debouncedWait?: number;
		selection?: Selection;
		isLoading?: boolean;
		hasData?: boolean;
		loadMoreLabel?: string;
	}

	let {
		id = 'supersearch',
		name,
		value = $bindable(''),
		form,
		language,
		placeholder = '',
		endpoint,
		queryFn = (value) => new URLSearchParams({ q: value }),
		paginationQueryFn,
		transformFn,
		shouldShowStartContentFn = (value) => !value.trim().length,
		extensions = [],
		comboboxAriaLabel,
		startContent,
		inputRow = fallbackInputRow,
		resultItemRow = fallbackResultItemRow,
		persistentResultItemRow,
		loadingIndicator,
		toggleWithKeyboardShortcut = false,
		defaultInputCol = -1,
		defaultResultRow = 0,
		defaultResultCol = 0,
		debouncedWait = 300,
		selection = $bindable(),
		isLoading = $bindable(), // should be treated as readonly
		hasData = $bindable(), // should be treated as readonly
		loadMoreLabel = 'Load more'
	}: Props = $props();

	let collapsedEditorView: EditorView | undefined = $state();
	let expandedEditorView: EditorView | undefined = $state();
	let dialog: HTMLDialogElement | undefined = $state();
	let expanded = $state(false);
	let activeRowIndex: number = $state(0);
	let activeColIndex: number = $state(0);
	let prevValue: string = value;

	let allowArrowKeyCursorHandling: { vertical: boolean; horizontal: boolean } = $state({
		vertical: true,
		horizontal: true
	});
	let prevArrowKeyCursorHandling = { vertical: true, horizontal: true };
	let cursorHandlingCompartment = new Compartment();

	let placeholderCompartment = new Compartment();
	let prevPlaceholder = placeholder;

	let collapsedContentAttributesCompartment = new Compartment();
	let expandedContentAttributesCompartment = new Compartment();

	let search = useSearchRequest({
		endpoint,
		queryFn,
		paginationQueryFn,
		transformFn,
		debouncedWait
	});

	let prevSearchDataId: string | undefined;
	const sendMessage = StateEffect.define<{ message: string }>({});
	const newDataMessage = { effects: sendMessage.of({ message: messages.NEW_DATA }) };

	$effect(() => {
		if (search.data && search.data?.['@id'] !== prevSearchDataId) {
			expandedEditorView?.dispatch(newDataMessage);
			collapsedEditorView?.dispatch(newDataMessage);
			prevSearchDataId = search.data?.['@id'];
		}
	});

	const extensionsWithDefaults = [
		keymap.of(standardKeymap), // Needed for atomic ranges to work. Maybe we can use a subset?
		preventEnterKeyHandling(),
		cursorHandlingCompartment.of(arrowKeyCursorHandling({ vertical: true, horizontal: true })),
		preventNewLine({ replaceWithSpace: true }),
		...(language ? [language] : []),
		placeholderCompartment.of(placeholderExtension(placeholder)),
		...extensions
	];

	let collapsedContentAttributes = $derived(
		EditorView.contentAttributes.of({
			role: 'combobox',
			enterkeyhint: 'search',
			...(comboboxAriaLabel && {
				'aria-label': comboboxAriaLabel
			}),
			'aria-haspopup': 'dialog', // indicates the availability and type of interactive popup element that can be triggered by the element
			'aria-controls': `${id}-dialog`, // identifies the popup element
			'aria-expanded': expanded.toString(), // indicates if the popup element is open
			'aria-multiline': 'false' // aria-multiline isn't allowed inside elements with role=combobox
		})
	);

	let includeAriaActiveDescendant = $derived(activeRowIndex >= 0 && activeColIndex >= 0); // ensures aria-activedecendant is only shown if the element exists in the DOM
	let expandedContentAttributes = $derived(
		EditorView.contentAttributes.of({
			id: `${id}-content`,
			role: 'combobox', // identifies the element as a combobox
			enterkeyhint: 'search',
			...(comboboxAriaLabel && {
				'aria-label': comboboxAriaLabel
			}),
			'aria-haspopup': 'grid', // indicates that the combobox can popup a grid to suggest values
			'aria-expanded': 'true', // indicates that the popup element is displayed
			'aria-autocomplete': 'list', // indicates that the autocomplete behavior of the input is to suggest a list of possible values in a popup
			'aria-controls': `${id}-grid`, // identifies the popup element that lists suggested values
			'aria-multiline': 'false',
			...(includeAriaActiveDescendant && {
				'aria-activedescendant': `${id}-item-${activeRowIndex}x${activeColIndex}` // enables assistive technologies to know which element the application regards as focused while DOM focus remains on the input element
			})
		})
	);

	/* svelte-ignore state_referenced_locally */
	const initialCollapsedContentAttributes = collapsedContentAttributes; // initial value is needed to prevent unnecessary updates when using compartments
	// svelte-ignore state_referenced_locally
	const initialExpandedContentAttributes = expandedContentAttributes;

	let collapsedExtensions = $derived([
		...extensionsWithDefaults,
		collapsedContentAttributesCompartment.of(initialCollapsedContentAttributes)
	]);

	let expandedExtensions = $derived([
		...extensionsWithDefaults,
		expandedContentAttributesCompartment.of(initialExpandedContentAttributes)
	]);

	function handleClickCollapsed() {
		if (!dialog?.open) showExpandedSearch();
	}

	function setDefaultRowAndCols() {
		if (!shouldShowStartContentFn(value, selection)) {
			activeRowIndex = defaultResultRow;
			if (activeRowIndex > 0) {
				activeColIndex = defaultResultCol;
			} else {
				activeColIndex = defaultInputCol;
			}
		} else {
			activeRowIndex = 0;
			activeColIndex = defaultInputCol;
		}
	}

	function handleChangeCodeMirror(event: ChangeCodeMirrorEvent) {
		if (!dialog?.open && value !== event.value) {
			showExpandedSearch();
		}
		value = event.value;
		selection = event.selection;
		setDefaultRowAndCols();

		if (value.trim() && value.trim() !== prevValue.trim()) {
			prevValue = value;
			search.debouncedFetchData(value, selection.head);
		}

		if (!value.trim()) {
			prevValue = value;
			if (search.data) search.resetData();
		}
	}

	function handleSelectCodeMirror(event: SelectCodeMirrorEvent) {
		selection = event;
	}

	export function dispatchChange({
		change,
		selection,
		userEvent = 'input'
	}: {
		change?: {
			from: number;
			to?: number;
			insert?: string;
		};
		selection?: {
			anchor: number;
			head?: number;
		};
		userEvent?:
			| 'input'
			| 'input.type'
			| 'input.paste'
			| 'input.drop'
			| 'input.complete'
			| 'delete'
			| 'delete.selection'
			| 'delete.forward'
			| 'delete.backward'
			| 'delete.cut'
			| 'move'
			| 'move.drop'
			| 'select'
			| 'select.pointer'
			| 'undo'
			| 'redo'; // see: https://codemirror.net/docs/ref/#state.Transaction%5EuserEvent
	}) {
		collapsedEditorView?.dispatch({
			changes: change,
			selection,
			userEvent
		});
	}

	export function showExpandedSearch() {
		expandedEditorView?.dispatch({
			selection: collapsedEditorView?.state.selection.main
		});
		dialog?.showModal();
		expandedEditorView?.focus();
		setDefaultRowAndCols();
		expanded = true;
		allowArrowKeyCursorHandling = { ...allowArrowKeyCursorHandling, vertical: false };
	}

	export function hideExpandedSearch() {
		dialog?.close();
	}

	function handleCloseExpandedSearch() {
		collapsedEditorView?.focus();
		expanded = false;
		allowArrowKeyCursorHandling = { vertical: true, horizontal: true };
	}

	function submitClosestForm() {
		const formElement = form
			? document.getElementById(form)
			: collapsedEditorView?.dom?.closest('form');

		if (formElement && formElement instanceof HTMLFormElement) {
			formElement.requestSubmit();
			hideExpandedSearch();
		}
	}

	function handleCollapsedKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && value.length) {
			submitClosestForm();
		}
	}

	function handleExpandedKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			hideExpandedSearch();
		}

		if (event.key === 'Enter') {
			const activeDecendant = document?.getElementById(
				`${id}-item-${activeRowIndex}x${activeColIndex}`
			);

			/* Fire click event if item cell is focused */
			if (activeDecendant) {
				activeDecendant.click();
			} else if (value.length) {
				submitClosestForm();
			}
		}

		/**
		 * Handle keyboard navigation between focusable elements in expanded search
		 */
		if (
			event.key === 'ArrowUp' ||
			event.key === 'ArrowDown' ||
			event.key === 'ArrowLeft' ||
			event.key === 'ArrowRight' ||
			event.key === 'Tab'
		) {
			const rows = Array.from(dialog?.querySelectorAll(':scope [role=row]') || []);
			const getColsInRow = (rowIndex: number) =>
				Array.from(rows[rowIndex].querySelectorAll(':scope button, :scope a')).filter((colItem) => {
					if (typeof colItem?.checkVisibility === 'function') {
						return colItem.checkVisibility();
					}
					return true; // always return true as a fallback if checkVisiblity isn't available
				});

			const getColIndexFromId = (itemId: string) => {
				const colRegex = new RegExp(`${id}-item-\\d+x(\\d+)`);
				return Number(itemId.match(colRegex)?.[1]);
			};

			const getColIndexBefore = (rowIndex: number, colIndex: number) => {
				if (rowIndex < rows.length) {
					const colIndeces = getColsInRow(rowIndex).map((colItem) => getColIndexFromId(colItem.id));
					return colIndeces[colIndeces.indexOf(colIndex) - 1];
				}
				return -1;
			};

			const getColIndexAfter = (rowIndex: number, colIndex: number) => {
				if (rowIndex < rows.length) {
					const colIndeces = getColsInRow(rowIndex).map((colItem) => getColIndexFromId(colItem.id));
					return colIndeces[colIndeces.indexOf(colIndex) + 1];
				}
				return -1;
			};

			if (rows.length) {
				switch (event.key) {
					case 'ArrowUp':
						if (activeRowIndex >= 1) {
							activeRowIndex--;
							if (activeRowIndex < 1) {
								activeColIndex = defaultInputCol;
								allowArrowKeyCursorHandling = {
									...allowArrowKeyCursorHandling,
									horizontal: true
								};
							} else {
								const cols = getColsInRow(activeRowIndex);
								activeColIndex = Math.min(activeColIndex, cols.length - 1);
								allowArrowKeyCursorHandling = {
									...allowArrowKeyCursorHandling,
									horizontal: cols.length <= 1
								};
							}
						}
						break;
					case 'ArrowDown':
						if (activeRowIndex < rows.length - 1) {
							activeRowIndex++;
							const cols = getColsInRow(activeRowIndex);
							if (activeRowIndex === 1) {
								activeColIndex = 0;
							} else {
								activeColIndex = Math.min(activeColIndex, cols.length - 1);
							}
							allowArrowKeyCursorHandling = {
								...allowArrowKeyCursorHandling,
								horizontal: cols.length <= 1
							};
						}
						break;
					case 'ArrowLeft':
						if (activeRowIndex >= 1 && activeColIndex > 0) {
							activeColIndex = getColIndexBefore(activeRowIndex, activeColIndex);
						}
						break;
					case 'ArrowRight':
						if (activeRowIndex >= 1 && activeColIndex < getColsInRow(activeRowIndex).length - 1) {
							activeColIndex = getColIndexAfter(activeRowIndex, activeColIndex);
						}
						break;
					case 'Tab':
						event.preventDefault();
						if (event.shiftKey) {
							const closestBefore = getColIndexBefore(activeRowIndex, activeColIndex);
							if (typeof closestBefore !== 'number' && activeRowIndex > 0) {
								activeRowIndex = Math.max(0, activeRowIndex - 1);
								activeColIndex = getColIndexFromId(getColsInRow(activeRowIndex).at(-1)!.id);
							}
							if (typeof closestBefore === 'number') {
								activeColIndex = getColIndexBefore(activeRowIndex, activeColIndex);
							}
						} else {
							const closestAfter = getColIndexAfter(activeRowIndex, activeColIndex);

							if (typeof closestAfter !== 'number' && activeRowIndex < rows.length - 1) {
								activeRowIndex++;
								activeColIndex = getColIndexFromId(getColsInRow(activeRowIndex)[0].id);
							}
							if (typeof closestAfter === 'number') {
								activeColIndex = closestAfter;
							}
						}
						break;
				}

				/**
				 * TODO: Ensure the input is in view
				 * const activeCellElement = document.getElementById(`${id}-item-${activeRowIndex}x${activeColIndex}`);
				 *
				 * if (!isElementInView(activeCellElement)) {
				 *		activeCellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
				 * }
				 */
			}
		}
	}

	function handleClickOutsideDialog(event: MouseEvent) {
		if (event.target === dialog) {
			hideExpandedSearch();
		}
	}

	function handleKeyboardShortcut(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
			event.preventDefault();
			if (dialog?.open) {
				hideExpandedSearch();
			} else {
				showExpandedSearch();
			}
		}
	}

	function handleClickSubmit(event: MouseEvent) {
		if (!value.length) {
			event.preventDefault();
		}
	}

	function handleReset() {
		value = '';
		search.resetData();
		showExpandedSearch();
	}

	onMount(() => {
		if (BROWSER && toggleWithKeyboardShortcut) {
			document.addEventListener('keydown', handleKeyboardShortcut);
		}
		dialog?.addEventListener('click', handleClickOutsideDialog);
	});

	onDestroy(() => {
		if (BROWSER) {
			document.removeEventListener('keydown', handleKeyboardShortcut);
		}
		dialog?.removeEventListener('click', handleClickOutsideDialog);
	});

	$effect(() => {
		isLoading = search?.isLoading;
	});

	$effect(() => {
		hasData = !!search?.data;
	});

	$effect(() => {
		if (placeholder !== prevPlaceholder) {
			collapsedEditorView?.dispatch({
				effects: placeholderCompartment.reconfigure(placeholderExtension(placeholder))
			});
			expandedEditorView?.dispatch({
				effects: placeholderCompartment.reconfigure(placeholderExtension(placeholder))
			});
			prevPlaceholder = placeholder;
		}
	});

	$effect(() => {
		if (
			allowArrowKeyCursorHandling.vertical !== prevArrowKeyCursorHandling.vertical ||
			allowArrowKeyCursorHandling.horizontal !== prevArrowKeyCursorHandling.horizontal
		) {
			collapsedEditorView?.dispatch({
				effects: cursorHandlingCompartment.reconfigure(
					arrowKeyCursorHandling(allowArrowKeyCursorHandling)
				)
			});
			expandedEditorView?.dispatch({
				effects: cursorHandlingCompartment.reconfigure(
					arrowKeyCursorHandling(allowArrowKeyCursorHandling)
				)
			});
			prevArrowKeyCursorHandling = allowArrowKeyCursorHandling;
		}
	});

	$effect(() => {
		collapsedEditorView?.dispatch({
			effects: collapsedContentAttributesCompartment.reconfigure(collapsedContentAttributes)
		});
	});

	$effect(() => {
		expandedEditorView?.dispatch({
			effects: expandedContentAttributesCompartment.reconfigure(expandedContentAttributes)
		});
	});
</script>

{#snippet fallbackResultItemRow({ resultItem }: { resultItem: ResultItem })}
	{JSON.stringify(resultItem)}
{/snippet}

{#snippet fallbackInputRow({ inputField }: { inputField: Snippet<[]> })}
	{@render inputField()}
{/snippet}

{#snippet collapsedInputSnippet()}
	<CodeMirror
		{value}
		extensions={collapsedExtensions}
		onclick={handleClickCollapsed}
		onchange={handleChangeCodeMirror}
		onselect={handleSelectCodeMirror}
		bind:editorView={collapsedEditorView}
		syncedEditorView={expandedEditorView}
	/>
{/snippet}

{#snippet expandedInputSnippet()}
	<CodeMirror
		{value}
		extensions={expandedExtensions}
		onchange={handleChangeCodeMirror}
		onselect={handleSelectCodeMirror}
		bind:editorView={expandedEditorView}
		syncedEditorView={collapsedEditorView}
	/>
{/snippet}

<div role="presentation" onkeydown={handleCollapsedKeyDown} {id}>
	<div class="supersearch-combobox">
		{@render inputRow?.({
			expanded: false,
			inputField: collapsedInputSnippet,
			getCellId: () => undefined,
			isFocusedCell: () => false,
			onclickSubmit: handleClickSubmit,
			onclickClear: handleReset,
			onclickClose: hideExpandedSearch
		})}
		<textarea {value} {name} {form} hidden readonly></textarea>
	</div>
</div>
<dialog
	class="supersearch-dialog"
	id={`${id}-dialog`}
	bind:this={dialog}
	onclose={handleCloseExpandedSearch}
>
	<div class="supersearch-dialog-wrapper" role="presentation" onkeydown={handleExpandedKeyDown}>
		<div class="supersearch-dialog-content" role="grid">
			<div class="supersearch-combobox" role="row">
				{@render inputRow?.({
					expanded: true,
					inputField: expandedInputSnippet,
					getCellId: (colIndex: number) => `${id}-item-0x${colIndex}`,
					isFocusedCell: (colIndex: number) => activeRowIndex === 0 && colIndex === activeColIndex,
					onclickSubmit: handleClickSubmit,
					onclickClear: handleReset,
					onclickClose: hideExpandedSearch
				})}
			</div>
			<nav class="supersearch-suggestions" role="rowgroup">
				{#if startContent && shouldShowStartContentFn(value, selection)}
					{@render startContent({
						getCellId: (rowIndex: number, colIndex: number) => `${id}-item-${rowIndex}x${colIndex}`,
						isFocusedCell: (rowIndex: number, colIndex: number) =>
							activeRowIndex === rowIndex && colIndex === activeColIndex,
						isFocusedRow: (rowIndex: number) => activeRowIndex === rowIndex
					})}
				{:else}
					{#if persistentResultItemRow}
						<div role="row" class:focused={activeRowIndex === 1}>
							{@render persistentResultItemRow({
								getCellId: (colIndex: number) => `${id}-item-1x${colIndex}`,
								isFocusedCell: (colIndex: number) =>
									activeRowIndex === 1 && colIndex === activeColIndex
							})}
						</div>
					{/if}
					{#if selection?.anchor === selection?.head}
						{#if search.data}
							{@const resultItemRows =
								(Array.isArray(search.paginatedData) &&
									search.paginatedData.map((page) => page.items).flat()) ||
								search.data?.items}
							{#each resultItemRows as resultItem, index (index)}
								{@const rowIndex = persistentResultItemRow ? index + 2 : index + 1}
								<div role="row" class:focused={activeRowIndex === rowIndex}>
									{@render resultItemRow?.({
										resultItem,
										getCellId: (colIndex: number) => `${id}-item-${rowIndex}x${colIndex}`,
										isFocusedCell: (colIndex: number) =>
											activeRowIndex === rowIndex && colIndex === activeColIndex,
										rowIndex
									})}
								</div>
							{/each}
						{/if}
						{#if search.isLoading}
							{@render loadingIndicator?.()}
						{:else if search.hasMorePaginatedData}
							<button type="button" class="supersearch-show-more" onclick={search.fetchMoreData}>
								{loadMoreLabel}
							</button>
						{/if}
					{/if}
				{/if}
			</nav>
		</div>
	</div>
</dialog>

<style>
	dialog {
		padding: 0;
	}

	.supersearch-combobox {
		display: flex;
	}

	.supersearch-suggestions {
		overflow: hidden;
	}
</style>
