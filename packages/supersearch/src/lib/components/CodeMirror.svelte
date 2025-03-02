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
	import { EditorSelection, EditorState, StateEffect, type Extension } from '@codemirror/state';
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

	function createEditorState({ doc, selection }: { doc?: string; selection?: EditorSelection }) {
		return EditorState.create({
			doc,
			selection,
			extensions: extensionsWithBaseHandlers
		});
	}

	export function reset(options?: { doc: string; selection?: { anchor: number; head?: number } }) {
		editorView?.setState(
			createEditorState({
				doc: options?.doc,
				selection: EditorSelection.create([
					value && options?.selection
						? EditorSelection.range(
								options.selection.anchor,
								options.selection?.head || options.selection.anchor
							)
						: EditorSelection.range(0, 0)
				])
			})
		);
		value = options?.doc || '';
		onchange({
			value,
			cursor: options?.selection?.anchor || 0
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
		if (value !== editorView?.state.doc.toString()) {
			console.log('reset because', value, editorView?.state.doc.toString());
			// Reset editor when value changes from outside (= user navigating)
			reset({ doc: value });
		}
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
