<script module lang="ts">
	export type Selection = {
		anchor: number;
		head: number;
	};

	export type EditedRange = {
		from: number;
		to: number;
	};

	export type ChangeCodeMirrorEvent = {
		value: string;
		cursor: number;
	};
</script>

<script lang="ts">
	import { onMount, type SvelteComponent } from 'svelte';
	import { defaultKeymap, historyKeymap, history } from '@codemirror/commands';
	import {
		drawSelection,
		keymap,
		EditorView,
		placeholder as placeholderExtension
	} from '@codemirror/view';
	import {
		EditorSelection,
		EditorState,
		StateEffect,
		Transaction,
		Annotation,
		type Text,
		type Extension
	} from '@codemirror/state';
	import { lxlQueryLanguage } from 'codemirror-lang-lxlquery';
	import { tags } from '@lezer/highlight';
	import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
	import {
		qualifierNameDecoration,
		qualifierValueDecoration
	} from '$lib/utils/codemirror/extensions/qualifierDecoration';
	import qualifierLinter from '$lib/utils/codemirror/extensions/qualifierLinter';
	import getEditedRange from '$lib/utils/codemirror/getEditedRange';
	import getMainSelectionUtil from '$lib/utils/codemirror/getMainSelection';
	import qualifierWidgets from '$lib/utils/codemirror/extensions/qualifierWidgets';
	import type { Qualifiers } from '$lib/types/qualifier';

	/**
	 * TODO:
	 * - Add maxlength prop (query strings has a limit of 2048 characters)
	 */

	type CodeMirrorProps = {
		value?: string;
		placeholder: string;
		validQualifiers: Qualifiers;
		extensions?: Extension[];
		readonly?: boolean;
		tabindex?: string | number;
		syncedCodeMirrorComponent?: SvelteComponent;
		follows?: boolean;
		leads?: boolean;
		onchange?: (event: ChangeCodeMirrorEvent) => void;
		onclick?: (event: MouseEvent) => void;
	};

	let {
		value = $bindable(''),
		placeholder,
		extensions = [],
		validQualifiers,
		readonly = false,
		tabindex,
		syncedCodeMirrorComponent,
		leads,
		follows = false,
		onchange = () => {},
		onclick = () => {}
	}: CodeMirrorProps = $props();

	let editor: EditorView | undefined = $state();
	let codemirrorContainerElement: HTMLDivElement | undefined = $state();
	// let prevValue: string = $state(value);
	let prevExtensions: Extension[] = extensions;
	let prevReadOnly = $state(readonly);

	const initialValue = value;

	const lxlQueryHighlightStyle = HighlightStyle.define([
		{ tag: tags.string, color: '#0e8043' },
		{ tag: tags.paren, color: '#999' },
		{ tag: tags.compareOperator, color: '#620e80' },
		{ tag: tags.operator, color: '#620e80' }
	]);

	const updateHandler = EditorView.updateListener.of(function (e) {
		if (e.docChanged) {
			// value = e.state.doc.toString();
			// prevValue = value;
			onchange({
				value: e.state.doc.toString(),
				cursor: e.state.selection.main.head
			});
		}
	});

	let editorExtensions: Extension[] = $derived([
		// preventNewLine,
		...(follows ? [] : [history()]), // make sure there's only one undo history if external editor state is used
		drawSelection(),
		keymap.of([
			...defaultKeymap,
			...(follows
				? [
						// { key: 'Mod-z', run: () => undo(externalEditorState) }, // bind history-related keys to perform undo/redo in the external editor state
						// { key: 'Mod-y', mac: 'Mod-Shift-z', run: () => redo(externalEditorState) }
					]
				: historyKeymap)
		]),
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
		syntaxHighlighting(lxlQueryHighlightStyle),
		qualifierNameDecoration,
		qualifierValueDecoration,
		qualifierLinter(validQualifiers),
		qualifierWidgets,
		...extensions
	]);

	function createEditorState(doc: string | Text) {
		return EditorState.create({
			doc,
			extensions: editorExtensions
		});
	}

	let syncAnnotation = Annotation.define<boolean>();

	function syncDispatch(tr: Transaction) {
		editor!.update([tr]);
		if (!tr.changes.empty && !tr.annotation(syncAnnotation)) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let annotations: Annotation<any>[] = [syncAnnotation.of(true)];
			let userEvent = tr.annotation(Transaction.userEvent);
			if (userEvent) annotations.push(Transaction.userEvent.of(userEvent));
			if (follows) {
				// is follows needed?
				syncedCodeMirrorComponent?.getEditorView().dispatch({ changes: tr.changes, annotations });
			}
		}
	}

	export function updateValidatedQualifiers() {
		console.log('updateValidatedQualifiers reconfigure now');
		// See https://codemirror.net/examples/config/#dynamic-configuration
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
			const editedRange = getEditedRange(editor.state);
			editor.dispatch({
				changes: {
					from: editedRange.from,
					to: editedRange.to,
					insert: replacement
				},
				selection: { anchor: editedRange.from + replacement.length },
				scrollIntoView: true
			});
		}
	}

	export function focus() {
		editor?.focus();
	}

	export function getEditorView() {
		return editor;
	}

	onMount(() => {
		editor = new EditorView({
			state: createEditorState(initialValue),
			parent: codemirrorContainerElement,
			...((leads || follows) && { dispatch: (tr) => syncDispatch(tr) })
		});
	});

	/**	
	 * Replace the entire editor state if value is changed from outside (using props).
	 * We should use transactions where possible but then we need to know where to insert the changes (e.g. changes: { from: 0, to: XX, insert: 'hej'}`)
	$effect(() => {

		if (value !== prevValue) {
			console.log('create new state as value has changed');
			editor?.setState(createEditorState(value));
			prevValue = value;
			// Should the cursor be placed one step before where the first diff between value and prev value occurs?
		}
	});
	*/

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
</style>
