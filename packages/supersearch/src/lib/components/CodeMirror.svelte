<script lang="ts" module>
	export type ChangeCodeMirrorEvent = {
		value: string;
		cursor: number;
	};
</script>

<script lang="ts">
	import { DEV } from 'esm-env';
	import { onMount } from 'svelte';
	import { EditorView } from '@codemirror/view';
	import { EditorState, StateEffect, type Extension, type SelectionRange } from '@codemirror/state';

	type CodeMirrorProps = {
		value?: string;
		extensions?: Extension[];
		onchange?: (event: ChangeCodeMirrorEvent) => void;
		editorView?: EditorView | undefined;
	};

	let {
		value = '', // value isn't bindable as it can easily cause undo/redo history issues when changing the value from outside – it's preferable to dispatch changes instead
		extensions = [],
		onchange = () => {},
		editorView = $bindable()
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

	let codemirrorContainerElement: HTMLDivElement | undefined = $state();
	let extensionsWithBaseHandlers: Extension[] = $derived([updateHandler, ...extensions]);
	let prevExtensions: Extension[] = extensions;

	function createEditorState({ doc, selection }: { doc?: string; selection?: SelectionRange }) {
		return EditorState.create({
			doc,
			selection,
			extensions: extensionsWithBaseHandlers
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

	function reconfigureAllExtensions() {
		if (DEV) {
			console.warn(
				'All CodeMirror extensions were reconfigured, consider using extension compartments for partial dynamic reconfiguration extension.'
			);
		}
		editorView?.dispatch({
			effects: StateEffect.reconfigure.of(extensionsWithBaseHandlers)
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
