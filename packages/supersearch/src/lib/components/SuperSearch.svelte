<script lang="ts">
	import CodeMirror from '$lib/components/CodeMirror.svelte';
	import { placeholder } from '@codemirror/view';
	import type { ChangeCodeMirrorEvent } from '$lib/types/CodeMirror.js';

	let value = $state('');

	function handleChangeCodeMirror(event: ChangeCodeMirrorEvent) {
		value = event.value;
	}
</script>

<CodeMirror {value} extensions={[placeholder('Search')]} onchange={handleChangeCodeMirror} />
