<script lang="ts">
	import CodeMirror, { type ChangeCodeMirrorEvent } from '$lib/components/CodeMirror.svelte';
	import { EditorView, placeholder as placeholderExtension } from '@codemirror/view';
	import { Compartment } from '@codemirror/state';
	import { type LRLanguage } from '@codemirror/language';

	interface Props {
		language?: LRLanguage;
		placeholder?: string;
	}

	let { language, placeholder = '' }: Props = $props();

	let value = $state('');
	let editorView: EditorView | undefined = $state();

	let placeholderCompartment = new Compartment();
	let prevPlaceholder = placeholder;

	const extensions = [
		...(language ? [language] : []),
		placeholderCompartment.of(placeholderExtension(placeholder))
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

<CodeMirror {value} {extensions} onchange={handleChangeCodeMirror} bind:editorView />
