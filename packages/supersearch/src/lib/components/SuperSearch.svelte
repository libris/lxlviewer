<script lang="ts">
	import { onMount, onDestroy, type Snippet } from 'svelte';
	import { BROWSER } from 'esm-env';
	import CodeMirror, {
		type ChangeCodeMirrorEvent,
		type SelectCodeMirrorEvent,
		type ViewUpdateCodeMirrorEvent,
		type Selection
	} from '$lib/components/CodeMirror.svelte';
	import { sendMessage } from '$lib/utils/sendMessage.js';
	import type { ChangeSuperSearchEvent, ViewUpdateSuperSearchEvent } from '$lib/index.js';
	import { EditorView, placeholder as placeholderExtension, keymap } from '@codemirror/view';
	import { Compartment, type EditorState, type Extension } from '@codemirror/state';
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
		ResultItem,
		ShowExpandedSearchOptions,
		DebouncedWaitFunction,
		ExpandEvent,
		UserEvent,
		CollapseEvent,
		HideExpandedSearchParams
	} from '$lib/types/superSearch.js';
	import { history as historyExtension, standardKeymap, historyKeymap } from '@codemirror/commands';

	export type ExpandedContentParams = {
		search: ReturnType<typeof useSearchRequest>;
		resultsSnippet: Snippet<[{ rowOffset: number }]>;
		resultsCount?: number;
		getCellId: (rowIndex: number, cellIndex: number) => string | undefined;
		isFocusedCell: (rowIndex: number, cellIndex: number) => boolean;
		isFocusedRow: (rowIndex: number) => boolean;
	};

	interface Props {
		id?: string;
		name: string;
		value?: string;
		form?: string;
		language?: LanguageSupport;
		placeholder?: string;
		collapsedAriaLabelledBy?: string;
		collapsedAriaLabel?: string;
		collapsedAriaDescribedBy?: string;
		expandedAriaLabelledBy?: string;
		expandedAriaLabel?: string;
		expandedAriaDescribedBy?: string;
		collapsedAriaKeyshortcuts?: string;
		expandedAriaKeyshortcuts?: string;
		autofocus?: boolean;
		endpoint: string | URL;
		queryFn?: QueryFunction;
		paginationQueryFn?: PaginationQueryFunction;
		transformFn?: TransformFunction;
		extensions?: Extension[];
		inputRow?: Snippet<
			[
				{
					expanded: boolean;
					inputField: Snippet;
					getCellId: (cellIndex: number) => string | undefined;
					isFocusedCell: (cellIndex: number) => boolean;
					isFocusedRow: () => boolean;
					onclickSubmit: (event: MouseEvent) => void;
					onclickClear: (event: MouseEvent) => void;
					onclickClose: (event: MouseEvent) => void;
				}
			]
		>;
		expandedContent?: Snippet<[ExpandedContentParams]>;
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
		loadingIndicator?: Snippet;
		defaultInputCol?: number;
		defaultResultRow?: number;
		defaultResultCol?: number;
		toggleWithKeyboardShortcut?: boolean;
		wrappingArrowKeyNavigation?: boolean;
		debouncedWait?: number;
		getDebouncedWait?: DebouncedWaitFunction;
		selection?: Selection;
		isLoading?: boolean;
		hasData?: boolean;
		loadMoreLabel?: string;
		onexpand?: (event: ExpandEvent) => void;
		oncollapse?: (event: CollapseEvent) => void;
		onchange?: (event: ChangeSuperSearchEvent) => void;
		onexpandedviewupdate?: (event: ViewUpdateSuperSearchEvent) => void;
		oninterceptexpandedclick?: (href: string, event: MouseEvent) => void;
		oninterceptexpandedsubmit?: (href: string) => void;
		externalEditorState?: EditorState;
	}

	let {
		id = 'supersearch',
		name,
		value = $bindable(''),
		form,
		language,
		placeholder = '',
		collapsedAriaLabelledBy,
		collapsedAriaLabel,
		collapsedAriaDescribedBy,
		expandedAriaLabelledBy,
		expandedAriaLabel,
		expandedAriaDescribedBy,
		collapsedAriaKeyshortcuts,
		expandedAriaKeyshortcuts,
		autofocus,
		endpoint,
		queryFn = (value) => new URLSearchParams({ q: value }),
		paginationQueryFn,
		transformFn,
		extensions = [],
		inputRow = fallbackInputRow,
		expandedContent = fallbackExpandedContent,
		resultItemRow = fallbackResultItemRow,
		loadingIndicator,
		toggleWithKeyboardShortcut = false,
		wrappingArrowKeyNavigation = false,
		defaultInputCol = -1,
		defaultResultRow = 0,
		defaultResultCol = 0,
		debouncedWait = 300,
		getDebouncedWait,
		selection = $bindable(),
		isLoading = $bindable(), // should be treated as readonly
		hasData = $bindable(), // should be treated as readonly
		loadMoreLabel = 'Load more',
		onexpand,
		oncollapse,
		onchange,
		onexpandedviewupdate,
		oninterceptexpandedclick,
		oninterceptexpandedsubmit,
		externalEditorState
	}: Props = $props();

	let collapsedEditorView: EditorView | undefined = $state();
	let expandedEditorView: EditorView | undefined = $state();
	let dialog: HTMLDialogElement | undefined = $state();
	let comboboxElement: HTMLDivElement | undefined = $state();
	let expanded = $state(false);
	let activeRowIndex: number = $state(0);
	let activeColIndex: number = $state(-1);
	let allowCollapsedUpdateHandling = $derived(
		!expanded && !!collapsedEditorView?.dom.checkVisibility()
	);

	let prevValue: string = value;

	let allowArrowKeyCursorHandling: { vertical: boolean; horizontal: boolean } = $state({
		vertical: true,
		horizontal: true
	});
	let prevArrowKeyCursorHandling = { vertical: true, horizontal: true };
	let cursorHandlingCompartment = new Compartment();

	let placeholderCompartment = new Compartment();
	let prevPlaceholder = (() => $state.snapshot(placeholder))();

	let collapsedContentAttributesCompartment = new Compartment();
	let expandedContentAttributesCompartment = new Compartment();

	let historyCompartment = new Compartment();

	let search = $derived.by(() =>
		useSearchRequest({
			endpoint,
			queryFn,
			paginationQueryFn,
			transformFn,
			debouncedWait,
			getDebouncedWait
		})
	);

	let prevSearchDataId: string | undefined;
	const newDataMessage = { effects: sendMessage.of({ message: messages.NEW_DATA }) };

	$effect(() => {
		if (search.data && search.data?.['@id'] !== prevSearchDataId) {
			expandedEditorView?.dispatch(newDataMessage);
			collapsedEditorView?.dispatch(newDataMessage);
			prevSearchDataId = search.data?.['@id'];
		}
	});

	const extensionsWithDefaults = $derived([
		historyCompartment.of(historyExtension()),
		keymap.of(standardKeymap), // Needed for atomic ranges to work. Maybe we can use a subset?
		keymap.of(historyKeymap),
		preventEnterKeyHandling(),
		cursorHandlingCompartment.of(arrowKeyCursorHandling({ vertical: true, horizontal: true })),
		preventNewLine({ replaceWithSpace: true }),
		...(language ? [language] : []),
		placeholderCompartment.of(placeholderExtension(placeholder)),
		...extensions
	]);

	let collapsedContentAttributes = $derived(
		EditorView.contentAttributes.of({
			id: `${id}-collapsed-combobox`,
			role: 'combobox',
			enterkeyhint: 'search',
			...(collapsedAriaLabelledBy && {
				'aria-labelledby': collapsedAriaLabelledBy
			}),
			...(collapsedAriaLabel && {
				'aria-label': collapsedAriaLabel
			}),
			...(collapsedAriaDescribedBy && {
				'aria-describedby': collapsedAriaDescribedBy
			}),
			'aria-haspopup': 'dialog', // indicates the availability and type of interactive popup element that can be triggered by the element
			'aria-controls': `${id}-dialog`, // identifies the popup element
			'aria-expanded': expanded.toString(), // indicates if the popup element is open
			'aria-multiline': 'false', // aria-multiline isn't allowed inside elements with role=combobox
			...(collapsedAriaKeyshortcuts && {
				'aria-keyshortcuts': collapsedAriaKeyshortcuts
			})
		})
	);

	let includeAriaActiveDescendant = $derived(
		activeRowIndex > 0 || (activeRowIndex === 0 && activeColIndex !== defaultInputCol)
	); // ensures aria-activedecendant is only shown if the element exists in the DOM
	let expandedContentAttributes = $derived(
		EditorView.contentAttributes.of({
			id: `${id}-expanded-combobox`,
			role: 'combobox', // identifies the element as a combobox
			enterkeyhint: 'search',
			...(expandedAriaLabelledBy && {
				'aria-labelledby': expandedAriaLabelledBy
			}),
			...(expandedAriaLabel && {
				'aria-label': expandedAriaLabel
			}),
			...(expandedAriaDescribedBy && {
				'aria-describedby': expandedAriaDescribedBy
			}),
			'aria-haspopup': 'grid', // indicates that the combobox can popup a grid to suggest values
			'aria-expanded': 'true', // indicates that the popup element is displayed
			'aria-autocomplete': 'list', // indicates that the autocomplete behavior of the input is to suggest a list of possible values in a popup
			'aria-controls': `${id}-grid`, // identifies the popup element that lists suggested values
			'aria-multiline': 'false',
			...(expandedAriaKeyshortcuts && {
				'aria-keyshortcuts': expandedAriaKeyshortcuts
			}),
			...(includeAriaActiveDescendant && {
				'aria-activedescendant': `${id}-item-${activeRowIndex}x${activeColIndex}` // enables assistive technologies to know which element the application regards as focused while DOM focus remains on the input element
			})
		})
	);

	const initialCollapsedContentAttributes = collapsedContentAttributes; // initial value is needed to prevent unnecessary updates when using compartments
	const initialExpandedContentAttributes = expandedContentAttributes;

	let collapsedExtensions = $derived([
		...extensionsWithDefaults,
		collapsedContentAttributesCompartment.of(initialCollapsedContentAttributes)
	]);

	let expandedExtensions = $derived([
		...extensionsWithDefaults,
		EditorView.lineWrapping,
		expandedContentAttributesCompartment.of(initialExpandedContentAttributes)
	]);

	let resultItemRows = $derived(
		(Array.isArray(search.paginatedData) &&
			search.paginatedData.map((page) => page.items).flat()) ||
			search.data?.items
	);

	function handleClickCollapsed() {
		if (!dialog?.open) showExpandedSearch();
	}

	function handleClickExpanded() {
		setDefaultRowAndCols();
		if (!expandedEditorView?.hasFocus) {
			expandedEditorView?.focus();
		}
	}

	function setDefaultRowAndCols(options?: { focusRow?: number }) {
		activeRowIndex = options?.focusRow || defaultResultRow;
		if (activeRowIndex > 0) {
			activeColIndex = defaultResultCol;
		} else {
			activeColIndex = defaultInputCol;
		}
	}

	function handleChangeCodeMirror(event: ChangeCodeMirrorEvent) {
		if (!dialog?.open && event.userEvent === 'input.type' && value.trim() !== event.value.trim()) {
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

		onchange?.(event);
	}

	function handleSelectCodeMirror(event: SelectCodeMirrorEvent) {
		selection = event;
	}

	function handleExpandedViewUpdate(event: ViewUpdateCodeMirrorEvent) {
		onexpandedviewupdate?.(event);
	}

	export function getValueLength() {
		return value.length;
	}

	export function dispatchChange({
		change,
		selection,
		userEvent = 'input'
	}: {
		change?: {
			from: number;
			to: number;
			insert: string;
		};
		selection?: {
			anchor: number;
			head: number;
		};
		userEvent?: UserEvent;
	}) {
		if (expanded) {
			expandedEditorView?.dispatch({
				changes: change,
				selection,
				userEvent
			});
		} else {
			collapsedEditorView?.dispatch({
				changes: change,
				selection,
				userEvent
			});
		}
	}

	export function showExpandedSearch(options?: ShowExpandedSearchOptions) {
		dialog?.showModal();
		expanded = true;
		onexpand?.({
			windowPageYOffset: window.pageYOffset,
			editorState: collapsedEditorView?.state
		});
		setDefaultRowAndCols({ focusRow: options?.focusRow });
		if (!options?.focusRow || options.focusRow < 1) {
			allowArrowKeyCursorHandling = { vertical: false, horizontal: true };
		} else {
			allowArrowKeyCursorHandling = { vertical: false, horizontal: false };
		}
		expandedEditorView?.focus();
	}

	export function hideExpandedSearch(params?: HideExpandedSearchParams) {
		dialog?.close();
		collapsedEditorView?.focus();
		expanded = false;
		oncollapse?.({
			trigger: params?.trigger,
			editorState: expandedEditorView?.state
		});
		allowArrowKeyCursorHandling = { vertical: true, horizontal: true };
	}

	export function fetchData() {
		if (selection) {
			search?.fetchData(value, selection.head);
		}
	}

	export function resetData() {
		search?.resetData();
	}

	export function focus() {
		collapsedEditorView?.focus();
	}

	export function blur() {
		collapsedEditorView?.contentDOM.blur();
	}

	function submitClosestForm() {
		const formElement = form
			? document.getElementById(form)
			: collapsedEditorView?.dom?.closest('form');

		if (formElement && formElement instanceof HTMLFormElement) {
			if (expanded && oninterceptexpandedsubmit) {
				const formAction = formElement.getAttribute('action');
				const formParams = new URLSearchParams(
					new FormData(formElement) as unknown as Record<string, string>
				);

				console.log('formAction', formAction, 'formParams', formParams);

				if (formAction && formParams) {
					oninterceptexpandedsubmit?.(
						`${!formAction.startsWith('/') ? '/' : ''}${formAction}?${formParams.toString()}`
					);
				} else {
					formElement.requestSubmit();
				}
			} else {
				formElement.requestSubmit();
			}
		}
	}

	function controlOrMetaKey(event: KeyboardEvent) {
		if (!event.ctrlKey && !event.metaKey) return false;
		const isMac = navigator.userAgent.includes('Mac OS X');
		if (isMac && event.metaKey) return true;
		if (!isMac && event.ctrlKey) return true;
		return false;
	}

	function handleCollapsedKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			console.log('aaaa');
			submitClosestForm();
		}
		if (event.key === 'ArrowDown' && event.altKey) {
			event.preventDefault();
			showExpandedSearch();
		}
	}

	function handleExpandedKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (expanded) {
				hideExpandedSearch({ trigger: 'key' });
			}
		}

		if (event.key === 'Enter') {
			const activeDecendant = document?.getElementById(
				`${id}-item-${activeRowIndex}x${activeColIndex}`
			);

			/* Fire click event if item cell is focused */
			if (activeDecendant) {
				activeDecendant.click();
			} else {
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
			const arrowKeyRows = Array.from(
				dialog?.querySelectorAll(':scope [role=row]:not([data-skip-row-on-arrow-key])') || []
			);

			const rows =
				event.key === 'Tab'
					? Array.from(dialog?.querySelectorAll(':scope [role=row]') || [])
					: arrowKeyRows;

			const getColsInInputRow = () => {
				return comboboxElement
					? Array.from(comboboxElement.querySelectorAll(':scope button, :scope a')).filter(
							(colItem) => {
								if (typeof colItem?.checkVisibility === 'function') {
									return colItem.checkVisibility();
								}
								return true; // always return true as a fallback if checkVisiblity isn't available
							}
						)
					: [];
			};

			const getColsInRow = (rowIndex: number) => {
				return rows?.[rowIndex]
					? Array.from(rows[rowIndex].querySelectorAll(':scope button, :scope a')).filter(
							(colItem) => {
								if (typeof colItem?.checkVisibility === 'function') {
									return colItem.checkVisibility();
								}
								return true; // always return true as a fallback if checkVisiblity isn't available
							}
						)
					: [];
			};

			const getColIndexFromId = (itemId: string) => {
				const colRegex = new RegExp(`${id}-item-\\d+x(\\d+)`);
				return Number(itemId.match(colRegex)?.[1]);
			};

			const getColIndexBefore = (rowIndex: number, colIndex: number) => {
				if (rowIndex <= rows.length) {
					const colIndeces = getColsInRow(rowIndex).map((colItem) => getColIndexFromId(colItem.id));
					return colIndeces[colIndeces.indexOf(colIndex) - 1];
				}
				return -1;
			};

			const getColIndexAfter = (rowIndex: number, colIndex: number) => {
				if (rowIndex <= rows.length) {
					const colIndeces = getColsInRow(rowIndex).map((colItem) => getColIndexFromId(colItem.id));
					return colIndeces[colIndeces.indexOf(colIndex) + 1];
				}
				return -1;
			};

			switch (event.key) {
				case 'ArrowUp':
					if (event.altKey) {
						event.preventDefault();
						hideExpandedSearch({ trigger: 'key' });
					} else {
						if (wrappingArrowKeyNavigation && activeRowIndex === 0) {
							activeRowIndex = arrowKeyRows.length;
							activeColIndex = 0;
						} else if (activeRowIndex >= 1) {
							activeRowIndex--;
							if (activeRowIndex < 1) {
								activeColIndex = defaultInputCol;
								allowArrowKeyCursorHandling = {
									vertical: false,
									horizontal: true
								};
							} else {
								const cols = getColsInRow(activeRowIndex - 1);
								activeColIndex = Math.min(activeColIndex, cols.length - 1);
								allowArrowKeyCursorHandling = {
									vertical: false,
									horizontal: cols.length <= 1
								};
							}
						}
					}
					break;
				case 'ArrowDown':
					if (wrappingArrowKeyNavigation && activeRowIndex >= arrowKeyRows.length) {
						activeRowIndex = 0;
						activeColIndex = defaultInputCol;
					} else if (activeRowIndex < arrowKeyRows.length) {
						activeRowIndex++;
						const cols = getColsInRow(activeRowIndex - 1);
						if (activeRowIndex === 1) {
							activeColIndex = 0;
						} else {
							activeColIndex = Math.min(activeColIndex, cols.length - 1);
						}
						allowArrowKeyCursorHandling = {
							vertical: false,
							horizontal: cols.length <= 1
						};
					}
					break;
				case 'ArrowLeft':
					if (wrappingArrowKeyNavigation && activeRowIndex >= 1 && activeColIndex === 0) {
						activeColIndex = Math.max(0, getColsInRow(activeRowIndex - 1).length - 1);
					} else if (activeRowIndex >= 1 && activeColIndex > 0) {
						activeColIndex = getColIndexBefore(activeRowIndex - 1, activeColIndex);
					}
					break;
				case 'ArrowRight':
					if (
						wrappingArrowKeyNavigation &&
						activeRowIndex >= 1 &&
						activeColIndex === getColsInRow(activeRowIndex - 1).length - 1
					) {
						activeColIndex = 0;
					} else if (
						activeRowIndex >= 1 &&
						activeColIndex < getColsInRow(activeRowIndex - 1).length - 1
					) {
						activeColIndex = getColIndexAfter(activeRowIndex - 1, activeColIndex);
					}

					break;
				case 'Tab':
					event.preventDefault();
					if (event.shiftKey) {
						if (activeRowIndex === 0) {
							const colIndeces = getColsInInputRow().map((item) => getColIndexFromId(item.id));
							const closestBefore = colIndeces.findLast((index) => index < activeColIndex);
							if (typeof closestBefore === 'number') {
								activeColIndex = closestBefore;
							} else if (activeColIndex === -1) {
								activeRowIndex = Math.max(0, rows.length);
								const lastRowColIndeces = getColsInRow(Math.max(0, rows.length - 1)).map((item) =>
									getColIndexFromId(item.id)
								);
								activeColIndex = lastRowColIndeces[lastRowColIndeces.length - 1] || 0;
							} else {
								activeColIndex = -1;
							}
						} else {
							const closestBefore = getColIndexBefore(activeRowIndex - 1, activeColIndex);
							if (typeof closestBefore !== 'number') {
								activeRowIndex = activeRowIndex - 1;
								if (activeRowIndex > 0) {
									activeColIndex = getColIndexFromId(getColsInRow(activeRowIndex - 1).at(-1)!.id);
								} else {
									const lastCol = getColsInInputRow().at(-1)?.id;
									activeColIndex = lastCol ? getColIndexFromId(lastCol) : 0;
								}
							}
							if (typeof closestBefore === 'number') {
								activeColIndex = getColIndexBefore(activeRowIndex - 1, activeColIndex);
							}
						}
					} else {
						const closestAfter =
							activeRowIndex >= 1
								? getColIndexAfter(Math.max(0, activeRowIndex - 1), activeColIndex)
								: undefined;

						if (typeof closestAfter !== 'number' && activeRowIndex === 0) {
							const colIndeces = getColsInInputRow().map((item) => getColIndexFromId(item.id));
							const indexAfter = colIndeces.find((index) => index > activeColIndex);
							if (typeof indexAfter === 'number') {
								activeColIndex = indexAfter;
							} else if (rows.length) {
								activeRowIndex++;
								activeColIndex = getColIndexFromId(getColsInRow(activeRowIndex - 1)[0].id) || 0;
							} else {
								activeColIndex = -1;
							}
						} else if (typeof closestAfter !== 'number' && activeRowIndex < rows.length) {
							activeRowIndex++;
							activeColIndex = getColIndexFromId(getColsInRow(activeRowIndex - 1)[0].id) || 0;
						} else if (typeof closestAfter !== 'number' && activeRowIndex === rows.length) {
							activeRowIndex = 0;
							activeColIndex = -1;
						} else if (typeof closestAfter === 'number') {
							if (activeRowIndex === 0) {
								const firstCol = getColsInInputRow()[0].id;
								if (firstCol) {
									activeColIndex = getColIndexFromId(firstCol);
								}
							} else {
								activeColIndex = closestAfter || 0;
							}
						}
					}
					if (activeRowIndex === 0) {
						allowArrowKeyCursorHandling = {
							vertical: false,
							horizontal: true
						};
					} else {
						const cols = getColsInRow(activeRowIndex);
						allowArrowKeyCursorHandling = {
							vertical: false,
							horizontal: cols.length <= 1
						};
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

	function handleClickClose() {
		hideExpandedSearch({ trigger: 'click' });
	}

	/*
	$effect(() => {
		if (!page.state.expandedSuperSearch && expanded) {
			hideExpandedSearch({ trigger: 'navigation' });
		}
	});
	*/

	function handleClickOutsideDialog(event: MouseEvent) {
		if (event.target === dialog || event.target === event.currentTarget) {
			hideExpandedSearch({ trigger: 'click' });
		}
	}

	function handleKeyboardShortcut(event: KeyboardEvent) {
		if (controlOrMetaKey(event) && event.key === 'k') {
			if (!dialog?.open) {
				event.preventDefault();
				showExpandedSearch();
			}
		}

		if (event.shiftKey && event.key === '/' && !dialog?.open) {
			event.preventDefault();
			showExpandedSearch();
		}
	}

	function handleClickSubmit() {
		// if (!value.length) {
		// 	event.preventDefault();
		// }
	}

	function interceptExpandedLinks(event: MouseEvent) {
		const target = event.target as HTMLElement;
		const anchorElement = target.tagName === 'A' ? target : target.closest('a');
		const href = anchorElement?.getAttribute('href');
		if (href) {
			event.preventDefault();
			oninterceptexpandedclick?.(href, event);
		}
	}

	function handleClickClear(event: MouseEvent) {
		event.preventDefault();
		const _view = expanded ? expandedEditorView : collapsedEditorView;
		_view?.dispatch({
			changes: { from: 0, to: value.length, insert: '' },
			userEvent: 'delete'
		});
		search.resetData();
		if (dialog?.open) {
			expandedEditorView?.focus();
		} else {
			collapsedEditorView?.focus();
		}
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
		if (collapsedContentAttributes !== initialCollapsedContentAttributes) {
			collapsedEditorView?.dispatch({
				effects: collapsedContentAttributesCompartment.reconfigure(collapsedContentAttributes)
			});
		}
	});

	$effect(() => {
		if (expandedContentAttributes !== initialExpandedContentAttributes) {
			expandedEditorView?.dispatch({
				effects: expandedContentAttributesCompartment.reconfigure(expandedContentAttributes)
			});
		}
	});

	$effect(() => {
		if (autofocus && collapsedEditorView) {
			collapsedEditorView.focus();
		}
	});

	$effect(() => {
		if (externalEditorState) {
			collapsedEditorView?.dispatch({
				changes: {
					from: 0,
					to: collapsedEditorView.state.doc.length,
					insert: externalEditorState.doc
				},
				selection: {
					anchor: externalEditorState.selection.main.anchor,
					head: externalEditorState.selection.main.head
				}
			});
			expandedEditorView?.dispatch({
				changes: {
					from: 0,
					to: expandedEditorView.state.doc.length,
					insert: externalEditorState.doc
				},
				selection: {
					anchor: externalEditorState.selection.main.anchor,
					head: externalEditorState.selection.main.head
				}
			});
		}
	});
</script>

{#snippet fallbackExpandedContent({ search }: { search: ReturnType<typeof useSearchRequest> })}
	<nav class="supersearch-suggestions" role="rowgroup">
		{@render resultsSnippet()}
		{#if search.isLoading}
			{@render loadingIndicator?.()}
		{:else if search.hasMorePaginatedData}
			<button type="button" class="supersearch-show-more" onclick={search.fetchMoreData}>
				{loadMoreLabel}
			</button>
		{/if}
	</nav>
{/snippet}

{#snippet fallbackResultItemRow({ resultItem }: { resultItem: ResultItem })}
	{JSON.stringify(resultItem)}
{/snippet}

{#snippet fallbackInputRow({ inputField }: { inputField: Snippet<[]> })}
	{@render inputField()}
{/snippet}

{#snippet resultsSnippet({ rowOffset }: { rowOffset: number } = { rowOffset: 1 })}
	{#each resultItemRows as resultItem, index (index)}
		{@const rowIndex = index + rowOffset}
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
{/snippet}

{#snippet collapsedInputSnippet()}
	<div class="contents" onclickcapture={handleClickCollapsed}>
		<CodeMirror
			{value}
			extensions={collapsedExtensions}
			onchange={handleChangeCodeMirror}
			onselect={handleSelectCodeMirror}
			allowUpdateHandling={allowCollapsedUpdateHandling}
			bind:editorView={collapsedEditorView}
		/>
	</div>
{/snippet}

{#snippet expandedInputSnippet()}
	<CodeMirror
		{value}
		extensions={expandedExtensions}
		onclick={handleClickExpanded}
		onchange={handleChangeCodeMirror}
		onselect={handleSelectCodeMirror}
		onviewupdate={handleExpandedViewUpdate}
		allowUpdateHandling={expanded}
		bind:editorView={expandedEditorView}
	/>
{/snippet}

<div
	class="collapsed supersearch-combobox"
	onkeydown={handleCollapsedKeyDown}
	{id}
	role="presentation"
>
	{@render inputRow?.({
		expanded: false,
		inputField: collapsedInputSnippet,
		getCellId: () => undefined,
		isFocusedCell: () => false,
		isFocusedRow: () => activeRowIndex === -1,
		onclickSubmit: handleClickSubmit,
		onclickClear: handleClickClear,
		onclickClose: handleClickClose
	})}
	<textarea {value} {name} {form} hidden readonly></textarea>
</div>
<dialog
	class="supersearch-dialog"
	id={`${id}-dialog`}
	bind:this={dialog}
	closedby="none"
	tabindex="-1"
	onfocus={() => console.log('aaaaa')}
>
	<div
		class="supersearch-dialog-wrapper"
		role="presentation"
		onkeydown={handleExpandedKeyDown}
		onclick={handleClickOutsideDialog}
	>
		<div class="supersearch-dialog-content">
			<div class="supersearch-combobox" bind:this={comboboxElement}>
				{@render inputRow?.({
					expanded: true,
					inputField: expandedInputSnippet,
					getCellId: (colIndex: number) => `${id}-item-0x${colIndex}`,
					isFocusedCell: (colIndex: number) => activeRowIndex === 0 && colIndex === activeColIndex,
					isFocusedRow: () => activeRowIndex === 0,
					onclickSubmit: handleClickSubmit,
					onclickClear: handleClickClear,
					onclickClose: handleClickClose
				})}
			</div>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_interactive_supports_focus -->
			<div
				id={`${id}-grid`}
				role="grid"
				onclick={oninterceptexpandedclick ? interceptExpandedLinks : undefined}
			>
				{@render expandedContent({
					search,
					resultsSnippet,
					resultsCount: resultItemRows?.length,
					getCellId: (rowIndex: number, colIndex: number) => `${id}-item-${rowIndex}x${colIndex}`,
					isFocusedCell: (rowIndex: number, colIndex: number) =>
						rowIndex === activeRowIndex && colIndex === activeColIndex,
					isFocusedRow: (rowIndex: number) => rowIndex === activeRowIndex
				})}
			</div>
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
