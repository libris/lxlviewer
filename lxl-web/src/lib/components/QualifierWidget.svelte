<script lang="ts">
	import type { SearchMapping } from '$lib/utils/search';
	import { onDestroy } from 'svelte';
	type QualifierWidget = {
		type: string;
		value: string;
		searchMappings: SearchMapping[] | undefined;
	};
	let { type, value, searchMappings }: QualifierWidget = $props();

	onDestroy(() => {
		console.log('destgroy');
	});

	$inspect(searchMappings);
</script>

<span><span class="type">{type}:</span><span class="value"><a href="/">{value}</a></span></span>

<style>
	.type {
		border: 1px solid blue;
		border-right: none;
		border-radius: 4px 0 0 4px;
		background: #90ee90;
		padding: 0 2px;
	}

	.value {
		border: 1px solid blue;
		border-left: none;
		border-radius: 0 4px 4px 0;
		background: #cceecc;
		padding: 0 2px;
	}

	.value a {
		color: inherit;
	}
</style>
