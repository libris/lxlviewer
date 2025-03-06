<script lang="ts" module>
	export type Selection = {
		from: number;
		to: number;
		anchor: number;
		head: number;
	};

	export type ChangeCodeMirrorEvent = {
		value: string;
		selection: Selection;
	};

	export type SelectCodeMirrorEvent = Selection;
</script>

<script lang="ts">
	import { DEV } from 'esm-env';
	import { onMount } from 'svelte';
	import { EditorView } from '@codemirror/view';
	import { EditorSelection, EditorState, StateEffect, type Extension } from '@codemirror/state';
	import isViewUpdateFromUserInput from '$lib/utils/isViewUpdateFromUserInput.js';
	import isViewUpdateOfUserEvent from '$lib/utils/isViewUpdateOfUserEvent.js';

	type CodeMirrorProps = {
		value?: string;
		extensions?: Extension[];
		onclick?: (event: MouseEvent) => void;
		onselect?: (event: SelectCodeMirrorEvent) => void;
		onchange?: (event: ChangeCodeMirrorEvent) => void;
		editorView?: EditorView | undefined;
		syncedEditorView?: EditorView | undefined;
	};

	let {
		value = '', // value isn't bindable as it can easily cause undo/redo history issues when changing the value from outside – it's preferable to dispatch changes instead
		extensions = [],
		onclick = () => {},
		onselect = () => {},
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
					selection: {
						from: update.state.selection.main.from,
						to: update.state.selection.main.to,
						anchor: update.state.selection.main.anchor,
						head: update.state.selection.main.head
					}
				});
			}
		}

		if (isViewUpdateOfUserEvent(update, 'select')) {
			syncedEditorView?.dispatch({
				selection: update.state.selection
			});
			onselect({
				from: update.state.selection.main.from,
				to: update.state.selection.main.to,
				anchor: update.state.selection.main.anchor,
				head: update.state.selection.main.head
			});
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

	export function reset(options?: { doc: string; selection?: { anchor: number; head: number } }) {
		const selection = EditorSelection.create([
			options?.selection
				? EditorSelection.range(options.selection.anchor, options.selection.head)
				: EditorSelection.range(0, 0)
		]);
		editorView?.setState(
			createEditorState({
				doc: options?.doc,
				selection
			})
		);
		value = options?.doc || '';
		onchange({
			value,
			selection: {
				from: selection.main.from,
				to: selection.main.to,
				anchor: selection.main.anchor,
				head: selection.main.head
			}
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
