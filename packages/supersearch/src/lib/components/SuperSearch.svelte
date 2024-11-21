<script lang="ts">
	import CodeMirror, { type ChangeCodeMirrorEvent } from '$lib/components/CodeMirror.svelte';
	import { EditorView, placeholder as placeholderExtension } from '@codemirror/view';
	import { Compartment } from '@codemirror/state';
	import { type LanguageSupport } from '@codemirror/language';
	import submitFormOnEnterKey from '$lib/extensions/submitFormOnEnterKey.js';
	import preventNewLine from '$lib/extensions/preventNewLine.js';
	import useSearchRequest, {
		type SearchParamKeyMappings
	} from '$lib/utils/useSearchRequest.svelte.js';

	interface Props {
		name: string;
		value?: string;
		form?: string;
		language?: LanguageSupport;
		placeholder?: string;
		endpoint: string;
		searchParamKeyMappings?: SearchParamKeyMappings;
	}

	let {
		name,
		value = $bindable(''),
		form,
		language,
		placeholder = '',
		endpoint,
		searchParamKeyMappings
	}: Props = $props();

	let collapsedEditorView: EditorView | undefined = $state();
	let expandedEditorView: EditorView | undefined = $state();
	let dialog: HTMLDialogElement | undefined = $state();

	let placeholderCompartment = new Compartment();
	let prevPlaceholder = placeholder;

	let search = useSearchRequest({ endpoint, searchParamKeyMappings });

	$effect(() => {
		if (value) search.debouncedFetchData({ query: value });
	});

	const extensions = [
		submitFormOnEnterKey(form),
		preventNewLine({ replaceWithSpace: true }),
		...(language ? [language] : []),
		placeholderCompartment.of(placeholderExtension(placeholder))
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
		<ul>
			{#each search.data as item (item.id)}
				<li>{item.heading}</li>
			{/each}
		</ul>
	</nav>
	<button type="button" onclick={search.fetchMoreData}>Load more</button>
</dialog>
