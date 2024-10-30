<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView } from '@codemirror/view';
	import { EditorState, StateEffect, type Extension, type SelectionRange } from '@codemirror/state';
	import type { ChangeCodeMirrorEvent } from '$lib/types/CodeMirror.js'; // TODO: type should be preferably be defined and exported from <script module> inside component file when https://github.com/sveltejs/svelte/issues/13886 is resolved

	type CodeMirrorProps = {
		value?: string;
		extensions?: Extension[];
		onchange?: (event: ChangeCodeMirrorEvent) => void;
	};

	let {
		value = '', // value isn't bindable as it can easily cause undo/redo history issues when changing the value from outside – it's preferable to dispatch changes instead
		extensions = [],
		onchange = () => {}
	}: CodeMirrorProps = $props();

	const updateHandler = EditorView.updateListener.of((update) => {
		if (update.docChanged) {
			value = update.state.doc.toString();
			onchange({
				value,
				cursor: update.state.selection.main.anchor
			});
		}
	});

	let editorView: EditorView | undefined = $state();
	let codemirrorContainerElement: HTMLDivElement | undefined = $state();
	let extensionsWithDefaults: Extension[] = $derived([updateHandler, ...extensions]);
	let prevExtensions: Extension[] = extensions;

	function createEditorState({ doc, selection }: { doc?: string; selection?: SelectionRange }) {
		return EditorState.create({
			doc,
			selection,
			extensions: extensionsWithDefaults
		});
	}

	export function reset({ doc, selection }: { doc: string; selection?: SelectionRange }) {
		editorView?.setState(createEditorState({ doc, selection }));
		value = doc;
		onchange({
			value,
			cursor: selection?.anchor || 0
		});
	}

	/**
	 * Reconfigures all extensions in the main configuration. Note that this should be done
	 * sparingly – extension compartments are preferable for partial dynamic reconfigurations
	 * See: https://codemirror.net/docs/ref/#state.Compartment
	 */
	function reconfigureAllExtensions() {
		console.warn('All CodeMirror extensions were reconfigured');
		editorView?.dispatch({
			effects: StateEffect.reconfigure.of(extensionsWithDefaults)
		});
	}

	onMount(() => {
		editorView = new EditorView({
			state: createEditorState({ doc: value }),
			parent: codemirrorContainerElement
		});
	});

	$effect(() => {
		if (extensions !== prevExtensions) {
			reconfigureAllExtensions();
			prevExtensions = extensions;
		}
	});
</script>

<div class="codemirror-container" bind:this={codemirrorContainerElement}></div>

<style>
	.codemirror-container {
		display: contents;
	}
</style>
