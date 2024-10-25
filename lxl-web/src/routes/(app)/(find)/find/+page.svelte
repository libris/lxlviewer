<script lang="ts">
	import { page } from '$app/stores';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
</script>

<div class="find-page">
	{#if $page.data.records.length}
		<ul>
			{#each $page.data.records as recordItem}
				<li>
					<header>
						<h3><DecoratedData data={recordItem.heading} /></h3>
					</header>
					<div class="body">
						<DecoratedData data={recordItem.body} showLabels={ShowLabelsOptions.Never} block />
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<p>Inga träffar</p>
	{/if}
</div>

<style>
	.find-page {
		padding: 0 var(--padding-base);
		overflow: hidden;
	}
	ul {
		margin: 0;
		padding: 0;
		max-width: 60vw;
		list-style-type: none;
	}

	ul h3 {
		margin: 0 0 var(--padding-xs) 0;
		font-weight: 500;
		font-size: var(--font-size-base);
	}

	li {
		padding: var(--padding-base) 0 24px 0;
	}

	.body {
		color: var(--color-subtle);
		font-size: var(--font-size-sm);
	}

	.body :global(a) {
		color: inherit;
	}

	ul li {
		border-bottom: 1px solid var(--border-color);
	}
</style>
