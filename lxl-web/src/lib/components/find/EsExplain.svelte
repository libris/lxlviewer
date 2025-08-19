<script lang="ts">
	import EsExplain from './EsExplain.svelte';
	import type { EsExplain as EsExplainType } from '$lib/types/search';
	interface Props {
		explain: EsExplainType;
		open?: boolean;
	}

	let { explain, open = true }: Props = $props();
</script>

<details {open} class="text-xs">
	<summary>
		{explain.value} <span>{explain.description}</span>
	</summary>
	{#each explain.details as child, index (index)}
		<div class="pl-3">
			<EsExplain explain={child} />
		</div>
	{/each}
</details>

<style>
	summary::after {
		content: ' ...';
	}

	details[open] > summary::after {
		content: '';
	}
</style>
