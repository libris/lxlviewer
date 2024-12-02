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
		resultItem?: Snippet<[ResultItem]>;
		toggleWithKeyboardShortcut?: boolean;
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
		toggleWithKeyboardShortcut = false
	}: Props = $props();

	let collapsedEditorView: EditorView | undefined = $state();
	let expandedEditorView: EditorView | undefined = $state();
	let dialog: HTMLDialogElement | undefined = $state();

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
		if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			const focusableElements = Array.from(
				(event.target as HTMLElement)
					.closest('dialog')
					?.querySelectorAll(`.cm-content, nav button`) || []
			);
			const activeIndex = document.activeElement
				? focusableElements?.indexOf(document.activeElement)
				: -1;
			if (activeIndex > -1) {
				event.preventDefault();
				(
					focusableElements[
						event.key === 'ArrowUp' ? activeIndex - 1 : activeIndex + 1
					] as HTMLElement
				)?.focus();
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
		/>
		<nav>
			{#if search.data}
				{@const resultItems =
					(Array.isArray(search.paginatedData) &&
						search.paginatedData.map((page) => page.items).flat()) ||
					search.data?.items}
				<ul>
					{#each resultItems as item}
						<li>
							{@render resultItem?.(item)}
						</li>
					{/each}
				</ul>
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
	ul {
		margin: 0;
		padding: 0;
		list-style-type: none;
	}

	dialog {
		padding: 0;
	}
</style>
