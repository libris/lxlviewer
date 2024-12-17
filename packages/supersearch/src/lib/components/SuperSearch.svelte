<script lang="ts">
	import { onMount, onDestroy, type Snippet } from 'svelte';
	import { browser } from '$app/environment';
	import CodeMirror, { type ChangeCodeMirrorEvent } from '$lib/components/CodeMirror.svelte';
	import { EditorView, placeholder as placeholderExtension, keymap } from '@codemirror/view';
	import { Compartment, type Extension } from '@codemirror/state';
	import { type LanguageSupport } from '@codemirror/language';
	import submitFormOnEnterKey from '$lib/extensions/submitFormOnEnterKey.js';
	import preventNewLine from '$lib/extensions/preventNewLine.js';
	import useSearchRequest from '$lib/utils/useSearchRequest.svelte.js';
	import type {
		QueryFunction,
		PaginationQueryFunction,
		TransformFunction,
		ResultItem
	} from '$lib/types/superSearch.js';
	import { standardKeymap } from '@codemirror/commands';

	interface Props {
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
		resultItem?: Snippet<[ResultItem, number?, number?]>;
		toggleWithKeyboardShortcut?: boolean;
		id?: string;
	}

	let {
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
		resultItem = fallbackResultItem,
		toggleWithKeyboardShortcut = false,
		id = 'supersearch'
	}: Props = $props();

	let collapsedEditorView: EditorView | undefined = $state();
	let expandedEditorView: EditorView | undefined = $state();
	let dialog: HTMLDialogElement | undefined = $state();
	let activeRowIndex: number = $state(0);
	let activeColIndex: number = $state(0);

	let placeholderCompartment = new Compartment();
	let prevPlaceholder = placeholder;

	let search = useSearchRequest({
		endpoint,
		queryFn,
		paginationQueryFn,
		transformFn
	});

	$effect(() => {
		if (value) {
			search.debouncedFetchData(value);
		}
	});

	const extensionsWithDefaults = [
		keymap.of(standardKeymap), // Needed for atomic ranges to work. Maybe we can use a subset?
		submitFormOnEnterKey(form),
		preventNewLine({ replaceWithSpace: true }),
		...(language ? [language] : []),
		placeholderCompartment.of(placeholderExtension(placeholder)),
		...extensions
	];

	function handleClickCollapsed() {
		if (!dialog?.open) showExpandedSearch();
	}

	function handleChangeCodeMirror(event: ChangeCodeMirrorEvent) {
		if (!dialog?.open) {
			showExpandedSearch();
		}
		value = event.value;
		activeRowIndex = -1;
		activeColIndex = 0;

		console.log('actievCollaa', activeColIndex);
	}

	function showExpandedSearch() {
		expandedEditorView?.dispatch({
			selection: collapsedEditorView?.state.selection.main
		});
		dialog?.showModal();
		expandedEditorView?.focus();
	}

	function hideExpandedSearch() {
		collapsedEditorView?.dispatch({
			selection: expandedEditorView?.state.selection.main
		});
		dialog?.close();
		collapsedEditorView?.focus();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			hideExpandedSearch();
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

			console.log('rows.length', rows.length);

			if (event.key === 'ArrowUp' && activeRowIndex > 0) {
				activeRowIndex = activeRowIndex - 1;
				const colsInActiveRow = rows[activeRowIndex].querySelectorAll(':scope button, :scope a');
				activeColIndex = Math.min(activeColIndex, colsInActiveRow.length - 1);
			}
			if (event.key === 'ArrowDown' && activeRowIndex < rows.length - 1) {
				activeRowIndex = activeRowIndex + 1;
				const colsInActiveRow = rows[activeRowIndex].querySelectorAll(':scope button, :scope a');
				activeColIndex = Math.min(activeColIndex, colsInActiveRow.length - 1);
			}

			if (event.key === 'ArrowLeft' && activeColIndex > 0) {
				activeColIndex--;
			}

			if (event.key === 'ArrowRight') {
				const colsInActiveRow = rows[activeRowIndex].querySelectorAll(':scope button, :scope a');
				if (activeColIndex < colsInActiveRow.length - 1) {
					activeColIndex++;
				}
			}

			const activedescendant = `result-item-${activeRowIndex}x${activeColIndex}`;
			console.log('activedescendant', activedescendant);

			/*
			  // ensure the input is in view
					if (!this.isElementInView(this.input)) {
						this.input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
					}
				};
			*/
			if (event.key === 'Tab') {
				event.preventDefault();
				// const activeCol = dialog!.querySelector('.focused-cell');
				const colsInActiveRow = rows[activeRowIndex].querySelectorAll(':scope button, :scope a');

				if (event.shiftKey) {
					if (activeColIndex == 0) {
						activeRowIndex--;
						const colsInActiveRow =
							rows[activeRowIndex].querySelectorAll(':scope button, :scope a');
						activeColIndex = colsInActiveRow.length - 1;
					} else {
						activeColIndex--;
					}
				} else {
					if (activeColIndex < colsInActiveRow.length - 1) {
						activeColIndex++;
					} else {
						activeRowIndex++;
						activeColIndex = 0;
					}
				}
			}
		}

		if (event.key === 'Enter') {
			console.log('ENTER!');
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
		if (toggleWithKeyboardShortcut && browser) {
			document.addEventListener('keydown', handleKeyboardShortcut);
		}
		dialog?.addEventListener('click', handleClickOutsideDialog);
	});

	onDestroy(() => {
		if (browser) {
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
	// aria-haspopup="grid" aria-expanded="false" aria-autocomplete="list" aria-controls="ex1-grid"
</script>

{#snippet fallbackResultItem(item: ResultItem)}
	{JSON.stringify(item)}
{/snippet}

<CodeMirror
	{value}
	extensions={extensionsWithDefaults}
	onclick={handleClickCollapsed}
	onchange={handleChangeCodeMirror}
	bind:editorView={collapsedEditorView}
	syncedEditorView={expandedEditorView}
/>
<textarea {value} {name} {form} hidden readonly></textarea>
<dialog bind:this={dialog} onclose={hideExpandedSearch}>
	<div role="presentation" onkeydown={handleKeyDown}>
		<CodeMirror
			{value}
			extensions={extensionsWithDefaults}
			onchange={handleChangeCodeMirror}
			bind:editorView={expandedEditorView}
			syncedEditorView={collapsedEditorView}
			contentAttributes={{
				id: `${id}-content`,
				role: 'combobox',
				'aria-haspopup': 'grid',
				'aria-expanded': 'true',
				'aria-autocomplete': 'list',
				'aria-controls': `${id}-grid`,
				...(activeRowIndex >= 0 && {
					'aria-activedescendant': `${id}-resultitem-${activeRowIndex}x${activeColIndex}`
				})
			}}
		/>
		<nav>
			{#if search.data}
				{@const resultItems =
					(Array.isArray(search.paginatedData) &&
						search.paginatedData.map((page) => page.items).flat()) ||
					search.data?.items}
				<div id={`${id}-grid`} role="grid">
					{#each resultItems as item, index}
						<div role="row" class:focused={activeRowIndex === index}>
							{@render resultItem?.(item, index, activeRowIndex === index ? activeColIndex : -1)}
						</div>
					{/each}
				</div>
			{/if}
			{#if search.isLoading}
				Loading...
			{:else if search.hasMorePaginatedData}
				<li>
					<button type="button" class="supersearch-show-more" onclick={search.fetchMoreData}>
						Load more
						{activeRowIndex}x{activeColIndex}
					</button>
				</li>
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
