<script lang="ts">
	import { onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import CodeMirror, { type ChangeCodeMirrorEvent } from '$lib/components/CodeMirror.svelte';
	import { EditorView, placeholder as placeholderExtension } from '@codemirror/view';
	import { Compartment, type SelectionRange } from '@codemirror/state';
	import { type LanguageSupport } from '@codemirror/language';
	import submitFormOnEnterKey from '$lib/extensions/submitFormOnEnterKey.js';
	import preventNewLine from '$lib/extensions/preventNewLine.js';

	interface Props {
		name: string;
		value?: string;
		form?: string;
		language?: LanguageSupport;
		placeholder?: string;
	}

	let { name, value = $bindable(''), form, language, placeholder = '' }: Props = $props();

	let collapsedEditorView: EditorView | undefined = $state();
	let expandedEditorView: EditorView | undefined = $state();
	let dialog: HTMLDialogElement | undefined = $state();

	let placeholderCompartment = new Compartment();
	let prevPlaceholder = placeholder;
	let wordSelectionAtClickStart: SelectionRange | null | undefined;
	let doubleClickTimer: ReturnType<typeof setTimeout>;
	let tripleClickTimer: ReturnType<typeof setTimeout>;

	const extensions = [
		submitFormOnEnterKey(form),
		preventNewLine({ replaceWithSpace: true }),
		...(language ? [language] : []),
		placeholderCompartment.of(placeholderExtension(placeholder))
	];

	function handleClickCollapsed(event: MouseEvent) {
		if (!dialog?.open) {
			showExpandedSearch();
			if (event.detail === 1) {
				wordSelectionAtClickStart = collapsedEditorView?.state.wordAt(
					collapsedEditorView?.state.selection.main.from
				);
				doubleClickTimer = setTimeout(
					() => window.removeEventListener('dblclick', handleDoubleClickCollapsed),
					200
				);
				tripleClickTimer = setTimeout(
					() => window.removeEventListener('click', handleTripleClickCollapsed), // we need to use the click event as there is no native event for triple-clicks
					400
				);
				window.addEventListener('dblclick', handleDoubleClickCollapsed);
				window.addEventListener('click', handleTripleClickCollapsed);
			}
		}
	}

	function handleDoubleClickCollapsed() {
		clearTimeout(doubleClickTimer);
		window.removeEventListener('dblclick', handleDoubleClickCollapsed);
		if (wordSelectionAtClickStart) {
			expandedEditorView?.dispatch({
				selection: wordSelectionAtClickStart
			});
		}
		expandedEditorView?.focus();
	}

	function handleTripleClickCollapsed(event: MouseEvent) {
		if (event.detail === 3) {
			clearTimeout(tripleClickTimer);
			window.removeEventListener('click', handleTripleClickCollapsed);
			if (wordSelectionAtClickStart) {
				const lineAt = expandedEditorView?.state.doc.lineAt(wordSelectionAtClickStart.head);
				expandedEditorView?.dispatch({
					selection: lineAt
						? { anchor: lineAt.from, head: lineAt.to }
						: {
								anchor: expandedEditorView.state.doc.length
							}
				});
				expandedEditorView?.focus();
			}
		}
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

	onDestroy(() => {
		clearTimeout(doubleClickTimer);
		clearTimeout(tripleClickTimer);
		if (browser) {
			window.removeEventListener('dblclick', handleDoubleClickCollapsed);
			window.removeEventListener('click', handleTripleClickCollapsed);
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
</dialog>
