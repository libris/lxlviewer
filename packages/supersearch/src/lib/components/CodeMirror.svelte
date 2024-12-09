<script lang="ts" module>
	export type ChangeCodeMirrorEvent = {
		value: string;
		cursor: number;
	};
</script>

<script lang="ts">
	import { DEV } from 'esm-env';
	import { onMount, tick } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { EditorView } from '@codemirror/view';
	import { EditorState, StateEffect, type Extension, type SelectionRange } from '@codemirror/state';
	import isViewUpdateFromUserInput from '$lib/utils/isViewUpdateFromUserInput.js';

	type CodeMirrorProps = {
		value?: string;
		extensions?: Extension[];
		onclick?: (event: MouseEvent) => void;
		onchange?: (event: ChangeCodeMirrorEvent) => void;
		editorView?: EditorView | undefined;
		syncedEditorView?: EditorView | undefined;
	};

	let {
		value = '', // value isn't bindable as it can easily cause undo/redo history issues when changing the value from outside – it's preferable to dispatch changes instead
		extensions = [],
		onclick = () => {},
		onchange = () => {},
		editorView = $bindable(),
		syncedEditorView
	}: CodeMirrorProps = $props();

	const updateHandler = EditorView.updateListener.of((update) => {
		if (isViewUpdateFromUserInput(update)) {
			syncedEditorView?.dispatch({
				changes: update.changes,
				selection: update.state.selection,
				scrollIntoView: update.transactions?.[0].scrollIntoView
			});
			if (update.docChanged) {
				value = update.state.doc.toString();
				onchange({
					value,
					cursor: update.state.selection.main.anchor
				});
			}
		}
	});

	const domEventHandler = EditorView.domEventHandlers({
		click: (event: MouseEvent) => onclick(event)
	});

	let codemirrorContainerElement: HTMLDivElement | undefined = $state();
	let extensionsWithBaseHandlers: Extension[] = $derived([
		updateHandler,
		domEventHandler,
		...extensions
	]);
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

	afterNavigate(() => {
		tick().then(() => {
			editorView?.dispatch({
				changes: {
					from: 0,
					to: editorView.state.doc.length,
					insert: value
				}
			});
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
