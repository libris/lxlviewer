<script context="module" lang="ts">
	export type Selection = {
		anchor: number;
		head: number;
	};

	export type EditedPart = {
		value: string;
		from: number;
		to: number;
	};

	export type ChangeCodeMirrorEvent = {
		value: string;
		editedPart: EditedPart | null;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { minimalSetup } from 'codemirror';
	import { EditorView, placeholder as placeholderExtension } from '@codemirror/view';
	import { EditorSelection, EditorState, StateEffect, type Extension } from '@codemirror/state';
	import { lxlQueryLanguage } from 'codemirror-lang-lxlquery';
	import { tags } from '@lezer/highlight';
	import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
	import {
		qualifierNameDecoration,
		qualifierValueDecoration
	} from '$lib/utils/codemirror/qualifierDecoration';

	import getEditedPart from '$lib/utils/codemirror/getEditedPart';
	import getMainSelectionUtil from '$lib/utils/codemirror/getMainSelection';

	/**
	 * TODO:
	 * - Add maxlength prop (query strings has a limit of 2048 characters)
	 */

	type CodeMirrorProps = {
		value: string;
		placeholder: string;
		extensions?: Extension[];
		readonly?: boolean;
		tabindex?: string | number;
		onchange?: (event: ChangeCodeMirrorEvent) => void;
		onclick?: (event: MouseEvent) => void;
	};

	let {
		value = $bindable(''),
		placeholder,
		extensions = [],
		readonly = false,
		tabindex,
		onchange = () => {},
		onclick = () => {}
	}: CodeMirrorProps = $props();

	let codemirrorContainerElement: HTMLDivElement | undefined = $state();
	let prevValue: string = $state(value);
	let prevExtensions: Extension[] = extensions;
	let prevReadOnly = $state(readonly);

	const lxlQueryHighlightStyle = HighlightStyle.define([
		{ tag: tags.string, color: '#a11' },
		{ tag: tags.paren, color: '#999' }
	]);

	const updateHandler = EditorView.updateListener.of(function (e) {
		if (e.docChanged) {
			value = e.state.doc.toString();
			prevValue = value;
			onchange({ value, editedPart: getEditedPart(e.state) });
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
		EditorView.contentAttributes.of({
			...(tabindex?.toString() && {
				tabindex: tabindex?.toString()
			})
		}),
		lxlQueryLanguage,
		qualifierNameDecoration,
		qualifierValueDecoration,
		syntaxHighlighting(lxlQueryHighlightStyle),
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
		if (editor?.state) {
			return getMainSelectionUtil(editor.state);
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

	export function replaceEditedPart(replacement: string) {
		if (editor) {
			const editedPart = getEditedPart(editor.state);

			if (editedPart) {
				editor.dispatch({
					changes: {
						from: editedPart.from,
						to: editedPart.to,
						insert: replacement
					},
					selection: { anchor: editedPart.from + replacement.length },
					scrollIntoView: true
				});
			}
		}
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
			// Should the cursor be placed one step before where the first diff between value and prev value occurs?
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
		padding: 0.75rem 0;
	}

	.codemirror-container :global(.cm-line) {
		padding: 0 1px; /* using 0 on horizontal axis causes codemirror cursor to occasionally disappear on firefox */
		line-height: 1.75;
	}

	.codemirror-container :global(.cm-editor.cm-focused) {
		outline: none;
	}

	.codemirror-container :global(.lxlquery-qualifier-name),
	.codemirror-container :global(.lxlquery-qualifier-name *) {
		color: var(--color-link); /* ensures highlighted styles are overwritten */
		font-weight: 500;
	}

	.codemirror-container :global(.lxlquery-qualifier-value),
	.codemirror-container :global(.lxlquery-qualifier-value *) {
		color: var(--color-link); /* ensures highlighted styles are overwritten */
	}
</style>
