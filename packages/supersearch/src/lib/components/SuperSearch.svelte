<script lang="ts">
	import CodeMirror, { type ChangeCodeMirrorEvent } from '$lib/components/CodeMirror.svelte';
	import { placeholder } from '@codemirror/view';
	import { type LRLanguage } from '@codemirror/language';

	let value = $state('');
	let { language }: { language?: LRLanguage } = $props();

	const extensions = [placeholder('Search')];
	if (language) {
		extensions.push(language);
	}

	function handleChangeCodeMirror(event: ChangeCodeMirrorEvent) {
		value = event.value;
	}
</script>

<CodeMirror {value} {extensions} onchange={handleChangeCodeMirror} />
