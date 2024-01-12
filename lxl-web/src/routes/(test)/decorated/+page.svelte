<script lang="ts">
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import exampleDecorated from '$lib/assets/json/exampleDecorated.json';
	import TestValue from './TestValue.svelte';
</script>

<DecoratedData data={exampleDecorated} customValueComponent={TestValue} />
