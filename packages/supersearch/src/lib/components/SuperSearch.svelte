<script lang="ts">
	import CodeMirror, { type ChangeCodeMirrorEvent } from '$lib/components/CodeMirror.svelte';
	import { EditorView, placeholder as placeholderExtension } from '@codemirror/view';
	import { Compartment } from '@codemirror/state';
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

	let editorView: EditorView | undefined = $state();

	let prevValue = value;
	let prevPlaceholder = placeholder;

	let placeholderCompartment = new Compartment();

	const extensions = [
		submitFormOnEnterKey(form),
		preventNewLine({ replaceWithSpace: true }),
		...(language ? [language] : []),
		placeholderCompartment.of(placeholderExtension(placeholder))
	];

	function handleChangeCodeMirror(event: ChangeCodeMirrorEvent) {
		prevValue = value = event.value;
	}

	$effect(() => {
		/**
		 * Prefer changing the value using dispatched changes (if it should be changed from the outside) to prevent
		 * history issues. The following effect is however kept as a fallback:
		 * */
		if (value !== prevValue) {
			editorView?.dispatch({
				changes: {
					from: 0,
					to: editorView.state.doc.length,
					insert: value
				}
			});
			prevValue = value;
		}
	});

	$effect(() => {
		if (placeholder !== prevPlaceholder) {
			editorView?.dispatch({
				effects: placeholderCompartment.reconfigure(placeholderExtension(placeholder))
			});
			prevPlaceholder = placeholder;
		}
	});
</script>

<CodeMirror {value} {extensions} onchange={handleChangeCodeMirror} bind:editorView />
<textarea {value} {name} {form} hidden readonly></textarea>
