<script lang="ts">
	import CodeMirror, { type ChangeCodeMirrorEvent } from '$lib/components/CodeMirror.svelte';
	import { placeholder } from '@codemirror/view';

	let value = $state('');

	function handleChangeCodeMirror(event: ChangeCodeMirrorEvent) {
		value = event.value;
	}
</script>

<CodeMirror {value} extensions={[placeholder('Search')]} onchange={handleChangeCodeMirror} />
