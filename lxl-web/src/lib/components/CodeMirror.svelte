<script module lang="ts">
	export type Selection = {
		anchor: number;
		head?: number;
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
	import { defaultKeymap, historyKeymap, history, undo, redo } from '@codemirror/commands';
	import {
		drawSelection,
		keymap,
		EditorView,
		placeholder as placeholderExtension
	} from '@codemirror/view';
	import { EditorSelection, EditorState, StateEffect, type Extension } from '@codemirror/state';
	import { lxlQueryLanguage } from 'codemirror-lang-lxlquery';
	import { tags } from '@lezer/highlight';
	import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
	import {
		qualifierNameDecoration,
		qualifierValueDecoration
	} from '$lib/utils/codemirror/extensions/qualifierDecoration';
	import getMainSelectionUtil from '$lib/utils/codemirror/getMainSelection';
	import isViewUpdateFromUserInput from '$lib/utils/codemirror/isViewUpdateFromUserInput';

	/**
	 * TODO:
	 * - Add maxlength prop (query strings has a limit of 2048 characters)
	 */

	type CodeMirrorProps = {
		value?: string;
		placeholder: string;
		extensions?: Extension[];
		readonly?: boolean;
		tabindex?: string | number;
		syncedCodeMirrorComponent?: SvelteComponent;
		follows?: boolean;
		onchange?: (event: ChangeCodeMirrorEvent) => void;
		onclick?: (event: MouseEvent) => void;
	};

	let {
		value = $bindable(''),
		placeholder,
		extensions = [],
		readonly = false,
		tabindex,
		syncedCodeMirrorComponent,
		follows = false,
		onchange = () => {},
		onclick = () => {}
	}: CodeMirrorProps = $props();

	let editor: EditorView | undefined = $state();
	let codemirrorContainerElement: HTMLDivElement | undefined = $state();
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
		const userEvent = isViewUpdateFromUserInput(e);

		if (userEvent) {
			syncedCodeMirrorComponent?.getEditorView().dispatch({
				changes: e.changes,
				selection: e.state.selection,
				scrollIntoView: e.transactions?.[0].scrollIntoView
			});
		}

		if (e.docChanged) {
			onchange({
				value: e.state.doc.toString(),
				cursor: e.state.selection.main.anchor
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
						{ key: 'Mod-z', run: () => undo(syncedCodeMirrorComponent?.getEditorView()) }, // bind history-related keys to perform undo/redo in the external editor state
						{
							key: 'Mod-y',
							mac: 'Mod-Shift-z',
							run: () => redo(syncedCodeMirrorComponent?.getEditorView())
						}
					]
				: historyKeymap)
		]),
		updateHandler,
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
		//qualifierLinter(validQualifiers),
		//qualifierWidgets,
		...extensions
	]);

	function createEditorState({
		doc,
		selection
	}: {
		doc: string;
		selection?: Selection | undefined;
	}) {
		return EditorState.create({
			doc,
			extensions: editorExtensions,

			...(selection
				? {
						selection: EditorSelection.create([
							EditorSelection.range(
								Math.min(doc.length, selection.anchor),
								Math.min(doc.length, selection?.head || selection.anchor)
							)
						])
					}
				: {
						selection: EditorSelection.create([
							EditorSelection.range(Math.min(doc.length), Math.min(doc.length))
						])
					})
		});
	}

	export function updateValidatedQualifiers() {
		// console.log('updateValidatedQualifiers reconfigure now');
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
		try {
			editor?.dispatch({
				selection: EditorSelection.create(
					[EditorSelection.range(newSelection.anchor, newSelection?.head || newSelection.anchor)],
					0
				)
			});
		} catch (err) {
			console.warn(err);
			selectEnd();
		}
	}

	export function selectEnd() {
		editor?.dispatch({
			selection: EditorSelection.create(
				[EditorSelection.range(editor.state.doc.length, editor.state.doc.length)],
				0
			)
		});
	}

	export function dispatchChange(
		change: { from: number; to?: number; insert: string },
		options: { userEvent?: string } | undefined = {}
	) {
		if (editor) {
			const { from, to, insert } = change;
			const selection = { anchor: from + insert.length, head: from + insert.length };
			console.log('selection', selection);
			editor.dispatch({
				changes: {
					from,
					to,
					insert
				},
				selection: { anchor: from + insert.length, head: from + insert.length },
				...(options?.userEvent && { userEvent: options.userEvent })
			});
		}
	}

	export function reset({ doc, selection }: { doc: string; selection: Selection | undefined }) {
		editor?.setState(createEditorState({ doc, selection }));
	}

	export function focus() {
		editor?.focus();
	}

	export function blur() {
		editor?.contentDOM.blur();
	}

	export function getEditorView() {
		return editor;
	}

	onMount(() => {
		editor = new EditorView({
			state: createEditorState({ doc: initialValue }),
			parent: codemirrorContainerElement
		});
	});

	$effect(() => {
		if (readonly !== prevReadOnly) {
			reconfigureEditorExtensions();
			prevReadOnly = readonly;
		}
	});

	$effect(() => {
		if (extensions !== prevExtensions) {
			// console.log('reconfigureEditorExtensions!');
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
		min-height: var(--height-input-lg);
		font-size: var(--font-size-sm);
		font-family: var(--font-body);
	}

	.codemirror-container :global(.cm-content) {
		padding-top: 0.6125rem;
		padding-bottom: 0.6125rem;
	}

	.codemirror-container :global(.cm-line) {
		padding: 0 1px; /* using 0 on horizontal axis causes codemirror cursor to occasionally disappear on firefox */
		line-height: 2;
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
