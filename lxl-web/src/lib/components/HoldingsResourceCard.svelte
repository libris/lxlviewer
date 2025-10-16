<script lang="ts">
	import { page } from '$app/state';
	import type { ResourceData } from '$lib/types/resourceData';
	import DecoratedData from './DecoratedData.svelte';

	type Props = { title: string; data: ResourceData };
	const { title, data }: Props = $props();

	const ASIDE_SEARCH_CARD_MAX_HEIGHT = 140;

	let holdingsInstanceElement: HTMLElement | undefined = $state();
	let expandedHoldingsInstance = $state(false);

	const expandableHoldingsInstance = $derived(
		holdingsInstanceElement?.scrollHeight &&
			holdingsInstanceElement?.scrollHeight > ASIDE_SEARCH_CARD_MAX_HEIGHT
	);
</script>

<div
	class="bg-page border-b-neutral relative mb-2 flex w-full flex-col gap-x-4 rounded-md border-b p-5 text-xs transition-shadow"
>
	<div
		id="instance-details"
		class="overview relative"
		class:expandable={expandableHoldingsInstance}
		class:expanded={expandedHoldingsInstance}
		style="--max-height:{ASIDE_SEARCH_CARD_MAX_HEIGHT}px"
		bind:this={holdingsInstanceElement}
	>
		<h2 class="mb-2">
			<span class="font-medium">
				<DecoratedData data={title} block keyed={false} allowPopovers={false} allowLinks={false} />
			</span>
			{#if data?.['_label']}
				<span> · </span>
				<span>{data?.['_label']}</span>
			{/if}
		</h2>
		<DecoratedData {data} block keyed={false} allowPopovers={false} allowLinks={false} />
	</div>
	<button
		class="link-subtle mt-2 text-left"
		onclick={() => (expandedHoldingsInstance = !expandedHoldingsInstance)}
		aria-expanded={expandedHoldingsInstance}
		aria-controls="instance-details"
	>
		{expandedHoldingsInstance
			? page.data.t('search.hideDetails')
			: page.data.t('search.showDetails')}</button
	>
</div>

<style>
	.expandable {
		max-height: var(--max-height);
		overflow: hidden;
	}

	.expandable:not(.expanded)::after {
		height: 3rem;
		width: 100%;
		position: absolute;
		content: '';
		bottom: 0;
		left: 0;
		pointer-events: none;
		background: linear-gradient(
			to bottom,
			--alpha(var(--color-page) / 0%),
			--alpha(var(--color-page) / 100%)
		);
		overflow: hidden;
	}

	.expanded {
		max-height: initial;
	}

	#instance-details {
		& :global(.contribution-role),
		& :global(.property-label) {
			font-size: var(--text-2xs);
		}
	}
</style>
