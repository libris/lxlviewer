<script lang="ts">
	import type { EsExplain } from '$lib/types/search';
	export let explain: EsExplain;
	export let open = true;
</script>

<details {open} class="text-xs">
	<summary>
		{explain.value} <span class="text-secondary">{explain.description}</span>
	</summary>
	{#each explain.details as child}
		<div class="pl-3">
			<svelte:self explain={child} />
		</div>
	{/each}
</details>

<style lang="postcss">
	summary::after {
		content: ' ...';
	}

	details[open] > summary::after {
		content: '';
	}
</style>
