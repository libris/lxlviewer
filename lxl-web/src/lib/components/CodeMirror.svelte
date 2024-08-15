<script lang="ts">
	import { onMount } from 'svelte';
	import { minimalSetup } from 'codemirror';
	import { EditorView, placeholder as placeholderExtension } from '@codemirror/view';
	import { EditorSelection, EditorState, StateEffect, type Extension } from '@codemirror/state';

	/**
	 * TODO:
	 * - Add maxlength prop
	 * - Add multiline prop
	 */

	type CodeMirrorProps = {
		value: string;
		placeholder: string;
		extensions?: Extension[];
		readonly?: boolean;
		onchange?: (value: string) => void;
		onclick?: (event: MouseEvent) => void;
	};

	type Selection = {
		anchor: number;
		head: number;
	};

	let {
		value = $bindable(''),
		placeholder,
		extensions = [],
		readonly = false,
		onchange = () => {},
		onclick = () => {}
	}: CodeMirrorProps = $props();

	let codemirrorContainerElement: HTMLDivElement | undefined = $state();
	let prevValue: string = $state(value);
	let prevExtensions: Extension[] = extensions;
	let prevReadOnly = $state(readonly);

	const updateHandler = EditorView.updateListener.of(function (e) {
		if (e.docChanged) {
			value = e.state.doc.toString();
			prevValue = value;
			onchange(value);
		}
	});

	let editorExtensions: Extension[] = $derived([
		// preventNewLine,
		minimalSetup,
		updateHandler,
		EditorView.lineWrapping,
		EditorState.readOnly.of(readonly),
		placeholderExtension(placeholder),
		EditorView.domEventHandlers({
			click: (event: MouseEvent) => onclick(event)
		}),
		...extensions
	]);

	let editor: EditorView | undefined = $state();

	function createEditorState(value: string) {
		return EditorState.create({
			doc: value,
			extensions: editorExtensions
		});
	}

	function reconfigureEditorExtensions() {
		editor?.dispatch({
			effects: StateEffect.reconfigure.of(editorExtensions)
		});
	}

	export function getMainSelection(): Selection | null {
		const mainSelection = editor?.state.selection.main;

		if (mainSelection) {
			return { anchor: mainSelection.anchor, head: mainSelection.head };
		}
		return null;
	}

	export function select(newSelection: Selection) {
		editor?.dispatch({
			selection: EditorSelection.create(
				[EditorSelection.range(newSelection.anchor, newSelection.head)],
				0
			)
		});
	}

	export function focus() {
		editor?.focus();
	}

	onMount(() => {
		editor = new EditorView({
			state: createEditorState(value),
			parent: codemirrorContainerElement
		});
	});

	$effect(() => {
		/**
		 * Replace the entire editor state if value is changed from outside (using props).
		 * We should use transactions where possible but then we need to know where to insert the changes (e.g. changes: { from: 0, to: XX, insert: 'hej'}`)
		 */
		if (value !== prevValue) {
			editor?.setState(createEditorState(value));
			prevValue = value;
		}
	});

	$effect(() => {
		if (readonly !== prevReadOnly) {
			reconfigureEditorExtensions();
			prevReadOnly = readonly;
		}
	});

	$effect(() => {
		if (extensions !== prevExtensions) {
			reconfigureEditorExtensions();
			prevExtensions = extensions;
		}
	});
</script>

<div class="codemirror-container" bind:this={codemirrorContainerElement}></div>

<style>
	.codemirror-container {
		display: contents;
	}

	.codemirror-container :global(.cm-scroller) {
		font-size: var(--font-size-sm);
		font-family: var(--font-body);
	}

	.codemirror-container :global(.cm-content) {
		padding: 0.875rem 0;
	}

	.codemirror-container :global(.cm-line) {
		padding: 0 1px; /* using 0 on horizontal axis causes codemirror cursor to occasionally disappear on firefox */
	}

	.codemirror-container :global(.cm-editor.cm-focused) {
		outline: none;
	}
</style>
