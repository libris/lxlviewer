<script lang="ts">
	import type { Snippet } from 'svelte';
	import CodeMirror, { type ChangeCodeMirrorEvent } from '$lib/components/CodeMirror.svelte';
	import { EditorView, placeholder as placeholderExtension } from '@codemirror/view';
	import { Compartment } from '@codemirror/state';
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
	import { qualifierPlugin } from '$lib/extensions/qualifier.js';

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
		resultItem?: Snippet<[ResultItem]>;
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
		resultItem = fallbackResultItem
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

	const extensions = [
		submitFormOnEnterKey(form),
		preventNewLine({ replaceWithSpace: true }),
		...(language ? [language] : []),
		placeholderCompartment.of(placeholderExtension(placeholder)),
		qualifierPlugin
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
	}

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
	{extensions}
	onclick={handleClickCollapsed}
	onchange={handleChangeCodeMirror}
	bind:editorView={collapsedEditorView}
	syncedEditorView={expandedEditorView}
/>
<textarea {value} {name} {form} hidden readonly></textarea>
<dialog bind:this={dialog} onclose={hideExpandedSearch} onkeydowncapture={handleKeyDown}>
	<CodeMirror
		{value}
		{extensions}
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
</dialog>

<style>
	ul {
		margin: 0;
		padding: 0;
		list-style-type: none;
	}
</style>
