<script lang="ts">
	import { onMount, onDestroy, type Snippet } from 'svelte';
	import { BROWSER } from 'esm-env';
	import CodeMirror, { type ChangeCodeMirrorEvent } from '$lib/components/CodeMirror.svelte';
	import { EditorView, placeholder as placeholderExtension, keymap } from '@codemirror/view';
	import { Compartment, StateEffect, type Extension } from '@codemirror/state';
	import { type LanguageSupport } from '@codemirror/language';
	import preventEnterKeyHandling from '$lib/extensions/preventEnterKeyHandling.js';
	import preventNewLine from '$lib/extensions/preventNewLine.js';
	import useSearchRequest from '$lib/utils/useSearchRequest.svelte.js';
	import { messages } from '$lib/constants/messages.js';
	import type {
		QueryFunction,
		PaginationQueryFunction,
		TransformFunction,
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
		extensions?: Extension[];
		comboboxAriaLabel?: string;
		resultItem?: Snippet<
			[ResultItem, (cellIndex: number) => string, (cellIndex: number) => boolean, number]
		>;
		defaultRow?: number;
		toggleWithKeyboardShortcut?: boolean;
		debouncedWait?: number;
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
		extensions = [],
		comboboxAriaLabel,
		resultItem = fallbackResultItem,
		toggleWithKeyboardShortcut = false,
		defaultRow = 0,
		debouncedWait = 300
	}: Props = $props();

	let collapsedEditorView: EditorView | undefined = $state();
	let expandedEditorView: EditorView | undefined = $state();
	let dialog: HTMLDialogElement | undefined = $state();
	let expanded = $state(false);
	let cursor: number = $state(0);
	let activeRowIndex: number = $state(0);
	let activeColIndex: number = $state(0);
	let prevValue: string = value;

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

	$effect(() => {
		if (value && value.trim() && value.trim() !== prevValue.trim()) {
			search.resetData();
			prevValue = value;
			search.debouncedFetchData(value, cursor);
		}
	});

	const extensionsWithDefaults = [
		keymap.of(standardKeymap), // Needed for atomic ranges to work. Maybe we can use a subset?
		preventEnterKeyHandling(),
		preventNewLine({ replaceWithSpace: true }),
		...(language ? [language] : []),
		placeholderCompartment.of(placeholderExtension(placeholder)),
		...extensions
	];

	let collapsedContentAttributes = $derived(
		EditorView.contentAttributes.of({
			role: 'combobox',
			...(comboboxAriaLabel && {
				'aria-label': comboboxAriaLabel
			}),
			'aria-haspopup': 'dialog', // indicates the availability and type of interactive popup element that can be triggered by the element
			'aria-controls': `${id}-dialog`, // identifies the popup element
			'aria-expanded': expanded.toString(), // indicates if the popup element is open
			'aria-multiline': 'false' // aria-multiline isn't allowed inside elements with role=combobox
		})
	);

	let includeAriaActiveDescendant = $derived(activeRowIndex >= 0 && !!search?.data); // ensures aria-activedecendant is only shown if the element exists in the DOM
	let expandedContentAttributes = $derived(
		EditorView.contentAttributes.of({
			id: `${id}-content`,
			role: 'combobox', // identifies the element as a combobox
			...(comboboxAriaLabel && {
				'aria-label': comboboxAriaLabel
			}),
			'aria-haspopup': 'grid', // indicates that the combobox can popup a grid to suggest values
			'aria-expanded': 'true', // indicates that the popup element is displayed
			'aria-autocomplete': 'list', // indicates that the autocomplete behavior of the input is to suggest a list of possible values in a popup
			'aria-controls': `${id}-grid`, // identifies the popup element that lists suggested values
			'aria-multiline': 'false',
			...(includeAriaActiveDescendant && {
				'aria-activedescendant': `${id}-result-item-${activeRowIndex}x${activeColIndex}` // enables assistive technologies to know which element the application regards as focused while DOM focus remains on the input element
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

	function handleChangeCodeMirror(event: ChangeCodeMirrorEvent) {
		if (!dialog?.open && value !== event.value) {
			showExpandedSearch();
		}
		value = event.value;
		cursor = event.cursor;
		activeRowIndex = defaultRow;
		activeColIndex = 0;
	}

	function showExpandedSearch() {
		expandedEditorView?.dispatch({
			selection: collapsedEditorView?.state.selection.main
		});
		dialog?.showModal();
		expandedEditorView?.focus();
		expanded = true;
	}

	function hideExpandedSearch() {
		collapsedEditorView?.dispatch({
			selection: expandedEditorView?.state.selection.main
		});
		dialog?.close();
		collapsedEditorView?.focus();
		expanded = false;
		activeRowIndex = defaultRow;
		activeColIndex = 0;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			hideExpandedSearch();
		}

		if (event.key === 'Enter') {
			/* Fire click event if result item cell is focused */
			if (activeRowIndex >= 0) {
				document?.getElementById(`${id}-result-item-${activeRowIndex}x${activeColIndex}`)?.click();
				hideExpandedSearch();
			} else {
				/* Otherwise submit closest form */
				const formElement = form
					? document.getElementById(form)
					: collapsedEditorView?.dom?.closest('form');
				if (formElement && formElement instanceof HTMLFormElement) {
					formElement.requestSubmit();
					hideExpandedSearch();
				}
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
			const rows = Array.from(
				dialog?.querySelectorAll(':scope nav:first-of-type [role=row]') || []
			);

			const getColsInActiveRow = (activeRowIndex: number) =>
				rows[activeRowIndex].querySelectorAll(':scope button, :scope a');

			if (rows.length) {
				switch (event.key) {
					case 'ArrowUp':
						if (activeRowIndex > 0) {
							activeRowIndex--;
							activeColIndex = Math.min(
								activeColIndex,
								getColsInActiveRow(activeRowIndex).length - 1
							);
						}
						break;
					case 'ArrowDown':
						if (activeRowIndex < rows.length - 1) {
							activeRowIndex++;
							activeColIndex = Math.min(
								activeColIndex,
								getColsInActiveRow(activeRowIndex).length - 1
							);
						}
						break;
					case 'ArrowLeft':
						if (activeColIndex > 0) {
							activeColIndex--;
						}
						break;
					case 'ArrowRight':
						if (activeColIndex < getColsInActiveRow(activeRowIndex).length - 1) {
							activeColIndex++;
						}
						break;
					case 'Tab':
						event.preventDefault();
						if (event.shiftKey) {
							if (activeColIndex == 0) {
								activeRowIndex = Math.max(activeRowIndex - 1, 0);
								activeColIndex = getColsInActiveRow(activeRowIndex).length - 1;
							} else {
								activeColIndex--;
							}
						} else {
							if (
								activeRowIndex >= 0 &&
								activeColIndex < getColsInActiveRow(activeRowIndex).length - 1
							) {
								activeColIndex++;
							} else if (activeRowIndex < rows.length - 1) {
								activeRowIndex++;
								activeColIndex = 0;
							}
						}
						break;
				}

				/**
				 * TODO: Ensure the input is in view
				 * const activeCellElement = document.getElementById(`${id}-result-item-${activeRowIndex}x${activeColIndex}`);
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

{#snippet fallbackResultItem(item: ResultItem)}
	{JSON.stringify(item)}
{/snippet}

<CodeMirror
	{value}
	extensions={collapsedExtensions}
	onclick={handleClickCollapsed}
	onchange={handleChangeCodeMirror}
	bind:editorView={collapsedEditorView}
	syncedEditorView={expandedEditorView}
/>
<textarea {value} {name} {form} hidden readonly></textarea>
<dialog id={`${id}-dialog`} bind:this={dialog} onclose={hideExpandedSearch}>
	<div role="presentation" onkeydown={handleKeyDown}>
		<CodeMirror
			{value}
			extensions={expandedExtensions}
			onchange={handleChangeCodeMirror}
			bind:editorView={expandedEditorView}
			syncedEditorView={collapsedEditorView}
		/>
		<nav>
			{#if search.data}
				{@const resultItems =
					(Array.isArray(search.paginatedData) &&
						search.paginatedData.map((page) => page.items).flat()) ||
					search.data?.items}
				<div id={`${id}-grid`} role="grid">
					{#each resultItems as item, rowIndex}
						<div role="row" class:focused={activeRowIndex === rowIndex}>
							{@render resultItem?.(
								item,
								(colIndex: number) => `${id}-result-item-${rowIndex}x${colIndex}`,
								(colIndex: number) => activeRowIndex === rowIndex && colIndex === activeColIndex,
								rowIndex
							)}
						</div>
					{/each}
				</div>
			{/if}
			{#if search.isLoading}
				Loading...
			{:else if search.hasMorePaginatedData}
				<button type="button" class="supersearch-show-more" onclick={search.fetchMoreData}>
					Load more
				</button>
			{/if}
		</nav>
	</div>
</dialog>

<style>
	dialog {
		padding: 0;
	}

	.focused {
		background: #ebebeb;

		& :global(.focused-cell) {
			background: lightgreen;
		}
	}
</style>
