<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';

	interface Props {
		content: Snippet;
		collapsedHeightPx?: number;
	}

	let { content, collapsedHeightPx = 200 }: Props = $props();

	let expanded = $state(false);
	let canCollapse = $state(true);

	let contentEl: HTMLDivElement;

	let height = $derived.by(() => {
		if (!canCollapse) return 'auto';
		return expanded ? 'auto' : `${collapsedHeightPx}px`;
	});

	$effect(() => {
		if (!contentEl) return;

		const ro = new ResizeObserver(() => {
			expanded = false;
			canCollapse = contentEl.scrollHeight > collapsedHeightPx;
		});

		ro.observe(contentEl);

		canCollapse = contentEl.scrollHeight > collapsedHeightPx;

		return () => ro.disconnect();
	});
</script>

<div class="container">
	<div class="content-clip" style="height: {height};">
		<div class="content" bind:this={contentEl}>
			{@render content()}
		</div>
	</div>

	{#if canCollapse && !expanded}
		<div class="fade" aria-hidden="true" onclick={() => (expanded = true)}></div>
	{/if}
</div>

{#if canCollapse}
	<button
		class="delimiter link-subtle"
		type="button"
		aria-expanded={expanded}
		onclick={() => (expanded = !expanded)}
	>
		{expanded ? page.data.t('search.hideDetails') : page.data.t('search.showDetails')}
	</button>
{/if}

<style>
	.container {
		position: relative;
	}

	.content-clip {
		overflow: hidden;
	}

	.fade {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 80px;
		width: 100%;
		background: linear-gradient(to top, white, transparent);
	}
</style>
