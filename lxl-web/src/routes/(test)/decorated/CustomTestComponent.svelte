<script lang="ts">
	import type ResourceData from '$lib/components/DecoratedData.svelte';

	export let name: string;
	export let parentData: ResourceData;
</script>

<div {...$$restProps}>
	{#if parentData}
		<code>
			<details>
				<summary>{name}</summary>
				<pre>{JSON.stringify(parentData, null, 2)}</pre>
			</details>
		</code>
	{/if}
	<slot />
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		padding: 8px;
		margin: 8px;

		border-radius: 8px;
		background: #fff;
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.12),
			0 1px 2px rgba(0, 0, 0, 0.24);
		transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
	}

	div:hover {
		background: #eeeeff;
		box-shadow:
			0 14px 28px rgba(0, 0, 0, 0.25),
			0 10px 10px rgba(0, 0, 0, 0.22);
	}
	code {
		font-size: 8px;
	}
</style>
