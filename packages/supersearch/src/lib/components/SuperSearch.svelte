<script lang="ts">
	import CodeMirror, { type ChangeCodeMirrorEvent } from '$lib/components/CodeMirror.svelte';
	import { EditorView, placeholder as placeholderExtension } from '@codemirror/view';
	import { Compartment, type Extension } from '@codemirror/state';
	import { type LRLanguage } from '@codemirror/language';
	import submitFormOnEnterKey from '$lib/extensions/submitFormOnEnterKey.js';

	interface Props {
		name: string;
		value?: string;
		form?: string;
		language?: LRLanguage;
		placeholder?: string;
		extensions?: Extension[];
	}

	let {
		name,
		value = $bindable(''),
		form,
		language,
		extensions,
		placeholder = ''
	}: Props = $props();

	let editorView: EditorView | undefined = $state();

	let placeholderCompartment = new Compartment();
	let prevPlaceholder = placeholder;

	const useExtensions = [
		submitFormOnEnterKey(form),
		...(language ? [language] : []),
		placeholderCompartment.of(placeholderExtension(placeholder)),
		// compartmentalize rest of extensions?
		...(extensions ? extensions : [])
	];

	function handleChangeCodeMirror(event: ChangeCodeMirrorEvent) {
		value = event.value;
	}

	$effect(() => {
		if (placeholder !== prevPlaceholder) {
			editorView?.dispatch({
				effects: placeholderCompartment.reconfigure(placeholderExtension(placeholder))
			});
			prevPlaceholder = placeholder;
		}
	});
</script>

<CodeMirror {value} extensions={useExtensions} onchange={handleChangeCodeMirror} bind:editorView />
<textarea {value} {name} {form} hidden readonly></textarea>
